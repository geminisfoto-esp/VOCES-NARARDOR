<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/302415c3-1b74-4d9d-a148-18aa3f6474d2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` with the following server-only variables (none of these are exposed to the browser):
   - `GEMINI_API_KEY` — your Gemini API key
   - `RESEND_API_KEY` — your Resend API key (for the 2FA email)
   - `APP_USER` / `APP_PASSWORD` — login credentials for the app
   - `SESSION_SECRET` — a long random string used to sign session cookies (e.g. `openssl rand -hex 32`)

   If `APP_USER`/`APP_PASSWORD`/`SESSION_SECRET` are left unset, the app skips the login screen (useful for local dev).
3. Run the app:
   `npm run dev`

   Note: the `/api/*` routes (login, 2FA, speech generation) are Vercel Serverless Functions and are not served by plain `vite dev`. Use `vercel dev` (Vercel CLI) to test the full flow locally, or a Vercel preview deployment.
