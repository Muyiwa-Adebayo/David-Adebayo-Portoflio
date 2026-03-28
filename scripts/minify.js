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
 * A safer JS minifier that handles trailing comments (//) 
 * without breaking the code when collapsed into one line.
 */
function minifyJS(js) {
    return js
        // 1. Remove block comments
        .replace(/\/\*[\s\S]*?\*\//g, '') 
        // 2. Remove line comments (avoiding protocol slashes in URLs)
        .replace(/\s*\/\/(?!(?:https?:|ftps?:|mailto:)\/\/).*$/gm, '')
        // 3. Collapse multiple spaces and newlines
        .replace(/\s+/g, ' ')
        // 4. Remove space around syntax tokens (except + and - for safety)
        .replace(/\s*([\{\};:=\*\/\?\(\)\[\]])\s*/g, '$1')
        .trim();
}

// ── DIRECTORY MANAGEMENT ─────────────────────────────

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Recursively copies a directory to another location.
 */
function copyDir(src, dest) {
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            console.log(`  → Copying: ${entry.name}`);
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// ── BUILD TASKS ──────────────────────────────────────

try {
    console.log('\n🚀 Starting FULL Build For InfinityFree Production\n');

    // 1. Ensure subdirectories exist
    ensureDir(path.join(distDir, 'css'));
    ensureDir(path.join(distDir, 'js'));

    // 2. Clear previous dist contents (but keep dist itself)
    // Actually, we'll just overwrite, but let's copy images first.

    // 3. Copy Assets (Crucial for 404 Fix!)
    console.log('📦 Copying Images...');
    if (fs.existsSync(path.join(rootDir, 'images'))) {
        copyDir(path.join(rootDir, 'images'), path.join(distDir, 'images'));
    }

    console.log('📦 Copying Resources...');
    if (fs.existsSync(path.join(rootDir, 'resources'))) {
        copyDir(path.join(rootDir, 'resources'), path.join(distDir, 'resources'));
    }

    // 4. Minify CSS
    const cssPath = path.join(rootDir, 'css', 'style.css');
    if (fs.existsSync(cssPath)) {
        const cssSrc = fs.readFileSync(cssPath, 'utf8');
        fs.writeFileSync(path.join(distDir, 'css', 'style.min.css'), minifyCSS(cssSrc));
        console.log('✓ CSS Minified');
    }

    // 5. Minify JS (Fixing trailing comment bug)
    const jsPath = path.join(rootDir, 'js', 'main.js');
    if (fs.existsSync(jsPath)) {
        const jsSrc = fs.readFileSync(jsPath, 'utf8');
        fs.writeFileSync(path.join(distDir, 'js', 'main.min.js'), minifyJS(jsSrc));
        console.log('✓ JS Minified (Fixed Comments)');
    }

    // 6. Synchronize index.html
    const indexPath = path.join(rootDir, 'index.html');
    if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf8');
        // Point source links to minified prod files
        html = html
            .replace('css/style.css', 'css/style.min.css')
            .replace('js/main.js', 'js/main.min.js');
        
        fs.writeFileSync(path.join(distDir, 'index.html'), html);
        console.log('✓ index.html Finalized');
    }

    // 7. Copy Sitemap & robots.txt if they exist
    ['sitemap.xml', 'robots.txt'].forEach(file => {
        const fPath = path.join(rootDir, file);
        if (fs.existsSync(fPath)) {
            fs.copyFileSync(fPath, path.join(distDir, file));
            console.log(`✓ Synchronized: ${file}`);
        }
    });

    console.log('\n⭐ Build SUCCESSFULLY Completed! Root dist folder is ready.\n');

} catch (err) {
    console.error('\n❌ Build Error:', err);
    process.exit(1);
}
