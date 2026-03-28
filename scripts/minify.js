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

function minifyJS(js) {
    return js
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
        .replace(/^(?!\s*https?:\/\/)\s*\/\/.*$/gm, '') // remove line comments not in URLs
        .replace(/\s+/g, ' ')           // collapse multiple spaces
        .replace(/\s*([\{\};:=\*\/\?\(\)\[\]])\s*/g, '$1') // remove space around syntax (removed + and -)
        .trim();
}

// ── DIRECTORY SETUP ──────────────────────────────────

const distDir = path.join(__dirname, '..', 'dist');
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir(path.join(distDir, 'css'));
ensureDir(path.join(distDir, 'js'));

// ── BUILD TASKS ──────────────────────────────────────

try {
    console.log('--- Starting Production Build ---');

    // 1. Minify CSS
    const cssPath = path.join(__dirname, '..', 'css', 'style.css');
    const cssSrc = fs.readFileSync(cssPath, 'utf8');
    fs.writeFileSync(path.join(distDir, 'css', 'style.min.css'), minifyCSS(cssSrc));
    console.log('✓ CSS Minified');

    // 2. Minify JS
    const jsPath = path.join(__dirname, '..', 'js', 'main.js');
    const jsSrc = fs.readFileSync(jsPath, 'utf8');
    fs.writeFileSync(path.join(distDir, 'js', 'main.min.js'), minifyJS(jsSrc));
    console.log('✓ JS Minified');

    // 3. Synchronize index.html to dist
    const indexPath = path.join(__dirname, '..', 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');
    
    // Replace source links with minified versions
    html = html
        .replace('css/style.css', 'css/style.min.css')
        .replace('js/main.js', 'js/main.min.js');
    
    fs.writeFileSync(path.join(distDir, 'index.html'), html);
    console.log('✓ index.html Synchronized');

    console.log('--- Build Successfully Completed ---');
} catch (err) {
    console.error('Build Error:', err);
    process.exit(1);
}
