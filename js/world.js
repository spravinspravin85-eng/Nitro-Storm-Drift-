import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createWorld(scene) {
  const world = new THREE.Group();
  scene.add(world);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 700),
    new THREE.MeshStandardMaterial({
      color: 0x17202b,
      roughness: 1
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.12;
  ground.position.z = -250;
  world.add(ground);

  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 700),
    new THREE.MeshStandardMaterial({
      color: 0x20242b,
      roughness: 0.95
    })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0;
  road.position.z = -250;
  world.add(road);

  const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0xe8e8e8
  });

  // Centre markings
  for (let z = 20; z > -600; z -= 12) {
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 5),
      new THREE.MeshBasicMaterial({ color: 0xf3d36b })
    );
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.015, z);
    world.add(line);
  }

  // Roadside lane markings
  for (const x of [-8.7, 8.7]) {
    const edge = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, 700),
      lineMaterial
    );
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(x, 0.018, -250);
    world.add(edge);
  }

  const buildingMaterials = [
    0x26364b, 0x344357, 0x202c3e,
    0x48546a, 0x293044, 0x3c4658
  ];

  const seeded = (n) => {
    const v = Math.sin(n * 127.1 + 78.2) * 43758.5453;
    return v - Math.floor(v);
  };

  for (let i = 0; i < 110; i++) {
    const z = 15 - i * 5.7;

    for (const side of [-1, 1]) {
      const r = seeded(i * 3 + (side + 1) * 17);
      const width = 5 + r * 8;
      const height = 8 + seeded(i * 9 + side * 5) * 42;
      const depth = 5 + seeded(i * 11 + side * 2) * 8;

      const building = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshStandardMaterial({
          color: buildingMaterials[i % buildingMaterials.length],
          roughness: 0.85,
          metalness: 0.1
        })
      );

      building.position.set(
        side * (15 + width * 0.5 + r * 12),
        height * 0.5,
        z
      );
      building.castShadow = true;
      building.receiveShadow = true;
      world.add(building);

      // Decorative window strips
      const windows = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.82, 0.13, 0.06),
        new THREE.MeshBasicMaterial({
          color: i % 3 === 0 ? 0x00aaff : 0xffc56b
        })
      );
      windows.position.set(
        building.position.x,
        Math.min(height * 0.65, height - 1),
        z + depth * 0.5 + 0.04
      );
      world.add(windows);
    }
  }

  // Streetlights
  const lampMaterial = new THREE.MeshStandardMaterial({
    color: 0x778899,
    metalness: 0.7,
    roughness: 0.35
  });

  for (let z = 10; z > -600; z -= 32) {
    for (const side of [-1, 1]) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 6, 8),
        lampMaterial
      );
      pole.position.set(side * 10.5, 3, z);
      world.add(pole);

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x8adfff })
      );
      bulb.position.set(side * 10.5, 6.1, z);
      world.add(bulb);
    }
  }

  return world;
}

export function createTraffic(scene) {
  const traffic = [];

  const materials = [
    0xffbd32, 0xeeeeee, 0x31a6ff, 0xe34c43, 0x888888
  ];

  for (let i = 0; i < 9; i++) {
    const group = new THREE.Group();
    const color = materials[i % materials.length];

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.8, 3.5),
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0.4,
        roughness: 0.4
      })
    );
    body.position.y = 0.65;
    body.castShadow = true;
    group.add(body);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.65, 1.65),
      new THREE.MeshStandardMaterial({
        color: 0x172536,
        metalness: 0.4,
        roughness: 0.2
      })
    );
    cabin.position.set(0, 1.25, 0.05);
    group.add(cabin);

    group.position.set(
      [-5.5, -2.8, 2.8, 5.5][i % 4],
      0,
      -35 - i * 46
    );

    scene.add(group);
    traffic.push(group);
  }

  return traffic;
}