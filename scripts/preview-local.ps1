# Local preview for toolbox (Node.js only, no Python/npm install)
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\preview-local.ps1

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Port = 8080

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error 'Node.js not found. Install from https://nodejs.org'
}

$previewJs = Join-Path $PSScriptRoot 'preview-local-server.mjs'
if (-not (Test-Path $previewJs)) {
    Write-Error "Missing $previewJs"
}

Set-Location $Root
Write-Host ">> Preview: http://127.0.0.1:$Port/index.html"
Write-Host '>> Press Ctrl+C to stop'
Write-Host ''
node $previewJs $Port $Root
