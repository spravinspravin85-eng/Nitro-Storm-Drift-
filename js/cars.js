export const CAR_DATA = {
  storm:   { name: "STORM GT",   color: 0x087cff, acceleration: 30, maxSpeed: 245, handling: 1.00, style: 0 },
  phantom: { name: "PHANTOM R",  color: 0x252a38, acceleration: 34, maxSpeed: 265, handling: 0.92, style: 1 },
  vortex:  { name: "VORTEX X",   color: 0x8c20ff, acceleration: 37, maxSpeed: 280, handling: 1.08, style: 2 },
  inferno: { name: "INFERNO RS", color: 0xff4b16, acceleration: 32, maxSpeed: 255, handling: 1.15, style: 3 }
};

export function rotateWheels(car, amount) {
  for (const wheel of car?.userData?.wheels || []) wheel.rotation.x += amount;
}
