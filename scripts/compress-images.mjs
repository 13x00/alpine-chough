#!/usr/bin/env node
/**
 * compress-images.mjs
 *
 * Non-destructive image optimisation pipeline.
 *
 * Reads originals from assets/originals/, writes optimised copies to public/.
 * Originals are NEVER modified. A local cache (scripts/.image-cache.json)
 * records each file's mtime+size so unchanged originals are skipped on
 * subsequent runs.
 *
 * Modes:
 *   (default)  process new/changed originals, write outputs
 *   --dry-run  preview only — no writes; exits 1 if any file would be written
 *   --clean    delete output files in public/ with no matching original
 *   --clean --dry-run  preview which orphans would be deleted, no deletes
 */

import sharp from 'sharp';
import { readdir, stat, writeFile, readFile, mkdir, unlink } from 'node:fs/promises';
import { existsSync }                                        from 'node:fs';
import { join, extname, dirname, relative }                  from 'node:path';

const DRY_RUN = process.argv.includes('--dry-run');
const CLEAN   = process.argv.includes('--clean');

const CACHE_PATH = 'scripts/.image-cache.json';

/**
 * Source → output mappings.
 * maxDim: longest edge cap (aspect-ratio preserved; never upscaled).
 */
const SOURCES = [
  {
    inputDir:  'assets/originals/photos',
    outputDir: 'public/photos',
    maxDim:    3840,
  },
  {
    inputDir:  'assets/originals/portraits',
    outputDir: 'public/Portrait_cycle',
    maxDim:    2400,
  },
];

const JPEG_EXTS = new Set(['.jpg', '.jpeg']);
const PNG_EXTS  = new Set(['.png']);

// ── Utilities ─────────────────────────────────────────────────────────────────

function fmt(bytes) {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function loadCache() {
  try {
    return JSON.parse(await readFile(CACHE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2) + '\n');
}

/** Recursively collect all image paths under a directory. */
async function collectImages(dir) {
  let results = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    console.warn(`  [warn] directory not found, skipping: ${dir}`);
    return results;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await collectImages(fullPath));
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (JPEG_EXTS.has(ext) || PNG_EXTS.has(ext)) results.push(fullPath);
    }
  }
  return results;
}

/**
 * Resolve the output path for an input file.
 * PNG-without-alpha is converted to JPEG so the extension changes to .jpg.
 */
function resolveOutputPath(inputPath, inputDir, outputDir, convertToJpeg) {
  const rel    = relative(inputDir, inputPath);
  const ext    = extname(rel).toLowerCase();
  const relOut = convertToJpeg && PNG_EXTS.has(ext)
    ? rel.slice(0, -ext.length) + '.jpg'
    : rel;
  return join(outputDir, relOut);
}

// ── Per-file processing ───────────────────────────────────────────────────────

async function processFile(inputPath, inputDir, outputDir, maxDim, cache) {
  const fileStat = await stat(inputPath);
  const ext      = extname(inputPath).toLowerCase();
  const isPng    = PNG_EXTS.has(ext);

  const alpha         = isPng ? (await sharp(inputPath).metadata()).hasAlpha === true : false;
  const convertToJpeg = isPng && !alpha;

  const outPath  = resolveOutputPath(inputPath, inputDir, outputDir, convertToJpeg);
  const cacheKey = inputPath;
  const cached   = cache[cacheKey];

  // Cache hit: same mtime + size and output already on disk → skip.
  if (
    cached &&
    cached.mtimeMs === fileStat.mtimeMs &&
    cached.size    === fileStat.size    &&
    existsSync(outPath)
  ) {
    console.log(`  [cached] ${inputPath}`);
    return { status: 'cached', originalSize: fileStat.size, newSize: cached.outputSize };
  }

  // Build sharp pipeline.
  let pipeline = sharp(inputPath)
    .withMetadata(false)
    .resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true });

  let outputBuffer;
  if (!isPng || convertToJpeg) {
    outputBuffer = await pipeline
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toBuffer();
  } else {
    outputBuffer = await pipeline
      .png({ compressionLevel: 9, effort: 10 })
      .toBuffer();
  }

  const origSize = fileStat.size;
  const newSize  = outputBuffer.byteLength;
  const saving   = origSize - newSize;
  const pct      = ((saving / origSize) * 100).toFixed(1);
  const tag      = saving >= 0 ? `↓ ${pct}%` : `↑ grew ${Math.abs(Number(pct))}%`;
  const fmtTag   = convertToJpeg ? ' [png→jpg]' : '';

  console.log(
    `  ${inputPath}${fmtTag}\n` +
    `    → ${outPath}  ${fmt(origSize)} → ${fmt(newSize)}  (${tag})`
  );

  if (!DRY_RUN) {
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, outputBuffer);
    cache[cacheKey] = {
      mtimeMs:    fileStat.mtimeMs,
      size:       fileStat.size,
      outputPath: outPath,
      outputSize: newSize,
    };
  }

  return { status: 'processed', originalSize: origSize, newSize };
}

// ── Compress mode ─────────────────────────────────────────────────────────────

async function runCompress() {
  if (DRY_RUN) {
    console.log('=== DRY RUN — no files will be written ===');
    console.log('    Exits 1 if any file would be written.\n');
  }

  const cache = await loadCache();

  let totalOriginal = 0;
  let totalNew      = 0;
  let nProcessed    = 0;
  let nCached       = 0;
  let nErrors       = 0;

  for (const { inputDir, outputDir, maxDim } of SOURCES) {
    const files = await collectImages(inputDir);
    if (files.length === 0) continue;

    console.log(`\n── ${inputDir} → ${outputDir} (${files.length} file(s), cap ${maxDim}px) ─`);

    for (const file of files) {
      try {
        const r = await processFile(file, inputDir, outputDir, maxDim, cache);
        totalOriginal += r.originalSize;
        totalNew      += r.newSize;
        if (r.status === 'cached') nCached++; else nProcessed++;
      } catch (err) {
        console.error(`  [error] ${file}: ${err.message}`);
        nErrors++;
      }
    }
  }

  if (nProcessed + nCached + nErrors === 0) {
    console.log('No originals found. Add images to assets/originals/ and re-run.');
    return;
  }

  const saving    = totalOriginal - totalNew;
  const savingPct = totalOriginal > 0
    ? ((saving / totalOriginal) * 100).toFixed(1)
    : '0.0';

  console.log('\n── Summary ─────────────────────────────────────────────────');
  console.log(`  Processed (written) : ${nProcessed}`);
  console.log(`  Cached    (skipped) : ${nCached}`);
  if (nErrors) console.log(`  Errors              : ${nErrors}`);
  console.log(`  Originals total     : ${fmt(totalOriginal)}`);
  console.log(`  Outputs   total     : ${fmt(totalNew)}`);
  console.log(`  Saved               : ${fmt(saving)} (${savingPct}%)`);

  if (DRY_RUN) {
    if (nProcessed > 0) {
      console.log(
        `\n  [FAIL] ${nProcessed} file(s) would be written.` +
        '\n         Run: npm run images:compress'
      );
      process.exitCode = 1;
    } else {
      console.log('\n  [OK] All outputs are up to date.');
    }
  } else {
    await saveCache(cache);
    if (nErrors > 0) process.exitCode = 1;
  }
}

// ── Clean mode ────────────────────────────────────────────────────────────────

async function runClean() {
  if (DRY_RUN) {
    console.log('=== DRY RUN — no files will be deleted ===\n');
  } else {
    console.log('=== CLEAN — removing orphaned output files ===\n');
  }

  // Build the full set of output paths that SHOULD exist based on current originals.
  const expectedOutputs = new Set();
  for (const { inputDir, outputDir } of SOURCES) {
    const files = await collectImages(inputDir);
    for (const inputPath of files) {
      const ext   = extname(inputPath).toLowerCase();
      const isPng = PNG_EXTS.has(ext);
      let convertToJpeg = false;
      if (isPng) {
        const meta = await sharp(inputPath).metadata();
        convertToJpeg = !meta.hasAlpha;
      }
      expectedOutputs.add(resolveOutputPath(inputPath, inputDir, outputDir, convertToJpeg));
    }
  }

  const cache          = await loadCache();
  let   cacheModified  = false;
  let   nDeleted       = 0;

  for (const { outputDir } of SOURCES) {
    const outFiles = await collectImages(outputDir);
    for (const outFile of outFiles) {
      if (expectedOutputs.has(outFile)) continue;

      console.log(`  [${DRY_RUN ? 'would delete' : 'delete'}] ${outFile}`);

      if (!DRY_RUN) {
        await unlink(outFile);
        // Prune any cache entry that pointed to this output.
        for (const [key, val] of Object.entries(cache)) {
          if (val.outputPath === outFile) {
            delete cache[key];
            cacheModified = true;
          }
        }
      }
      nDeleted++;
    }
  }

  if (nDeleted === 0) {
    console.log('  No orphaned output files found.');
  } else {
    console.log(`\n  ${DRY_RUN ? 'Would delete' : 'Deleted'}: ${nDeleted} file(s).`);
  }

  if (!DRY_RUN && cacheModified) await saveCache(cache);
}

// ── Entry point ───────────────────────────────────────────────────────────────

CLEAN ? runClean() : runCompress();
