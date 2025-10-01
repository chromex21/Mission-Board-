<#
Start the dev JSON server in a detached process on Windows PowerShell.
Usage: .\scripts\start-dev-json-server.ps1
#>
$script = Join-Path $PSScriptRoot 'dev-json-server.cjs'
if (-not (Test-Path $script)) {
  Write-Error "dev-json-server script not found: $script"
  exit 1
}

Write-Host "Starting dev JSON server detached..."
Start-Process -FilePath node -ArgumentList $script -WindowStyle Hidden
Write-Host "Dev JSON server started (detached). Use the server logs or check http://localhost:4000/health to verify."
