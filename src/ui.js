const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initTilt() {
  if (reduceMotion) return;
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -8;
      const ry = (px - 0.5) * 10;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  });
}

export function initTypewriter() {
  const targets = document.querySelectorAll('[data-type]');
  if (!targets.length || reduceMotion) return;

  const prepared = [];
  targets.forEach((el) => {
    const textNodes = [];
    (function walk(node) {
      node.childNodes.forEach((c) => {
        if (c.nodeType === 3 && c.nodeValue.length) {
          textNodes.push({ node: c, full: c.nodeValue, shown: 0 });
        } else if (c.nodeType === 1) {
          walk(c);
        }
      });
    })(el);
    textNodes.forEach((t) => { t.node.nodeValue = ''; });
    prepared.push({ el, textNodes, done: false });
  });

  function typeItem(item) {
    if (item.done) return;
    item.done = true;
    const flat = [];
    item.textNodes.forEach((t) => {
      for (let i = 0; i < t.full.length; i++) flat.push(t);
    });
    const cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    item.el.appendChild(cursor);
    const speed = item.el.classList.contains('sec-title') ? 26 : 15;
    let idx = 0;
    function tick() {
      if (idx >= flat.length) {
        setTimeout(() => cursor.remove(), 500);
        return;
      }
      const t = flat[idx];
      t.shown++;
      t.node.nodeValue = t.full.slice(0, t.shown);
      idx++;
      setTimeout(tick, speed);
    }
    tick();
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const item = prepared.find((p) => p.el === entry.target);
      if (item) {
        typeItem(item);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  prepared.forEach((item) => io.observe(item.el));
}

export function initReveal() {
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('in');
    });
  }, { threshold: 0.15 });
  items.forEach((el) => io.observe(el));
}

export function initSpy() {
  const links = document.querySelectorAll('.sidenav a');
  if (!links.length) return;
  const map = {};
  links.forEach((l) => { map[l.dataset.target] = l; });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = map[entry.target.id];
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { threshold: 0.5 });
  Object.keys(map).forEach((id) => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });
}
