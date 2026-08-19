# Contribuyendo a IE Mariscal Castilla

¡Gracias por tu interés en contribuir! Este documento proporciona directrices para contribuir al proyecto.

## 📋 Tipos de Contribuciones

### 🐛 Reportar Bugs
1. Usa el título descriptivo para el issue
2. Describe los pasos exactos para reproducir
3. Proporciona ejemplos específicos
4. Describe el comportamiento observado y esperado
5. Incluye capturas de pantalla si aplica
6. Menciona tu navegador y versión

### ✨ Sugerencias de Mejoras
1. Usa un título claro y descriptivo
2. Proporciona una descripción detallada
3. Explica por qué esta mejora sería útil
4. Lista ejemplos de implementaciones similares

### 🔧 Pull Requests (Cambios de Código)

#### Antes de Empezar
1. Fork el repositorio
2. Crea una rama desde `main`: `git checkout -b feature/nombre-feature`
3. Instala dependencias: `npm install`

#### Código
1. Sigue las convenciones de código del proyecto
2. Escribe código limpio y legible
3. Incluye comentarios para lógica compleja
4. Usa nombres descriptivos en variables y funciones

#### Commits
```bash
# Usa mensajes claros
git commit -m "feat: añadir slider de testimonios"
git commit -m "fix: corregir error de responsive en mobile"
git commit -m "docs: actualizar README"
```

Prefijos recomendados:
- `feat:` Nueva característica
- `fix:` Arreglo de bug
- `docs:` Cambios en documentación
- `style:` Formato de código (no cambios de lógica)
- `refactor:` Refactoring de código
- `test:` Añadir o actualizar tests
- `chore:` Cambios de build, dependencias, etc.

#### Push y Pull Request
```bash
git push origin feature/nombre-feature
```

1. Describe qué cambios hace
2. Referencia issues relacionados (#123)
3. Incluye antes/después si aplica
4. Asegúrate de que no hay conflictos

## 🎯 Estándares de Código

### HTML
```html
<!-- ✅ Bien -->
<div class="card" id="card-hero">
  <h2>Título</h2>
  <p>Contenido</p>
</div>

<!-- ❌ Mal -->
<div class="card">
<H2>Título</H2>
  <P>Contenido</P>
</div>
```

### CSS
```css
/* ✅ Bien */
:root {
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
}

.card {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

/* ❌ Mal */
.card { padding: 1rem; margin-bottom: 1rem; }
.Card { }
```

### JavaScript
```javascript
// ✅ Bien
function mostrarModal() {
  const modal = document.getElementById('modal');
  modal.classList.add('active');
}

// ❌ Mal
function showmodal() {
  var modal = document.getElementById('modal');
  modal.classList = 'active';
}
```

## 📱 Testing

Antes de enviar un PR, verifica:

1. **Visual**
   - Desktop (1920px+)
   - Tablet (768px-1024px)
   - Mobile (320px-767px)
   - Navegadores: Chrome, Firefox, Safari, Edge

2. **Funcional**
   - Sin errores en console
   - Animaciones suaves (60fps)
   - Links funcionan
   - Formularios envían

3. **Accesibilidad**
   - Alt text en imágenes
   - Labels en inputs
   - Navegación con teclado
   - Contraste de colores

4. **Performance**
   - Google PageSpeed (móvil: 85+)
   - Lighthouse (90+)
   - Tiempo de carga < 3s

## 📝 Documentación

- Actualiza README.md si cambias características
- Comenta código complejo
- Usa docstrings en funciones complejas
- Documenta configuración nueva

## 🔄 Proceso de Revisión

1. Revisión automática (linting)
2. Revisión manual del código
3. Testing
4. Aprobación y merge

Los comentarios del revisor son para mejorar, no críticos.

## ✅ Checklist Final

Antes de hacer submit:

- [ ] Código formateado
- [ ] Sin console.log() de debug
- [ ] Responsivo en todos los breakpoints
- [ ] Accesibilidad verificada
- [ ] Documentación actualizada
- [ ] Sin conflictos con `main`
- [ ] Descripción clara del PR

## 🚀 Después del Merge

Tu contribución será:
1. Mergeada a `main`
2. Testeada en staging
3. Deployada a producción
4. Documentada en changelog

¡Gracias por contribuir! 🎉

---

**Preguntas?** Abre un issue o contacta a los mantainers.
