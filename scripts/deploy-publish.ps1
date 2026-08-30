# Push to GitHub then POST Cloud Build webhook (~4 min, email on success)
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\deploy-publish.ps1

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$WebhookFile = Join-Path $PSScriptRoot 'deploy-webhook.url'
if (-not (Test-Path $WebhookFile)) {
    Write-Error "Missing $WebhookFile - copy deploy-webhook.url.example and fill in the webhook URL."
}

$WebhookUrl = (Get-Content $WebhookFile -Raw).Trim()
if (-not $WebhookUrl) { Write-Error 'Webhook URL is empty' }

Write-Host '>> git push origin main'
git push origin main
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host '>> POST Cloud Build webhook'
try {
    $resp = Invoke-RestMethod -Uri $WebhookUrl -Method Post -ContentType 'application/json' -Body '{}'
    Write-Host 'Webhook OK:' ($resp | ConvertTo-Json -Compress)
} catch {
    Write-Host "Webhook failed: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message }
    exit 1
}

Write-Host ''
Write-Host 'Deploy triggered. Check email in ~4 min.'
Write-Host 'Live site: https://thinklover.github.io/skyfun-toolbox-pages/'
