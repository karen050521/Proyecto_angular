@echo off
echo ========================================
echo   Iniciando Servidor Backend Gemini AI
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando dependencias...
if not exist "node_modules\" (
    echo.
    echo [ADVERTENCIA] Las dependencias no estan instaladas.
    echo Instalando dependencias necesarias...
    echo.
    call npm install
    echo.
)

echo.
echo Iniciando servidor en http://localhost:3002
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

node gemini.js

pause
