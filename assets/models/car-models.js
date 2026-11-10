
import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createNSDCar(color = 0x00aaff, style = 0) {
  const car = new THREE.Group();

  const paint = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.75,
    roughness: 0.24
  });

  const glass = new THREE.MeshStandardMaterial({
    color: 0x101c30,
    metalness: 0.5,
    roughness: 0.15
  });

  const rubber = new THREE.MeshStandardMaterial({
    color: 0x090909,
    roughness: 0.85
  });

  const metal = new THREE.MeshStandardMaterial({
    color: 0x777777,
    metalness: 0.9,
    roughness: 0.25
  });

  function part(geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    car.add(mesh);
    return mesh;
  }

  // Main body
  part(
    new THREE.BoxGeometry(2.05, 0.48, 4.35),
    paint, 0, 0.65, 0
  );

  // Front hood
  part(
    new THREE.BoxGeometry(1.9, 0.18, 1.15),
    paint, 0, 0.91, -1.42
  );

  // Cabin
  part(
    new THREE.BoxGeometry(1.55, 0.62, 1.95),
    glass, 0, 1.12, 0.05
  );

  // Roof
  part(
    new THREE.BoxGeometry(1.48, 0.12, 1.3),
    paint, 0, 1.48, 0.12
  );

  // Rear section
  part(
    new THREE.BoxGeometry(1.95, 0.25, 0.85),
    paint, 0, 0.88, 1.65
  );

  // Front grille
  part(
    new THREE.BoxGeometry(0.8, 0.16, 0.06),
    rubber, 0, 0.52, -2.19
  );

  // Headlights
  const lights = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x99ddff,
    emissiveIntensity: 2
  });

  for (const x of [-0.72, 0.72]) {
    part(
      new THREE.BoxGeometry(0.42, 0.12, 0.06),
      lights, x, 0.79, -2.2
    );
  }

  // Rear lights
  const red = new THREE.MeshStandardMaterial({
    color: 0xff1100,
    emissive: 0xff0000,
    emissiveIntensity: 1.5
  });

  for (const x of [-0.72, 0.72]) {
    part(
      new THREE.BoxGeometry(0.48, 0.12, 0.06),
      red, x, 0.83, 2.19
    );
  }

  // Wheels
  const wheels = [];

  for (const x of [-1.05, 1.05]) {
    for (const z of [-1.35, 1.35]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.43, 0.43, 0.28, 24),
        rubber
      );

      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.43, z);
      wheel.castShadow = true;
      car.add(wheel);
      wheels.push(wheel);

      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.23, 0.23, 0.3, 16),
        metal
      );

      rim.rotation.z = Math.PI / 2;
      rim.position.copy(wheel.position);
      car.add(rim);
    }
  }

  // Rear spoiler
  if (style !== 0) {
    part(
      new THREE.BoxGeometry(1.8, 0.1, 0.32),
      paint, 0, 1.35, 1.85
    );
  }

  // Side skirts
  for (const x of [-1, 1]) {
    part(
      new THREE.BoxGeometry(0.12, 0.15, 2.5),
      paint, x, 0.42, 0
    );
  }

  car.userData.wheels = wheels;
  return car;
}

export const NSD_CARS = [
  { name: "STORM GT", color: 0x00aaff, style: 0 },
  { name: "PHANTOM R", color: 0xff2222, style: 1 },
  { name: "VORTEX X", color: 0x8b35ff, style: 2 },
  { name: "INFERNO RS", color: 0xff8800, style: 3 }
];
