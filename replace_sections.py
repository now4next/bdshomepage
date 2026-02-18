#!/usr/bin/env python3
"""
Replace old sections with modern redesigned sections
"""

# Read the original file
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Read the new modern sections
with open('modern_sections.html', 'r', encoding='utf-8') as f:
    new_sections = f.read()

# Find line numbers
education_start = 1541  # Line before "<!-- Education Philosophy Section -->"
footer_start = 1805     # Line before "<!-- Footer -->"

# Build the new content
new_content = ''.join(lines[:education_start]) + '\n' + new_sections + '\n\n' + ''.join(lines[footer_start:])

# Write the updated file
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Successfully replaced old sections with modern design!")
print(f"   - Removed lines {education_start+1} to {footer_start}")
print(f"   - Inserted modern sections with clean, professional design")
print(f"   - Removed all emoji icons")
print(f"   - Added modern gradients, shadows, and border accents")
