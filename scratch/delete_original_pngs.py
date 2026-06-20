import os

public_dir = os.path.join(os.path.dirname(__file__), "..", "public")
files = os.listdir(public_dir)

png_files = [f for f in files if f.endswith(".png")]

# List of assets that we converted
assets_to_delete = [
    "annual_compliances.png", "brand_protection.png", "consultancy_strategy.png", "fssai_food_safety.png",
    "gst_tax_registration.png", "iso_certification.png", "legal_policy_drafting.png", "litigation_assistance.png",
    "llp_partners.png", "msme_udyam.png", "opc_director.png", "partnership_firm.png", "patent_invention.png",
    "pvt_ltd_corp.png", "section8_ngo.png", "tax_return_filing.png", "trademark_assignment.png", "trademark_brand.png",
    "trademark_defense.png", "trademark_opposition.png", "trademark_renewal.png", "virtual_cfo_analytics.png",
    "virtual_office_workspace.png", "Inc Route Logo.png"
]

deleted = 0
for filename in png_files:
    if filename in assets_to_delete:
        file_path = os.path.join(public_dir, filename)
        try:
            os.remove(file_path)
            print(f"Deleted original PNG: {filename}")
            deleted += 1
        except Exception as e:
            print(f"Error deleting {filename}: {e}")

print(f"Cleaned up {deleted} PNG files.")
