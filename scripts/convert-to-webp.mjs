/**
 * Convert selected large images to WebP to improve page load on mobile.
 * Usage: node scripts/convert-to-webp.mjs
 */
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const imagesDir = path.resolve(process.cwd(), 'images');

// Curated list of heavier assets across pages
const targets = [
  // Home
  'image3.jpg',
  'image4.jpg',
  'image5.png',

  // Batch2 event
  'batch2final-1.jpg',
  'batch2final-2.jpg',
  'batch2final-3.jpg',

  // Portfolio logos
  'skysail.jpeg',
  'bellfeeds.jpeg',
  'mosoro.jpg',
  'crafty-steaks.jpg',
  'nyumbani.png',
  'paycloud.png',
  'aluvana.png',
  'greenwells.png',
  'jarvis-farm1.png',

  // Class page images
  'kahoot-screenshot.png',
  'Class2.png',
  'Sales Channel Kahoot.png',
  'Retention Kahoot.png',
  'Kahoot5.png',
  'Kahoot6.png',
];

/**
 * Convert a single image to WebP next to the original.
 */
async function convertToWebp(filename) {
  const abs = path.join(imagesDir, filename);
  const webpName = filename.replace(/\.(jpe?g|png)$/i, '.webp');
  const out = path.join(imagesDir, webpName);

  // Skip if already exists
  try {
    await fs.access(out);
    return { filename, out, skipped: true };
  } catch {}

  const isJpeg = /\.(jpe?g)$/i.test(filename);
  const isPng = /\.png$/i.test(filename);

  const pipeline = sharp(abs).rotate(); // auto-orient
  const quality = isJpeg ? 78 : 80;
  await pipeline.webp({ quality, effort: 5 }).toFile(out);
  return { filename, out, skipped: false };
}

async function main() {
  const results = [];
  for (const f of targets) {
    try {
      results.push(await convertToWebp(f));
    } catch (err) {
      console.error('Failed to convert:', f, err?.message ?? err);
    }
  }
  const converted = results.filter(r => !r.skipped);
  console.log(`Converted ${converted.length} images to WebP.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


