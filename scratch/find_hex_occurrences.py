import re

filepath = r"c:\Users\Dev\OneDrive\Company Information\My website\fggf\My website\legiscorp-registrations\src\components\RegistrationServices.tsx"
gold_patterns = [
    r"#C7A86B",
    r"#E5C687",
    r"#F0D090",
    r"#F5DFA0",
    r"#D4B87A"
]

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("Scanning for gold colors...")
for i, line in enumerate(lines):
    for pattern in gold_patterns:
        if re.search(pattern, line, re.IGNORECASE):
            print(f"Line {i+1}: {line.strip()}")
            break
