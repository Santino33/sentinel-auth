const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.sql')) results.push(file);
        }
    });
    return results;
}

const files = walk('./prisma/migrations').concat(walk('./db'));

files.forEach(file => {
    console.log(`Fixing encoding for: ${file}`);
    const buffer = fs.readFileSync(file);
    // Check for UTF-16 BOM
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
        const content = buffer.toString('utf16le');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Converted UTF-16LE to UTF-8: ${file}`);
    } else if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
        const content = buffer.toString('utf16be');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Converted UTF-16BE to UTF-8: ${file}`);
    } else {
        // Just re-save as UTF-8 to be sure
        const content = buffer.toString('utf8');
        fs.writeFileSync(file, content, 'utf8');
    }
});
