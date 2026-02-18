#!/usr/bin/env python3
"""
Add Tablet Responsive CSS
- Add @media queries for tablet screens (769px - 1024px)
"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Tablet CSS - add between desktop and mobile
tablet_css = """
    
    /* Tablet Responsive (769px - 1024px) */
    @media (min-width: 769px) and (max-width: 1024px) {
      .header-container {
        padding: 18px 30px;
      }
      
      .hero-title {
        font-size: 3.5rem;
      }
      
      .hero-subtext {
        font-size: 16px;
      }
      
      .news-item {
        gap: 30px;
      }
      
      .news-item-title {
        font-size: 2.25rem;
      }
      
      .news-item-description {
        font-size: 16px;
      }
      
      .section-title {
        font-size: 2.25rem;
      }
      
      .cards-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
        gap: 25px !important;
      }
      
      .feature-card {
        padding: 30px 25px;
      }
      
      .section-content {
        padding: 80px 40px;
      }
    }
"""

# Find where to insert (after the @media (max-width: 1024px) section)
import re

# Find the end of @media (max-width: 1024px)
pattern = r'(@media \(max-width: 1024px\) \{[\s\S]*?    \}\s*)'
match = re.search(pattern, content)

if match:
    # Insert tablet CSS after the 1024px media query
    enhanced_content = content[:match.end()] + "\n" + tablet_css + "\n" + content[match.end():]
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(enhanced_content)
    
    print("✅ Tablet responsiveness added successfully!")
else:
    print("❌ Could not find @media (max-width: 1024px) block")
