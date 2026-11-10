import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createRoadTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#292e35"; ctx.fillRect(0,0,512,512);
  // Subtle asphalt grain
  let seed = 42;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i=0;i<9000;i++) {
    const v = 48 + Math.floor(rand()*38);
    ctx.fillStyle = `rgba(${v},${v},${v},${0.18+rand()*0.25})`;
    ctx.fillRect(rand()*512,rand()*512,1+rand()*2,1+rand()*2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1,12);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
