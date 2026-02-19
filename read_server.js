const fs = require('fs');
const content = fs.readFileSync('server/src/index.ts', 'utf8');
console.log(content);
