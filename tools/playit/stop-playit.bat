@echo off
title Stop Playit Bedrock
cd /d "%~dp0"
echo Stopping Playit Bedrock...
powershell -NoProfile -Command "Stop-Process -Name 'playitd' -Force -ErrorAction SilentlyContinue"
echo Done.
