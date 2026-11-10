import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export const CAR_DATA = {
  storm: {
    name: "STORM GT",
    color: 0x087cff,
    acceleration: 30,
    maxSpeed: 245,
    handling: 1.0
  },
  phantom: {
    name: "PHANTOM R",
    color: 0x252a38,
    acceleration: 34,
    maxSpeed: 265,
    handling: 0.92
  },
  vortex: {
    name: "VORTEX X",
    color: 0x8c20ff,
    acceleration: 37,
    maxSpeed: 280,
    handling: 1.08
  },
  inferno: {
    name: "INFERNO RS",
    color: 0xff4b16,
    acceleration: 32,
    maxSpeed: 255,
    handling: 1.15
  }
};

export function createCar(type = "storm") {
  const data = CAR_DATA[type] || CAR_DATA.storm;
  const car = new THREE.Group();
  const wheels = [];

  const paint = new THREE.MeshStandardMaterial({
    color: data.color,
    metalness: 0.72,
    roughness: 0.25
  });

  const dark = new THREE.MeshStandardMaterial({
    color: 0x10141b,
    metalness: 0.25,
    roughness: 0.55
  });

  const glass = new THREE.MeshStandardMaterial({
    color: 0x101e30,
    metalness: 0.5,
    roughness: 0.12
  });

  const headlight = new THREE.MeshStandardMaterial({
    color: 0xbceeff,
    emissive: 0x55bbff,
    emissiveIntensity: 2
  });

  const tailLight = new THREE.MeshStandardMaterial({
    color: 0xff1010,
    emissive: 0xff0000,
    emissiveIntensity: 1.8
  });

  function block(w, h, d, material, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      material
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    car.add(mesh);
    return mesh;
  }

  block(2.05, 0.52, 4.35, paint, 0, 0.67, 0);
  block(1.7, 0.56, 2.05, glass, 0, 1.15, 0.1);
  block(2.0, 0.13, 0.35, dark, 0, 0.48, -2.13);
  block(2.0, 0.13, 0.35, dark, 0, 0.48, 2.13);

  block(0.55, 0.12, 0.16, headlight, -0.65, 0.73, -2.21);
  block(0.55, 0.12, 0.16, headlight, 0.65, 0.73, -2.21);
  block(0.55, 0.13, 0.15, tailLight, -0.65, 0.73, 2.21);
  block(0.55, 0.13, 0.15, tailLight, 0.65, 0.73, 2.21);

  // Rear spoiler
  block(1.65, 0.09, 0.32, dark, 0, 1.15, 1.75);
  block(0.1, 0.3, 0.1, dark, -0.55, 1.0, 1.75);
  block(0.1, 0.3, 0.1, dark, 0.55, 1.0, 1.75);

  for (const x of [-1.05, 1.05]) {
    for (const z of [-1.35, 1.35]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.25, 20),
        dark
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.43, z);
      wheel.castShadow = true;
      car.add(wheel);
      wheels.push(wheel);

      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.19, 0.27, 12),
        new THREE.MeshStandardMaterial({
          color: 0x9ba9b8,
          metalness: 0.9,
          roughness: 0.2
        })
      );
      hub.rotation.z = Math.PI / 2;
      hub.position.copy(wheel.position);
      car.add(hub);
    }
  }

  car.userData.wheels = wheels;
  car.userData.stats = data;
  car.userData.carType = type;

  return car;
}

export function rotateWheels(car, amount) {
  for (const wheel of car.userData.wheels || []) {
    wheel.rotation.x += amount;
  }
}