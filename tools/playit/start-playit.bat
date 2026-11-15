@echo off
title Playit Windows Agent
cd /d "%~dp0"
echo Starting Playit Windows Agent (v2.0.2)...
playitd.exe --secret-path playit.toml
pause
