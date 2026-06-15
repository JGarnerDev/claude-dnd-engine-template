# validate-refs.ps1 -- instruction-file reference lint.
# consumers: CLAUDE.md -- update these if usage, flags, or output format change.
# validate.ps1 covers the entity graph ([[wiki-links]], frontmatter). This covers the
# OTHER dependency surface: plain path references between instruction files --
# CLAUDE.md files, command specs, meta docs, tests -- pointing at files that were
# renamed or deleted. Catches drift like `scheduler/campaign.md` going stale after
# a restructure.
#
# Usage: .\scripts\validate-refs.ps1 [-Quiet]
#   -Quiet      suppress the per-source-file breakdown, show missing targets only
# Exit code: 0 = no dangling refs, 1 = dangling refs found (CI-friendly).

param(
    [switch]$Quiet
)

$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
function Rel($p) { $p.Replace($repo + [IO.Path]::DirectorySeparatorChar, "") }

# Instruction files = anything that tells the engine how to operate (not campaign content).
$sources = @()
$sources += Get-Item (Join-Path $repo 'CLAUDE.md') -ErrorAction SilentlyContinue
$sources += Get-Item (Join-Path $repo 'README.md') -ErrorAction SilentlyContinue
# todo*.md are instruction-adjacent: they reference scripts and meta files that get renamed.
# todo-dashboard.md is /todo output, not a source.
$sources += Get-ChildItem (Join-Path $repo 'todo*.md') -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne 'todo-dashboard.md' }
foreach ($glob in @('.claude\commands\*.md', 'meta\*.md', 'meta\*\*.md', 'tests\*.md', 'tests\*\*.md', 'tests\*\*\*.md', '*\CLAUDE.md')) {
    $sources += Get-ChildItem (Join-Path $repo $glob) -File -ErrorAction SilentlyContinue
}
$sources = $sources | Where-Object { $_ } | Sort-Object FullName -Unique

# Path-like refs: known top-level dir, then a relative path ending in a tracked extension.
# Char class excludes <>{}$* so placeholder/example paths never match.
# The (?<![\w-]) lookbehind stops a dir token from matching mid-word -- e.g. the `maps`
# inside `fetch-maps.ps1` must not be picked up as a bare `maps.ps1` reference.
$refPattern = '(?<![\w-])(?:\.\\|\./)?(?:\.claude[/\\]commands|meta|scripts|data|historian|scheduler|maps|tests|recaps|questionnaires)[a-zA-Z0-9._/\\-]*\.(?:md|ps1|py)'

# Paths that are intentionally referenced but absent (planned files, doc examples).
$ignore = @()

$missing = @{}   # normalized path -> list of "source.md:line"
$refCount = 0

foreach ($src in $sources) {
    $rel = Rel $src.FullName
    $lineNo = 0
    foreach ($line in (Get-Content $src.FullName -Encoding UTF8)) {
        $lineNo++
        foreach ($m in [regex]::Matches($line, $refPattern)) {
            $path = $m.Value -replace '\\', '/' -replace '^\./', ''
            $refCount++
            if ($ignore -contains $path) { continue }
            if (-not (Test-Path (Join-Path $repo ($path -replace '/', '\')))) {
                if (-not $missing.ContainsKey($path)) { $missing[$path] = New-Object System.Collections.ArrayList }
                [void]$missing[$path].Add("${rel}:$lineNo")
            }
        }
    }
}

if ($missing.Count) {
    Write-Host "`n=== DANGLING REFS ($($missing.Count)) ===" -ForegroundColor Red
    foreach ($kv in ($missing.GetEnumerator() | Sort-Object Key)) {
        Write-Host "  $($kv.Key)" -ForegroundColor Red
        if (-not $Quiet) {
            foreach ($loc in $kv.Value) { Write-Host "    <- $loc" -ForegroundColor DarkGray }
        }
    }
}

Write-Host "`nChecked $refCount path refs across $($sources.Count) instruction files. Dangling: $($missing.Count)" -ForegroundColor Cyan
if ($missing.Count) { exit 1 } else { exit 0 }
