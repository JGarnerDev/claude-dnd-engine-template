from PIL import Image
import os

base_dir = r"C:\Users\Jeff\Desktop\claude-dnd-engine\maps\world"
out      = os.path.join(base_dir, "tiles")
cw, ch   = 512, 472

tiles = {
    "nw": (1,6,1,5), "n":  (5,12,1,5), "ne": (10,16,1,5),
    "w":  (1,6,4,9),  "c":  (5,12,4,9),  "e":  (10,16,4,9),
    "sw": (1,6,8,13), "s":  (5,12,8,13), "se": (10,16,8,13),
}

def tile_image(src_path, prefix=""):
    if not os.path.exists(src_path):
        print(f"Skipping {os.path.basename(src_path)} — not found")
        return
    img = Image.open(src_path)
    for name, (c1,c2,r1,r2) in tiles.items():
        left   = (c1-1)*cw
        top    = (r1-1)*ch
        right  = min(8192, c2*cw)
        bottom = min(6144, r2*ch)
        crop   = img.crop((left,top,right,bottom))
        filename = (prefix + "-" + name if prefix else name) + ".png"
        path = os.path.join(out, filename)
        crop.save(path)
        print(filename + ": " + str(crop.size))

tile_image(os.path.join(base_dir, "world-names.png"))
tile_image(os.path.join(base_dir, "city-markers.png"), prefix="markers")
