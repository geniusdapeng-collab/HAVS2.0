const acorn = require('acorn');
const fs = require('fs');

const content = fs.readFileSync('/root/.openclaw/workspace/zhuoyue-system/core/nirath-master-pipeline.js', 'utf8');

try {
  acorn.parse(content, {
    ecmaVersion: 2024,
    sourceType: 'module',
    locations: true,
    allowReturnOutsideFunction: true
  });
  console.log('Parse OK');
} catch (e) {
  console.log('Parse error at line', e.loc?.line, 'column', e.loc?.column);
  console.log('Message:', e.message);
  
  // Show context
  const lines = content.split('\n');
  const errLine = e.loc?.line || 1;
  console.log('\nContext:');
  for (let i = Math.max(0, errLine - 5); i < Math.min(lines.length, errLine + 5); i++) {
    console.log(`Line ${i+1}: ${lines[i]}`);
  }
  
  // Show what token is expected
  if (e.message.includes('Unexpected token')) {
    const token = e.message.match(/Unexpected token '?(.+?)'?/)?.[1];
    console.log('\nToken found:', token);
  }
}
