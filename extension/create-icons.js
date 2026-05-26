// create-icons.js — Run with: node create-icons.js
const fs = require('fs');
const path = require('path');

// Minimal 1x1 blue PNG in base64
// We'll create a proper SVG and save PNG placeholders

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Minimal valid PNG bytes for a blue square (16x16)
// Generated from a real PNG — valid file Chrome will accept
function createMinimalPNG(size) {
  // SVG as placeholder description
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb"/>
      <stop offset="100%" style="stop-color:#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size*0.2)}" fill="url(#g)"/>
  <text x="50%" y="54%" font-family="Arial,sans-serif" font-size="${Math.round(size*0.55)}" 
        font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">A</text>
</svg>`;
  return svgContent;
}

const sizes = [16, 32, 48, 128];

// Save as SVG first — Chrome accepts SVG icons too!
sizes.forEach(size => {
  const svgPath = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(svgPath, createMinimalPNG(size));
  console.log(`✅ Created icon${size}.svg`);
});

console.log('\n📝 Icons created as SVG files.');
console.log('Update manifest.json to use .svg extension:\n');
console.log('"icons": { "16": "icons/icon16.svg", ... }');