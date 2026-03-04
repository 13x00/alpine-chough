# Scripts

## compress-images.mjs — Non-destructive image optimisation

Reads **originals** from `assets/originals/`, writes **two** optimised copies
into `public/` for every input file. Originals are **never modified**. A cache
file records each original's mtime + size so only new or changed files are
processed on subsequent runs.

---

### Architecture

```
assets/originals/
  photos/           ← source files for public/photos/
  portraits/        ← source files for public/Portrait_cycle/

public/
  photos/           ← generated outputs (committed, served by Next.js)
    DSC07488.webp   ← canonical deployed format (referenced by the site)
    DSC07488.jpg    ← fallback / archive copy
    ...
  Portrait_cycle/   ← generated outputs (committed, served by Next.js)
    ...
```

**WebP is the canonical format.** `content.json` and all UI components
reference `.webp` paths. The `.jpg` files are generated alongside as a
fallback/archive but are not referenced by the live site.

Next.js runtime image optimization is **disabled** (`images.unoptimized: true`
in `next.config.js`). WebP files are served directly as static assets, which
eliminates cold-start processing delays on first load.

`assets/originals/` is listed in `.gitignore`. Store originals in Git LFS, a
shared drive, or locally on each developer's machine. The `public/` outputs are
committed so the site deploys without the originals needing to be present in CI.

---

### Encoding settings

Both outputs are generated from each original, stripped of all metadata
(EXIF, ICC, GPS):

| Output | Settings |
| ------ | -------- |
| `.webp` | quality 80, effort 6, metadata stripped |
| `.jpg`  | quality 82, progressive, mozjpeg, metadata stripped |

**Dimension cap** (longest edge, aspect-ratio preserved, never upscaled):

| Source directory            | Cap     |
| --------------------------- | ------- |
| `assets/originals/photos`   | 3840 px |
| `assets/originals/portraits`| 2400 px |

All inputs (JPEG, PNG) are treated as opaque photos — no alpha handling.

---

### Usage

```bash
# Preview what would be written — no files touched
npm run images:compress:dry

# Generate / update outputs (webp + jpg for each original)
npm run images:compress

# CI check: exits 1 if any output is missing or stale, 0 if up to date
npm run images:check

# Preview which public/ files have no matching original — no deletes
npm run images:clean -- --dry-run

# Delete orphaned output files (also removes legacy .png outputs)
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

Scans each `public/` output directory for `.jpg`, `.jpeg`, `.png`, and `.webp`
files with no matching original, and deletes them. Handles legacy `.png` outputs
from earlier versions of the pipeline. Combine with `--dry-run` to preview
before deleting.

> **Before running `--clean`:** verify that removed outputs are not still
> referenced in `content.json` or component files. Update references first.

---

### Cache

`scripts/.image-cache.json` (gitignored) stores per-original:

```json
{
  "assets/originals/photos/DSC07488.jpg": {
    "mtimeMs": 1234567890123,
    "size": 14000000,
    "webp": { "outputPath": "public/photos/DSC07488.webp", "outputSize": 540000 },
    "jpg":  { "outputPath": "public/photos/DSC07488.jpg",  "outputSize": 820000 }
  }
}
```

A file is skipped when mtime + size match the cache **and** both output files
already exist on disk. Delete the cache file to force a full reprocess.

---

### Recommended workflow

1. **Add originals** — drop files into `assets/originals/photos/` or
   `assets/originals/portraits/`.
2. **Preview** — `npm run images:compress:dry` to confirm expected output.
3. **Compress** — `npm run images:compress` writes `.webp` + `.jpg` to `public/`.
4. **Update references** if adding new images — add `.webp` paths to
   `content.json` and/or component files.
5. **Commit `public/`** — outputs are committed so CI never needs the originals.
6. **Keep originals off-repo** — use Git LFS or a shared drive.

**Removing an image:**

1. Delete (or move) the original from `assets/originals/`.
2. Update `content.json` to remove/replace any `.webp` references.
3. Preview: `npm run images:clean -- --dry-run`.
4. Delete orphans: `npm run images:clean`.
5. Commit the updated `public/` and `content.json`.
