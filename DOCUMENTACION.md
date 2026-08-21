# Documentación del sitio web

## 1. Resumen

Sitio web estático de la Institución Educativa Mariscal Castilla, Huancayo, Junín, Perú. Está construido con HTML5, CSS3 y JavaScript vanilla, sin backend ni base de datos.

El proyecto tiene dos experiencias principales:

- `index.html`: página institucional principal.
- `atajos/areas_curriculares.html`: directorio institucional 2026.

La información se mantiene directamente en HTML y JavaScript. Gran parte de las imágenes de la portada está embebida como Base64.

## 2. Tecnologías y ejecución

- HTML5, CSS3, Grid, Flexbox, variables CSS y media queries.
- JavaScript vanilla.
- Anime.js declarado como dependencia.
- Font Awesome 6.4 y Google Fonts cargados desde CDN.
- `http-server` para desarrollo local.

```bash
npm install
npm run dev
```

El sitio se sirve normalmente en `http://localhost:8000`. También puede abrirse `index.html` directamente, aunque se recomienda usar servidor local para probar rutas y recursos.

## 3. Estructura

```text
index.html                  Página institucional principal
Script.js                   Navegación y comportamiento global
style.css                   Estilos de la página principal
atajos/areas_curriculares.html  Directorio institucional 2026
atajos/Script.js            Datos y lógica del directorio
atajos/Style.css            Estilos del directorio
supabase-config.js          Configuración pública de Supabase
Auth.js                     Autenticación y sesión estudiantil
img/                        Recursos gráficos
icon/                       Iconos y favicon
package.json                Dependencias y scripts npm
README.md                   Guía general
DEVELOPMENT.md              Guía de desarrollo
CONTRIBUTING.md             Guía para colaboradores
ISSUES.md                   Problemas frecuentes
CHANGELOG.md                Historial de cambios
```

## 4. Página institucional principal

La portada utiliza un sistema de vistas con elementos `.page`. La función `navigate(page)` oculta las vistas y activa `#page-${page}` sin recargar el documento.

### Navegación

- Navbar fijo con cambio visual al hacer scroll.
- Menú de escritorio con submenú de áreas.
- Menú móvil desplegable.
- Botón destacado de Matrícula 2027.
- Botón flotante de WhatsApp.
- Enlaces internos sin recarga.

### Inicio (`page-home`)

Incluye hero con slider automático de cuatro imágenes, indicadores y llamadas a la acción; estadísticas animadas de estudiantes, docentes e historia; oferta de primero a quinto de secundaria; historia institucional y misión, visión, excelencia y comunidad; infraestructura; resumen de admisión; noticias; galería; testimonios; contacto y mapa de Google Maps.

### Páginas internas

- `page-nosotros`: historia, misión, visión y valores.
- `page-areas-curriculares`: descripción de áreas curriculares.
- `page-admision`: pasos, requisitos, fechas, costos y WhatsApp.
- `page-noticias`: noticias con filtro por categoría.
- `page-noticia-1` a `page-noticia-6`: artículos individuales.
- `page-galeria`: galería ampliada.
- `page-contacto`: formulario y datos de contacto.

## 5. Funcionalidades de `Script.js`

- Navegación: `navigate()` y `showPage()`.
- Menú móvil: `toggleMenu()`.
- Navbar reactivo al scroll.
- Slider del hero: `goToSlide()` y avance cada cinco segundos.
- Carrusel de testimonios: `slideTestimonio()`.
- Contadores con `IntersectionObserver`.
- Animaciones de aparición al hacer scroll.
- Lightbox con `openLightbox()` y `closeLightbox()`.
- Cierre del lightbox con Escape.
- Filtro de noticias con `filterNews()`.
- Confirmación visual del formulario con `submitForm()`.

## 6. Directorio institucional 2026

La página secundaria implementa este flujo sin recarga:

```text
Listado de áreas -> Personas de un área -> Horario individual
```

Sus vistas son `#vista-areas`, `#vista-detalle` y `#vista-horario`.

### Funcionalidades

- Buscador global por nombre, cargo o área.
- Buscador interno por área.
- Tarjetas dinámicas de áreas y personas.
- Visualización de nombre, cargo, situación y correo disponible.
- Indicador de personas con horario cargado.
- Horario separado para padres y estudiantes.
- Días sin atención y lugar de atención.
- Navegación de retorno entre vistas.
- Secciones expandibles y contraíbles.
- Navegación por hash hacia subcategorías.
- Diseño responsive.
- No se incluyen ni renderizan números de celular.

### Organización actual

El directorio fue reorganizado bajo cuatro subcategorías:

1. **Directivos Jerárquicos:** `DIRECTIVOS`, `JERARQUICOS`.
2. **Gestión Pedagógica:** `PIP`, `AUXILIARES DE EDUCACIÓN`.
3. **Áreas Curriculares:** Matemática, Comunicación, Inglés, Ciencia y Tecnología, CC.SS. - DPCC, Arte y Cultura, Educación Religiosa, Educación Física y EPT.
4. **Gestión Administrativa:** Notas y Matrículas, Actas y Certificados, Secretaría General, Mesa de Partes, Tesorería, Auxiliar de Laboratorio, Auxiliar de Biblioteca, Patrimonio y Trabajador de Servicio.

### Modelo de datos

`directorioData` agrupa personas por área. Cada persona puede contener:

```js
{
  (nombre, cargo, situacion, cumpleanos, correo);
}
```

`areaCategoria` asigna las áreas a sus subcategorías y `categoriaDeArea()` resuelve esa asignación.

`horariosAtencion` relaciona un área y el nombre exacto de una persona con dos calendarios:

```js
{
  padres: { lunes, martes, miercoles, jueves, viernes },
  estudiantes: { lunes, martes, miercoles, jueves, viernes }
}
```

Cada día es `null` o contiene `hora` y `lugar`.

### Estado de horarios

La carga de horarios es parcial. El código documenta información para EPT, Educación Religiosa y Educación Física; el resto debe verificarse y completarse con la fuente institucional correspondiente. Para agregar datos basta con incluir una entrada nueva en `horariosAtencion`, usando exactamente el nombre presente en `directorioData`.

## 7. Avances realizados

### Base institucional

- Portada institucional completa.
- Identidad visual con rojo, azul marino, dorado y blanco.
- Metadatos SEO, Open Graph y favicon.
- Diseño responsive y menú móvil.
- Slider, contadores, lightbox, filtros, carrusel y navegación interna.
- Guías de proyecto en README, desarrollo, contribución, incidencias y changelog.
- Scripts npm para servidor local.

### Directorio 2026

- Encabezado institucional y buscador global.
- Flujo áreas -> personas -> horarios.
- Datos de personal, cargos, situaciones y correos.
- Horarios para padres y estudiantes.
- Reorganización en cuatro subcategorías de Gestión Institucional.
- Contadores y controles expandibles.
- Filtrado global que abre categorías con coincidencias.
- Estilos propios para subcategorías, tarjetas y estados sin resultados.

## 8. Estado actual y pendientes

### Implementado

- Sitio estático navegable.
- Página institucional visualmente completa.
- Directorio dinámico en el navegador.
- Búsquedas y filtros principales.
- Diseño responsive.
- Horarios individuales con cobertura parcial.
- Documentación base del proyecto.
- Login inicial con Supabase Auth y vista privada del estudiante.
- Acceso limitado al dominio de correo institucional.
- Cierre y restauración de sesión.

### Pendiente o recomendable

- Completar y validar horarios de todas las áreas.
- Reemplazar datos demostrativos de contacto, especialmente el WhatsApp.
- Actualizar fechas de noticias, admisión y copyright cuando corresponda.
- Separar imágenes Base64 y optimizarlas como WebP o AVIF.
- Unificar la vista estática `page-areas-curriculares` con el directorio actual de `atajos/`.
- Revisar referencias a `showDocentes()` en la vista estática y confirmar que exista la implementación correspondiente.
- Añadir textos `alt` descriptivos a las imágenes.
- Conectar el formulario a un servicio real; actualmente solo muestra una alerta.
- Crear un sistema de noticias actualizable sin editar HTML.
- Crear pruebas automatizadas; `npm test` todavía es un placeholder que termina con error.
- Validar HTML, CSS, consola y responsive en navegadores reales.
- Revisar accesibilidad de controles que dependen de `onclick` y elementos visuales.
- Configurar `supabase-config.js` con la URL y la clave pública `anon`.
- Crear o invitar usuarios en Supabase Auth; no existe registro público desde la web.
- Confirmar las columnas de `estudiantes` para mostrar DNI, notas y horarios reales.
- Crear políticas RLS para que cada estudiante solo pueda leer sus propios datos.

## 9. Mantenimiento del directorio

Para modificar personas, editar el área correspondiente dentro de `directorioData` en `atajos/Script.js`.

Para modificar horarios, editar `horariosAtencion`, mantener el nombre exacto, completar `padres` y `estudiantes` de lunes a viernes y usar `null` cuando no haya atención.

Para modificar categorías, editar `areaCategoria` y confirmar que existan los contenedores HTML `directivos`, `pedagogica`, `areas` y `administrativa`, además de sus enlaces y hashes.

## 10. Autenticación estudiantil

La autenticación inicial está implementada en `Auth.js` y utiliza Supabase Auth mediante la librería cargada desde CDN. El acceso está disponible desde el navbar y el menú móvil.

### Flujo actual

1. El visitante ve normalmente todo el contenido público.
2. Al pulsar `Acceso estudiante`, aparece el formulario de login.
3. El correo debe terminar en `@mariscalcastilla.edu.pe`.
4. Supabase valida el correo y la contraseña mediante `signInWithPassword()`.
5. Con sesión válida se habilita `page-estudiante`.
6. La vista muestra las áreas privadas previstas: datos personales, notas y horario.
7. El cierre de sesión elimina la sesión y devuelve al inicio.

### Configuración requerida

Editar `supabase-config.js` usando únicamente valores públicos:

```js
window.SUPABASE_CONFIG = {
  url: 'https://tu-proyecto.supabase.co',
  anonKey: 'tu-clave-anon-publica',
  institutionalEmailDomain: 'mariscalcastilla.edu.pe',
};
```

No debe colocarse `service_role` en el navegador. Los usuarios deben existir previamente en Supabase Auth o ser creados/invitados desde un entorno administrativo seguro. La web no tiene registro público.

### Estado de los datos privados

La interfaz privada está preparada, pero las tarjetas de DNI, notas y horario aparecen como `Próximamente` hasta confirmar el esquema de la tabla `estudiantes` y las tablas académicas. La sesión por sí sola no autoriza a leer datos: Supabase debe tener políticas RLS que comparen el usuario autenticado con el propietario del registro.

## 11. Validación antes de publicar

- Ejecutar `npm install` y `npm run dev`.
- Probar navegación, menú móvil, slider, galería, lightbox, testimonios y filtros.
- Probar búsquedas del directorio con nombres, cargos y áreas.
- Abrir personas con y sin horario.
- Probar enlaces con hash.
- Revisar la consola del navegador.
- Revisar móvil, tablet y escritorio.
- Confirmar que todos los datos públicos estén actualizados y autorizados.

## 12. Conclusión

El proyecto cuenta con una base visual y funcional amplia. La portada funciona como sitio institucional informativo y el directorio 2026 ya permite consultar áreas, personal y horarios. El avance más relevante es la reorganización del directorio bajo Gestión Institucional con cuatro subcategorías y renderizado dinámico.

El siguiente bloque de trabajo debería centrarse en validar y completar datos, unificar la vista antigua de áreas con el directorio actual, optimizar imágenes y establecer pruebas mínimas antes de considerar el sitio completamente listo para producción.
