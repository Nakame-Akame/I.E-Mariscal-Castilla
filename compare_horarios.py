import re
from pathlib import Path

root = Path(r'C:\Users\Usuario\Documents\I.E M_C\I.E-Mariscal-Castilla')
text = (root / 'horarios-por-curso.txt').read_text(encoding='utf-8', errors='ignore')
js = (root / 'atajos' / 'Script.js').read_text(encoding='utf-8', errors='ignore')

# Parse txt names by course
cur = None
names_by_area = {}
for line in text.splitlines():
    m = re.match(r'^CURSO:\s*(.+)$', line.strip())
    if m:
        cur = m.group(1).strip()
        names_by_area.setdefault(cur, [])
        continue
    m = re.match(r'^-\s*(.+)$', line.strip())
    if m and cur:
        name = re.sub(r'\s+', ' ', m.group(1).strip())
        names_by_area.setdefault(cur, []).append(name)

# Parse JS names by area
area_pattern = re.compile(r"\n\s*([A-ZÁÉÍÓÚÑ.\- ]+):\s*\{\s*(.*?)\n\s*\},\s*\n\s*[A-ZÁÉÍÓÚÑ.\- ]+:\s*\{|\n\s*([A-ZÁÉÍÓÚÑ.\- ]+):\s*\{\s*(.*?)\n\s*\}\s*\n\s*\}\s*;", re.S)
# simpler broad parse for start of each area block
area_blocks = re.findall(r"\n\s*([A-ZÁÉÍÓÚÑ.\- ]+):\s*\{\s*([\s\S]*?)\n\s*\}\s*,?\s*(?=\n\s*[A-ZÁÉÍÓÚÑ.\- ]+:\s*\{|\n\s*\};)", js)
js_names_by_area = {}
for area, body in area_blocks:
    names = re.findall(r"'([^']+)'\s*:\s*\{\s*padres", body)
    js_names_by_area[area.strip()] = {re.sub(r'\s+', ' ', n).strip().lower() for n in names}

missing = []
for area, names in names_by_area.items():
    js_names = js_names_by_area.get(area, set())
    for name in names:
        norm = re.sub(r'\s+', ' ', name).strip().lower()
        if norm not in js_names:
            missing.append((area, name))

print('TOTAL_MISSING', len(missing))
for area, name in missing:
    print(f'{area} | {name}')
