import os
from PIL import Image

logo_path = os.path.join(os.path.dirname(__file__), "..", "public", "incroute_logo.png")
if not os.path.exists(logo_path):
    print(f"Error: Logo file not found at {logo_path}")
    exit(1)

original_size = os.path.getsize(logo_path)
print(f"Original logo size: {original_size} bytes ({original_size / 1024:.2f} KB)")

# Open image
img = Image.open(logo_path)

# Option 1: Compress original RGBA with max compression and optimization
temp_rgba_path = logo_path + ".rgba.png"
img.save(temp_rgba_path, "PNG", optimize=True, compress_level=9)
rgba_size = os.path.getsize(temp_rgba_path)
print(f"Compressed RGBA size: {rgba_size} bytes ({rgba_size / 1024:.2f} KB)")

# Option 2: Convert to Palette mode with transparency and compress
temp_p_path = logo_path + ".p.png"
# Save with palette conversion to reduce color depth (usually looks identical for logo graphics)
p_img = img.convert("P", palette=Image.Palette.ADAPTIVE, colors=256)
p_img.save(temp_p_path, "PNG", optimize=True, compress_level=9)
p_size = os.path.getsize(temp_p_path)
print(f"Compressed Palette size: {p_size} bytes ({p_size / 1024:.2f} KB)")

# Choose the smallest version and overwrite the original
best_path = temp_p_path if p_size < rgba_size else temp_rgba_path
os.replace(best_path, logo_path)

# Clean up temp files
if os.path.exists(temp_rgba_path):
    os.remove(temp_rgba_path)
if os.path.exists(temp_p_path):
    os.remove(temp_p_path)

new_size = os.path.getsize(logo_path)
print(f"🟢 Logo successfully optimized and overwritten!")
print(f"New logo size: {new_size} bytes ({new_size / 1024:.2f} KB) - Saved {((original_size - new_size)/original_size)*100:.1f}% space.")
