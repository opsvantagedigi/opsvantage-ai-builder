# PWA Setup Script for MARZ
# This creates placeholder icons for the PWA

echo "Creating PWA icons directory..."
mkdir -p public/icons
mkdir -p public/screenshots

# Create a simple SVG icon for MARZ
cat > public/icons/marz-icon-192.svg << 'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0891b2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="192" height="192" rx="40" fill="url(#grad)"/>
  <circle cx="96" cy="80" r="35" fill="white" opacity="0.9"/>
  <circle cx="96" cy="80" r="25" fill="#0f172a"/>
  <path d="M 56 130 Q 96 150 136 130" stroke="white" stroke-width="8" stroke-linecap="round" fill="none"/>
  <circle cx="80" cy="75" r="8" fill="#06b6d4"/>
  <circle cx="112" cy="75" r="8" fill="#06b6d4"/>
</svg>
SVG

echo "PWA icons created in public/icons/"
echo ""
echo "To generate proper PNG icons, use one of these options:"
echo "1. Use an online SVG to PNG converter"
echo "2. Use ImageMagick: convert -density 300 -background none marz-icon-192.svg marz-icon-192.png"
echo "3. Use a PWA icon generator tool"
echo ""
echo "Required icon sizes:"
echo "  - 192x192 (for Android home screen)"
echo "  - 512x512 (for Android splash screen)"
echo "  - 96x96 (for shortcuts)"
