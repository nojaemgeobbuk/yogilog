/**
 * SVG Icon Fix Script
 *
 * This script removes background layers from SVG files and ensures
 * proper fill attributes for "Warm Minimal" design system.
 *
 * What it does:
 * 1. Removes background path (path0 that covers entire canvas)
 * 2. Keeps fill="currentColor" for dynamic color control
 * 3. Removes any hardcoded fill colors
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'assets', 'images', 'icons-optimized');

// Check if path is a background layer (covers entire canvas starting from origin)
function isBackgroundPath(pathData) {
  if (!pathData) return false;

  // Background paths typically start with M0 (origin) and draw a rectangle
  // covering the entire canvas
  const trimmed = pathData.trim();

  // Check for patterns that indicate a background layer:
  // 1. Starts with M0.000 or M0 (origin point)
  // 2. Contains 4 corner movements to form a rectangle
  // 3. The path draws the outer boundary before the actual content

  // Common pattern: M0.000 109.083 L 0.000 218.167 200.000 218.167 L 400.000 218.167...
  // This is a rectangle from (0,0) to (400, 218) which is the full canvas

  if (trimmed.startsWith('M0.000') || trimmed.startsWith('M0 ')) {
    // Check if the first few coordinates form a rectangle boundary
    const firstPart = trimmed.substring(0, 200);

    // If path starts at origin and immediately draws to canvas edges, it's a background
    if (firstPart.includes('L 0.000') &&
        (firstPart.includes('200.000') || firstPart.includes('400.000'))) {
      return true;
    }
  }

  return false;
}

// Process a single SVG file
function processSvgFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Parse path elements
  const pathRegex = /<path\s+id="path(\d+)"([^>]*)>/g;
  let modified = content;
  let removed = false;

  // Find all paths and check path0
  const match = content.match(/<path\s+id="path0"\s+d="([^"]*)"[^>]*>/);
  if (match) {
    const pathData = match[1];

    if (isBackgroundPath(pathData)) {
      // Remove the entire path0 element
      const path0Regex = /<path\s+id="path0"[^>]*><\/path>|<path\s+id="path0"[^\/]*\/>/g;

      // Handle both self-closing and regular path elements
      modified = modified.replace(/<path\s+id="path0"[^>]*>(?:<\/path>)?/g, '');
      removed = true;
      console.log(`  Removed background layer from: ${path.basename(filePath)}`);
    }
  }

  // Ensure all paths use currentColor for fill
  modified = modified.replace(/fill="#[A-Fa-f0-9]{6}"/g, 'fill="currentColor"');
  modified = modified.replace(/fill="#[A-Fa-f0-9]{3}"/g, 'fill="currentColor"');

  // Clean up any double newlines created by removal
  modified = modified.replace(/\n\s*\n/g, '\n');

  if (modified !== content) {
    fs.writeFileSync(filePath, modified, 'utf-8');
    return true;
  }

  return false;
}

// Main execution
console.log('SVG Icon Fix Script');
console.log('===================\n');
console.log(`Processing SVGs in: ${iconsDir}\n`);

let processedCount = 0;
let modifiedCount = 0;

try {
  const files = fs.readdirSync(iconsDir);
  const svgFiles = files.filter(f => f.endsWith('.svg'));

  console.log(`Found ${svgFiles.length} SVG files\n`);

  for (const file of svgFiles) {
    const filePath = path.join(iconsDir, file);
    processedCount++;

    if (processSvgFile(filePath)) {
      modifiedCount++;
    }
  }

  console.log('\n===================');
  console.log(`Processed: ${processedCount} files`);
  console.log(`Modified: ${modifiedCount} files`);
  console.log('\nDone!');

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
