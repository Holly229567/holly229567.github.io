@echo off
if exist "F:\node\node.exe" (
  "F:\node\node.exe" "%~dp0scripts\launch-manager.mjs"
) else (
  node "%~dp0scripts\launch-manager.mjs"
)
