import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

export function buildCharacter() {
  const group = new THREE.Group();
  loader.load('/models/character.glb', (gltf) => {
    group.add(gltf.scene);
  });
  return group;
}

export function idleCharacter(character, t) {
  const { parts } = character.userData;
  if (!parts) return;
  const blink = Math.sin(t * 2.4) > 0.985 ? 0.15 : 1;
  parts.eyeL.scale.y = blink;
  parts.eyeR.scale.y = blink;
}
