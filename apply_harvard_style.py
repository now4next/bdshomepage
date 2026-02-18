#!/usr/bin/env python3
"""
Replace modern sections with Harvard-style sections
"""

# Read the original file
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Read the new Harvard-style sections
with open('harvard_style_sections.html', 'r', encoding='utf-8') as f:
    new_sections = f.read()

# Find line numbers (0-indexed, so subtract 1)
education_start = 1561  # Line before "<!-- Education Philosophy Section"
footer_start = 1814     # Line before "<!-- Footer -->"

# Build the new content
new_content = ''.join(lines[:education_start]) + '\n' + new_sections + '\n\n' + ''.join(lines[footer_start:])

# Write the updated file
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Successfully replaced sections with Harvard-style design!")
print(f"   - Removed old sections (lines {education_start+1} to {footer_start})")
print(f"   - Applied Harvard design principles:")
print(f"     • Clean white/gray backgrounds")
print(f"     • Black/dark gray text (no red)")
print(f"     • No icons, typography-focused")
print(f"     • Optimal spacing (80px padding)")
print(f"     • Merriweather serif headings")
print(f"     • Border accents instead of shadows")
print(f"     • Minimal, professional aesthetic")
