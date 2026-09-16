const PROJECTS = [
  {
    status: 'active',
    title: 'League of Legends Custom Game Record System',
    tags: ['DJANGO', 'POSTGRESQL', 'WEB'],
    desc: '약 20명 규모의 리그오브레전드 내전 전적 관리 웹 서비스 개발',
    bullets: [
      'Django 기반 웹 서버 구축',
      'PostgreSQL 데이터 저장 및 관리',
      '사용자 전적 조회 시스템 구현',
      '게임 기록 통계 및 분석 기능 개발'
    ]
  },
  { status: 'soon' },
  { status: 'soon' },
  { status: 'soon' },
  { status: 'soon' },
  { status: 'soon' }
];

export function initProjectCarousel() {
  const stage = document.getElementById('project-carousel');
  if (!stage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const count = PROJECTS.length;
  const spacing = 5, tilt = -8, sensitivity = 1, speed = 3, direction = 1, cornerRadius = 18;
  const angle = 360 / count;
  const factor = 1 + spacing * 0.15;

  let ring, size, radius;
  let rotY = 0, vel = 0, lastT = 0, dragging = false, dragX = 0, paused = false;

  function pickSize() {
    const narrow = window.innerWidth <= 640;
    return narrow
      ? { width: 260, height: 360, perspective: 2000 }
      : { width: 420, height: 520, perspective: 3200 };
  }

  function applyRingTransform() {
    ring.style.transform = `translateZ(${-radius}px) rotateY(${rotY}deg)`;
  }

  function build() {
    stage.innerHTML = '';
    size = pickSize();
    stage.style.perspective = size.perspective + 'px';
    radius = (size.width * factor) / (2 * Math.tan(Math.PI / count));

    const tiltWrap = document.createElement('div');
    tiltWrap.className = 'carousel-tilt';
    tiltWrap.style.transform = `rotateX(${tilt}deg)`;

    ring = document.createElement('div');
    ring.className = 'carousel-ring';
    ring.style.width = size.width + 'px';
    ring.style.height = size.height + 'px';

    PROJECTS.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'carousel-item';
      item.style.transform = `rotateY(${i * angle}deg) translateZ(${radius}px)`;

      const front = document.createElement('div');
      front.className = 'card-face front' + (p.status === 'soon' ? ' soon' : '');
      front.style.borderRadius = cornerRadius + 'px';

      if (p.status === 'active') {
        front.innerHTML =
          `<div class="card-top"><span class="card-idx">PROJECT 0${i + 1}</span><span class="card-status active">ACTIVE</span></div>` +
          `<h3>${p.title}</h3>` +
          `<p class="desc">${p.desc}</p>` +
          `<div class="tag-row">${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>` +
          `<ul class="bullets">${p.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`;
      } else {
        front.innerHTML =
          `<div class="card-top"><span class="card-idx">PROJECT 0${i + 1}</span><span class="card-status soon">SOON</span></div>` +
          `<div class="soon-icon">◇</div>` +
          `<div class="soon-text">다음 프로젝트를 준비 중입니다</div>`;
      }

      const back = document.createElement('div');
      back.className = 'card-face back';
      back.style.borderRadius = cornerRadius + 'px';
      back.innerHTML = '<span class="mono-mark">CY</span>';

      item.appendChild(front);
      item.appendChild(back);
      ring.appendChild(item);
    });

    tiltWrap.appendChild(ring);
    stage.appendChild(tiltWrap);
    applyRingTransform();
  }

  function loop(now) {
    const dt = lastT ? (now - lastT) / 1000 : 0;
    lastT = now;
    const f = Math.min(dt, 0.1);
    if (!dragging) {
      if (Math.abs(vel) > 0.01) {
        rotY += vel * f;
        vel *= 0.94;
      } else if (!paused && !reduceMotion) {
        rotY += speed * 6 * direction * f;
      }
    }
    applyRingTransform();
    requestAnimationFrame(loop);
  }

  stage.addEventListener('pointerdown', (e) => {
    dragging = true;
    dragX = e.clientX;
    vel = 0;
    stage.setPointerCapture?.(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragX;
    dragX = e.clientX;
    const k = 0.12 * sensitivity;
    rotY += dx * k;
    vel = dx * k * 60;
  });
  function endDrag(e) {
    dragging = false;
    if (e?.pointerId != null) stage.releasePointerCapture?.(e.pointerId);
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('pointerenter', () => { paused = true; });
  stage.addEventListener('pointerleave', () => { paused = false; });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasNarrow = size.width <= 260;
      const isNarrow = window.innerWidth <= 640;
      if (wasNarrow !== isNarrow) build();
    }, 150);
  });

  build();
  requestAnimationFrame(loop);
}
