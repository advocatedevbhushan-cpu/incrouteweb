import re

filepath = r"c:\Users\Dev\OneDrive\Company Information\My website\fggf\My website\legiscorp-registrations\src\components\RegistrationServices.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("Searching for catalog/image references...")
for i, line in enumerate(lines):
    if "image:" in line or "serviceCatalog" in line:
        print(f"Line {i+1}: {line.strip()}")
