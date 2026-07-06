const fs = require('fs');

const content = fs.readFileSync('src/components/RegistrationServices.tsx', 'utf8');

const startIdx = content.indexOf('const serviceCatalog = [');
if (startIdx === -1) {
  console.error('Could not find serviceCatalog');
  process.exit(1);
}

let bracketCount = 0;
let endIdx = -1;
for (let i = startIdx + 'const serviceCatalog = '.length; i < content.length; i++) {
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
  console.error('Could not find end of serviceCatalog');
  process.exit(1);
}

const arrayStr = content.substring(startIdx + 'const serviceCatalog = '.length, endIdx);

let serviceCatalog;
try {
  serviceCatalog = eval(arrayStr);
} catch (e) {
  console.error('Failed to eval serviceCatalog:', e.message);
  process.exit(1);
}

const ids = new Set();
serviceCatalog.forEach((s, idx) => {
  if (ids.has(s.id)) {
    console.log(`DUPLICATE ID DETECTED: ${s.id} at index ${idx}`);
  }
  ids.add(s.id);
});
console.log('Duplicate ID check complete.');
