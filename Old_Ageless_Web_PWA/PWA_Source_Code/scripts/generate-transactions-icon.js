// Generates monochrome, transparent PNG icons for Transactions from web/icons/bagicon.jpg
// Outputs:
//  - web/icons/bagicon-transactions@2x.png (60x60)
//  - web/icons/bagicon-transactions.png (30x30)
// Heuristics: remove near-white background, threshold to black silhouette, center with padding.

const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function generate() {
  const SRC = path.resolve(__dirname, '..', 'web', 'icons', 'bagicon.jpg');
  const OUT_DIR = path.resolve(__dirname, '..', 'web', 'icons');
  const OUT_2X = path.join(OUT_DIR, 'bagicon-transactions@2x.png');
  const OUT_1X = path.join(OUT_DIR, 'bagicon-transactions.png');

  if (!fs.existsSync(SRC)) {
    console.error('[gen-transactions-icon] Source not found:', SRC);
    process.exitCode = 1;
    return;
  }

  await ensureDir(OUT_DIR);

  const img = await Jimp.read(SRC);

  // Normalize: convert to RGBA, increase contrast gently for clearer thresholding
  img.color([{ apply: 'desaturate', params: [100] }]).contrast(0.2);

  // Remove near-white background by setting alpha to 0 for pixels above a brightness threshold
  // Threshold tuned for typical white/near-white backgrounds
  const WHITE_THR = 245; // 0..255, higher = more pixels become transparent
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const a = this.bitmap.data[idx + 3];
    if (a > 0 && r >= WHITE_THR && g >= WHITE_THR && b >= WHITE_THR) {
      this.bitmap.data[idx + 3] = 0; // transparent
    }
  });

  // Auto-crop transparent borders (with tolerance)
  img.autocrop({
    tolerance: 10,
    leaveBorder: 0,
  });

  // Convert any non-transparent pixels to solid black for a clean monochrome silhouette
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
    const a = this.bitmap.data[idx + 3];
    if (a > 10) { // keep semi-opaque as opaque
      this.bitmap.data[idx + 0] = 0;
      this.bitmap.data[idx + 1] = 0;
      this.bitmap.data[idx + 2] = 0;
      this.bitmap.data[idx + 3] = 255;
    }
  });

  // Create a 60x60 canvas and center-fit the silhouette with ~3px padding (retina for 30x30)
  const TARGET_2X = 60;
  const PADDING = 3; // pixels on each side (optical margin)
  const fitW = TARGET_2X - PADDING * 2;
  const fitH = TARGET_2X - PADDING * 2;

  // Compute scale to fit within fitW x fitH preserving aspect ratio
  const scale = Math.min(fitW / img.bitmap.width, fitH / img.bitmap.height);
  const newW = Math.max(1, Math.round(img.bitmap.width * scale));
  const newH = Math.max(1, Math.round(img.bitmap.height * scale));
  img.resize(newW, newH, Jimp.RESIZE_BILINEAR);

  const canvas2x = new Jimp(TARGET_2X, TARGET_2X, 0x00000000);
  const xOff = Math.round((TARGET_2X - newW) / 2);
  const yOff = Math.round((TARGET_2X - newH) / 2);
  canvas2x.composite(img, xOff, yOff);

  await canvas2x.writeAsync(OUT_2X);

  // Downscale to 30x30 for 1x fallback
  const canvas1x = canvas2x.clone().resize(30, 30, Jimp.RESIZE_BILINEAR);
  await canvas1x.writeAsync(OUT_1X);

  console.log('[gen-transactions-icon] Wrote:', OUT_2X);
  console.log('[gen-transactions-icon] Wrote:', OUT_1X);
}

generate().catch(err => {
  console.error('[gen-transactions-icon] Failed:', err);
  process.exitCode = 1;
});
