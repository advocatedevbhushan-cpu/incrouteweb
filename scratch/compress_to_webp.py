import os
from PIL import Image

public_dir = os.path.join(os.path.dirname(__file__), "..", "public")
files = os.listdir(public_dir)

png_files = [f for f in files if f.endswith(".png")]

print(f"Found {len(png_files)} PNG files to optimize.")

total_original_size = 0
total_new_size = 0

for filename in png_files:
    # Skip the logo if it's already tiny/optimized, but we can process it too.
    # Actually, incroute_logo.png is 44KB, which is fine.
    # Let's compress 'Inc Route Logo.png' to 'incroute_logo.webp' or similar, but wait,
    # the site references '/incroute_logo.png' in many places.
    # Let's compress all PNG files!
    
    file_path = os.path.join(public_dir, filename)
    original_size = os.path.getsize(file_path)
    total_original_size += original_size
    
    # Define new webp path
    base_name = os.path.splitext(filename)[0]
    # Replace spaces with underscores or keep as is
    base_name_clean = base_name.replace(" ", "_").lower()
    webp_filename = base_name_clean + ".webp"
    webp_path = os.path.join(public_dir, webp_filename)
    
    try:
        img = Image.open(file_path)
        width, height = img.size
        
        # Max dimension 600px for card illustrations
        # If it's a logo (like incroute_logo.png or Inc Route Logo.png), maybe keep it smaller, or max 300px.
        max_dim = 600
        if "logo" in filename.lower():
            max_dim = 300
            
        if width > max_dim or height > max_dim:
            ratio = min(max_dim / width, max_dim / height)
            new_width = int(width * ratio)
            new_height = int(height * ratio)
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
        # Convert RGBA to RGB if saving without transparency, but webp supports transparency, so keep mode.
        img.save(webp_path, "WEBP", quality=80)
        new_size = os.path.getsize(webp_path)
        total_new_size += new_size
        
        savings = (original_size - new_size) / original_size * 100
        print(f"Compressed {filename} ({original_size/1024:.1f} KB) -> {webp_filename} ({new_size/1024:.1f} KB) | Saved {savings:.1f}%")
        
    except Exception as e:
        print(f"Error compressing {filename}: {e}")

print("\n--- Summary ---")
print(f"Original total size: {total_original_size / (1024*1024):.2f} MB")
print(f"New total WebP size: {total_new_size / (1024*1024):.2f} MB")
if total_original_size > 0:
    print(f"Total space saved: {((total_original_size - total_new_size) / total_original_size) * 100:.1f}%")
