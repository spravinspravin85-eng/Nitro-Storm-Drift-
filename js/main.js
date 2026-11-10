import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

import { createWorld, createTraffic } from "./world.js";
import { createControls } from "./controls.js";
import { RaceManager } from "./race.js";
import { Garage } from "./garage.js";
import { rotateWheels } from "./cars.js";

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

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.getElementById("game").prepend(renderer.domElement);

// Lighting
scene.add(new THREE.HemisphereLight(0xc8e5ff, 0x30303a, 2));

const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(-25, 60, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

// Environment
createWorld(scene);
const traffic = createTraffic(scene);

// Systems
const controls = createControls();
const race = new RaceManager();
const garage = new Garage(scene);

const garagePanel = document.getElementById("garage");
const pausePanel = document.getElementById("pause-panel");
const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const resumeButton = document.getElementById("resume-button");
const garageButton = document.getElementById("garage-button");
const raceMessage = document.getElementById("race-message");

let paused = true;
let lastTime = performance.now();

function startRace() {
  garagePanel.classList.add("hidden");
  pausePanel.classList.add("hidden");

  garage.getCar().position.set(0, 0, 0);
  garage.getCar().rotation.set(0, 0, 0);

  race.start();
  paused = false;
}

function pauseRace() {
  if (!race.running || paused) return;
  paused = true;
  race.stop();
  pausePanel.classList.remove("hidden");
}

function resumeRace() {
  pausePanel.classList.add("hidden");
  race.running = true;
  paused = false;
}

function backToGarage() {
  race.stop();
  paused = true;
  pausePanel.classList.add("hidden");
  garagePanel.classList.remove("hidden");
  raceMessage.textContent = "READY TO RACE?";
}

startButton.addEventListener("click", startRace);
pauseButton.addEventListener("click", pauseRace);
resumeButton.addEventListener("click", resumeRace);
garageButton.addEventListener("click", backToGarage);

function updateTraffic(dt, player) {
  for (const vehicle of traffic) {
    vehicle.position.z += (race.speed / 3.6 + 12) * dt;

    if (vehicle.position.z > 16) {
      vehicle.position.z = -330 - Math.random() * 180;
      vehicle.position.x =
        [-5.5, -2.8, 2.8, 5.5][Math.floor(Math.random() * 4)];
    }

    const closeZ = Math.abs(vehicle.position.z - player.position.z) < 2.8;
    const closeX = Math.abs(vehicle.position.x - player.position.x) < 1.8;

    if (closeZ && closeX && race.running) {
      race.speed *= 0.88;
      vehicle.position.z -= 8;
    }
  }
}

function updateCamera(car, dt) {
  const target = new THREE.Vector3(
    car.position.x * 0.55,
    5.2,
    car.position.z + 10
  );

  camera.position.lerp(target, 1 - Math.exp(-4 * dt));

  const lookAt = new THREE.Vector3(
    car.position.x * 0.35,
    1,
    car.position.z - 12
  );

  camera.lookAt(lookAt);
}

function animate(now) {
  requestAnimationFrame(animate);

  const dt = Math.min((now - lastTime) / 1000, 0.04);
  lastTime = now;

  const car = garage.getCar();

  if (race.running && !paused) {
    race.update(dt, controls, garage.getStats(), car);

    const movement = race.speed / 3.6;
    car.position.z -= movement * dt;

    rotateWheels(car, movement * dt * 1.8);
    updateTraffic(dt, car);
  }

  updateCamera(car, dt);
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
});

// Register the PWA service worker when hosted over HTTPS or localhost.
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(error => {
    console.warn("Service worker registration failed:", error);
  });
}