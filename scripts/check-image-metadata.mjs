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
 * Attempt to extract DateTimeOriginal from raw EXIF buffer.
 * EXIF stores it as ASCII "YYYY:MM:DD HH:MM:SS". We scan for that pattern.
 */
function extractDateTimeOriginal(exifBuffer) {
  if (!exifBuffer || !Buffer.isBuffer(exifBuffer) || exifBuffer.length < 20) return null;
  try {
    const str = exifBuffer.toString('ascii', 0, Math.min(exifBuffer.length, 4096));
    const match = str.match(/\d{4}:\d{2}:\d{2}\s+\d{2}:\d{2}:\d{2}/);
    if (!match) return null;
    const s = match[0];
    return s.slice(0, 10).replace(/:/g, '-') + s.slice(10);
  } catch {
    return null;
  }
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
  const date = hasEXIF ? extractDateTimeOriginal(meta.exif) : null;

  return {
    name,
    format: meta.format ?? '?',
    width: meta.width ?? '?',
    height: meta.height ?? '?',
    hasEXIF,
    hasXMP,
    hasICC,
    orientation,
    date,
  };
}

function printResult(r) {
  console.log(r.name);
  console.log(`  format: ${r.format}`);
  console.log(`  size: ${r.width}x${r.height}`);
  console.log(`  EXIF: ${r.hasEXIF ? 'yes' : 'no'}`);
  console.log(`  XMP: ${r.hasXMP ? 'yes' : 'no'}`);
  console.log(`  ICC: ${r.hasICC ? 'yes' : 'no'}`);
  console.log(`  orientation: ${r.orientation}`);
  if (r.date) console.log(`  date: ${r.date}`);
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
