import * as THREE from 'three';
import { buildCharacter } from './character.js';

function mat(opts) {
  return new THREE.MeshPhysicalMaterial(Object.assign({
    metalness: 0.2,
    roughness: 0.5,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25
  }, opts));
}

function screenTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 320;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#15130f';
  ctx.fillRect(0, 0, c.width, c.height);
  const rows = [
    ['#ff4d3d', 120], ['#f4f1ea', 260], ['#6d6a60', 180],
    ['#ff4d3d', 90], ['#f4f1ea', 220], ['#6d6a60', 150], ['#f4f1ea', 200]
  ];
  let y = 28;
  rows.forEach(([color, w]) => {
    ctx.fillStyle = color;
    ctx.fillRect(30, y, w, 14);
    y += 30;
  });
  ctx.strokeStyle = '#ff4d3d';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, c.width - 20, c.height - 20);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Builds the intro desk scene. Returns the group plus world info needed to
// aim the scroll-driven camera at the monitor screen.
export function buildDeskScene() {
  const group = new THREE.Group();

  // desk
  const deskMat = mat({ color: 0xd9c9ab, roughness: 0.55, clearcoat: 0.35 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(6, 0.12, 2.6), deskMat);
  top.position.y = 0;
  group.add(top);
  const legGeo = new THREE.BoxGeometry(0.12, 1.6, 0.12);
  [[-2.8, -1.2], [2.8, -1.2], [-2.8, 1.1], [2.8, 1.1]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, deskMat);
    leg.position.set(x, -0.86, z);
    group.add(leg);
  });

  // monitor
  const standMat = mat({ color: 0x2a2823, metalness: 0.5, roughness: 0.4 });
  const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.05, 32), standMat);
  standBase.position.set(0, 0.09, -1.05);
  group.add(standBase);
  const standNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16), standMat);
  standNeck.position.set(0, 0.36, -1.05);
  group.add(standNeck);

  const bezelMat = mat({ color: 0x181714, metalness: 0.4, roughness: 0.35 });
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.42, 0.08), bezelMat);
  bezel.position.set(0, 1.05, -1.06);
  group.add(bezel);

  const screenW = 2.08, screenH = 1.24;
  const screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(screenW, screenH),
    new THREE.MeshBasicMaterial({ map: screenTexture() })
  );
  screenMesh.position.set(0, 1.05, -1.015);
  group.add(screenMesh);

  const screenGlow = new THREE.PointLight(0xdce8ff, 1.4, 5, 2);
  screenGlow.position.set(0, 1.05, -0.4);
  group.add(screenGlow);

  // keyboard + mouse
  const kbMat = mat({ color: 0xefece2, roughness: 0.6, clearcoat: 0.2 });
  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.05, 0.36), kbMat);
  keyboard.position.set(0, 0.09, 0.55);
  group.add(keyboard);
  const mouse = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.09, 4, 8), kbMat);
  mouse.rotation.z = Math.PI / 2;
  mouse.position.set(0.75, 0.1, 0.55);
  group.add(mouse);

  // chair
  const chairMat = mat({ color: 0xff4d3d, metalness: 0, roughness: 0.85, clearcoat: 0 });
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.56, 0.14, 32), chairMat);
  seat.position.set(0, -0.05, 1.05);
  group.add(seat);
  const back = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.5, 4, 16), chairMat);
  back.rotation.x = 0.18;
  back.position.set(0, 0.68, 1.32);
  group.add(back);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.75, 12), standMat);
  post.position.set(0, -0.48, 1.05);
  group.add(post);
  const baseGeo = new THREE.BoxGeometry(0.6, 0.05, 0.09);
  for (let i = 0; i < 5; i++) {
    const legArm = new THREE.Mesh(baseGeo, standMat);
    legArm.position.set(0, -0.85, 1.05);
    legArm.rotation.y = (i / 5) * Math.PI * 2;
    legArm.translateX(0.3);
    group.add(legArm);
    const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), standMat);
    wheel.position.copy(legArm.position);
    const angle = (i / 5) * Math.PI * 2;
    wheel.position.x += Math.cos(angle) * 0.3;
    wheel.position.z += Math.sin(angle) * 0.3;
    group.add(wheel);
  }

  // character, seated facing the monitor
  const character = buildCharacter();
  character.scale.setScalar(0.95);
  character.position.set(0, 0.02, 0.95);
  character.rotation.y = Math.PI;
  group.add(character);

  return {
    group,
    character,
    screen: { mesh: screenMesh, width: screenW, height: screenH, worldZ: -1.015 }
  };
}
