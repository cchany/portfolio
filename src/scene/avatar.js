import * as THREE from 'three';

export function initAvatar() {
  const canvas = document.getElementById('avatar-canvas');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const box = canvas.parentElement.getBoundingClientRect();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(box.width, box.height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, box.width / box.height, 0.1, 50);
  camera.position.z = 5.6;

  scene.add(new THREE.AmbientLight(0xfff2e2, 1.3));
  const key = new THREE.PointLight(0xff4d3d, 2.2, 30, 2);
  key.position.set(-3, 2, 3);
  scene.add(key);
  const rim = new THREE.PointLight(0xffffff, 1.4, 30, 2);
  rim.position.set(3, 1.5, 2);
  scene.add(rim);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 64, 64),
    new THREE.MeshPhysicalMaterial({
      color: 0x15130f,
      metalness: 0.8,
      roughness: 0.24,
      reflectivity: 0.6,
      clearcoat: 1,
      clearcoatRoughness: 0.15
    })
  );
  scene.add(sphere);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.012, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0xff4d3d, transparent: true, opacity: 0.5 })
  );
  ring.rotation.x = Math.PI / 2.4;
  scene.add(ring);

  window.addEventListener('resize', () => {
    const r = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(r.width, r.height);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!reduceMotion) {
      sphere.rotation.y += 0.0032;
      ring.rotation.z += 0.0022;
    }
    renderer.render(scene, camera);
  }
  animate();
}
