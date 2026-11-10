export function createControls() {
  const state = { left:false, right:false, accelerate:false, brake:false, nitro:false };
  const keyMap = {
    ArrowLeft:"left", KeyA:"left", ArrowRight:"right", KeyD:"right",
    ArrowUp:"accelerate", KeyW:"accelerate", ArrowDown:"brake", KeyS:"brake",
    Space:"nitro", ShiftLeft:"nitro", ShiftRight:"nitro"
  };
  window.addEventListener("keydown", event => {
    const action = keyMap[event.code];
    if (action) { state[action] = true; event.preventDefault(); }
  });
  window.addEventListener("keyup", event => {
    const action = keyMap[event.code];
    if (action) { state[action] = false; event.preventDefault(); }
  });
  document.querySelectorAll("[data-control]").forEach(button => {
    const action = button.dataset.control;
    const release = event => { if (event) event.preventDefault(); state[action] = false; };
    button.addEventListener("pointerdown", event => {
      event.preventDefault(); state[action] = true;
      try { button.setPointerCapture(event.pointerId); } catch {}
    });
    ["pointerup","pointercancel","lostpointercapture","pointerleave"].forEach(type =>
      button.addEventListener(type, release)
    );
    button.addEventListener("contextmenu", event => event.preventDefault());
  });
  window.addEventListener("blur", () => Object.keys(state).forEach(key => state[key] = false));
  return state;
}
