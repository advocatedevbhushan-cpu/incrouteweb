const fs = require('fs');

const content = fs.readFileSync('src/components/RegistrationServices.tsx', 'utf8');

// We can find the array content. Since it is defined as const serviceCatalog = [...];
// Let's extract it or evaluate it.
// The easiest way is to use a simple regex or parser, or read lines and find where it is.
const startIdx = content.indexOf('const serviceCatalog = [');
if (startIdx === -1) {
  console.error('Could not find serviceCatalog');
  process.exit(1);
}

// Find matching bracket
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

// Evaluate the string as JavaScript
let serviceCatalog;
try {
  serviceCatalog = eval(arrayStr);
} catch (e) {
  console.error('Failed to eval serviceCatalog:', e.message);
  // Let's try to wrap it in a function or print it
  process.exit(1);
}

console.log(`Found ${serviceCatalog.length} services.`);
serviceCatalog.forEach((s, idx) => {
  const missing = [];
  if (!s.id) missing.push('id');
  if (!s.name) missing.push('name');
  if (!s.category) missing.push('category');
  if (!s.pricing) missing.push('pricing');
  if (!s.timeline) missing.push('timeline');
  if (!s.minDirectors) missing.push('minDirectors');
  if (!s.description) missing.push('description');
  if (!s.features) missing.push('features');
  if (!s.documents) missing.push('documents');
  if (!s.expert) missing.push('expert');
  
  if (missing.length > 0) {
    console.log(`Service index ${idx} (ID: ${s.id || 'unknown'}): missing [${missing.join(', ')}]`);
  }
});
