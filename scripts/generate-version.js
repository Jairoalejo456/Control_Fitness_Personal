const fs = require('fs');
const path = require('path');

const version = new Date().toISOString();

fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'generatedVersion.ts'),
  `export const APP_VERSION = '${version}';\n`,
);

fs.writeFileSync(path.join(__dirname, '..', 'public', 'version.json'), JSON.stringify({ version }));

console.log(`Generated app version: ${version}`);
