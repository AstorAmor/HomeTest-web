@echo off
rem Editor de textos de la web de Kuova (kuovahealth.com).
rem Arranca la web en este ordenador y abre el editor en el navegador.
rem No publica nada: los cambios se quedan aqui hasta que los subas a GitHub (ver content\README.md).
cd /d "%~dp0"
title Kuova - editor de textos (cierra esta ventana para terminar)
set NEXT_PUBLIC_PRELAUNCH=false
echo.
echo   Arrancando la web en tu ordenador...
echo   En unos segundos se abre el navegador con el editor:  http://localhost:3010/editar
echo   La web completa se ve en:                              http://localhost:3010
echo.
echo   Para terminar, cierra esta ventana.
echo.
start "" /min cmd /c "timeout /t 12 /nobreak >nul & start "" http://localhost:3010/editar"
call npm run dev -- -p 3010
pause
