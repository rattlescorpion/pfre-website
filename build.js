#!/usr/bin/env node
/**
 * PFRE Website — Production Build Script
 * Minifies CSS+JS, outputs to dist/
 *
 * Usage:
 *   node build.js              # minify to dist/
 *   node build.js --check      # just report sizes, don't write files
 *
 * Requires: npm install terser clean-css-cli --save-dev
 * Or run once: npx --yes terser --version
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHECK_ONLY = process.argv.includes('--check');
const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// ── Check deps ──────────────────────────────────────────────────────────────
function hasBin(name) {
  try { execSync(`${name} --version`, { stdio: 'ignore' }); return true; }
  catch { return false; }
}
const hasTerser    = hasBin('terser')    || hasBin('npx terser');
const hasCleanCSS  = hasBin('cleancss') || hasBin('npx cleancss');

if (!hasTerser || !hasCleanCSS) {
  console.log('\n  Install build tools first:\n');
  console.log('    npm install terser clean-css-cli --save-dev\n');
  console.log('  Then re-run: node build.js\n');
  process.exit(1);
}

// ── Utility ─────────────────────────────────────────────────────────────────
function fmt(bytes) { return (bytes / 1024).toFixed(1) + ' KB'; }
function pct(a, b)  { return (((b - a) / a) * 100).toFixed(0) + '%'; }

function minifyCSS(src, dest) {
  const input = path.join(ROOT, 'css', src);
  const output = path.join(DIST, 'css', dest);
  const before = fs.statSync(input).size;
  if (!CHECK_ONLY) {
    fs.mkdirSync(path.dirname(output), { recursive: true });
    execSync(`npx cleancss -o "${output}" "${input}"`);
  }
  const after = CHECK_ONLY ? before * 0.38 : fs.statSync(output).size;
  return { src, before, after };
}

function minifyJS(src, dest) {
  const input = path.join(ROOT, 'js', src);
  const output = path.join(DIST, 'js', dest);
  const before = fs.statSync(input).size;
  if (!CHECK_ONLY) {
    fs.mkdirSync(path.dirname(output), { recursive: true });
    execSync(`npx terser "${input}" --compress --mangle --output "${output}"`);
  }
  const after = CHECK_ONLY ? before * 0.45 : fs.statSync(output).size;
  return { src, before, after };
}

// ── Build ────────────────────────────────────────────────────────────────────
console.log(`\n  PFRE Production Build ${CHECK_ONLY ? '[CHECK ONLY]' : ''}`);
console.log('  ' + '─'.repeat(56));

let totalBefore = 0, totalAfter = 0;

const cssFiles = ['styles.css','theme.css','mobile.css','overrides.css','utils.css','widgets.css'];
console.log('\n  CSS:');
for (const f of cssFiles) {
  const r = minifyCSS(f, f.replace('.css', '.min.css'));
  totalBefore += r.before; totalAfter += r.after;
  console.log(`    ${r.src.padEnd(20)} ${fmt(r.before).padStart(8)} → ${fmt(r.after).padStart(8)}  (${pct(r.before, r.after)})`);
}

// Optionally produce one concatenated bundle too
if (!CHECK_ONLY) {
  const allCSS = cssFiles.map(f => fs.readFileSync(path.join(DIST,'css',f.replace('.css','.min.css')),'utf8')).join('\n');
  fs.writeFileSync(path.join(DIST,'css','pfre.bundle.min.css'), allCSS);
  console.log(`\n    → Bundle: dist/css/pfre.bundle.min.css`);
}

const jsFiles = ['theme.js','security.js','widgets.js','i18n.js','api.js','config.js','tracker.js','properties-filter.js'];
console.log('\n  JS:');
for (const f of jsFiles) {
  const r = minifyJS(f, f.replace('.js', '.min.js'));
  totalBefore += r.before; totalAfter += r.after;
  console.log(`    ${r.src.padEnd(28)} ${fmt(r.before).padStart(8)} → ${fmt(r.after).padStart(8)}  (${pct(r.before, r.after)})`);
}

// Copy non-minifiable assets
if (!CHECK_ONLY) {
  ['sw.js','manifest.json','robots.txt','sitemap.xml'].forEach(f => {
    const src = path.join(ROOT, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DIST, f));
    }
  });
  fs.cpSync(path.join(ROOT, 'icons'), path.join(DIST, 'icons'), { recursive: true });
  // Copy all HTML files updating CSS/JS references to .min versions
  const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
  for (const htmlFile of htmlFiles) {
    let html = fs.readFileSync(path.join(ROOT, htmlFile), 'utf8');
    // Swap CSS refs
    cssFiles.forEach(f => {
      html = html.replaceAll(`css/${f}`, `css/${f.replace('.css','.min.css')}`);
    });
    // Swap JS refs
    jsFiles.forEach(f => {
      html = html.replaceAll(`js/${f}`, `js/${f.replace('.js','.min.js')}`);
    });
    fs.writeFileSync(path.join(DIST, htmlFile), html);
  }
  console.log(`\n    HTML: ${htmlFiles.length} pages updated with .min references → dist/`);
}

console.log('\n  ' + '─'.repeat(56));
console.log(`  Total: ${fmt(totalBefore)} → ${fmt(totalAfter)}  (${pct(totalBefore, totalAfter)} saved)`);
if (!CHECK_ONLY) {
  console.log(`\n  ✅ dist/ ready for deployment`);
  console.log(`\n  Upload the CONTENTS of dist/ to your web server root.`);
  console.log(`  (Not the dist/ directory itself — its contents.)\n`);
} else {
  console.log(`\n  Run without --check to actually build.\n`);
}
