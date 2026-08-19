# Guía de Desarrollo

## 🚀 Configuración Inicial

### Requisitos
- Node.js 14+ (opcional, solo para servidor local)
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Git

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/usuario/I.E-Mariscal-Castilla.git
cd I.E-Mariscal-Castilla
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar servidor local**
```bash
npm run dev
# o
npm run serve
```

El sitio estará disponible en `http://localhost:8000`

## 📝 Estructura de Archivos

```
├── index.html              # Página principal
├── Script.js              # JavaScript global
├── style.css              # Estilos globales
├── package.json           # Dependencias
├── .gitignore            # Archivos a ignorar en Git
├── .editorconfig         # Configuración de editor
├── .prettierrc            # Configuración de formato
├── atajos/               # Páginas secundarias
│   ├── areas_curriculares.html
│   ├── Script.js
│   └── Style.css
└── img/                  # Imágenes y assets
```

## 🎨 Convenciones de Código

### HTML
- Usar indentación de 2 espacios
- Nombres de clase en kebab-case: `.card-title`
- IDs en camelCase: `#heroSection`
- Atributos en orden: class, id, data-*, event handlers

### CSS
- Variables CSS para colores y espaciado
- Nombres de clase descriptivos
- Mobile-first approach
- Comentarios para secciones principales

### JavaScript
- Usar `const` por defecto, `let` si es necesario
- Funciones con nombres descriptivos en camelCase
- Comentarios en español para documentación
- Evitar variables globales

## 🔧 Tareas Comunes

### Agregar una Nueva Página
1. Crear un nuevo `div.page` en `index.html`
2. Agregar CSS en `style.css`
3. Agregar funciones de navegación en `Script.js`
4. Actualizar navbar y menú móvil

### Modificar Colores
Editar `:root` en `style.css`:
```css
:root {
  --red: #8B0000;
  --navy: #0B1F3A;
  /* ... */
}
```

### Agregar Animaciones
Usar Anime.js:
```javascript
anime({
  targets: '.elemento',
  opacity: [0, 1],
  duration: 800,
  easing: 'easeOutCubic'
});
```

## 🧪 Testing

Validar HTML/CSS en:
- https://validator.w3.org/
- https://jigsaw.w3.org/css-validator/

## 📱 Responsive Design

Breakpoints definidos:
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

## 🚀 Deployment

### GitHub Pages
1. Activar GitHub Pages en Settings
2. Seleccionar rama `main` o `gh-pages`
3. El sitio estará en `https://usuario.github.io/I.E-Mariscal-Castilla`

### Otros Servidores
1. Subir archivos a servidor web
2. Asegurar HTTPS
3. Configurar cache headers

## 📋 Checklist Antes de Commit

- [ ] Código formateado (prettier)
- [ ] Sin errores en consola
- [ ] Responsive en mobile (768px)
- [ ] Meta tags actualizados
- [ ] Links internos funcionan
- [ ] Animaciones suaves
- [ ] Accesibilidad (alt text, ARIA)

## 🐛 Debugging

Abrir DevTools (F12) y revisar:
1. Console (errores JavaScript)
2. Network (recursos que faltan)
3. Responsive Design Mode
4. Performance (animaciones)

## 📚 Recursos

- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [Anime.js Docs](https://animejs.com/)
- [Can I Use](https://caniuse.com/)

## 🤝 Contribuciones

Ver [CONTRIBUTING.md](CONTRIBUTING.md)
