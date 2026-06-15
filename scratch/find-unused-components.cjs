const fs = require('fs');
const path = require('path');

const componentsDir = 'src/components';
const srcDir = 'src';

const componentFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
const usages = {};
componentFiles.forEach(file => {
  const name = path.basename(file, path.extname(file));
  usages[name] = 0;
});

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        searchDir(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      componentFiles.forEach(cFile => {
        const name = path.basename(cFile, path.extname(cFile));
        // Check if the file imports this component name
        // e.g. import ... from "./components/Name" or import("./components/Name")
        const regex = new RegExp(`from\\s+['\"].*\\/${name}['\"]|import\\(\\s*['\"].*\\/${name}['\"]\\)`, 'i');
        if (regex.test(content) && fullPath !== path.join(componentsDir, cFile)) {
          usages[name]++;
        }
      });
    }
  });
}

searchDir(srcDir);

console.log("Component usages:");
componentFiles.forEach(file => {
  const name = path.basename(file, path.extname(file));
  console.log(`- ${name}: ${usages[name]} imports`);
});

const unused = Object.keys(usages).filter(name => usages[name] === 0);
console.log("\nUnused components that can be deleted:", unused);
