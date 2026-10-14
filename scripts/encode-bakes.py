"""Convert baked PNG atlases in public/models/bake to WebP (run after bake-projector.py).

    python3 scripts/encode-bakes.py
"""
import glob, os
from PIL import Image

for png in sorted(glob.glob("public/models/bake/*.png")):
    out = png[:-4] + ".webp"
    Image.open(png).convert("RGB").save(out, "WEBP", quality=88, method=6)
    print(f"{os.path.basename(out)}  {os.path.getsize(png) // 1024} KB → {os.path.getsize(out) // 1024} KB")
    os.remove(png)
