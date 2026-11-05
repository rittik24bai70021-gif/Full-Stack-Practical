@echo off
cd /d "%~dp0"
echo Starting CanaryDock backend on http://localhost:8080
echo Start frontend separately and open http://localhost:3000
java -jar dist\canarydock.jar
pause
