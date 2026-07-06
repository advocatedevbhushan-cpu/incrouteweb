const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(
  path.join(__dirname, '../src/components/RegistrationServices.tsx'),
  'utf8'
);

const startIdx = content.indexOf('const INDIA_STATES = [');
const endIdx = content.indexOf('];', startIdx);
const statesBlock = content.substring(startIdx, endIdx + 2);

// Extract all path d= values from { id: "xx", name: "...", path: "..." }
const paths = [];
let searchFrom = 0;
while (true) {
  const pathKeyIdx = statesBlock.indexOf('path: "', searchFrom);
  if (pathKeyIdx === -1) break;
  const pathStart = pathKeyIdx + 7; // skip 'path: "'
  // Find the closing quote - need to handle potential escaped quotes
  let pathEnd = pathStart;
  while (pathEnd < statesBlock.length) {
    if (statesBlock[pathEnd] === '"' && statesBlock[pathEnd - 1] !== '\\') {
      break;
    }
    pathEnd++;
  }
  paths.push(statesBlock.substring(pathStart, pathEnd));
  searchFrom = pathEnd + 1;
}

console.log('Number of state paths found:', paths.length);

const combined = paths.join(' ');
fs.writeFileSync(path.join(__dirname, 'combined_paths.txt'), combined, 'utf8');
console.log('Combined path total chars:', combined.length);
console.log('Written to scratch/combined_paths.txt');
