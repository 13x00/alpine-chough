#!/usr/bin/env node
/**
 * check-image-metadata.mjs
 *
 * Audits images in public/photos/ for embedded metadata (EXIF, XMP, ICC,
 * orientation, DateTimeOriginal). Uses Sharp only. Fails gracefully per file.
 *
 * Run: npm run images:metadata
 */

import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

const PHOTOS_DIR = 'public/photos';
const IMAGE_EXTS = new Set(['.webp', '.jpg', '.jpeg', '.png']);

/**
 * Parse EXIF buffer as string and extract common tags (no external deps).
 * Returns an object with Date, Make, Model, LensModel, FNumber, ExposureTime, ISO, FocalLength.
 * Uses heuristic string search; does not crash on invalid data.
 */
function parseExifFields(exifBuffer) {
  const out = {
    date: null,
    make: null,
    model: null,
    lensModel: null,
    fNumber: null,
    exposureTime: null,
    iso: null,
    focalLength: null,
  };
  if (!exifBuffer || !Buffer.isBuffer(exifBuffer) || exifBuffer.length < 20) return out;
  let str;
  try {
    str = exifBuffer.toString('ascii', 0, Math.min(exifBuffer.length, 8192));
  } catch {
    return out;
  }
  // Replace non-printable so we don't get runaway matches
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');

  // DateTimeOriginal — "YYYY:MM:DD HH:MM:SS"
  const dateMatch = str.match(/\d{4}:\d{2}:\d{2}\s+\d{2}:\d{2}:\d{2}/);
  if (dateMatch) out.date = dateMatch[0];

  // Make — known manufacturers (first match)
  const makes = [
    'Canon', 'Nikon', 'SONY', 'Sony', 'FUJIFILM', 'Fujifilm', 'OLYMPUS', 'Olympus',
    'Panasonic', 'Leica', 'LEICA', 'Apple', 'Samsung', 'Pentax', 'RICOH', 'Ricoh',
    'Sigma', 'Hasselblad', 'Phase One', 'OM Digital', 'OM System',
  ];
  for (const make of makes) {
    if (str.includes(make)) {
      out.make = make;
      break;
    }
  }

  // Model — skip junk (Exif, ICC, Adobe); prefer known model patterns
  const skip = /\b(Exif|ICC|Adobe|II|MM)\b/i;
  const alt = str.match(/\b(ILCE-[A-Z0-9\-]+|DSC-[A-Z0-9\-]+|EOS\s+[A-Z0-9\s\-]+|NIKON\s+[A-Z0-9\s\-]+|iPhone\s+\d+[A-Za-z]*|Pixel\s+\d+)\b/);
  if (alt && !skip.test(alt[1])) out.model = alt[1].trim();
  if (!out.model) {
    const modelMatch = str.match(/\b([A-Z][A-Za-z0-9\-\.]+(?:\s+[A-Za-z0-9\-\.]+){0,3})\s{2,}/);
    if (modelMatch) {
      const candidate = modelMatch[1].trim();
      if (candidate.length >= 2 && candidate.length <= 40 && !/^\d+$/.test(candidate) && !skip.test(candidate))
        out.model = candidate;
    }
  }

  // LensModel — string containing "mm" (and often "F" or "f/")
  const lensMatch = str.match(/\b([\d\.\-]+\s*mm(?:\s+[A-Za-z0-9\-\.\/]+)*)\b/i);
  if (lensMatch) out.lensModel = lensMatch[1].trim();

  // FNumber — F2.8, f/2.8, F2, etc. (ignore bogus like f/0)
  const fMatch = str.match(/[Ff]\/?\s*(\d+(?:\.\d+)?)/);
  if (fMatch) {
    const n = parseFloat(fMatch[1]);
    if (n >= 1 && n <= 64) out.fNumber = `f/${fMatch[1]}`;
  }

  // ExposureTime — 1/400, 1/30, etc.
  const expMatch = str.match(/\b1\/(\d+)\b/);
  if (expMatch) out.exposureTime = `1/${expMatch[1]}`;

  // ISO — ISO 200, or standalone 200/400/800 in plausible range
  const isoLabel = str.match(/ISO\s*(\d+)/i);
  if (isoLabel) out.iso = isoLabel[1];
  if (!out.iso) {
    const isoStandalone = str.match(/\b(50|64|80|100|125|160|200|250|320|400|500|640|800|1000|1250|1600|2000|2500|3200|4000|5000|6400|8000|10000|12800|16000|25600|51200|102400)\b/);
    if (isoStandalone) out.iso = isoStandalone[1];
  }

  // FocalLength — 70mm, 24-70mm, 24.5 mm
  const flMatch = str.match(/\b(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)\s*mm\b/i);
  if (flMatch) out.focalLength = flMatch[1].replace(/\s+/g, '') + 'mm';

  return out;
}

async function collectImageFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = extname(entry.name).toLowerCase();
    if (IMAGE_EXTS.has(ext)) files.push(join(dir, entry.name));
  }
  return files.sort();
}

async function auditFile(filePath) {
  const name = filePath.split('/').pop();
  const meta = await sharp(filePath).metadata();

  const hasEXIF = Boolean(meta.exif && meta.exif.length > 0);
  const hasXMP = Boolean(meta.xmp && meta.xmp.length > 0);
  const hasICC = Boolean(meta.icc && meta.icc.length > 0) || Boolean(meta.hasProfile);
  const orientation = meta.orientation ?? '—';
  const exifFields = hasEXIF ? parseExifFields(meta.exif) : null;

  return {
    name,
    format: meta.format ?? '?',
    width: meta.width ?? '?',
    height: meta.height ?? '?',
    hasEXIF,
    hasXMP,
    hasICC,
    orientation,
    exifFields,
  };
}

function printResult(r) {
  const e = r.exifFields;
  console.log(r.name);
  console.log(`  format: ${r.format}`);
  console.log(`  size: ${r.width}x${r.height}`);
  console.log(`  EXIF: ${r.hasEXIF ? 'yes' : 'no'}`);
  console.log(`  XMP: ${r.hasXMP ? 'yes' : 'no'}`);
  console.log(`  ICC: ${r.hasICC ? 'yes' : 'no'}`);
  console.log(`  orientation: ${r.orientation}`);
  if (e) {
    console.log(`  Date: ${e.date ?? 'unknown'}`);
    const camera = [e.make, e.model].filter(Boolean).join(' ') || 'unknown';
    console.log(`  Camera: ${camera}`);
    console.log(`  Lens: ${e.lensModel ?? 'unknown'}`);
    console.log(`  ISO: ${e.iso ?? 'unknown'}`);
    console.log(`  Exposure: ${e.exposureTime ?? 'unknown'}`);
    console.log(`  Focal Length: ${e.focalLength ?? 'unknown'}`);
    if (e.fNumber) console.log(`  FNumber: ${e.fNumber}`);
  }
}

async function main() {
  let files;
  try {
    files = await collectImageFiles(PHOTOS_DIR);
  } catch (err) {
    console.error(`Error reading directory ${PHOTOS_DIR}:`, err.message);
    process.exitCode = 1;
    return;
  }

  if (files.length === 0) {
    console.log(`No image files (.webp, .jpg, .jpeg, .png) found in ${PHOTOS_DIR}`);
    return;
  }

  let withEXIF = 0;
  let withXMP = 0;
  let withICC = 0;
  let withoutAny = 0;

  for (const file of files) {
    try {
      const r = await auditFile(file);
      printResult(r);

      if (r.hasEXIF) withEXIF++;
      if (r.hasXMP) withXMP++;
      if (r.hasICC) withICC++;
      if (!r.hasEXIF && !r.hasXMP && !r.hasICC) withoutAny++;
    } catch (err) {
      console.log(file.split('/').pop());
      console.log(`  [error] ${err.message}`);
    }
  }

  console.log('\nSummary');
  console.log('-------');
  console.log(`Images scanned: ${files.length}`);
  console.log(`With EXIF: ${withEXIF}`);
  console.log(`With XMP: ${withXMP}`);
  console.log(`Without metadata: ${withoutAny}`);
}

main();
