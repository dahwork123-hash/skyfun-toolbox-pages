# 推送到 GitHub 後觸發 Cloud Build 部署（約 4 分鐘內完成，會寄 Email）
# 用法：powershell -ExecutionPolicy Bypass -File .\scripts\deploy-publish.ps1

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$WebhookFile = Join-Path $PSScriptRoot 'deploy-webhook.url'
if (-not (Test-Path $WebhookFile)) {
    Write-Error "找不到 $WebhookFile`n請複製 deploy-webhook.url.example 並填入 Cloud Build webhook 完整 URL。"
}

$WebhookUrl = (Get-Content $WebhookFile -Raw).Trim()
if (-not $WebhookUrl) { Write-Error 'webhook URL 為空' }

Write-Host '>> git push origin main'
git push origin main
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host '>> POST Cloud Build webhook'
try {
    $resp = Invoke-RestMethod -Uri $WebhookUrl -Method Post -ContentType 'application/json' -Body '{}'
    Write-Host 'Webhook OK:' ($resp | ConvertTo-Json -Compress)
} catch {
    Write-Host "Webhook 失敗: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message }
    exit 1
}

Write-Host ''
Write-Host '已觸發部署。約 4 分鐘內會收到 Email，正式網址：'
Write-Host 'https://thinklover.github.io/skyfun-toolbox-pages/'
