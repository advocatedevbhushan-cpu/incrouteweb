const fs = require('fs');
const content = fs.readFileSync('src/components/RegistrationServices.tsx', 'utf8');

// Find the serviceCatalog array declaration block
const matches = content.match(/const serviceCatalog\s*=\s*\[([\s\S]*?)\];/);
if (!matches) {
  console.log("Could not find serviceCatalog array!");
  process.exit(1);
}

const rawArray = matches[1];

// Split serviceCatalog array by objects (we can approximate by splitting on 'id:')
const items = rawArray.split(/{\s*id:/).slice(1);
console.log(`Checking ${items.length} serviceCatalog items...`);

items.forEach((item, index) => {
  // Extract ID
  const idMatch = item.match(/^\s*["']([^"']+)["']/);
  const id = idMatch ? idMatch[1] : `Unknown-${index}`;

  const hasName = item.includes('name:');
  const hasCategory = item.includes('category:');
  const hasTimeline = item.includes('timeline:');
  const hasDescription = item.includes('description:');

  const missing = [];
  if (!hasName) missing.push('name');
  if (!hasCategory) missing.push('category');
  if (!hasTimeline) missing.push('timeline');
  if (!hasDescription) missing.push('description');

  if (missing.length > 0) {
    console.log(`ERROR: Service '${id}' is missing required fields: ${missing.join(', ')}`);
  } else {
    console.log(`Service '${id}' is OK.`);
  }
});
