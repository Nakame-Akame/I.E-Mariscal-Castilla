// NAVIGATION SYSTEM
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) {
    target.classList.add('active');
    window.scrollTo({top:0, behavior:'smooth'});
  }
}

function showPage(page) {
  navigate(page);
}

// NAVBAR SCROLL
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 50) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
  revealOnScroll();
});

// MOBILE MENU
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
}

// HERO SLIDER
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.hero-dot');

function goToSlide(n) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

setInterval(() => goToSlide(currentSlide + 1), 5000);

// TESTIMONIOS SLIDER
let testimonioIdx = 0;
function slideTestimonio(dir) {
  const track = document.getElementById('testimoniosTrack');
  const cards = track.querySelectorAll('.testimonio-card');
  const visible = window.innerWidth < 768 ? 1 : 3;
  const max = cards.length - visible;
  testimonioIdx = Math.max(0, Math.min(testimonioIdx + dir, max));
  const w = cards[0].offsetWidth + 24;
  track.style.transform = `translateX(-${testimonioIdx * w}px)`;
}

// COUNTER ANIMATION
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const start = Date.now();
  const timer = setInterval(() => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = '+' + Math.floor(eased * target).toLocaleString();
    if (progress >= 1) { el.textContent = '+' + target.toLocaleString(); clearInterval(timer); }
  }, 16);
}

// SCROLL REVEAL
function revealOnScroll() {
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) el.classList.add('visible');
  });
}

// LIGHTBOX
function openLightbox(src) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if(e.key==='Escape') closeLightbox(); });

// FORM SUBMIT
function submitForm() {
  alert('✅ Mensaje enviado correctamente. Nos comunicaremos contigo a la brevedad. ¡Gracias por contactar a IE Mariscal Castilla!');
}

// NEWS FILTER
function filterNews(cat) {
  const cards = document.querySelectorAll('#page-noticias .noticia-card');
  cards.forEach(card => {
    if (cat === 'all' || card.dataset.cat === cat) card.style.display = 'block';
    else card.style.display = 'none';
  });
}

// INIT
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    setTimeout(() => document.getElementById('loader').remove(), 600);
  }, 1200);
  
  document.querySelectorAll('[data-target]').forEach(el => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting) animateCounter(el); });
    }, {threshold:0.5});
    observer.observe(el);
  });
  
  revealOnScroll();
});