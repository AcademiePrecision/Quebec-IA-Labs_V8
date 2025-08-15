@echo off
REM start-all.bat - Démarrer tout l'écosystème

echo =====================================
echo    QUEBEC IA LABS - DEMARRAGE
echo =====================================

echo.
echo [1/2] Demarrage serveur principal...
start cmd /k "cd quebec-ia-labs && npm start"

echo.
choice /C YN /M "Lancer l'app mobile"
if %ERRORLEVEL% == 1 (
    echo [2/2] Demarrage app mobile...
    start cmd /k "cd academie-precision-app && npm run mobile"
)

echo.
echo =====================================
echo    SYSTEMES DEMARRES!
echo    Serveur: http://localhost:3000
echo    Marcel: http://localhost:3000/test-marcel
echo =====================================
pause
