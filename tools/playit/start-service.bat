@echo off
title Playit Bedrock Daemon & Bridge
cd /d "%~dp0"
echo ===================================================
echo   KryinCraft Playit Bedrock Bridge Service
echo   Port: 8089 (Listens for Indian Node commands)
echo ===================================================
python playit_bridge.py --autostart
pause
