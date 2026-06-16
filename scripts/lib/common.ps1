# common.ps1 -- shared helpers dot-sourced by the scripts in scripts/.
# consumers: scripts/entity-graph.ps1, scripts/free-entities.ps1, scripts/location-entities.ps1,
#   scripts/party-status.ps1, scripts/route-cities.ps1, scripts/session-brief.ps1,
#   scripts/session-state.ps1, scripts/todo-brief.ps1, scripts/inventory-brief.ps1,
#   scripts/threads-brief.ps1, scripts/spotlight-balance.ps1, scripts/timeline-gantt.ps1
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

# -- Calendar + timeline helpers (meta/calendar.md) ---------------------------
# Used by timeline-gantt.ps1. True scale is NOT a goal -- these support rough
# orientation: ordering + display + a plottable date for mermaid. timeline_date
# is a flat string "YYYY[-MM[-DD]]" (the flat parser can't read nested maps).

# Read the campaign calendar (falls back to the synced template if no campaign file).
function Get-Calendar($root) {
    $path = Join-Path $root 'meta\calendar.md'
    if (-not (Test-Path $path)) { $path = Join-Path $root 'meta\calendar-template.md' }
    $fm = Get-Frontmatter $path
    $months = @()
    if ($fm['_list_months']) {
        foreach ($m in $fm['_list_months']) {
            $parts = $m -split ':', 2
            $months += [PSCustomObject]@{ Name = $parts[0].Trim(); Days = [int]($parts[1].Trim()) }
        }
    }
    $epoch = 0; if ($fm['epoch_year'] -match '^-?\d+$') { $epoch = [int]$fm['epoch_year'] }
    $yearDays = if ($months) { ($months | Measure-Object Days -Sum).Sum } else { 365 }
    [PSCustomObject]@{
        Months     = $months
        EpochYear  = $epoch
        YearSuffix = $fm['year_suffix']
        YearDays   = $yearDays
    }
}

# Precision of a timeline_date string: 'year' | 'month' | 'day' | $null.
function Get-DatePrecision($s) {
    if (-not $s) { return $null }
    switch (($s -split '-').Count) { 1 { 'year' } 2 { 'month' } 3 { 'day' } default { $null } }
}

# Split a timeline_date into clamped y/m/d ints (clamped so custom calendars with
# >12 months / long months still produce a valid [datetime] for mermaid).
function Get-DateParts($s) {
    $p = $s -split '-'
    $y = [int]$p[0]
    $m = if ($p.Count -ge 2) { [math]::Min(12, [math]::Max(1, [int]$p[1])) } else { 1 }
    $d = if ($p.Count -ge 3) { [math]::Min(28, [math]::Max(1, [int]$p[2])) } else { 1 }
    [PSCustomObject]@{ Year = $y; Month = $m; Day = $d }
}

# A [datetime] mermaid can plot. Rough by design (custom calendars approximate to Gregorian).
function Get-PlotDate($s) {
    $d = Get-DateParts $s
    [datetime]::new($d.Year, $d.Month, $d.Day)
}

# Numeric sort key honoring graded precision (missing month/day sort to start).
function Get-DateSortKey($s) {
    $d = Get-DateParts $s
    $d.Year * 10000 + $d.Month * 100 + $d.Day
}

# Bar duration string by precision: year -> whole year, month -> that month, day -> milestone (0d).
function Get-PrecisionDuration($s, $cal) {
    switch (Get-DatePrecision $s) {
        'year'  { "$($cal.YearDays)d" }
        'month' {
            $mi = (Get-DateParts $s).Month
            $days = if ($cal.Months.Count -ge $mi) { $cal.Months[$mi - 1].Days } else { 30 }
            "${days}d"
        }
        default { '0d' }
    }
}

# Tick-count axis resolver: target ~10 ticks, snap interval to a mermaid-safe value.
# Returns { TickInterval; AxisFormat }. Uses month-multiples ('year' unit support varies).
function Get-AxisConfig($minDate, $maxDate) {
    $spanDays = [math]::Max(1, ($maxDate - $minDate).TotalDays)
    $raw = $spanDays / 10
    $allowed = @(
        @{ d = 7;     t = '1week'   }, @{ d = 14;    t = '2week'    },
        @{ d = 30;    t = '1month'  }, @{ d = 91;    t = '3month'   },
        @{ d = 182;   t = '6month'  }, @{ d = 365;   t = '12month'  },
        @{ d = 730;   t = '24month' }, @{ d = 1825;  t = '60month'  },
        @{ d = 3650;  t = '120month'}, @{ d = 18250; t = '600month' },
        @{ d = 36500; t = '1200month' }
    )
    $pick = $allowed | Where-Object { $_.d -ge $raw } | Select-Object -First 1
    if (-not $pick) { $pick = $allowed[-1] }
    $fmt = if ($pick.d -lt 30) { '%d %b' } elseif ($pick.d -lt 365) { '%b %Y' } else { '%Y' }
    [PSCustomObject]@{ TickInterval = $pick.t; AxisFormat = $fmt; Days = $pick.d }
}
