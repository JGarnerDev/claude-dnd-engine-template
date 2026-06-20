# consumers: CLAUDE.md, maps/CLAUDE.md -- update these if usage, flags, or output format change.
from PIL import Image
import os

# Resolve maps/world relative to this script so the tool is path-portable.
base_dir    = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "maps", "world")
masters_dir = os.path.join(base_dir, "masters")   # gitignored master images you supply
out         = os.path.join(base_dir, "tiles")      # gitignored read-tiles, generated locally

# Nominal grid the tile ranges below are defined against (16 cols x 13 rows).
# Cell size is derived per-image from the actual source dimensions, so any
# export resolution tiles correctly (the source need not be 8192x6144).
NCOLS, NROWS = 16, 13

# Master format is up to you -- any of these is accepted, in priority order.
MASTER_EXTS = (".webp", ".png", ".jpg", ".jpeg", ".gif")

def find_master(stem):
    """First masters/<stem>.<ext> that exists, regardless of format, else None."""
    for ext in MASTER_EXTS:
        p = os.path.join(masters_dir, stem + ext)
        if os.path.exists(p):
            return p
    return None

tiles = {
    "nw": (1,6,1,5), "n":  (5,12,1,5), "ne": (10,16,1,5),
    "w":  (1,6,4,9),  "c":  (5,12,4,9),  "e":  (10,16,4,9),
    "sw": (1,6,8,13), "s":  (5,12,8,13), "se": (10,16,8,13),
}

os.makedirs(out, exist_ok=True)   # tiles/ is not committed; create it on a cold clone

def tile_image(stem, prefix=""):
    src_path = find_master(stem)
    if src_path is None:
        exts = "/".join(e.lstrip(".") for e in MASTER_EXTS)
        print(f"Skipping {stem} — no master found (looked for {stem}.{{{exts}}}). "
              f"Place your master images in maps/world/masters/ (see maps/CLAUDE.md).")
        return
    img = Image.open(src_path)
    W, H = img.size
    cw, ch = W / NCOLS, H / NROWS
    for name, (c1,c2,r1,r2) in tiles.items():
        left   = round((c1-1)*cw)
        top    = round((r1-1)*ch)
        right  = min(W, round(c2*cw))
        bottom = min(H, round(r2*ch))
        crop   = img.crop((left,top,right,bottom))
        filename = (prefix + "-" + name if prefix else name) + ".png"
        path = os.path.join(out, filename)
        crop.save(path)
        print(filename + ": " + str(crop.size))

tile_image("world-names")
tile_image("city-markers", prefix="markers")
tile_image("world-sky", prefix="sky")
