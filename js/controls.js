export function createControls() {
  const state = {
    left: false,
    right: false,
    accelerate: false,
    brake: false,
    nitro: false
  };

  const keyMap = {
    ArrowLeft: "left",
    KeyA: "left",
    ArrowRight: "right",
    KeyD: "right",
    ArrowUp: "accelerate",
    KeyW: "accelerate",
    ArrowDown: "brake",
    KeyS: "brake",
    Space: "nitro",
    ShiftLeft: "nitro",
    ShiftRight: "nitro"
  };

  window.addEventListener("keydown", event => {
    const action = keyMap[event.code];
    if (action) {
      state[action] = true;
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", event => {
    const action = keyMap[event.code];
    if (action) {
      state[action] = false;
      event.preventDefault();
    }
  });

  document.querySelectorAll("[data-control]").forEach(button => {
    const action = button.dataset.control;

    const press = event => {
      event.preventDefault();
      state[action] = true;
      button.setPointerCapture?.(event.pointerId);
    };

    const release = event => {
      event.preventDefault();
      state[action] = false;
    };

    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
    button.addEventListener("contextmenu", event => event.preventDefault());
  });

  window.addEventListener("blur", () => {
    for (const key of Object.keys(state)) state[key] = false;
  });

  return state;
}