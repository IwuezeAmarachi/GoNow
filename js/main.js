(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Lenis ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const scrollTo = (target, offset = 0) => {
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else (target === 0 ? scrollTo0() : target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));
  };
  const scrollTo0 = () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });

  /* ---------- header ---------- */
  const hdr = document.querySelector('.hdr');
  let lastY = 0;
  const onScroll = (y) => {
    hdr.classList.toggle('is-solid', y > 40);
    hdr.classList.toggle('is-hidden', y > lastY && y > 500 && !menu.classList.contains('open'));
    lastY = y;
  };

  /* ---------- menu popover ---------- */
  const menu = document.querySelector('.menu');
  const menuBtn = menu.querySelector('.menu__btn');
  const setMenu = (open) => { menu.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); };
  menuBtn.addEventListener('click', (e) => { e.stopPropagation(); setMenu(!menu.classList.contains('open')); });
  document.addEventListener('click', (e) => { if (!menu.contains(e.target)) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  onScroll(scrollY);

  /* ---------- anchors ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) { e.preventDefault(); return; }
    e.preventDefault(); setMenu(false);
    if (id === '#top') return scrollTo(0);
    const t = document.querySelector(id);
    if (t) scrollTo(t, -70);
  });

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal, .foot__word').forEach((el) => io.observe(el));

  /* ---------- parallax on step images ---------- */
  if (!reduce) {
    const items = [...document.querySelectorAll('[data-parallax]')].map((el) => ({ el, box: el.parentElement, on: false }));
    const vis = new IntersectionObserver((es) => es.forEach((en) => { items.find((i) => i.box === en.target).on = en.isIntersecting; }));
    items.forEach((i) => vis.observe(i.box));
    const tick = () => {
      const vh = innerHeight;
      items.forEach((i) => {
        if (!i.on) return;
        const r = i.box.getBoundingClientRect();
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
        i.el.style.transform = `translate3d(0,${(p * -4).toFixed(2)}%,0) scale(1.06)`;
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.qa').forEach((qa) => {
    const btn = qa.querySelector('button');
    const icon = btn.querySelector('img');
    const open = 'assets/faq-open.svg', closed = 'assets/faq-closed.svg';
    btn.addEventListener('click', () => {
      const isOpen = qa.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
      icon.src = isOpen ? open : closed;
    });
  });

  /* ---------- testimonials: drag + buttons ---------- */
  const track = document.querySelector('.voices__track');
  let down = false, sx = 0, sl = 0, moved = false;
  track.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add('drag'); });
  addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; track.scrollLeft = sl - dx; });
  addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('drag'); });
  document.querySelectorAll('.voices__nav button').forEach((b) => b.addEventListener('click', () => {
    track.scrollBy({ left: +b.dataset.dir * 420, behavior: reduce ? 'auto' : 'smooth' });
  }));
})();
