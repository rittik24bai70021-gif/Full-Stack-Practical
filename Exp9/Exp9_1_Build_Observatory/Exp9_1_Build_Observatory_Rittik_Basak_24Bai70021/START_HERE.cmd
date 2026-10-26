@echo off
setlocal
cd /d "%~dp0"
echo Build Observatory - Rittik Basak - 24Bai70021
echo Open http://localhost:8400 after Spring Boot starts.
call mvnw.cmd spring-boot:run
pause
