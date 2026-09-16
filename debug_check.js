const fs = require('fs');
const src = fs.readFileSync('c:/Users/Usuario/Documents/I.E M_C/I.E-Mariscal-Castilla/atajos/Script.js', 'utf8');
const dirMatch = src.match(/const directorioData = \{([\s\S]*?)\n\};\n\nconst DIAS_SEMANA/);
const schedMatch = src.match(/const horariosAtencion = \{([\s\S]*?)\n\};\n\nconst DIAS_SEMANA/);
if (!dirMatch || !schedMatch) {
  console.log('NO_MATCH');
  process.exit(1);
}
const directorio = Function('return (' + '{' + dirMatch[1] + '}' + ');')();
const horarios = Function('return (' + '{' + schedMatch[1] + '}' + ');')();
const norm = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,;:()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
const missing = [];
for (const [area, entries] of Object.entries(horarios)) {
  const members = (directorio[area] || []).map((p) => p.nombre);
  for (const name of Object.keys(entries || {})) {
    const ok = members.some((m) => norm(m) === norm(name));
    if (!ok) {
      missing.push({ area, name });
    }
  }
}
console.log('missing_count=' + missing.length);
console.log(JSON.stringify(missing.slice(0, 80), null, 2));
