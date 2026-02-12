#!/usr/bin/env python3
"""
Script to remove background from MARZ_Headshot.png and make it transparent
"""

import os
from PIL import Image
import numpy as np
try:
    from rembg import remove
    HAS_REMBG = True
except ImportError:
    print("rembg not available, trying alternative approach...")
    HAS_REMBG = False

def remove_background_with_rembg(input_path, output_path):
    """Remove background using rembg library"""
    from rembg import remove
    from PIL import Image
    
    # Open and process the image
    input_image = Image.open(input_path)
    
    # Convert to RGB if necessary (rembg expects RGB)
    if input_image.mode != 'RGB':
        input_image = input_image.convert('RGB')
    
    # Remove background
    output_image = remove(input_image)
    
    # Save with transparency
    output_image.save(output_path, "PNG")
    print(f"Background removed using rembg. Saved to {output_path}")

def remove_background_simple_approach(input_path, output_path):
    """
    Simple approach to make white background transparent
    This is a fallback if rembg is not available
    """
    img = Image.open(input_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Get the data of the image
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # If the pixel is close to white, make it transparent
        if item[0] > 200 and item[1] > 200 and item[2] > 200:  # RGB values near white
            newData.append((255, 255, 255, 0))  # Transparent pixel
        else:
            newData.append(item)
    
    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Background removed using simple approach. Saved to {output_path}")

def main():
    input_path = "public/MARZ_Headshot.png"
    output_path = "public/MARZ_Headshot_transparent.png"
    
    if not os.path.exists(input_path):
        print(f"Input file {input_path} does not exist!")
        return
    
    print("Attempting to remove background from MARZ headshot...")
    
    if HAS_REMBG:
        try:
            remove_background_with_rembg(input_path, output_path)
        except Exception as e:
            print(f"Rembg approach failed: {e}")
            print("Trying simple approach...")
            remove_background_simple_approach(input_path, output_path)
    else:
        remove_background_simple_approach(input_path, output_path)
    
    print("Process completed!")

if __name__ == "__main__":
    main()