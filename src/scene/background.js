import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { buildDeskScene } from './desk.js';
import { idleCharacter } from './character.js';

gsap.registerPlugin(ScrollTrigger);

const smoothstep = (t) => t * t * (3 - 2 * t);

export function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);

  scene.add(new THREE.AmbientLight(0xfff2e2, 1.2));
  const keyLight = new THREE.DirectionalLight(0xfff4e6, 1.6);
  keyLight.position.set(-4, 6, 6);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0xff4d3d, 1.1, 20, 2);
  rimLight.position.set(4, 2.5, -3);
  scene.add(rimLight);
  const fillLight = new THREE.PointLight(0xffffff, 0.7, 20, 2);
  fillLight.position.set(-3, -1, 4);
  scene.add(fillLight);

  const { group, character, screen } = buildDeskScene();
  scene.add(group);

  const START_POS = new THREE.Vector3(6.6, 2.7, 7.0);
  const START_LOOKAT = new THREE.Vector3(-0.4, 0.6, -0.2);
  const endPos = new THREE.Vector3();
  const endLookAt = new THREE.Vector3(0, screen.mesh.position.y, screen.mesh.position.z);

  function updateEndCamera() {
    const vFov = (camera.fov * Math.PI) / 180;
    const distH = screen.height / (2 * Math.tan(vFov / 2));
    const distW = (screen.width / camera.aspect) / (2 * Math.tan(vFov / 2));
    const dist = Math.min(distH, distW) * 0.92;
    endPos.set(0, screen.mesh.position.y + 0.35, screen.worldZ + dist);
  }
  updateEndCamera();

  let introProgress = 0;
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: '+=140%',
    pin: true,
    scrub: 0.4,
    onUpdate: (self) => { introProgress = self.progress; }
  });

  const heroFadeEls = document.querySelectorAll('.hero-label, .hero-year, .hero h1, .hero .role, .hero .tagline, .hero .cta-row');
  const scrollCueEl = document.querySelector('.scroll-cue');
  const contentEl = document.getElementById('content');
  const topnavEl = document.querySelector('.topnav');
  const sidenavEl = document.getElementById('sidenav');

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateEndCamera();
  });

  const camPos = new THREE.Vector3();
  const camLookAt = new THREE.Vector3();
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const eased = smoothstep(Math.min(introProgress, 1));

    if (!reduceMotion) {
      idleCharacter(character, t);

      camPos.lerpVectors(START_POS, endPos, eased);
      camLookAt.lerpVectors(START_LOOKAT, endLookAt, eased);
      const parallax = 1 - eased;
      camPos.x += mouseX * 0.6 * parallax;
      camPos.y += -mouseY * 0.4 * parallax;
      camera.position.copy(camPos);
      camera.lookAt(camLookAt);

      const heroFade = 1 - Math.min(eased / 0.3, 1);
      heroFadeEls.forEach((el) => { el.style.opacity = heroFade; });
      if (scrollCueEl) scrollCueEl.style.opacity = 1 - Math.min(eased / 0.12, 1);

      const revealT = Math.max(0, Math.min((eased - 0.7) / 0.3, 1));
      if (contentEl) {
        contentEl.style.opacity = revealT;
        contentEl.style.transform = `translateY(${24 * (1 - revealT)}px) scale(${0.97 + 0.03 * revealT})`;
      }

      const chromeVisible = eased > 0.85;
      if (topnavEl) topnavEl.classList.toggle('visible', chromeVisible);
      if (sidenavEl) sidenavEl.classList.toggle('visible', chromeVisible);

      canvas.style.opacity = 1 - Math.max(0, Math.min((eased - 0.75) / 0.25, 1));
    } else {
      camera.position.copy(START_POS);
      camera.lookAt(START_LOOKAT);
      if (contentEl) contentEl.style.opacity = 1;
    }

    renderer.render(scene, camera);
  }
  animate();
}
