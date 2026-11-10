import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export const NSD_CARS = [
  { type: "storm", name: "STORM GT", color: 0x087cff, style: 0 },
  { type: "phantom", name: "PHANTOM R", color: 0x252a38, style: 1 },
  { type: "vortex", name: "VORTEX X", color: 0x8c20ff, style: 2 },
  { type: "inferno", name: "INFERNO RS", color: 0xff4b16, style: 3 }
];

export function createNSDCar(color = 0x087cff, style = 0) {
  const car = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color, metalness: 0.72, roughness: 0.24 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x10151d, metalness: 0.25, roughness: 0.58 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x10243a, metalness: 0.45, roughness: 0.16 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x08090c, roughness: 0.9 });
  const rim = new THREE.MeshStandardMaterial({ color: 0xa9bdce, metalness: 0.92, roughness: 0.2 });
  const head = new THREE.MeshStandardMaterial({ color: 0xdff8ff, emissive: 0x55bbff, emissiveIntensity: 1.7 });
  const tail = new THREE.MeshStandardMaterial({ color: 0xff2828, emissive: 0xff0808, emissiveIntensity: 1.4 });
  const wheels = [];

  function box(w,h,d,mat,x,y,z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
    m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; car.add(m); return m;
  }
  // Low, wide coupe silhouette. Vehicle faces negative Z.
  box(2.08,0.48,4.25,paint,0,0.66,0);
  box(1.92,0.20,1.20,paint,0,0.91,-1.45);
  box(1.72,0.58,1.95,glass,0,1.12,0.08);
  box(1.55,0.12,1.30,paint,0,1.43,0.12);
  box(1.96,0.22,0.78,paint,0,0.86,1.65);
  box(1.78,0.12,0.28,dark,0,0.42,-2.10);
  box(0.75,0.13,0.08,head,-0.68,0.78,-2.17);
  box(0.75,0.13,0.08,head,0.68,0.78,-2.17);
  box(0.82,0.12,0.08,tail,-0.55,0.78,2.13);
  box(0.82,0.12,0.08,tail,0.55,0.78,2.13);
  // Side skirts and mirrors
  for (const side of [-1,1]) {
    box(0.12,0.15,2.55,dark,side*1.02,0.43,0);
    box(0.18,0.12,0.28,paint,side*0.96,1.05,-0.65);
  }
  // Spoiler variants
  if (style > 0) {
    box(1.72,0.09,0.28,style === 2 ? paint : dark,0,1.30,1.83);
    box(0.09,0.28,0.10,dark,-0.55,1.15,1.83);
    box(0.09,0.28,0.10,dark,0.55,1.15,1.83);
  }
  // Four wheels with alloy hubs
  for (const x of [-1.04,1.04]) for (const z of [-1.36,1.36]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.40,0.40,0.27,24),rubber);
    wheel.rotation.z = Math.PI/2; wheel.position.set(x,0.42,z); wheel.castShadow = true; car.add(wheel); wheels.push(wheel);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.21,0.21,0.29,16),rim);
    hub.rotation.z = Math.PI/2; hub.position.copy(wheel.position); car.add(hub);
  }
  car.userData.wheels = wheels;
  return car;
}
