# Scripts

## compress-images.mjs — Non-destructive image optimisation

Reads **originals** from `assets/originals/`, writes compressed copies into
`public/`. Originals are **never modified**. A cache file records each
original's mtime + size so only new or changed files are processed on
subsequent runs.

---

### Directory layout

```
assets/
  originals/
    photos/          ← source files for public/photos/
    portraits/       ← source files for public/Portrait_cycle/

public/
  photos/            ← generated output (committed, served by Next.js)
  Portrait_cycle/    ← generated output (committed, served by Next.js)
```

`assets/originals/` is listed in `.gitignore`. Store originals in Git LFS,
a shared drive, or locally on each developer's machine. The `public/` outputs
are committed so the site works without running the script.

---

### Encoding settings

| Input       | Condition      | Output                               |
| ----------- | -------------- | ------------------------------------ |
| `.jpg/.jpeg` | —             | JPEG, quality 82, progressive, mozjpeg |
| `.png`      | has alpha      | PNG, compressionLevel 9, effort 10   |
| `.png`      | no alpha       | JPEG @ quality 82 (filename → `.jpg`) |

All metadata (EXIF, ICC, GPS) is stripped from every output.

**Dimension cap** (longest edge, aspect-ratio preserved, never upscaled):

| Source directory          | Cap     |
| ------------------------- | ------- |
| `assets/originals/photos` | 3840 px |
| `assets/originals/portraits` | 2400 px |

---

### Usage

```bash
# Preview what will be written — no files touched
npm run images:compress:dry

# Generate / update outputs
npm run images:compress

# CI check: exits 1 if any output is missing or stale
npm run images:check

# Preview which public/ files have no matching original — no deletes
npm run images:clean -- --dry-run

# Delete orphaned output files (outputs with no corresponding original)
npm run images:clean
```

Or run directly:

```bash
node scripts/compress-images.mjs [--dry-run] [--clean]
```

#### `--dry-run` exit codes

| Situation | Exit code |
|---|---|
| All outputs up to date | `0` |
| Any output missing or stale | `1` |
| Script error | `1` |

#### `--clean`

Scans each `public/` output directory and removes any image file with no
matching original in `assets/originals/`. Combine with `--dry-run` to preview
before deleting.

> **Before running `--clean`:** verify that removed outputs are not still
> referenced in `content.json`. Update paths there first if needed.

---

### Cache

`scripts/.image-cache.json` (gitignored) stores per-file `{ mtimeMs, size,
outputPath, outputSize }`. A file is skipped when mtime + size match the cache
**and** the output already exists on disk. Delete the cache file to force a
full reprocess.

---

### Recommended workflow

1. **Add originals** — drop files into `assets/originals/photos/` or
   `assets/originals/portraits/`.
2. **Preview** — `npm run images:compress:dry` to confirm expected savings.
3. **Compress** — `npm run images:compress` writes outputs to `public/`.
4. **Commit `public/`** — outputs are committed so CI never needs the originals.
5. **Keep originals off-repo** — use Git LFS or a shared drive.

**Removing an image:**

1. Delete (or move) the original from `assets/originals/`.
2. Update `content.json` to remove/replace any references to the old path.
3. Preview: `npm run images:clean -- --dry-run`.
4. Delete orphan: `npm run images:clean`.
5. Commit the updated `public/` and `content.json`.

---

### Runtime optimisation (Next.js)

`next.config.js` is configured with `formats: ['image/avif', 'image/webp']`.
Next.js automatically serves the best format to each browser via the `<Image />`
component — no extra build step required. The pipeline here reduces the
**source** file size that Next.js reads, cutting cold-start I/O and CDN
storage costs.
