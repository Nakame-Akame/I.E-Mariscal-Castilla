const componentesHtml = [
  { selector: '#header-component', source: 'components/header.html' },
  { selector: '#pages-component', source: 'pages/home.html', append: true },
  { selector: '#pages-component', source: 'pages/nosotros.html', append: true },
  { selector: '#pages-component', source: 'pages/areas-curriculares.html', append: true },
  { selector: '#pages-component', source: 'pages/admision.html', append: true },
  { selector: '#pages-component', source: 'pages/noticias.html', append: true },
  { selector: '#pages-component', source: 'pages/galeria.html', append: true },
  { selector: '#pages-component', source: 'pages/contacto.html', append: true },
  { selector: '#student-component', source: 'components/student-dashboard.html' },
  { selector: '#login-component', source: 'components/login-modal.html' },
  { selector: '#lightbox-component', source: 'components/lightbox.html' },
  { selector: '#footer-component', source: 'components/footer.html' },
];

function cargarComponenteHtml({ selector, source, append = false }) {
  const host = document.querySelector(selector);
  if (!host) return;

  const request = new XMLHttpRequest();
  request.open('GET', source, false);
  request.send();
  if (request.status < 200 || request.status >= 300) {
    throw new Error(`No se pudo cargar el componente ${source}: ${request.status}`);
  }

  const template = document.createElement('template');
  template.innerHTML = request.responseText.trim();
  if (append) {
    host.appendChild(template.content.cloneNode(true));
  } else {
    host.replaceWith(template.content.cloneNode(true));
  }
}

function cargarComponentesHtml() {
  componentesHtml.forEach(cargarComponenteHtml);
  document.dispatchEvent(new CustomEvent('components:ready'));
}

cargarComponentesHtml();
