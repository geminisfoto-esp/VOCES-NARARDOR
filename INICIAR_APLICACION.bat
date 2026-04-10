@echo off
title Voces Narrador Premium
setlocal

:: Cambiar al directorio del script
cd /d "%~dp0"

echo ==========================================
echo        VOCES NARRADOR - PREMIUM
echo ==========================================
echo.

:: Comprobar si existe la carpeta node_modules
if not exist "node_modules\" (
    echo [1/3] Detectado primer inicio. Instalando dependencias...
    echo Esto puede tardar un minuto la primera vez.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo Error al instalar dependencias. Asegurate de tener Node.js instalado.
        pause
        exit /b %errorlevel%
    )
)

echo [2/3] Iniciando el servidor...
echo.
echo La aplicacion se abrira en tu navegador en breve.
echo No cierres esta ventana mientras uses la aplicacion.
echo.

:: Abrir el navegador automaticamente (esperamos un momento para que el servidor arranque)
start "" http://localhost:3000

:: Iniciar Vite
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo El servidor se ha detenido de forma inesperada.
    pause
)
