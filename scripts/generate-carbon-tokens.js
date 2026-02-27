/**
 * Generates app/styles/carbon-tokens.css from @carbon/colors and @carbon/themes.
 * Do not edit the generated file by hand.
 *
 * Base theme: g100 (dark). Light theme: g10.
 * Run: node scripts/generate-carbon-tokens.js
 */

const fs = require('fs');
const path = require('path');

const { colors } = require('@carbon/colors');
const { themes } = require('@carbon/themes');

const OUT_DIR = path.join(__dirname, '..', 'app', 'styles');
const OUT_FILE = path.join(OUT_DIR, 'carbon-tokens.css');

/** camelCase to kebab-case; e.g. layer01 -> layer-01, textPrimary -> text-primary */
function camelToKebab(str) {
  return str
    .replace(/([a-z])([A-Z])/g, (_, a, b) => `${a}-${b.toLowerCase()}`)
    .replace(/([a-z])([0-9])/g, (_, a, b) => `${a}-${b}`)
    .replace(/([0-9])([a-zA-Z])/g, (_, a, b) => `${a}-${b.toLowerCase()}`);
}

/** Escape a CSS value (e.g. rgba stays as-is) */
function cssValue(value) {
  if (typeof value !== 'string') return null;
  return value.trim();
}

// --- Palette from @carbon/colors ---
const paletteLines = [];

paletteLines.push('  /* Palette from @carbon/colors */');
paletteLines.push('  --cds-black-100: ' + (colors.black[100] || colors.black['100']) + ';');
paletteLines.push('  --cds-white-0: ' + (colors.white[0] || colors.white['0']) + ';');

const paletteNames = [
  'blue', 'coolGray', 'cyan', 'gray', 'green', 'magenta', 'orange',
  'purple', 'red', 'teal', 'warmGray', 'yellow'
];

for (const name of paletteNames) {
  const palette = colors[name];
  if (!palette || typeof palette !== 'object') continue;
  const kebab = name.replace(/([A-Z])/g, (m) => '-' + m.toLowerCase());
  for (const step of [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) {
    const v = palette[step];
    if (v != null) {
      paletteLines.push(`  --cds-${kebab}-${step}: ${v};`);
    }
  }
}

// --- Theme tokens from @carbon/themes (only string values) ---
function themeToCssVars(themeObj) {
  const lines = [];
  for (const [key, value] of Object.entries(themeObj)) {
    const val = cssValue(value);
    if (val == null) continue;
    const kebab = camelToKebab(key);
    lines.push(`  --cds-${kebab}: ${val};`);
  }
  return lines;
}

const g100 = themes.g100;
const g10 = themes.g10;

const themeDarkLines = themeToCssVars(g100);
const themeLightLines = themeToCssVars(g10);

// --- Build file ---
const header = `/**
 * Generated from @carbon/colors and @carbon/themes.
 * Do not edit by hand. Run: npm run tokens:generate
 */

`;

const rootBlock =
  ':root {\n' +
  paletteLines.join('\n') + '\n' +
  '  /* Theme: g100 (dark) */\n' +
  themeDarkLines.join('\n') + '\n' +
  '}\n\n';

const lightBlock =
  "[data-theme='light'] {\n" +
  '  /* Theme: g10 (light) */\n' +
  themeLightLines.join('\n') + '\n' +
  '}\n';

const content = header + rootBlock + lightBlock;

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}
fs.writeFileSync(OUT_FILE, content, 'utf8');
console.log('Wrote', OUT_FILE);
