#!/usr/bin/env python3
"""
Mobile Responsiveness Optimization Script
- Enhance mobile responsiveness for all sections
- Add better spacing and touch targets for mobile
"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Enhanced mobile CSS - add to existing @media (max-width: 768px) section
mobile_enhancements = """
      
      /* Enhanced News Items Mobile */
      .news-item-image-container {
        height: auto !important;
        min-height: 250px;
      }
      
      .news-item-title {
        font-size: 1.75rem !important;
        line-height: 1.3;
        margin-bottom: 15px;
      }
      
      .news-item-description {
        font-size: 16px !important;
        line-height: 1.6;
      }
      
      /* Section Padding Mobile */
      .news-section,
      .section-content {
        padding: 60px 20px !important;
      }
      
      .section-title {
        font-size: 1.875rem !important;
        margin-bottom: 20px;
      }
      
      .section-subtitle {
        font-size: 16px !important;
        line-height: 1.6;
      }
      
      /* Cards Mobile Optimization */
      .cards-grid {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
        padding: 0 10px;
      }
      
      .feature-card {
        padding: 25px 20px !important;
      }
      
      .feature-icon {
        font-size: 2rem !important;
        margin-bottom: 12px;
      }
      
      .feature-title {
        font-size: 1.25rem !important;
        margin-bottom: 10px;
      }
      
      .feature-description {
        font-size: 15px !important;
        line-height: 1.5;
      }
      
      /* Footer Mobile */
      .footer-section {
        padding: 40px 20px !important;
        text-align: center;
      }
      
      .footer-content {
        flex-direction: column !important;
        gap: 30px !important;
      }
      
      .footer-column {
        width: 100% !important;
        text-align: center;
      }
"""

# Find the closing brace of the @media (max-width: 768px) section
# Insert the enhancements before the closing brace
import re

# Find the @media (max-width: 768px) block
media_pattern = r'(@media \(max-width: 768px\) \{[\s\S]*?)(    \})'
match = re.search(media_pattern, content)

if match:
    # Insert the enhancements before the closing brace
    enhanced_content = content[:match.end(1)] + mobile_enhancements + "\n" + content[match.start(2):]
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(enhanced_content)
    
    print("✅ Mobile responsiveness enhancements added successfully!")
else:
    print("❌ Could not find @media (max-width: 768px) block")
