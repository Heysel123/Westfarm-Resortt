window.addEventListener('scroll', () => {
  document.getElementById('main-nav').classList.toggle('scrolled', window.scrollY > 40);
});

const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
  item.querySelector('a').addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    const open = item.classList.contains('open');
    navItems.forEach(i => i.classList.remove('open'));
    if (!open) item.classList.add('open');
  });
});
document.addEventListener('click', () => navItems.forEach(i => i.classList.remove('open')));