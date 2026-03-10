@echo off
echo Starting InstallmentPro...
echo.

start "InstallmentPro Backend" cmd /k "cd /d "%~dp0backend" && node index.js"
timeout /t 2 /nobreak > nul

start "InstallmentPro Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo InstallmentPro is starting up!
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window (servers keep running)
pause > nul
