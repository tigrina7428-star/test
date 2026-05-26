const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\User\\Desktop\\sklad 2';
const files = [
  'index.html','catalog.html','catalog copy.html','sclad.html',
  'complete.html','equipment.html','specs.html','configurator.html',
  'offer.html','project.html','buyers.html','owners.html'
];

// Compact tooltip: all on ONE line, style="margin-left:5px;margin-bottom:20px" (no spaces)
const COMPACT_RE = /<span class="tooltip"><svg class="tooltip__icon" style="margin-left:5px;margin-bottom:20px"[^>]*>(?:(?!<\/span><\/span>).)*<\/span><\/span>/g;

files.forEach(f => {
  const fp = path.join(dir, f);
  const html = fs.readFileSync(fp, 'utf8');
  const matches = html.match(COMPACT_RE) || [];
  if (matches.length === 0) { console.log(f + ': no compact dupes found'); return; }
  const fixed = html.replace(COMPACT_RE, '');
  fs.writeFileSync(fp, fixed, 'utf8');
  console.log(f + ': removed ' + matches.length + ' compact duplicate(s)');
});
