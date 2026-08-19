# Guía de Resolución de Problemas

## 🔍 Problemas Comunes y Soluciones

### El sitio no se ve correctamente en mobile

**Síntoma**: Layout roto, texto superpuesto, imágenes gigantes

**Soluciones**:

1. Verificar viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
2. Revisar media queries en `style.css`
3. Usar Chrome DevTools: presionar F12 → Click en dispositivo móvil
4. Probar en breakpoint 768px

```css
@media (max-width: 768px) {
  .contenedor {
    flex-direction: column;
    padding: 1rem;
  }
}
```

---

### Las animaciones Anime.js no funcionan

**Síntoma**: Sin animaciones, elementos sin movimiento

**Soluciones**:

1. Verificar que Anime.js esté cargado:

   ```html
   <script src="https://unpkg.com/animejs@4.5.0/lib/anime.min.js"></script>
   ```

2. Verificar console (F12):

   ```javascript
   console.log(window.anime); // Debe mostrar función
   ```

3. Revisar selectores CSS:

   ```javascript
   // Verificar que existen elementos
   console.log(document.querySelectorAll('.hero-slide'));
   ```

4. Revise que JavaScript se carga después del DOM:
   ```javascript
   document.addEventListener('DOMContentLoaded', function () {
     // Código aquí
   });
   ```

---

### El navegador muestra error: "Cannot read property 'classList' of null"

**Síntoma**: Error en console, funciones no funcionan

**Soluciones**:

1. El elemento no existe en HTML
2. El ID o clase está mal escrito
3. Script se ejecuta antes de que DOM esté listo

```javascript
// ✅ Bien
document.addEventListener('DOMContentLoaded', function () {
  const el = document.getElementById('navbar');
  if (el) el.classList.add('scrolled');
});

// ❌ Mal
const el = document.getElementById('navbar');
el.classList.add('scrolled'); // Error si el no existe
```

---

### El servidor local no funciona

**Síntoma**: "Cannot GET /", conexión rechazada

**Soluciones**:

Python 3:

```bash
cd C:\Users\Usuario\Documents\GitHub\I.E-Mariscal-Castilla
python -m http.server 8000
# Acceder a http://localhost:8000
```

Node.js:

```bash
npm install -g http-server
http-server -p 8000
```

Live Server (VS Code):

- Click derecho en `index.html` → "Open with Live Server"

---

### CSS no se aplica

**Síntoma**: Estilos no aparecen, cambios ignorados

**Soluciones**:

1. Hard refresh del navegador: `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac)
2. Limpiar cache del navegador
3. Verificar que path del archivo es correcto:

   ```html
   <!-- ✅ Correcto (relativo) -->
   <link rel="stylesheet" href="style.css" />

   <!-- ❌ Incorrecto (path no existe) -->
   <link rel="stylesheet" href="css/style.css" />
   ```

4. Verificar sintaxis CSS:

   ```css
   /* ✅ Bien */
   .elemento {
     color: red;
   }

   /* ❌ Mal (falta ;) */
   .elemento {
     color: red;
   }
   ```

---

### WhatsApp flotante no funciona

**Síntoma**: Link de WhatsApp no abre chat

**Soluciones**:

1. Verificar número de teléfono:

   ```html
   <a href="https://wa.me/51999999999?text=Hola"> <!-- Cambiar 51999999999 por tu número --></a>
   ```

2. Formato: país (51 Perú) + área + número
3. Sin espacios ni caracteres especiales
4. Probar en https://wa.me/

---

### Galería de imágenes no muestra imágenes

**Síntoma**: Imágenes con error (icono X roto)

**Soluciones**:

1. Verificar que imágenes existen en carpeta `img/`
2. Revisar path en HTML:

   ```html
   <!-- ✅ Bien -->
   <img src="img/foto.jpg" alt="Descripción" />

   <!-- ❌ Mal -->
   <img src="Image/foto.JPG" alt="" />
   ```

3. Extensión correcta (.jpg, .png, .gif)
4. Archivos no muy pesados (optimizar si > 500KB)

---

### Modal de docentes no abre/cierra

**Síntoma**: Click en botón pero no pasa nada

**Soluciones**:

1. Verificar que función `toggleDocentesModal()` existe
2. Revisar console para errores
3. Verificar que elemento `.docentes-overlay` existe
4. Verificar clase `.active` en CSS

```javascript
// Verificar
console.log(document.querySelector('.docentes-overlay'));
```

---

### Menú móvil no responde al hamburger

**Síntoma**: Click en ☰ pero menú no aparece

**Soluciones**:

1. Verificar función `toggleMenu()`:

   ```javascript
   function toggleMenu() {
     const menu = document.getElementById('mobileMenu');
     if (menu) menu.classList.toggle('open');
   }
   ```

2. Verificar CSS:

   ```css
   .mobile-menu {
     display: none;
   }
   .mobile-menu.open {
     display: flex;
   }
   ```

3. Verificar evento en HTML:
   ```html
   <div class="hamburger" onclick="toggleMenu()"></div>
   ```

---

### Página es muy lenta

**Síntoma**: Scroll lento, animaciones pixeladas

**Soluciones**:

1. Reducir imágenes grandes:
   - Usar herramienta como TinyPNG
   - Convertir a WebP
   - Comprimir antes de subir

2. Reducir animaciones simultáneas
3. Usar `will-change` en CSS con cuidado:

   ```css
   .animated {
     will-change: transform;
   }
   ```

4. Revisar performance: DevTools → Performance → Grabar

---

### Script.js no se ejecuta

**Síntoma**: Funciones JavaScript no funcionan

**Soluciones**:

1. Verificar que archivo se carga:

   ```html
   <script src="Script.js"></script>
   <!-- Nota: May sensible a mayúsculas! -->
   ```

2. Verificar ruta correcta (desde carpeta raíz)
3. Revisar console (F12):

   ```javascript
   console.log('Script cargado'); // Debe mostrar
   ```

4. Verificar sintaxis JavaScript:
   - Paréntesis equilibrados
   - Comillas equilibradas
   - Punto y coma al final

---

### Las fuentes (Poppins, Inter) no cargan

**Síntoma**: Fuentes genéricas, texto sin estilo

**Soluciones**:

1. Verificar conexión a Google Fonts:

   ```html
   <link
     href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap"
     rel="stylesheet"
   />
   ```

2. Verificar CSS está usando las fuentes:

   ```css
   :root {
     --font-title: 'Poppins', sans-serif;
     --font-body: 'Inter', sans-serif;
   }
   ```

3. Si no carga, usar fallback:
   ```css
   .titulo {
     font-family: 'Poppins', 'Arial', sans-serif;
   }
   ```

---

### Error: "Conflicto de merge sin resolver"

**Síntoma**: Símbolos `<<<<<<<` y `>>>>>>>` en archivo

**Solución**:
Ya ha sido arreglado en versión actual. Si aparece nuevamente:

1. Abrir archivo en editor
2. Resolver conflicto manualmente (elegir qué código mantener)
3. Eliminar marcadores de conflicto
4. Guardar y commit

---

## 🆘 Aún Necesitas Ayuda?

1. Revisar console (F12) para errores
2. Abrir issue en GitHub con:
   - Descripción clara del problema
   - Pasos para reproducir
   - Navegador y versión
   - Screenshot/video si posible

3. Contactar a:
   - 📞 WhatsApp: [Número configurado]
   - 📧 Email: contacto@iemariscal.edu.pe

---

**Última actualización**: 2025-08-18
