$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$webRoot = Join-Path $repoRoot "apps\web"

Push-Location $webRoot
try {
  node ..\..\node_modules\typescript\bin\tsc --noEmit --incremental false -p tsconfig.json
  node ..\..\node_modules\next\dist\bin\next lint
  node ..\..\node_modules\tsx\dist\cli.cjs tests\nullifier.test.ts
  node ..\..\node_modules\next\dist\bin\next build
} finally {
  Pop-Location
}

wsl -d Ubuntu -- bash -lc "cd /mnt/c/STRKperks/contracts && scarb build && snforge test"
if ($LASTEXITCODE -ne 0) {
  throw "Cairo verification failed (WSL exit code $LASTEXITCODE). Run PowerShell with WSL access enabled and retry."
}
Write-Host "All StrkPerks verification checks passed."
