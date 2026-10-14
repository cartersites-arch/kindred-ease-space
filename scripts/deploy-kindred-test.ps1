$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repoRoot

# This command is exclusively for the isolated Carter test application.
$expectedBranch = 'test/cloudflare-kindred-ease-20261013'
$expectedAccount = '0e91333c6994f692c3cb0e2d0e0efa02'
$expectedWorker = 'kindred-ease-space-test'
$expectedProject = 'jwqldxatoyeobnoibdvl'
$branch = git branch --show-current
$origin = git remote get-url origin
if ($LASTEXITCODE -ne 0 -or $branch -ne $expectedBranch -or
    $origin -notmatch '^https://github\.com/cartersites-arch/kindred-ease-space(?:\.git)?$') {
  throw 'Refusing deployment: use the Carter isolated test repository and branch.'
}
if (git status --porcelain) { throw 'Commit or resolve test-checkout changes before deploying.' }
$config = Get-Content -LiteralPath (Join-Path $repoRoot 'wrangler.jsonc') -Raw | ConvertFrom-Json
if ($config.name -ne $expectedWorker -or $config.account_id -ne $expectedAccount -or
    $config.vars.SUPABASE_PROJECT_ID -ne $expectedProject -or
    $config.vars.SUPABASE_URL -ne "https://$expectedProject.supabase.co" -or
    $config.vars.PUBLIC_APP_URL -ne 'https://kindred-ease-space-test.pms-chat.workers.dev' -or
    $config.routes.Count -ne 0) {
  throw 'Refusing deployment: configuration does not target the isolated resources.'
}
$env:VITE_SUPABASE_URL = $config.vars.SUPABASE_URL
$env:VITE_SUPABASE_PROJECT_ID = $expectedProject
$env:VITE_SUPABASE_PUBLISHABLE_KEY = $config.vars.SUPABASE_PUBLISHABLE_KEY
$env:BUILD_SHA = git rev-parse HEAD
if ($LASTEXITCODE -ne 0) { throw 'Could not resolve the test commit.' }
& bun run build
if ($LASTEXITCODE -ne 0) { throw 'Test build failed; nothing was deployed.' }
$builtConfigPath = Join-Path $repoRoot '.output/server/wrangler.json'
$built = Get-Content -LiteralPath $builtConfigPath -Raw | ConvertFrom-Json
if ($built.name -ne $expectedWorker -or $built.account_id -ne $expectedAccount -or
    $built.vars.SUPABASE_URL -ne $config.vars.SUPABASE_URL -or $built.routes.Count -ne 0) {
  throw 'Refusing deployment: generated Worker configuration changed the target.'
}
# Wrangler preserves runtime secrets. No secret is read or written here.
& node (Join-Path $repoRoot 'node_modules/wrangler/bin/wrangler.js') deploy --config $builtConfigPath --name $expectedWorker --keep-vars
if ($LASTEXITCODE -ne 0) { throw 'Test deployment failed.' }
$version = Invoke-RestMethod -Uri 'https://kindred-ease-space-test.pms-chat.workers.dev/api/public/version'
if ($version.sha -ne $env:BUILD_SHA) { throw 'The test URL does not report the deployed commit.' }
Write-Output "Verified isolated test deployment: $($version.sha)"
