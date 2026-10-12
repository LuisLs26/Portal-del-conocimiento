@echo off
title Portal del Conocimiento - Evaluacion de los Aprendizajes
echo ====================================================
echo  Iniciando Portal del Conocimiento en tu navegador...
echo ====================================================
echo.
start http://localhost:4173
npm run preview -- --port 4173
pause
