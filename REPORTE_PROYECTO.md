# Reporte de Proyecto: Voces Narrador 🛡️🎙️

## 1. Estado Actual: FUNCIONAL Y SEGURO
La aplicación está desplegada en `voces-narardor.vercel.app`, con la autenticación, el 2FA y las llamadas a Gemini corriendo enteramente en el servidor (ningún secreto llega al navegador), un catálogo de 30 voces reales, control de idioma y perfil de voz, y generación consistente entre tomas mediante `seed`.

## 2. Hitos Técnicos Alcanzados

### 🔒 Seguridad: secretos movidos al servidor (2026-07-17)
- Se detectó que la clave de Gemini y las credenciales reales de login (usuario/contraseña/email 2FA) estaban escritas en texto plano en el bundle JS público, pese a estar marcadas como "secret" en Vercel — con Vite, cualquier variable usada en código de cliente (incluidas las `VITE_*`) se hornea en el build igualmente.
- Login, verificación 2FA, generación de audio y análisis de voz se movieron a funciones serverless: `api/login.ts`, `api/verify-code.ts`, `api/session.ts`, `api/logout.ts`, `api/generate-speech.ts`, `api/analyze-voice.ts`, con sesión firmada por cookie `HttpOnly` (HMAC, `api/_lib/session.ts`).
- `api/send-code.ts` y `services/emailService.ts` (versión antigua, insegura) se eliminaron — su lógica quedó absorbida por `api/login.ts`.
- Gotcha de despliegue resuelto: Vercel ejecuta `api/` como ESM nativo de Node, que exige extensión `.js` en los imports relativos aunque el código fuente sea `.ts`.

### 🎙️ Audio Nativo Premium (Gemini 2.5) — catálogo ampliado
- **Modelo Activo:** `gemini-2.5-flash-preview-tts`.
- **30 voces reales** (antes solo 5 voces repetidas bajo 20 nombres de persona falsos): cada una con su descriptor oficial de carácter (Firme, Cálida, Enérgica...), con buscador y filtro por estilo en la interfaz.
- **Idioma:** selector en la UI (Español/Inglés/Francés/Alemán/Italiano/Portugués + personalizado) que refuerza al modelo, que además detecta el idioma automáticamente a partir del texto.
- **Perfil de voz:** campo de texto libre para describir edad/carácter (ej. "niña de 9 años, alegre"), inyectado como instrucción en el prompt — es orientativo, no un parámetro exacto.
- **Consistencia entre tomas:** `generationConfig.seed` derivado de voz + idioma + estilo + velocidad + tono + perfil de voz, para que repetir una narración con los mismos ajustes suene igual. Confirmado funcionando por pruebas reales.
- **Prompt Engineering:** soporte de etiquetas especiales `[pausa]`, `[risa]`, `[grito]`, `[llanto]`, `[susurro]`, `[aplausos]`.

### 🛡️ Seguridad Blindada (2FA con Resend)
- Verificación en dos pasos: tras el login correcto, un código de 6 dígitos llega a `geminisfoto@gmail.com` y se valida en el servidor (no en el navegador).
- Botón de **Cerrar Sesión** que invalida la cookie de sesión en el servidor.

## 3. Variables de Entorno Necesarias
Configúralas en Vercel → Project Settings → Environment Variables (sin prefijo `VITE_`, para que nunca lleguen al navegador):

| Variable | Descripción |
| :--- | :--- |
| `GEMINI_API_KEY` | Clave de Gemini (Google AI Studio). |
| `RESEND_API_KEY` | Clave de API de Resend (`re_...`). |
| `APP_USER` | Usuario para el login. |
| `APP_PASSWORD` | Contraseña para el login. |
| `SESSION_SECRET` | Cadena aleatoria larga para firmar las cookies de sesión (ej. `openssl rand -hex 32`). |

**Importante:** no vuelvas a crear variables con prefijo `VITE_APP_USER`, `VITE_APP_PASSWORD`, `VITE_GEMINI_API_KEY` ni `VITE_RESEND_API_KEY` — Vite las expondría en el bundle público de nuevo.

## 4. Próximos Pasos Recomendados
1. **Mantener Git Limpio:** haz `git push` tras los cambios para que Vercel se actualice.
2. **Género de las 25 voces nuevas sin verificar:** Google no documenta el género de las voces — solo `Puck/Charon/Fenrir` (masculinas) y `Kore/Zephyr` (femeninas) están confirmadas por pruebas propias. Pendiente: botón de previsualización de audio por voz para clasificar el resto a oído.
3. **Control de Créditos:** gracias al 2FA y a que la clave vive solo en el servidor, tienes control total sobre quién consume tu cuota de Gemini.

***
**Desarrollado con ❤️ para maximizar la creatividad en tus narraciones.**
