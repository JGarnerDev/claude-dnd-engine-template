# map-common.ps1 -- shared helpers for map scripts.
# consumers: scripts/map-crop.ps1, scripts/count-markers.ps1 (dot-sourced).
# Map masters, tiles, and crops are NOT committed (gitignored to keep the .git
# history from bloating on large binaries). You supply the master images yourself
# and place them in maps/world/masters/; tiles are generated locally. Master format
# is up to you -- any common image format works (see $MapImageExts).

# Accepted master image formats, in resolution priority order.
$MapImageExts = @('webp', 'png', 'jpg', 'jpeg', 'gif')

# Resolve a master by stem (e.g. "world-names") to the first matching image file
# in masters/, regardless of extension. Errors out with guidance if none is found.
function Resolve-Master {
    param(
        [Parameter(Mandatory)][string]$Stem,
        [string]$Dir = ".\maps\world\masters"
    )
    foreach ($ext in $MapImageExts) {
        $p = Join-Path $Dir "$Stem.$ext"
        if (Test-Path $p) { return $p }
    }
    Write-Error @"
Master image not found for '$Stem' in $Dir
Map masters are not committed (gitignored). Supply your own master image in any of
these formats: $($MapImageExts -join ', ') -- name it $Stem.<ext>, place it in
maps/world/masters/, then regenerate tiles:
  python scripts\gen-tiles.py
See maps/CLAUDE.md for the master layout.
"@
    exit 1
}
