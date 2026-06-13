# threads-brief.ps1 -- unresolved-thread signals. Backbone of /threads Phase 2.
# consumers: CLAUDE.md, .claude/commands/threads.md -- update these if usage, flags, or output format change.
# Collects: historian entities in unresolved states, hostile characters (recency judged
# by the caller), and pending Seeded: lines from the two meta tracking files.
# Usage: .\scripts\threads-brief.ps1

$root = Resolve-Path "$PSScriptRoot\.."

. "$PSScriptRoot\lib\common.ps1"

Write-Host "`n========================================" -ForegroundColor DarkGray
Write-Host "  THREADS BRIEF" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor DarkGray

# -- Unresolved states ----------------------------------------------------------
Write-Host "`n--- UNRESOLVED STATES (historian) ---" -ForegroundColor DarkGray
$stateHits = Get-ChildItem "$root\historian" -Recurse -Filter "*.md" -ErrorAction SilentlyContinue |
    Select-String -Pattern '^state:\s*(missing|imprisoned|transformed|unknown|stranded|captured)\s*$'
if ($stateHits) {
    foreach ($h in $stateHits) {
        $fm = Get-Frontmatter $h.Path
        $name = if ($fm['name']) { $fm['name'] } else { [IO.Path]::GetFileNameWithoutExtension($h.Filename) }
        $type = if ($fm['subtype']) { "$($fm['type'])/$($fm['subtype'])" } else { [string]$fm['type'] }
        Write-Host "  $name ($type) [$($h.Matches[0].Groups[1].Value)] - $($fm['description'])" -ForegroundColor White
    }
} else {
    Write-Host "  (none)" -ForegroundColor DarkGray
}

# -- Hostile characters (caller judges recency against recent sessions) ----------
Write-Host "`n--- HOSTILE CHARACTERS ---" -ForegroundColor DarkGray
$hostileHits = Get-ChildItem "$root\historian\characters" -Recurse -Filter "*.md" -ErrorAction SilentlyContinue |
    Select-String -Pattern '^disposition:\s*hostile\s*$'
if ($hostileHits) {
    foreach ($h in $hostileHits) {
        $fm = Get-Frontmatter $h.Path
        if ($fm['state'] -eq 'dead') { continue }   # dead enemies are closed threads
        $name = if ($fm['name']) { $fm['name'] } else { [IO.Path]::GetFileNameWithoutExtension($h.Filename) }
        Write-Host "  $name [state: $($fm['state'])] - $($fm['description'])" -ForegroundColor White
    }
} else {
    Write-Host "  (none)" -ForegroundColor DarkGray
}

# -- Pending seeds (planted, not yet paid off) ------------------------------------
Write-Host "`n--- PENDING SEEDS ---" -ForegroundColor DarkGray
$seedCount = 0
foreach ($metaFile in @("$root\meta\literary-devices.md", "$root\meta\campaign-design-preferences.md")) {
    if (-not (Test-Path $metaFile)) { continue }
    $itemName = "?"
    foreach ($line in (Get-Content $metaFile -Encoding UTF8)) {
        if ($line -match '^-\s+\*\*([^*]+)\*\*') { $itemName = $Matches[1].Trim(); continue }
        if ($line -match '^\s*-\s*\*Seeded:\s*(.+?)\*?\s*$' -and $line -notmatch 'paid off') {
            $src = [IO.Path]::GetFileNameWithoutExtension($metaFile)
            Write-Host "  $itemName ($src): $($Matches[1].Trim())" -ForegroundColor Yellow
            $seedCount++
        }
    }
}
if (-not $seedCount) { Write-Host "  (nothing seeded)" -ForegroundColor DarkGray }

Write-Host "`n========================================`n" -ForegroundColor DarkGray
