const fs = require('fs');

const content = fs.readFileSync('src/components/ServiceCatalogInsights.tsx', 'utf8');

// Get all imported symbols from lucide-react
const importMatch = content.match(/import\s+{([\s\S]*?)}\s+from\s+"lucide-react";/);
if (!importMatch) {
  console.error('Could not find lucide-react import in ServiceCatalogInsights.tsx');
  process.exit(1);
}

const imports = importMatch[1].split(',').map(s => s.trim()).filter(Boolean);
const importSet = new Set(imports);
console.log('Imported icons:', imports);

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

const arrayStr = content.substring(startIdx + 'const catalog = '.length, endIdx);

// Find all matches for icon: Name
const matches = arrayStr.matchAll(/icon:\s*([a-zA-Z0-9]+)/g);
const usedIcons = new Set();
for (const match of matches) {
  usedIcons.add(match[1]);
}

console.log('Used icons:', Array.from(usedIcons));

usedIcons.forEach(icon => {
  if (!importSet.has(icon)) {
    console.log(`CRITICAL: Icon "${icon}" is used in catalog but NOT imported from lucide-react!`);
  }
});
console.log('Icon check complete.');
