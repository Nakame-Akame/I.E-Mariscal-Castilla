document.addEventListener('DOMContentLoaded', () => {
  if (!window.anime) return;

  anime({
    targets: '.social-link',
    translateY: [12, 0],
    opacity: [0, 1],
    scale: [0.9, 1],
    delay: anime.stagger(120),
    duration: 700,
    easing: 'easeOutCubic',
  });

  anime
    .timeline({ easing: 'easeOutExpo', duration: 700 })
    .add({
      targets: '.hero-badge, .hero-title, .hero-subtitle, .hero-btns a, .hero-dots',
      opacity: [0, 1],
      translateY: [30, 0],
      delay: anime.stagger(110),
    })
    .add(
      {
        targets: '.hero-slide.active .hero-overlay',
        opacity: [0, 1],
        duration: 1200,
        easing: 'easeOutQuad',
      },
      '-=500'
    );

  anime({
    targets: '.stats-bar .stat-item',
    opacity: [0, 1],
    translateY: [20, 0],
    delay: anime.stagger(150, { start: 300 }),
    duration: 800,
    easing: 'easeOutCubic',
  });

  document.querySelectorAll('.social-link').forEach((element) => {
    element.addEventListener('mouseenter', () => {
      anime.remove(element);
      anime({ targets: element, scale: 1.14, duration: 220, easing: 'easeOutQuad' });
    });
    element.addEventListener('mouseleave', () => {
      anime.remove(element);
      anime({ targets: element, scale: 1, duration: 300, easing: 'easeOutElastic(1, .6)' });
    });
  });
});
