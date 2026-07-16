// ======================== ANIME.JS INITIALIZATION & SETUP ========================
// Configuración global de timing y easing por defecto
const animeConfig = {
  defaultDuration: 800,
  defaultEasing: 'easeOutCubic'
};

// ======================== LOADER ANIMATION ========================
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  
  // Animación del loader con rotación y escala
  const loaderAnimation = anime({
    targets: loader,
    opacity: [1, 0],
    duration: 800,
    delay: 1500,
    easing: 'easeInQuad',
    complete: function() {
      loader.remove();
    }
  });
  
  // Rotación continua del logo del loader
  anime({
    targets: '#loader img',
    rotate: 360,
    duration: 2000,
    loop: true,
    easing: 'linear'
  });
  
  // Pulso del texto de carga
  anime({
    targets: '#loader p',
    opacity: [0.5, 1],
    duration: 600,
    loop: true,
    direction: 'alternate',
    easing: 'easeInOutQuad'
  });
});

// ======================== PAGE NAVIGATION WITH ANIMATIONS ========================
function navigate(page) {
  const currentPage = document.querySelector('.page.active');
  const target = document.getElementById('page-' + page);
  if (!target || currentPage === target) return;

  // Exit animation para la página actual
  anime({
    targets: currentPage,
    opacity: [1, 0],
    translateY: [0, 20],
    duration: 350,
    easing: 'easeInQuad',
    complete: function() {
      currentPage.classList.remove('active');
      currentPage.style.opacity = '';
      currentPage.style.transform = '';
      
      // Entrada de la nueva página
      target.classList.add('active');
      anime.set(target, { opacity: 0, translateY: 20 });
      anime({
        targets: target,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: 'easeOutCubic',
        complete: function() {
          target.style.transform = '';
        }
      });
      
      // Animar elementos dentro de la página
      anime({
        targets: target.querySelectorAll('.reveal, .reveal-left, .reveal-right, .card, .section'),
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(80),
        duration: 600,
        easing: 'easeOutCubic'
      });
    }
  });

  window.scrollTo({top:0, behavior:'smooth'});
}

function showPage(page) {
  navigate(page);
}

// ======================== NAVBAR ANIMATIONS ========================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    if (!navbar.classList.contains('scrolled')) {
      navbar.classList.add('scrolled');
      anime({
        targets: navbar,
        boxShadow: ['0px 0px 0px rgba(0,0,0,0)', '0px 2px 20px rgba(0,0,0,0.3)'],
        duration: 400,
        easing: 'easeOutCubic'
      });
    }
  } else {
    if (navbar.classList.contains('scrolled')) {
      navbar.classList.remove('scrolled');
      anime({
        targets: navbar,
        boxShadow: '0px 0px 0px rgba(0,0,0,0)',
        duration: 400,
        easing: 'easeOutCubic'
      });
    }
  }
  revealOnScroll();
});

// ======================== MOBILE MENU TOGGLE ========================
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  const isOpen = menu.classList.toggle('open');

  if (isOpen) {
    // Animar hamburguesa
    anime({
      targets: hamburger.children,
      backgroundColor: 'rgba(255,255,255,1)',
      duration: 300,
      easing: 'easeOutQuad'
    });
    
    anime({
      targets: hamburger.children[0],
      rotate: 45,
      translateY: 10,
      duration: 300,
      easing: 'easeOutCubic'
    });
    
    anime({
      targets: hamburger.children[1],
      opacity: 0,
      duration: 300,
      easing: 'easeOutCubic'
    });
    
    anime({
      targets: hamburger.children[2],
      rotate: -45,
      translateY: -10,
      duration: 300,
      easing: 'easeOutCubic'
    });
    
    // Animar menú
    anime.set(menu, {opacity: 0});
    anime({
      targets: menu,
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutCubic'
    });
    
    // Animar items del menú
    anime({
      targets: '#mobileMenu a',
      opacity: [0, 1],
      translateX: [-20, 0],
      delay: anime.stagger(60),
      duration: 400,
      easing: 'easeOutCubic'
    });
  } else {
    // Cerrar menú
    anime({
      targets: hamburger.children[0],
      rotate: 0,
      translateY: 0,
      duration: 300,
      easing: 'easeOutCubic'
    });
    
    anime({
      targets: hamburger.children[1],
      opacity: 1,
      duration: 300,
      easing: 'easeOutCubic'
    });
    
    anime({
      targets: hamburger.children[2],
      rotate: 0,
      translateY: 0,
      duration: 300,
      easing: 'easeOutCubic'
    });
    
    anime({
      targets: menu,
      opacity: [1, 0],
      duration: 250,
      easing: 'easeInQuad',
      complete: function() {
        menu.classList.remove('open');
      }
    });
  }
}

// ======================== HERO SLIDER WITH ANIMATIONS ========================
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.hero-dot');

function goToSlide(n) {
  const nextIndex = (n + slides.length) % slides.length;
  if (nextIndex === currentSlide) return;

  const current = slides[currentSlide];
  const next = slides[nextIndex];

  // Efecto de parallax al salir
  anime({
    targets: current,
    opacity: [1, 0],
    scale: [1, 0.95],
    duration: 400,
    easing: 'easeInQuad',
    complete: function() {
      current.classList.remove('active');
      current.style.opacity = '';
      current.style.transform = '';
      next.classList.add('active');
      
      // Entrada con zoom
      anime.set(next, {scale: 1.1, opacity: 0});
      anime({
        targets: next,
        opacity: [0, 1],
        scale: [1.1, 1],
        duration: 600,
        easing: 'easeOutQuad'
      });
    }
  });

  // Animar los puntos
  dots[currentSlide].classList.remove('active');
  anime({
    targets: dots[currentSlide],
    scale: [1.3, 1],
    duration: 300,
    easing: 'easeOutCubic'
  });
  
  dots[nextIndex].classList.add('active');
  anime({
    targets: dots[nextIndex],
    scale: [1, 1.3],
    duration: 300,
    easing: 'easeOutCubic'
  });

  currentSlide = nextIndex;
}

setInterval(() => goToSlide(currentSlide + 1), 5000);

// ======================== DOT NAVIGATION CLICK ANIMATION ========================
dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    anime({
      targets: dot,
      scale: [1, 0.8, 1.3, 1],
      duration: 400,
      easing: 'easeOutElastic(1, 0.6)'
    });
    goToSlide(index);
  });
});

// ======================== TESTIMONIOS SLIDER ========================
let testimonioIdx = 0;
function slideTestimonio(dir) {
  const track = document.getElementById('testimoniosTrack');
  const cards = track.querySelectorAll('.testimonio-card');
  const visible = window.innerWidth < 768 ? 1 : 3;
  const max = cards.length - visible;
  
  const newIdx = Math.max(0, Math.min(testimonioIdx + dir, max));
  if (newIdx === testimonioIdx) return;
  
  testimonioIdx = newIdx;
  const w = cards[0].offsetWidth + 24;

  anime({
    targets: track,
    translateX: -testimonioIdx * w,
    duration: 800,
    easing: 'easeOutCubic'
  });
  
  // Animar tarjetas visibles
  anime({
    targets: '.testimonio-card',
    opacity: [0.6, 1],
    scale: [0.95, 1],
    delay: anime.stagger(50),
    duration: 500,
    easing: 'easeOutCubic'
  });
}

// Hover animation para tarjetas de testimonios
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.testimonio-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      anime({
        targets: card,
        scale: [1, 1.02],
        translateY: [-5, 0],
        duration: 300,
        easing: 'easeOutCubic'
      });
    });
    
    card.addEventListener('mouseleave', () => {
      anime({
        targets: card,
        scale: 1,
        translateY: 0,
        duration: 300,
        easing: 'easeOutCubic'
      });
    });
  });
});

// ======================== COUNTER ANIMATION ========================
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  
  anime({
    targets: { value: 0 },
    value: target,
    round: 1,
    duration: 2000,
    easing: 'easeOutCubic',
    update: function(anim) {
      el.textContent = '+' + anim.animations[0].currentValue.toLocaleString();
    }
  });
  
  // Efecto de escala
  anime({
    targets: el,
    scale: [0.8, 1],
    duration: 600,
    easing: 'easeOutBack(1.3)'
  });
}

// ======================== SCROLL REVEAL ========================
function revealOnScroll() {
  document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      el.classList.add('visible');
      
      const animationConfig = {
        targets: el,
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutCubic'
      };
      
      if (el.classList.contains('reveal-left')) {
        animationConfig.translateX = [-50, 0];
      } else if (el.classList.contains('reveal-right')) {
        animationConfig.translateX = [50, 0];
      } else {
        animationConfig.translateY = [30, 0];
      }
      
      // Agregar rotación sutil
      if (el.classList.contains('card') || el.classList.contains('area-card')) {
        animationConfig.rotate = [-2, 0];
      }
      
      anime(animationConfig);
    }
  });
}

// ======================== BUTTON HOVER ANIMATIONS ========================
document.addEventListener('DOMContentLoaded', () => {
  // Animación para botones primarios
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      anime({
        targets: btn,
        scale: 1.05,
        duration: 300,
        easing: 'easeOutCubic'
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      anime({
        targets: btn,
        scale: 1,
        duration: 300,
        easing: 'easeOutCubic'
      });
    });
  });
  
  // Animación para botones outline
  document.querySelectorAll('.btn-outline').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      anime({
        targets: btn,
        scale: 1.05,
        duration: 300,
        easing: 'easeOutCubic'
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      anime({
        targets: btn,
        scale: 1,
        duration: 300,
        easing: 'easeOutCubic'
      });
    });
  });
});

// ======================== LIGHTBOX ========================
function openLightbox(src) {
  const lightbox = document.getElementById('lightbox');
  const image = document.getElementById('lightboxImg');
  image.src = src;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';

  anime.set(lightbox, {opacity: 0, scale: 0.9});
  anime.set(image, {scale: 0.85, opacity: 0});
  
  anime({
    targets: lightbox,
    opacity: [0, 1],
    scale: [0.9, 1],
    duration: 400,
    easing: 'easeOutCubic'
  });
  
  anime({
    targets: image,
    scale: [0.85, 1],
    opacity: [0, 1],
    duration: 500,
    delay: 100,
    easing: 'easeOutBack(1.5)'
  });
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  
  anime({
    targets: lightbox,
    opacity: [1, 0],
    scale: [1, 0.9],
    duration: 350,
    easing: 'easeInQuad',
    complete: function() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lightbox.style.opacity = '';
      lightbox.style.transform = '';
    }
  });
}

document.addEventListener('keydown', e => { if(e.key==='Escape') closeLightbox(); });

// ======================== FORM SUBMIT ========================
function submitForm() {
  const form = event?.target || document.querySelector('form');
  
  if (form) {
    anime({
      targets: form,
      scale: [1, 0.98, 1.02, 1],
      duration: 400,
      easing: 'easeOutElastic(1, 0.5)'
    });
  }
  
  alert('✅ Mensaje enviado correctamente. Nos comunicaremos contigo a la brevedad. ¡Gracias por contactar a IE Mariscal Castilla!');
}

// ======================== NEWS FILTER ========================
function filterNews(cat) {
  const cards = document.querySelectorAll('#page-noticias .noticia-card');
  
  cards.forEach((card, i) => {
    const show = cat === 'all' || card.dataset.cat === cat;
    
    if (show) {
      card.style.display = 'block';
      anime({
        targets: card,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 500,
        delay: i * 100,
        easing: 'easeOutCubic'
      });
    } else {
      anime({
        targets: card,
        opacity: [1, 0],
        scale: [1, 0.9],
        duration: 400,
        easing: 'easeInCubic',
        complete: function() {
          card.style.display = 'none';
        }
      });
    }
  });
}

// ======================== AREA CARDS HOVER ========================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.area-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      anime({
        targets: card,
        scale: 1.05,
        translateY: -8,
        duration: 350,
        easing: 'easeOutCubic'
      });
    });
    
    card.addEventListener('mouseleave', () => {
      anime({
        targets: card,
        scale: 1,
        translateY: 0,
        duration: 350,
        easing: 'easeOutCubic'
      });
    });
  });
});

// ======================== INTERSECTION OBSERVER FOR COUNTERS ========================
window.addEventListener('load', () => {
  document.querySelectorAll('[data-target]').forEach(el => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { 
        if(entry.isIntersecting && !el.dataset.animated) {
          el.dataset.animated = 'true';
          animateCounter(el);
        }
      });
    }, {threshold:0.5});
    observer.observe(el);
  });
  
  revealOnScroll();
});
function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (window.anime) {
    anime({
      targets: lightbox,
      opacity: [1, 0],
      duration: 260,
      easing: 'easeInQuad',
      complete: function() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  } else {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
}
document.addEventListener('keydown', e => { if(e.key==='Escape') closeLightbox(); });

// FORM SUBMIT
function submitForm() {
  alert('✅ Mensaje enviado correctamente. Nos comunicaremos contigo a la brevedad. ¡Gracias por contactar a IE Mariscal Castilla!');
}

// NEWS FILTER
function filterNews(cat) {
  const cards = document.querySelectorAll('#page-noticias .noticia-card');
  
  cards.forEach((card, i) => {
    const show = cat === 'all' || card.dataset.cat === cat;
    
    if (show) {
      card.style.display = 'block';
      anime({
        targets: card,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 500,
        delay: i * 100,
        easing: 'easeOutCubic'
      });
    } else {
      anime({
        targets: card,
        opacity: [1, 0],
        scale: [1, 0.9],
        duration: 400,
        easing: 'easeInCubic',
        complete: function() {
          card.style.display = 'none';
        }
      });
    }
  });
}