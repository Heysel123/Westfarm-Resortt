// ── NAV SCROLL SHADOW (matches home page) ──
window.addEventListener('scroll', () => {
  document.getElementById('main-nav').classList.toggle('scrolled', window.scrollY > 40);
});

// ── HERO SLIDESHOW (matches Contact page) ──
const heroSlides = document.querySelectorAll('.hero .hero-slide');
const heroDotsEl = document.getElementById('hero-dots');
let heroCur = 0;

heroSlides.forEach((_, i) => {
  const d = document.createElement('button');
  d.type = 'button';
  d.className = 'hero-dot' + (i === 0 ? ' active' : '');
  d.onclick = () => heroGoTo(i);
  heroDotsEl.appendChild(d);
});

function heroGoTo(n) {
  heroSlides[heroCur].classList.remove('active');
  heroDotsEl.children[heroCur].classList.remove('active');
  heroCur = (n + heroSlides.length) % heroSlides.length;
  heroSlides[heroCur].classList.add('active');
  heroDotsEl.children[heroCur].classList.add('active');
}

function heroSlide(dir) {
  heroGoTo(heroCur + dir);
}

setInterval(() => heroGoTo(heroCur + 1), 5000);

// ── FAQ ACCORDION ──
function toggle(btn) {
  const item = btn.closest('.faq-item');
  item.classList.toggle('open');
}

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