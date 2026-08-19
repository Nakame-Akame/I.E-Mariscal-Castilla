# IE Mariscal Castilla

Sitio web oficial de la Institución Educativa Mariscal Castilla - Huancayo, Perú.

## 🎯 Descripción

Formando líderes con valores y excelencia académica desde 1957. Sitio web responsivo con información sobre la institución, áreas curriculares, noticias, galería y sistema de admisión.

## 📋 Características

- ✅ Diseño responsivo (Mobile-first)
- ✅ Navbar fijo con scroll dinámico
- ✅ Slider de hero con navegación automática
- ✅ Animaciones suaves con Anime.js
- ✅ Modal de docentes
- ✅ Sistema de navegación por páginas
- ✅ Contacto por WhatsApp flotante
- ✅ SEO optimizado (meta tags, OpenGraph)
- ✅ Accesibilidad (ARIA labels, screen-reader text)

## 🛠️ Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Grid, Flexbox, variables CSS
- **JavaScript Vanilla** - Interactividad sin dependencias
- **Anime.js** - Animaciones fluidas
- **Font Awesome 6.4** - Iconos
- **Google Fonts** - Tipografía (Poppins, Inter)

## 📁 Estructura del Proyecto

```
├── index.html              # Página principal
├── Script.js              # Lógica JavaScript
├── style.css              # Estilos CSS
├── package.json           # Dependencias Node
├── README.md              # Este archivo
├── atajos/                # Páginas secundarias
│   ├── areas_curriculares.html
│   ├── Script.js
│   └── Style.css
└── img/                   # Assets de imagen
    └── Castilla.ico
```

## 🚀 Instalación y Uso

### Opción 1: Local (sin servidor)
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/usuario/I.E-Mariscal-Castilla.git
   cd I.E-Mariscal-Castilla
   ```

2. Abrir `index.html` directamente en el navegador (funciona sin servidor)

### Opción 2: Con servidor local
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# Luego acceder a http://localhost:8000
```

## 📦 Dependencias

```json
{
  "dependencies": {
    "animejs": "^4.5.0"
  }
}
```

Instaladas con:
```bash
npm install
```

## 🎨 Personalización

### Colores Principales (CSS Variables)
Editar en `style.css`:
```css
:root {
  --red: #8B0000;              /* Rojo principal */
  --navy: #0B1F3A;             /* Azul marino */
  --gold: #C9A84C;             /* Dorado */
  --cream: #F5E6C8;            /* Crema */
  /* ... más colores */
}
```

### Tipografía
- Títulos: `Poppins` (300-900)
- Cuerpo: `Inter` (300-600)

## 📱 Breakpoints Responsivos

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔄 Navegación

### Sistema de Páginas
El sitio usa un sistema de navegación basado en clases CSS `page`:
- `page-home` - Inicio
- `page-nosotros` - Información institucional
- `page-galeria` - Galería fotográfica
- `page-noticias` - Noticias y actualizaciones
- `page-contacto` - Formulario de contacto
- `page-admision` - Proceso de admisión 2027

## 🔗 Enlaces Importantes

- **WhatsApp**: Botón flotante (modificar número en HTML)
- **Redes Sociales**: Iconos en footer
- **Áreas Curriculares**: Página independiente en `atajos/`

## ✅ Checklist de Mejoras Futuras

- [ ] Añadir base de datos para noticias
- [ ] Sistema de comentarios en posts
- [ ] Blog dinámico
- [ ] Panel de administración
- [ ] Integración con Google Analytics
- [ ] Certificado SSL (HTTPS)
- [ ] PWA (Progressive Web App)
- [ ] Optimización de imágenes (WebP)

## 📧 Contacto y Soporte

Para reportar bugs o sugerencias:
- 📍 Dirección: Huancayo, Junín, Perú
- 📞 WhatsApp: [Número configurado]
- 💬 Redes Sociales: [Links en footer]

## 📄 Licencia

© 2025 IE Mariscal Castilla · Todos los derechos reservados

---

**Última actualización**: 2025-08-18
**Estado**: ✅ Producción