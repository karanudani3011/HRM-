const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
let lines = code.split('\n');
// Let's find the line with `>;>&nbsp;&nbsp;&nbsp;&nbsp;c)` which should be around 812
let startLine = -1;
let endLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('`;>&nbsp;&nbsp;&nbsp;&nbsp;c) ફરજિયાત Disclaimer (અસ્વીકરણ):<br>')) {
    startLine = i;
  }
}
if (startLine !== -1) {
  // Find the next `    \`;` line after startLine
  for (let i = startLine + 1; i < lines.length; i++) {
    if (lines[i] === '    `;') {
      endLine = i;
      break;
    }
  }
}

if (startLine !== -1 && endLine !== -1) {
  lines.splice(startLine, endLine - startLine);
  lines[startLine] = '    `;';
  fs.writeFileSync('src/pages/AdminDashboard.jsx', lines.join('\n'));
  console.log('Fixed syntax error by line number slicing!');
} else {
  console.error('Failed to find start/end lines:', startLine, endLine);
}
