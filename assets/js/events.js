// ── NAV SCROLL SHADOW ──
window.addEventListener('scroll', () => {
  document.getElementById('main-nav').classList.toggle('scrolled', window.scrollY > 40);
});

// ── NAV DROPDOWN ──
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
  const link = item.querySelector('a');
  if (link) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = item.classList.contains('open');
      navItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  }
});
document.addEventListener('click', () => navItems.forEach(i => i.classList.remove('open')));

// ── SCROLL TO TOP VISIBILITY ──
const scrollBtn = document.querySelector('.scroll-top');
if (scrollBtn) {
  window.addEventListener('scroll', () => {
    scrollBtn.style.opacity = window.scrollY > 400 ? '1' : '0.7';
  });
}