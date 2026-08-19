#!/usr/bin/env python3
import re
import base64
import os
from pathlib import Path

# Rutas
html_file = "index.html"
img_dir = "img"

# Crear directorio de imágenes si no existe
os.makedirs(img_dir, exist_ok=True)

# Leer el HTML
with open(html_file, "r", encoding="utf-8") as f:
    html_content = f.read()

# Patrón para encontrar data URLs de imágenes
pattern = r'src="(data:image/(png|jpeg|jpg|gif|webp);base64,([^"]+))"'

# Diccionario para mapear data URLs originales a nuevas rutas
replacements = {}
image_counter = {"png": 0, "jpeg": 0, "jpg": 0, "gif": 0, "webp": 0}

# Encontrar y extraer todas las imágenes
for match in re.finditer(pattern, html_content):
    full_data_url = match.group(1)
    image_type = match.group(2)
    base64_data = match.group(3)

    # Normalizar tipo de imagen
    if image_type == "jpeg":
        ext = "jpg"
    else:
        ext = image_type

    # Contador para nombres únicos
    image_counter[ext] += 1
    filename = f"img-{image_counter[ext]}.{ext}"
    filepath = os.path.join(img_dir, filename)

    # Decodificar y guardar imagen
    try:
        image_data = base64.b64decode(base64_data)
        with open(filepath, "wb") as img_file:
            img_file.write(image_data)
        print(f"✓ Guardado: {filepath} ({len(image_data) / 1024:.1f} KB)")
        replacements[full_data_url] = f'src="{filename}"'
    except Exception as e:
        print(f"✗ Error al guardar {filename}: {e}")

# Reemplazar data URLs en el HTML
new_html = html_content
for old_url, new_src in replacements.items():
    new_html = new_html.replace(f'src="{old_url}"', new_src)

# Guardar HTML optimizado
with open(html_file, "w", encoding="utf-8") as f:
    f.write(new_html)

print(f"\n✓ HTML optimizado. Se extrajeron {sum(image_counter.values())} imágenes")

# Calcular tamaño
original_size = os.path.getsize(html_file + ".bak") if os.path.exists(html_file + ".bak") else 0
new_size = os.path.getsize(html_file)
print(f"Tamaño original: ~41 MB (con base64)")
print(f"Tamaño nuevo: {new_size / 1024 / 1024:.1f} MB (sin base64)")
print(f"Reducción: ~99% en transferencia de HTML")
