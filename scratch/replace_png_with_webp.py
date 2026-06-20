import os

workspace_dir = os.path.join(os.path.dirname(__file__), "..")
src_dir = os.path.join(workspace_dir, "src")

# List of files to process
files_to_process = []

# Collect all files in src recursively
for root, dirs, filenames in os.walk(src_dir):
    for filename in filenames:
        if filename.endswith((".tsx", ".ts", ".css")):
            files_to_process.append(os.path.join(root, filename))

# Add index.html as well
files_to_process.append(os.path.join(workspace_dir, "index.html"))

# Image mappings to replace
# We want to replace references to specific compressed images, or we can do a general replacement of .png with .webp for our assets.
# Let's list the assets we converted:
assets = [
    "annual_compliances", "brand_protection", "consultancy_strategy", "fssai_food_safety",
    "gst_tax_registration", "iso_certification", "legal_policy_drafting", "litigation_assistance",
    "llp_partners", "msme_udyam", "opc_director", "partnership_firm", "patent_invention",
    "pvt_ltd_corp", "section8_ngo", "tax_return_filing", "trademark_assignment", "trademark_brand",
    "trademark_defense", "trademark_opposition", "trademark_renewal", "virtual_cfo_analytics",
    "virtual_office_workspace", "incroute_logo"
]

replacements = 0

for file_path in files_to_process:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        new_content = content
        
        # Replace each asset .png with .webp
        for asset in assets:
            png_ref = f"/{asset}.png"
            webp_ref = f"/{asset}.webp"
            if png_ref in new_content:
                new_content = new_content.replace(png_ref, webp_ref)
                
            # Check without leading slash
            png_ref_no_slash = f'"{asset}.png"'
            webp_ref_no_slash = f'"{asset}.webp"'
            if png_ref_no_slash in new_content:
                new_content = new_content.replace(png_ref_no_slash, webp_ref_no_slash)
                
            # Check with single quotes
            png_ref_single = f"'{asset}.png'"
            webp_ref_single = f"'{asset}.webp'"
            if png_ref_single in new_content:
                new_content = new_content.replace(png_ref_single, webp_ref_single)
                
        # Also replace incroute_logo.png generally if it is loaded from public
        if "incroute_logo.png" in new_content:
            new_content = new_content.replace("incroute_logo.png", "incroute_logo.webp")
            
        if new_content != content:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Updated image references in {os.path.basename(file_path)}")
            replacements += 1
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print(f"Finished. Updated {replacements} files.")
