$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$webRoot = Join-Path $repoRoot "apps\web"

Push-Location $webRoot
try {
  node ..\..\node_modules\typescript\bin\tsc --noEmit --incremental false -p tsconfig.json
  if ($LASTEXITCODE -ne 0) { throw "Frontend typecheck failed" }
  node node_modules\eslint\bin\eslint.js .
  if ($LASTEXITCODE -ne 0) { throw "Frontend lint failed" }
  node ..\..\node_modules\tsx\dist\cli.cjs tests\nullifier.test.ts
  if ($LASTEXITCODE -ne 0) { throw "Frontend checks failed" }
  node ..\..\node_modules\next\dist\bin\next build
  if ($LASTEXITCODE -ne 0) { throw "Frontend production build failed" }
} finally {
  Pop-Location
}

wsl -d Ubuntu -- bash -lc 'export PATH="$HOME/.asdf/installs/scarb/2.20.1/bin:$HOME/.local/bin:/usr/bin:/bin"; export SCARB_TARGET_DIR=/tmp/strkperks-codex-target; cd /mnt/c/STRKperks/contracts && scarb build && snforge test'
if ($LASTEXITCODE -ne 0) {
  throw "Cairo verification failed (WSL exit code $LASTEXITCODE). Run PowerShell with WSL access enabled and retry."
}
Write-Host "All StrkPerks verification checks passed."
