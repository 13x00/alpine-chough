#!/usr/bin/env node
/**
 * compress-images.mjs
 *
 * Non-destructive image optimisation pipeline.
 *
 * Reads originals from assets/originals/, writes TWO optimised copies to
 * public/ for every input:
 *   • <basename>.webp  — canonical deployed format (quality 80, high effort)
 *   • <basename>.jpg   — fallback / archive (quality 82, progressive, mozjpeg)
 *
 * Originals are NEVER modified. All inputs are treated as opaque photos
 * (no alpha handling). Metadata is stripped from all outputs.
 *
 * scripts/.image-cache.json tracks both outputs per original so unchanged
 * files are skipped (idempotent runs).
 *
 * Modes:
 *   (default)          process new/changed originals, write outputs
 *   --dry-run          preview only — no writes; exits 1 if any output would
 *                      be written, 0 if everything is up to date
 *   --clean            delete output files (.webp + .jpg + legacy .png) in
 *                      public/ that have no matching original
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

// Extensions recognised as source inputs.
const INPUT_EXTS = new Set(['.jpg', '.jpeg', '.png']);
// Extensions scanned in output dirs (includes legacy .png and new .webp).
const OUTPUT_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

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

/**
 * Recursively collect files under dir whose extension is in extSet.
 * Defaults to INPUT_EXTS when extSet is omitted.
 */
async function collectFiles(dir, extSet = INPUT_EXTS) {
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
      results = results.concat(await collectFiles(fullPath, extSet));
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (extSet.has(ext)) results.push(fullPath);
    }
  }
  return results;
}

/**
 * Given an input path, return the stem-only relative path (no extension).
 * e.g. assets/originals/photos/DSC07488.jpg → "DSC07488"
 */
function stemRel(inputPath, inputDir) {
  const rel = relative(inputDir, inputPath);
  const ext = extname(rel);
  return rel.slice(0, -ext.length);
}

/** Resolve a specific output path for an input file given the target extension. */
function resolveOut(inputPath, inputDir, outputDir, ext) {
  return join(outputDir, stemRel(inputPath, inputDir) + ext);
}

// ── Per-file processing ───────────────────────────────────────────────────────

async function processFile(inputPath, inputDir, outputDir, maxDim, cache) {
  const fileStat = await stat(inputPath);
  const cached   = cache[inputPath];

  const webpOut = resolveOut(inputPath, inputDir, outputDir, '.webp');
  const jpgOut  = resolveOut(inputPath, inputDir, outputDir, '.jpg');

  // Cache hit: same mtime + size AND both outputs already on disk → skip.
  if (
    cached            &&
    cached.webp       &&
    cached.jpg        &&
    cached.mtimeMs === fileStat.mtimeMs &&
    cached.size    === fileStat.size    &&
    existsSync(webpOut)                 &&
    existsSync(jpgOut)
  ) {
    console.log(`  [cached] ${inputPath}`);
    return {
      status:       'cached',
      originalSize: fileStat.size,
      webpSize:     cached.webp.outputSize,
      jpgSize:      cached.jpg.outputSize,
    };
  }

  // Build the base pipeline (resize only — format applied per clone).
  const base = sharp(inputPath)
    .withMetadata(false)
    .resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true });

  const [webpBuf, jpgBuf] = await Promise.all([
    base.clone().webp({ quality: 80, effort: 6 }).toBuffer(),
    base.clone().jpeg({ quality: 82, progressive: true, mozjpeg: true }).toBuffer(),
  ]);

  const origSize = fileStat.size;
  const webpSize = webpBuf.byteLength;
  const jpgSize  = jpgBuf.byteLength;
  const saving   = origSize - webpSize;
  const pct      = ((saving / origSize) * 100).toFixed(1);
  const tag      = saving >= 0 ? `↓ ${pct}%` : `↑ grew ${Math.abs(Number(pct))}%`;

  console.log(
    `  ${inputPath}\n` +
    `    → ${webpOut}  ${fmt(origSize)} → ${fmt(webpSize)}  (${tag})  [webp]\n` +
    `    → ${jpgOut}   ${fmt(origSize)} → ${fmt(jpgSize)}   [jpg]`
  );

  if (!DRY_RUN) {
    await mkdir(dirname(webpOut), { recursive: true });
    await writeFile(webpOut, webpBuf);
    await writeFile(jpgOut,  jpgBuf);
    cache[inputPath] = {
      mtimeMs: fileStat.mtimeMs,
      size:    fileStat.size,
      webp:    { outputPath: webpOut, outputSize: webpSize },
      jpg:     { outputPath: jpgOut,  outputSize: jpgSize  },
    };
  }

  return { status: 'processed', originalSize: origSize, webpSize, jpgSize };
}

// ── Compress mode ─────────────────────────────────────────────────────────────

async function runCompress() {
  if (DRY_RUN) {
    console.log('=== DRY RUN — no files will be written ===');
    console.log('    Exits 1 if any output would be written.\n');
  }

  const cache = await loadCache();

  let totalOriginal = 0;
  let totalWebp     = 0;
  let totalJpg      = 0;
  let nProcessed    = 0;
  let nCached       = 0;
  let nErrors       = 0;

  for (const { inputDir, outputDir, maxDim } of SOURCES) {
    const files = await collectFiles(inputDir);
    if (files.length === 0) continue;

    console.log(`\n── ${inputDir} → ${outputDir} (${files.length} file(s), cap ${maxDim}px) ─`);

    for (const file of files) {
      try {
        const r = await processFile(file, inputDir, outputDir, maxDim, cache);
        totalOriginal += r.originalSize;
        totalWebp     += r.webpSize;
        totalJpg      += r.jpgSize;
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

  const savingPct = totalOriginal > 0
    ? (((totalOriginal - totalWebp) / totalOriginal) * 100).toFixed(1)
    : '0.0';

  console.log('\n── Summary ─────────────────────────────────────────────────');
  console.log(`  Processed (written) : ${nProcessed}  (× 2 outputs each)`);
  console.log(`  Cached    (skipped) : ${nCached}`);
  if (nErrors) console.log(`  Errors              : ${nErrors}`);
  console.log(`  Originals total     : ${fmt(totalOriginal)}`);
  console.log(`  WebP outputs total  : ${fmt(totalWebp)}  (saved ${savingPct}% vs originals)`);
  console.log(`  JPG outputs total   : ${fmt(totalJpg)}`);

  if (DRY_RUN) {
    if (nProcessed > 0) {
      console.log(
        `\n  [FAIL] ${nProcessed} original(s) would produce new outputs.` +
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

  // Build the full set of output paths that SHOULD exist.
  const expectedOutputs = new Set();
  for (const { inputDir, outputDir } of SOURCES) {
    const files = await collectFiles(inputDir);
    for (const inputPath of files) {
      expectedOutputs.add(resolveOut(inputPath, inputDir, outputDir, '.webp'));
      expectedOutputs.add(resolveOut(inputPath, inputDir, outputDir, '.jpg'));
    }
  }

  const cache         = await loadCache();
  let   cacheModified = false;
  let   nDeleted      = 0;

  for (const { outputDir } of SOURCES) {
    const outFiles = await collectFiles(outputDir, OUTPUT_EXTS);
    for (const outFile of outFiles) {
      if (expectedOutputs.has(outFile)) continue;

      console.log(`  [${DRY_RUN ? 'would delete' : 'delete'}] ${outFile}`);

      if (!DRY_RUN) {
        await unlink(outFile);
        // Prune cache entries that reference this output (handles both old and
        // new cache formats).
        for (const [key, val] of Object.entries(cache)) {
          if (
            val.webp?.outputPath === outFile ||
            val.jpg?.outputPath  === outFile ||
            val.outputPath       === outFile   // legacy single-output format
          ) {
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
