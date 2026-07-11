const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
let lines = code.split('\n');

lines.splice(811, 903 - 811);
fs.writeFileSync('src/pages/AdminDashboard.jsx', lines.join('\n'));
console.log('Fixed syntax error by line number slicing!');
