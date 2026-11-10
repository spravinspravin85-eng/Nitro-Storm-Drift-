
export function createRoadTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#252a32";
  ctx.fillRect(0, 0, 512, 512);

  // Asphalt grain
  for (let i = 0; i < 14000; i++) {
    const shade = Math.floor(Math.random() * 65) + 45;
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(
      Math.random() * 512,
      Math.random() * 512,
      1.5, 1.5
    );
  }

  // Road lane markings
  ctx.fillStyle = "#f4f4f4";
  ctx.fillRect(246, 0, 8, 512);

  // Side lines
  ctx.fillStyle = "#ffb52e";
  ctx.fillRect(18, 0, 5, 512);
  ctx.fillRect(489, 0, 5, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 8);

  return texture;
}
