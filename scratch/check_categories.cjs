const fs = require('fs');

const appContent = fs.readFileSync('src/App.tsx', 'utf8');
const rsContent = fs.readFileSync('src/components/RegistrationServices.tsx', 'utf8');

// Parse SERVICE_CATEGORIES in App.tsx
const scMatch = appContent.match(/const SERVICE_CATEGORIES: Record<string, string> = ({[\s\S]*?});/);
if (!scMatch) {
  console.error('Could not find SERVICE_CATEGORIES in App.tsx');
  process.exit(1);
}

let serviceCategories;
try {
  serviceCategories = eval('(' + scMatch[1] + ')');
} catch (e) {
  console.error('Failed to parse SERVICE_CATEGORIES:', e.message);
  process.exit(1);
}

// Parse serviceCatalog in RegistrationServices.tsx
const startIdx = rsContent.indexOf('const serviceCatalog = [');
if (startIdx === -1) {
  console.error('Could not find serviceCatalog');
  process.exit(1);
}

let bracketCount = 0;
let endIdx = -1;
for (let i = startIdx + 'const serviceCatalog = '.length; i < rsContent.length; i++) {
  if (rsContent[i] === '[') bracketCount++;
  if (rsContent[i] === ']') {
    bracketCount--;
    if (bracketCount === 0) {
      endIdx = i + 1;
      break;
    }
  }
}

const arrayStr = rsContent.substring(startIdx + 'const serviceCatalog = '.length, endIdx);
let serviceCatalog;
try {
  serviceCatalog = eval(arrayStr);
} catch (e) {
  console.error('Failed to eval serviceCatalog:', e.message);
  process.exit(1);
}

serviceCatalog.forEach((s) => {
  const appCategory = serviceCategories[s.id];
  if (!appCategory) {
    console.log(`Service ID "${s.id}" is missing from SERVICE_CATEGORIES in App.tsx!`);
  } else if (appCategory !== s.category) {
    console.log(`Service ID "${s.id}" category mismatch! App: "${appCategory}", Catalog: "${s.category}"`);
  }
});
console.log('Category check complete.');
