
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

import { createWorld, createTraffic } from "./world.js";
import { createControls } from "./controls.js";
import { RaceManager } from "./race.js";
import { Garage } from "./garage.js";
import { rotateWheels } from "./cars.js";

import {
  createNSDCar,
  NSD_CARS
} from "../assets/models/car-models.js";

import {
  createRoadTexture
} from "../assets/textures/texture-generator.js";

import {
  NSDAudio
} from "../assets/audio/sound-engine.js";

// =====================================
// NSD CONFIGURATION
// =====================================

const CONFIG = {
  maxPixelRatio: 1.5,
  cameraSmoothness: 4,
  collisionDistanceZ: 2.8,
  collisionDistanceX: 1.8,
  maxFrameTime: 0.04
};

// =====================================
// SCENE
// =====================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x8eb8d7);
scene.fog = new THREE.Fog(0x8eb8d7, 80, 300);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  800
);

camera.position.set(0, 6, 11);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio)
);

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const gameContainer = document.getElementById("game");

if (!gameContainer) {
  throw new Error('Missing HTML element with id="game"');
}

gameContainer.prepend(renderer.domElement);

// =====================================
// LIGHTING
// =====================================

scene.add(
  new THREE.HemisphereLight(
    0xc8e5ff,
    0x30303a,
    2
  )
);

const sun = new THREE.DirectionalLight(0xffffff, 2.2);

sun.position.set(-25, 60, 30);
sun.castShadow = true;

sun.shadow.mapSize.set(1024, 1024);

scene.add(sun);

// =====================================
// ENVIRONMENT
// =====================================

createWorld(scene);

const traffic = createTraffic(scene);

// =====================================
// PROCEDURAL ROAD TEXTURE
// =====================================

// The texture is generated locally using canvas.
const roadTexture = createRoadTexture();

roadTexture.colorSpace = THREE.SRGBColorSpace;

// =====================================
// GAME SYSTEMS
// =====================================

const controls = createControls();

const race = new RaceManager();

const garage = new Garage(scene);

const nsdAudio = new NSDAudio();

// =====================================
// DOM ELEMENTS
// =====================================

const garagePanel = document.getElementById("garage");
const pausePanel = document.getElementById("pause-panel");

const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const resumeButton = document.getElementById("resume-button");
const garageButton = document.getElementById("garage-button");

const raceMessage = document.getElementById("race-message");

// =====================================
// GAME STATE
// =====================================

let paused = true;
let lastTime = performance.now();

let currentSpeed = 0;
let nitroActive = false;

// =====================================
// AUDIO INITIALIZATION
// =====================================

window.addEventListener("pointerdown", () => {
  nsdAudio.start();
}, { once: true });

window.addEventListener("keydown", () => {
  nsdAudio.start();
}, { once: true });

// =====================================
// START RACE
// =====================================

function startRace() {
  garagePanel?.classList.add("hidden");
  pausePanel?.classList.add("hidden");

  const car = garage.getCar();

  car.position.set(0, 0, 0);
  car.rotation.set(0, 0, 0);

  race.start();

  paused = false;

  currentSpeed = 0;

  if (raceMessage) {
    raceMessage.textContent = "RACE STARTED!";
  }

  nsdAudio.start();
}

// =====================================
// PAUSE
// =====================================

function pauseRace() {
  if (!race.running || paused) return;

  paused = true;

  race.stop();

  nsdAudio.stop();

  pausePanel?.classList.remove("hidden");
}

// =====================================
// RESUME
// =====================================

function resumeRace() {
  pausePanel?.classList.add("hidden");

  race.running = true;

  paused = false;

  nsdAudio.start();
}

// =====================================
// BACK TO GARAGE
// =====================================

function backToGarage() {
  race.stop();

  paused = true;

  currentSpeed = 0;

  nsdAudio.stop();

  pausePanel?.classList.add("hidden");
  garagePanel?.classList.remove("hidden");

  if (raceMessage) {
    raceMessage.textContent = "READY TO RACE?";
  }
}

// =====================================
// BUTTON EVENTS
// =====================================

startButton?.addEventListener("click", startRace);

pauseButton?.addEventListener("click", pauseRace);

resumeButton?.addEventListener("click", resumeRace);

garageButton?.addEventListener("click", backToGarage);

// =====================================
// TRAFFIC SYSTEM
// =====================================

function updateTraffic(dt, player) {
  for (const vehicle of traffic) {

    vehicle.position.z +=
      (race.speed / 3.6 + 12) * dt;

    if (vehicle.position.z > 16) {
      vehicle.position.z = -330 - Math.random() * 180;

      vehicle.position.x =
        [-5.5, -2.8, 2.8, 5.5][
          Math.floor(Math.random() * 4)
        ];
    }

    const closeZ =
      Math.abs(vehicle.position.z - player.position.z)
      < CONFIG.collisionDistanceZ;

    const closeX =
      Math.abs(vehicle.position.x - player.position.x)
      < CONFIG.collisionDistanceX;

    if (closeZ && closeX && race.running) {

      race.speed *= 0.88;

      vehicle.position.z -= 8;
    }
  }
}

// =====================================
// CAMERA SYSTEM
// =====================================

function updateCamera(car, dt) {

  const target = new THREE.Vector3(
    car.position.x * 0.55,
    5.2,
    car.position.z + 10
  );

  camera.position.lerp(
    target,
    1 - Math.exp(-CONFIG.cameraSmoothness * dt)
  );

  const lookAt = new THREE.Vector3(
    car.position.x * 0.35,
    1,
    car.position.z - 12
  );

  camera.lookAt(lookAt);
}

// =====================================
// AUDIO UPDATE
// =====================================

function updateAudio() {

  currentSpeed = race.speed || 0;

  nsdAudio.setSpeed(currentSpeed);

  // Uses the race system's nitro state if available.
  nitroActive = Boolean(
    race.nitroActive ||
    race.isNitroActive
  );

  nsdAudio.nitro(nitroActive);
}

// =====================================
// ANIMATION LOOP
// =====================================

function animate(now) {

  requestAnimationFrame(animate);

  const dt = Math.min(
    (now - lastTime) / 1000,
    CONFIG.maxFrameTime
  );

  lastTime = now;

  const car = garage.getCar();

  if (!car) {
    renderer.render(scene, camera);
    return;
  }

  if (race.running && !paused) {

    race.update(
      dt,
      controls,
      garage.getStats(),
      car
    );

    const movement = race.speed / 3.6;

    car.position.z -= movement * dt;

    rotateWheels(
      car,
      movement * dt * 1.8
    );

    updateTraffic(dt, car);

    updateAudio();

  } else {
    nsdAudio.setSpeed(0);
    nsdAudio.nitro(false);
  }

  updateCamera(car, dt);

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);

// =====================================
// RESIZE
// =====================================

window.addEventListener("resize", () => {

  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio)
  );

});

// =====================================
// SERVICE WORKER
// =====================================

if (
  "serviceWorker" in navigator &&
  location.protocol !== "file:"
) {

  navigator.serviceWorker
    .register("./sw.js")
    .catch(error => {
      console.warn(
        "NSD service worker registration failed:",
        error
      );
    });

}

// =====================================
// NSD READY
// =====================================

console.log(
  "NSD — NITRO STORM DRIFT initialized"
);

console.log("Available car definitions:", NSD_CARS.length);
