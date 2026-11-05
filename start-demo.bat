@echo off
cd /d "%~dp0"
echo Starting ApexCare PS026 services. First run may take several minutes.
docker compose up --build
pause
