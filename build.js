#!/usr/bin/env node
/**
 * Property Finder Real Estate Website — Production Build Script v2.0
 * Minifies CSS + JS, updates asset references, and outputs to dist/
 *
 * Usage:
 *   node build.js              # Full production build to dist/
 *   node build.js --check      # Estimate sizes without modifying/writing files
 *
 * Dependencies:
 *   npm install terser clean-css-cli --save-dev
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHECK_ONLY = process.argv.includes('--check');
const ROOT = path.resolve(__dirname);
const DIST = path.join(ROOT, 'dist');

// ── Binary Resolution Helpers ───────────────────────────────────────────────
function resolveBin(binName) {
  const ext = process.platform === 'win32' ? '.cmd' : '';
  const localBin = path.join(ROOT, 'node_modules', '.bin', `${binName}${ext}`);
  if (fs.existsSync(localBin)) return `"${localBin}"`;
  return `npx --no-install ${binName}`;
}

function hasTool(binName) {
  const ext = process.platform === 'win32' ? '.cmd' : '';
  const localBin = path.join(ROOT, 'node_modules', '.bin', `${binName}${ext}`);
  if (fs.existsSync(localBin)) return true;
  try {
    execSync(`${binName} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    try {
      execSync(`npx --no-install ${binName} --version`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

// Check build dependencies only when performing an actual build
if (!CHECK_ONLY) {
  const hasTerser = hasTool('terser');
  const hasCleanCSS = hasTool('cleancss');

  if (!hasTerser || !hasCleanCSS) {
    console.error('\n  [PFRE Build] Missing required minification tools.');
    console.error('  Please install them via:');
    console.error('    npm install terser clean-css-cli --save-dev\n');
    process.exit(1);
  }
}

const TERSER_CMD = resolveBin('terser');
const CLEANCSS_CMD = resolveBin('cleancss');

// ── Formatting Utilities ───────────────────────────────────────────────────
function fmt(bytes) {
  return (bytes / 1024).toFixed(1) + ' KB';
}

function pct(before, after) {
  if (before === 0) return '0%';
  const diff = ((before - after) / before) * 100;
  return `${diff.toFixed(0)}% saved`;
}

// ── Asset Minification ─────────────────────────────────────────────────────
function minifyCSS(file) {
  const input = path.join(ROOT, 'css', file);
  const destName = file.replace(/\.css$/, '.min.css');
  const output = path.join(DIST, 'css', destName);

  if (!fs.existsSync(input)) {
    console.warn(`    ⚠ Skipping missing file: css/${file}`);
    return null;
  }

  const before = fs.statSync(input).size;

  if (!CHECK_ONLY) {
    fs.mkdirSync(path.dirname(output), { recursive: true });
    execSync(`${CLEANCSS_CMD} -o "${output}" "${input}"`, { stdio: 'pipe' });
  }

  const after = CHECK_ONLY ? Math.round(before * 0.42) : fs.statSync(output).size;
  return { src: file, dest: destName, before, after };
}

function minifyJS(file) {
  const input = path.join(ROOT, 'js', file);
  const destName = file.replace(/\.js$/, '.min.js');
  const output = path.join(DIST, 'js', destName);

  if (!fs.existsSync(input)) {
    console.warn(`    ⚠ Skipping missing file: js/${file}`);
    return null;
  }

  const before = fs.statSync(input).size;

  if (!CHECK_ONLY) {
    fs.mkdirSync(path.dirname(output), { recursive: true });
    execSync(`${TERSER_CMD} "${input}" --compress --mangle --output "${output}"`, { stdio: 'pipe' });
  }

  const after = CHECK_ONLY ? Math.round(before * 0.48) : fs.statSync(output).size;
  return { src: file, dest: destName, before, after };
}

// ── Build Execution ────────────────────────────────────────────────────────
console.log(`\n  PFRE Production Build ${CHECK_ONLY ? '[CHECK ONLY]' : ''}`);
console.log('  ' + '─'.repeat(58));

if (!CHECK_ONLY) {
  // Clean dist directory before build
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST, { recursive: true });
}

let totalBefore = 0;
let totalAfter = 0;

// 1. Process CSS
const cssFiles = [
  'styles.css',
  'theme.css',
  'mobile.css',
  'overrides.css',
  'utils.css',
  'widgets.css'
];

console.log('\n  Processing CSS:');
const processedCSS = [];
for (const f of cssFiles) {
  const r = minifyCSS(f);
  if (r) {
    processedCSS.push(r);
    totalBefore += r.before;
    totalAfter += r.after;
    console.log(`    ${r.src.padEnd(20)} ${fmt(r.before).padStart(8)} → ${fmt(r.after).padStart(8)}  (${pct(r.before, r.after)})`);
  }
}

// Generate unified CSS bundle
if (!CHECK_ONLY && processedCSS.length > 0) {
  const bundlePath = path.join(DIST, 'css', 'pfre.bundle.min.css');
  const bundleContent = processedCSS
    .map(item => fs.readFileSync(path.join(DIST, 'css', item.dest), 'utf8'))
    .join('\n');
  fs.writeFileSync(bundlePath, bundleContent, 'utf8');
  console.log(`\n    → Unified Bundle created: dist/css/pfre.bundle.min.css`);
}

// 2. Process JS (Included app-shell.js)
const jsFiles = [
  'theme.js',
  'security.js',
  'widgets.js',
  'i18n.js',
  'api.js',
  'config.js',
  'tracker.js',
  'properties-filter.js',
  'app-shell.js'
];

console.log('\n  Processing JS:');
const processedJS = [];
for (const f of jsFiles) {
  const r = minifyJS(f);
  if (r) {
    processedJS.push(r);
    totalBefore += r.before;
    totalAfter += r.after;
    console.log(`    ${r.src.padEnd(24)} ${fmt(r.before).padStart(8)} → ${fmt(r.after).padStart(8)}  (${pct(r.before, r.after)})`);
  }
}

// 3. Copy Static Folders & Assets
if (!CHECK_ONLY) {
  console.log('\n  Copying Assets & Static Files:');

  const assetFolders = ['icons', 'images', 'fonts'];
  assetFolders.forEach(folder => {
    const src = path.join(ROOT, folder);
    const dest = path.join(DIST, folder);
    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
      console.log(`    ✔ Folder copied: ${folder}/`);
    }
  });

  const rootFiles = ['manifest.json', 'robots.txt', 'sitemap.xml', 'favicon.ico', 'favicon.png'];
  rootFiles.forEach(file => {
    const src = path.join(ROOT, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DIST, file));
      console.log(`    ✔ File copied: ${file}`);
    }
  });

  // 4. Update HTML references to .min files
  const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
  for (const htmlFile of htmlFiles) {
    let content = fs.readFileSync(path.join(ROOT, htmlFile), 'utf8');

    processedCSS.forEach(item => {
      const regex = new RegExp(`css/${item.src.replace('.', '\\.')}`, 'g');
      content = content.replace(regex, `css/${item.dest}`);
    });

    processedJS.forEach(item => {
      const regex = new RegExp(`js/${item.src.replace('.', '\\.')}`, 'g');
      content = content.replace(regex, `js/${item.dest}`);
    });

    fs.writeFileSync(path.join(DIST, htmlFile), content, 'utf8');
  }
  console.log(`    ✔ ${htmlFiles.length} HTML pages rewritten with minified assets.`);

  // 5. Update and Minify Service Worker for production
  const swSrc = path.join(ROOT, 'sw.js');
  if (fs.existsSync(swSrc)) {
    let swContent = fs.readFileSync(swSrc, 'utf8');

    // Sync pre-cache paths with .min variants to prevent 404s in service worker installation
    processedCSS.forEach(item => {
      swContent = swContent.replace(new RegExp(`css/${item.src.replace('.', '\\.')}`, 'g'), `css/${item.dest}`);
    });
    processedJS.forEach(item => {
      swContent = swContent.replace(new RegExp(`js/${item.src.replace('.', '\\.')}`, 'g'), `js/${item.dest}`);
    });

    const swDest = path.join(DIST, 'sw.js');
    fs.writeFileSync(swDest, swContent, 'utf8');

    try {
      execSync(`${TERSER_CMD} "${swDest}" --compress --mangle --output "${swDest}"`, { stdio: 'pipe' });
      console.log('    ✔ sw.js updated with production asset cache list and minified.');
    } catch (_) {
      console.log('    ✔ sw.js updated with production asset cache list.');
    }
  }
}

// ── Summary Report ──────────────────────────────────────────────────────────
console.log('\n  ' + '─'.repeat(58));
console.log(`  Combined Size: ${fmt(totalBefore)} → ${fmt(totalAfter)} (${pct(totalBefore, totalAfter)})`);

if (!CHECK_ONLY) {
  console.log('\n  ✅ Production deployment ready in dist/');
  console.log('  Upload the contents of the dist/ directory to your web server.\n');
} else {
  console.log('\n  Size estimate complete. Run "node build.js" to create dist/.\n');
}