# validate.ps1 -- integrity checks for the campaign entity graph.
# consumers: CLAUDE.md, tests/CLAUDE.md -- update these if usage, flags, or output format change.
# Catches problems that accumulate silently across 1000+ files:
#   ERRORS   - dangling [[wiki-links]]; missing mandatory frontmatter (name/type/exists);
#              exists:false in historian/ (canon must be real).
#   WARNINGS - core reference-catalog type marked exists:false (should be true);
#              historian files missing provenance (source_session/confirmed_date);
#              name != filename; frontmatter [[links]] not echoed in body (Foam graph gap).
#
# Usage: .\scripts\validate.ps1 [-Scope all|links|frontmatter] [-Quiet]
#   -Scope      which checks to run (default all)
#   -Quiet      show ERRORS only, suppress WARNINGS
# Exit code: 0 = no errors, 1 = errors found (CI-friendly).

param(
    [ValidateSet('all', 'links', 'frontmatter')]
    [string]$Scope = 'all',
    [switch]$Quiet
)

$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$sep  = [IO.Path]::DirectorySeparatorChar
function Rel($p) { $p.Replace($repo + $sep, "") }

# Entity graph lives in these top-level dirs. CLAUDE.md, templates, and pool/collection docs are not entities.
$entityDirs = @('data', 'historian', 'scheduler')
function Is-Entity($f) {
    $top = ((Rel $f.FullName) -split '[\\/]')[0]
    if ($entityDirs -notcontains $top) { return $false }
    if ($f.Name -eq 'CLAUDE.md')       { return $false }
    if ($f.Name -match 'template')     { return $false }
    if ($f.Name -match 'pool')         { return $false }   # collection docs (e.g. world-events-pool), not single entities
    if ($f.Name -like '_*')            { return $false }
    return $true
}

# Reference-catalog types are campaign-agnostic stat libraries; their schemas omit `exists`.
$refTypes = @('monster', 'spell', 'deity', 'feat', 'race', 'class', 'background', 'skill')

# Spotlight ledger fields (meta/character-focus.md) are intentionally plain-string, NOT wikilinks:
#   spotlight_hooks (list of {hook,status}), spotlight (normal|low) on PCs;
#   beats ("classification: weight") and pcs_present (PC names) on sessions.
# PC names inside `beats:` are ledger tokens, not graph edges -- keep them bracket-free so they
# don't register as dangling [[links]] here. This validator has no field whitelist, so these
# fields pass without special handling; do not convert them to [[wiki-links]].

function Parse-File($path) {
    $raw = Get-Content $path -Raw -Encoding UTF8
    if ($raw.Length -and $raw[0] -eq [char]0xFEFF) { $raw = $raw.Substring(1) }   # strip UTF-8 BOM
    $fm = @{}; $aliases = @(); $block = ''; $body = $raw
    if ($raw -match '(?s)^---\r?\n(.+?)\r?\n---\r?\n?(.*)$') {
        $block = $Matches[1]; $body = $Matches[2]
        $curKey = $null
        foreach ($line in ($block -split "`n")) {
            $l = $line.TrimEnd("`r")
            if ($l -match '^([A-Za-z][\w_]*):\s*(.*)$') {
                $curKey = $Matches[1]
                $fm[$curKey] = $Matches[2].Trim().Trim('"')
            }
            elseif ($l -match '^\s+-\s+(.*)$') {
                if ($curKey -eq 'aliases') { $aliases += $Matches[1].Trim().Trim('"') }
            }
            elseif ($l -match '^\S') { $curKey = $null }
        }
    }
    [PSCustomObject]@{ Block = $block; Body = $body; FM = $fm; Aliases = $aliases }
}

# Extract resolvable [[wiki-link]] targets: strip |alias, #heading, ^block, and any folder path.
function Get-Links($text) {
    $out = @()
    foreach ($m in [regex]::Matches($text, '\[\[([^\]]+)\]\]')) {
        $t = $m.Groups[1].Value
        $t = ($t -split '\|')[0]
        $t = ($t -split '#')[0]
        $t = ($t -split '\^')[0]
        $t = ($t -split '[\\/]')[-1]
        $t = $t.Trim()
        if ($t) { $out += $t }
    }
    $out
}

$allMd = Get-ChildItem $repo -Recurse -Filter *.md -File |
    Where-Object { $_.FullName -notmatch '[\\/](\.obsidian|\.git|node_modules|tests)[\\/]' }

# Resolution universe: every file basename (any .md is a valid link target in Obsidian) + entity aliases.
$targets = @{}
foreach ($f in $allMd) { $targets[[IO.Path]::GetFileNameWithoutExtension($f.Name).ToLower()] = $true }

$parsed = @{}
foreach ($f in $allMd) { if (Is-Entity $f) { $parsed[$f.FullName] = Parse-File $f.FullName } }
foreach ($p in $parsed.Values) { foreach ($a in $p.Aliases) { if ($a) { $targets[$a.ToLower()] = $true } } }

$errors = New-Object System.Collections.ArrayList
$warnings = New-Object System.Collections.ArrayList

foreach ($kv in $parsed.GetEnumerator()) {
    $rel = Rel $kv.Key
    $top = ($rel -split '[\\/]')[0]
    $p   = $kv.Value
    $fm  = $p.FM

    if ($Scope -ne 'frontmatter') {
        # Dangling links (report each unresolved target once per file).
        $seen = @{}
        foreach ($link in (Get-Links ($p.Block + "`n" + $p.Body))) {
            $key = $link.ToLower()
            if (-not $targets.ContainsKey($key) -and -not $seen.ContainsKey($key)) {
                [void]$errors.Add("$rel -> [[$link]]  (no matching file or alias)")
                $seen[$key] = $true
            }
        }
        # Frontmatter links must also appear in body (Foam reads body links only).
        $bodyLinks = @{}
        foreach ($b in (Get-Links $p.Body)) { $bodyLinks[$b.ToLower()] = $true }
        foreach ($fl in (Get-Links $p.Block | Select-Object -Unique)) {
            if (-not $bodyLinks.ContainsKey($fl.ToLower())) {
                [void]$warnings.Add("$rel : frontmatter link [[$fl]] not echoed in body")
            }
        }
    }

    if ($Scope -ne 'links') {
        foreach ($req in 'name', 'type', 'exists') {
            if (-not $fm.ContainsKey($req) -or [string]::IsNullOrWhiteSpace([string]$fm[$req])) {
                [void]$errors.Add("$rel : missing mandatory field '$req'")
            }
        }
        # `exists` = real/canon in the world, not folder location. Historian is always canon;
        # core rulebook material in data/ should be real too (see meta/schemas/entity.md).
        if ($fm.ContainsKey('exists')) {
            $ex = ([string]$fm['exists']).ToLower()
            if ($top -eq 'historian' -and $ex -eq 'false') {
                [void]$errors.Add("$rel : exists:false in historian/ (canon must be true)")
            }
            if ($top -eq 'data' -and $ex -eq 'false' -and $refTypes -contains [string]$fm['type']) {
                [void]$warnings.Add("$rel : reference-catalog type '$($fm['type'])' is exists:false (core material should be true)")
            }
        }
        # Session files ARE the source of canon, so they carry no source_session/confirmed_date.
        if ($top -eq 'historian' -and $rel -notmatch '[\\/]sessions[\\/]') {
            foreach ($req in 'source_session', 'confirmed_date') {
                if (-not $fm.ContainsKey($req) -or [string]::IsNullOrWhiteSpace([string]$fm[$req])) {
                    [void]$warnings.Add("$rel : historian file missing '$req'")
                }
            }
        }
        if ($fm.ContainsKey('name') -and $fm['name']) {
            $base = [IO.Path]::GetFileNameWithoutExtension($kv.Key)
            if (([string]$fm['name']).Trim() -ne $base) {
                [void]$warnings.Add("$rel : name '$($fm['name'])' != filename '$base'")
            }
        }
    }
}

if ($errors.Count) {
    Write-Host "`n=== ERRORS ($($errors.Count)) ===" -ForegroundColor Red
    $errors | Sort-Object | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}
if (-not $Quiet -and $warnings.Count) {
    Write-Host "`n=== WARNINGS ($($warnings.Count)) ===" -ForegroundColor Yellow
    $warnings | Sort-Object | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
}

$tail = if (-not $Quiet) { "  Warnings: $($warnings.Count)" } else { "" }
Write-Host "`nChecked $($parsed.Count) entity files. Errors: $($errors.Count)$tail" -ForegroundColor Cyan
if ($errors.Count) { exit 1 } else { exit 0 }
