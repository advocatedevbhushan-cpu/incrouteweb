const fs = require('fs');

const content = fs.readFileSync('src/components/ServiceCatalogInsights.tsx', 'utf8');

const startIdx = content.indexOf('const catalog = [');
if (startIdx === -1) {
  console.error('Could not find catalog');
  process.exit(1);
}

let bracketCount = 0;
let endIdx = -1;
for (let i = startIdx + 'const catalog = '.length; i < content.length; i++) {
  if (content[i] === '[') bracketCount++;
  if (content[i] === ']') {
    bracketCount--;
    if (bracketCount === 0) {
      endIdx = i + 1;
      break;
    }
  }
}

if (endIdx === -1) {
  console.error('Could not find end of catalog');
  process.exit(1);
}

const arrayStr = content.substring(startIdx + 'const catalog = '.length, endIdx);

const cleanStr = arrayStr
  .replace(/icon:\s*([a-zA-Z0-9]+)/g, 'icon: "$1"');

let catalog;
try {
  catalog = eval(cleanStr);
} catch (e) {
  console.error('Failed to eval catalog:', e.message);
  process.exit(1);
}

console.log(`Found ${catalog.length} catalog items.`);
catalog.forEach((s, idx) => {
  if (!s.icon) {
    console.log(`Catalog index ${idx} (ID: ${s.id || 'unknown'}): missing [icon]`);
  }
});
console.log('Icon check complete.');
