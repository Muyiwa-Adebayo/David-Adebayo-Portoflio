const fs = require('fs');
const path = require('path');

// ── MINIFICATION FUNCTIONS ───────────────────────────

function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
        .replace(/\s+/g, ' ')           // collapse multiple spaces
        .replace(/\s*([\{\};:,])\s*/g, '$1') // remove spaces around syntax
        .trim();
}

/**
 * A SAFER JS minifier using negative lookbehind.
 * Prevents accidental deletion of "//" inside URLs.
 */
function minifyJS(js) {
    return js
        // 1. Remove block comments
        .replace(/\/\*[\s\S]*?\*\//g, '') 
        // 2. Remove line comments EXCEPT those preceded by a colon (URLs)
        // This ensures https://formspree.io is NOT deleted.
        .replace(/(?<!:)\s*\/\/.*$/gm, '')
        // 3. Collapse multiple spaces and newlines
        .replace(/\s+/g, ' ')
        // 4. Remove space around syntax tokens (safer list)
        .replace(/\s*([\{\};:=\*\/\?\(\)\[\]])\s*/g, '$1')
        .trim();
}

// ── DIRECTORY MANAGEMENT ─────────────────────────────

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// ── BUILD TASKS ──────────────────────────────────────

try {
    console.log('🚀 Finalizing Production Build...\n');

    ensureDir(path.join(distDir, 'css'));
    ensureDir(path.join(distDir, 'js'));

    // 1. Copy Folders
    console.log('📦 Syncing Assets...');
    copyDir(path.join(rootDir, 'images'), path.join(distDir, 'images'));
    copyDir(path.join(rootDir, 'resources'), path.join(distDir, 'resources'));

    // 2. Minify CSS
    const cssPath = path.join(rootDir, 'css', 'style.css');
    if (fs.existsSync(cssPath)) {
        const cssSrc = fs.readFileSync(cssPath, 'utf8');
        fs.writeFileSync(path.join(distDir, 'css', 'style.min.css'), minifyCSS(cssSrc));
        console.log('✓ CSS Optimized');
    }

    // 3. Minify JS (SAFE VERSION)
    const jsPath = path.join(rootDir, 'js', 'main.js');
    if (fs.existsSync(jsPath)) {
        const jsSrc = fs.readFileSync(jsPath, 'utf8');
        fs.writeFileSync(path.join(distDir, 'js', 'main.min.js'), minifyJS(jsSrc));
        console.log('✓ JS Optimized (URLs Protected)');
    }

    // 4. Sync HTML & Root Assets
    const indexPath = path.join(rootDir, 'index.html');
    if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf8');
        html = html
            .replace('css/style.css', 'css/style.min.css')
            .replace('js/main.js', 'js/main.min.js');
        fs.writeFileSync(path.join(distDir, 'index.html'), html);
        console.log('✓ HTML Synchronized');
    }

    // 5. Root File Sync (Favicon, robots, sitemap)
    const rootAssets = ['favicon.ico', 'sitemap.xml', 'robots.txt', '.htaccess'];
    rootAssets.forEach(file => {
        const fPath = path.join(rootDir, file);
        if (fs.existsSync(fPath)) {
            fs.copyFileSync(fPath, path.join(distDir, file));
            console.log(`✓ Synchronized root file: ${file}`);
        }
    });

    console.log('\n⭐ BUILD SUCCESSFUL! Ready for Deployment.\n');

} catch (err) {
    console.error('❌ Build Failed:', err);
    process.exit(1);
}
