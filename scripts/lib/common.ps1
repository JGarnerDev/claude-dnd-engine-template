# common.ps1 -- shared helpers dot-sourced by the scripts in scripts/.
# consumers: scripts/entity-graph.ps1, scripts/free-entities.ps1, scripts/location-entities.ps1,
#   scripts/party-status.ps1, scripts/route-cities.ps1, scripts/session-brief.ps1,
#   scripts/session-state.ps1, scripts/todo-brief.ps1, scripts/inventory-brief.ps1,
#   scripts/threads-brief.ps1, scripts/spotlight-balance.ps1
# -- update those scripts if a function signature or output shape changes here.

# Parse YAML-ish frontmatter into a hashtable.
# Scalars: $fm['key']. Wikilink scalars are unwrapped and alias-stripped ([[Name|alias]] -> Name).
# List items (plain or wikilink) accumulate under $fm['_list_<key>'].
function Get-Frontmatter($path) {
    $lines = Get-Content $path -Raw -Encoding UTF8
    if ($lines -notmatch '(?s)^---\r?\n(.+?)\r?\n---') { return @{} }
    $block = $Matches[1]
    $fm = @{}
    $currentKey = $null
    foreach ($line in ($block -split "`n")) {
        $line = $line.TrimEnd("`r")
        if ($line -match '^(\w[\w_]*):\s*\[\[([^\]]+)\]\]') {
            $currentKey = $Matches[1].Trim()
            $fm[$currentKey] = ($Matches[2] -split '\|')[0].Trim()
        } elseif ($line -match '^(\w[\w_]*):\s*"?([^"#\r\n]*)"?\s*$') {
            $currentKey = $Matches[1].Trim()
            $fm[$currentKey] = $Matches[2].Trim()
        } elseif ($line -match '^\s+-\s+\[\[([^\]]+)\]\]') {
            if ($currentKey) {
                if (-not $fm.ContainsKey("_list_$currentKey")) { $fm["_list_$currentKey"] = @() }
                $fm["_list_$currentKey"] += ($Matches[1] -split '\|')[0].Trim()
            }
        } elseif ($line -match '^\s+-\s+"?([^"#\r\n]+)"?\s*$') {
            if ($currentKey) {
                if (-not $fm.ContainsKey("_list_$currentKey")) { $fm["_list_$currentKey"] = @() }
                $fm["_list_$currentKey"] += $Matches[1].Trim()
            }
        }
    }
    return $fm
}

# -- Spotlight ledger helpers (meta/character-focus.md) -----------------------
# Shared by spotlight-balance.ps1 and party-status.ps1 so the rotation tally has one source.

$script:SPOTLIGHT_WEIGHT = @{ touch = 1; beat = 3; arc = 9 }

# Parse one beat token "<class>(<PCs>): <weight>" -> object, or $null if malformed.
function Parse-SpotlightBeat($s) {
    if ($s -notmatch '^\s*(spotlight|shared|party-centric|world)\s*(?:\(([^)]*)\))?\s*:\s*(touch|beat|arc)\s*$') {
        return $null
    }
    $pcs = @()
    if ($Matches[2]) { $pcs = @(($Matches[2] -split ',') | ForEach-Object { $_.Trim() } | Where-Object { $_ }) }
    [PSCustomObject]@{
        Class  = $Matches[1]
        PCs    = $pcs
        Weight = $Matches[3]
        Value  = $script:SPOTLIGHT_WEIGHT[$Matches[3]]
    }
}

# Collect played sessions (historian/sessions, recursive) with parsed beats + attendance.
# Returns an array of objects { Num; Name; Beats; Present; HasPresence } sorted by Num ascending.
function Get-PlayedSpotlightSessions($root) {
    $files = Get-ChildItem "$root\historian\sessions" -Recurse -Filter "*.md" -ErrorAction SilentlyContinue
    $out = @()
    foreach ($f in $files) {
        $fm = Get-Frontmatter $f.FullName
        if ($fm['type'] -ne 'session') { continue }
        $beats = @()
        if ($fm['_list_beats']) {
            foreach ($b in $fm['_list_beats']) {
                $parsed = Parse-SpotlightBeat $b
                if ($parsed) { $beats += $parsed }
            }
        }
        $present = @()
        if ($fm['_list_pcs_present']) { $present = @($fm['_list_pcs_present']) }
        $out += [PSCustomObject]@{
            Num         = [int]($fm['session_number'] -replace '[^0-9]', '')
            Name        = $fm['name']
            Beats       = $beats
            Present     = $present
            HasPresence = [bool]$fm['_list_pcs_present']
        }
    }
    return @($out | Sort-Object Num)
}

# Windowed per-PC rotation tally: solo >= beat = 1.0, shared >= beat = 0.5 each, present-only,
# touches excluded. Returns @{ Turns=@{name->float}; Present=@{name->bool}; Fallback=bool }.
# $activeNames feeds the fallback when a session lacks pcs_present.
function Get-SpotlightRotation($sessions, $window, $activeNames) {
    $windowSessions = @($sessions | Select-Object -Last $window)
    $turns = @{}
    $present = @{}
    $fallback = $false
    foreach ($s in $windowSessions) {
        $here = if ($s.HasPresence) { $s.Present } else { $fallback = $true; $activeNames }
        foreach ($n in $here) { $present[$n] = $true }
        foreach ($b in $s.Beats) {
            if ($b.Value -lt $script:SPOTLIGHT_WEIGHT['beat']) { continue }
            if ($b.Class -eq 'spotlight' -and $b.PCs.Count -ge 1) {
                $pc = $b.PCs[0]
                if ($here -contains $pc) { $turns[$pc] = ($turns[$pc] + 1.0) }
            } elseif ($b.Class -eq 'shared') {
                foreach ($pc in $b.PCs) {
                    if ($here -contains $pc) { $turns[$pc] = ($turns[$pc] + 0.5) }
                }
            }
        }
    }
    return @{ Turns = $turns; Present = $present; Fallback = $fallback }
}
