import os
from PIL import Image

logo_path = os.path.join(os.path.dirname(__file__), "..", "public", "incroute_logo.png")
if not os.path.exists(logo_path):
    print("Error: Logo file not found at " + logo_path)
    exit(1)

# Open image
img = Image.open(logo_path)
width, height = img.size
print("Original logo dimensions: " + str(width) + "x" + str(height))

# Target size: max 256px width/height while maintaining aspect ratio
max_size = 256
if width > max_size or height > max_size:
    ratio = min(max_size / width, max_size / height)
    new_width = int(width * ratio)
    new_height = int(height * ratio)
    # Use Lanczos resampling (formerly ANTIALIAS)
    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    print("Resized logo dimensions to: " + str(new_width) + "x" + str(new_height))

# Save image with optimal settings
img.save(logo_path, "PNG", optimize=True, compress_level=9)

new_size = os.path.getsize(logo_path)
print("Logo successfully resized and optimized.")
print("New logo size: " + str(new_size) + " bytes (" + str(new_size / 1024) + " KB)")
