import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { buildCharacter } from './character.js';

const loader = new GLTFLoader();

// desk.glb and character.glb are both real-proportioned (person ~0.9 tall next to
// a ~1 unit wide desk); this scales the pair up to roughly match the hero
// camera's old framing distances without having to re-derive them from scratch.
const RIG_SCALE = 1.35;

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

  loader.load('/models/desk.glb', (gltf) => {
    gltf.scene.scale.setScalar(RIG_SCALE);
    group.add(gltf.scene);
  });

  // screen plane overlaid on the desk's dual monitors, measured from the
  // desk.glb bounding box (see conversation notes) - covers both screens as
  // one wide surface, centered at x=0 like the dual-monitor gap is.
  const screenW = 0.707 * RIG_SCALE;
  const screenH = 0.239 * RIG_SCALE;
  const screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(screenW, screenH),
    new THREE.MeshBasicMaterial({ map: screenTexture() })
  );
  screenMesh.position.set(0, 0.6325 * RIG_SCALE, -0.42 * RIG_SCALE);
  group.add(screenMesh);

  const screenGlow = new THREE.PointLight(0xdce8ff, 1.4, 5, 2);
  screenGlow.position.copy(screenMesh.position).z += 0.4 * RIG_SCALE;
  group.add(screenGlow);

  // character, seated in the desk.glb chair (measured seat position)
  const character = buildCharacter();
  character.scale.setScalar(RIG_SCALE);
  character.position.set(0, 0, 0.1 * RIG_SCALE);
  character.rotation.y = Math.PI;
  group.add(character);

  return {
    group,
    character,
    screen: { mesh: screenMesh, width: screenW, height: screenH, worldZ: screenMesh.position.z }
  };
}
