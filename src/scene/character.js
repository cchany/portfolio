import * as THREE from 'three';

// ponytail: primitives-only humanoid (no glb) — see DESIGN_SPEC.md §3 for the future real-3D upgrade path

function clearcoatMat(opts) {
  return new THREE.MeshPhysicalMaterial(Object.assign({
    metalness: 0.15,
    roughness: 0.4,
    reflectivity: 0.5,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2
  }, opts));
}

export function buildCharacter() {
  const group = new THREE.Group();
  const skin = 0xe8b48c;
  const hair = 0x2b211b;
  const shirt = 0xf4f1ea;
  const pants = 0x3a352e;

  const selfLight = new THREE.PointLight(0xffe8d9, 1.6, 8, 2);
  selfLight.position.set(0.4, 1.7, 1.2);
  group.add(selfLight);

  // thighs (mostly tucked under the desk, keeps the sitting silhouette grounded)
  const thighGeo = new THREE.CapsuleGeometry(0.1, 0.28, 4, 8);
  const pantsMat = clearcoatMat({ color: pants, roughness: 0.55, clearcoat: 0.2 });
  [-0.14, 0.14].forEach((x) => {
    const thigh = new THREE.Mesh(thighGeo, pantsMat);
    thigh.rotation.x = Math.PI / 2;
    thigh.position.set(x, 0.06, 0.2);
    group.add(thigh);
  });

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.26, 0.5, 8, 20),
    clearcoatMat({ color: shirt, roughness: 0.5, clearcoat: 0.3 })
  );
  torso.position.y = 0.53;
  group.add(torso);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.1, 0.14, 16),
    clearcoatMat({ color: skin, roughness: 0.35 })
  );
  neck.position.y = 0.94;
  group.add(neck);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.27, 40, 40),
    clearcoatMat({ color: skin, metalness: 0.05, roughness: 0.32 })
  );
  head.position.y = 1.18;
  group.add(head);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.285, 40, 40, 0, Math.PI * 2, 0, Math.PI * 0.62),
    clearcoatMat({ color: hair, metalness: 0.1, roughness: 0.4, clearcoat: 0.4 })
  );
  hairCap.position.y = 1.21;
  group.add(hairCap);

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x231c17 });
  const eyeGeo = new THREE.SphereGeometry(0.032, 12, 12);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.1, 1.2, 0.24);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.1;
  group.add(eyeL, eyeR);

  const armGeo = new THREE.CapsuleGeometry(0.075, 0.4, 4, 12);
  const sleeveMat = clearcoatMat({ color: shirt, roughness: 0.5, clearcoat: 0.3 });
  const armL = new THREE.Mesh(armGeo, sleeveMat);
  armL.position.set(-0.32, 0.32, 0.3);
  armL.rotation.x = -1.15;
  armL.rotation.z = 0.18;
  const armR = armL.clone();
  armR.position.x = 0.32;
  armR.rotation.z = -0.18;
  group.add(armL, armR);

  const handGeo = new THREE.SphereGeometry(0.085, 16, 16);
  const handMat = clearcoatMat({ color: skin, roughness: 0.35 });
  const handL = new THREE.Mesh(handGeo, handMat);
  handL.position.set(-0.36, 0.1, 0.58);
  const handR = handL.clone();
  handR.position.x = 0.36;
  group.add(handL, handR);

  group.userData.parts = { eyeL, eyeR };
  return group;
}

export function idleCharacter(character, t) {
  const { parts } = character.userData;
  const blink = Math.sin(t * 2.4) > 0.985 ? 0.15 : 1;
  parts.eyeL.scale.y = blink;
  parts.eyeR.scale.y = blink;
}
