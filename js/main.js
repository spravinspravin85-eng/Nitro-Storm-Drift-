import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { createWorld, createTraffic } from "./world.js";
import { createControls } from "./controls.js";
import { RaceManager } from "./race.js";
import { Garage } from "./garage.js";
import { rotateWheels } from "./cars.js";
import { createRoadTexture } from "../assets/textures/texture-generator.js";
import { NSDAudio } from "../assets/audio/sound-engine.js";

const game = document.getElementById("game");
const errorBox = document.getElementById("load-error");
function showError(message) {
  if (errorBox) { errorBox.textContent = message; errorBox.classList.remove("hidden"); }
  console.error(message);
}
if (!game) throw new Error('Missing #game element');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
} catch (error) {
  showError("Your browser could not start WebGL. Try updating Chrome or enabling hardware acceleration.");
  throw error;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
game.prepend(renderer.domElement);

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8eb8d7);
scene.fog=new THREE.Fog(0x8eb8d7,85,310);
const camera=new THREE.PerspectiveCamera(65,window.innerWidth/window.innerHeight,.1,1000);
camera.position.set(0,5.5,10);

scene.add(new THREE.HemisphereLight(0xc8e5ff,0x30303a,2));
const sun=new THREE.DirectionalLight(0xffffff,2.1);
sun.position.set(-25,60,30);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);

const roadTexture=createRoadTexture();
const world=createWorld(scene,roadTexture);
const traffic=createTraffic(scene);
const controls=createControls();
const race=new RaceManager();
const garage=new Garage(scene);
const audio=new NSDAudio();

const $=id=>document.getElementById(id);
const garagePanel=$("garage"),pausePanel=$("pause-panel");
const startButton=$("start-button"),pauseButton=$("pause-button");
const resumeButton=$("resume-button"),garageButton=$("garage-button");
const raceMessage=$("race-message");
let paused=true,lastTime=performance.now();

function startRace(){
  garagePanel?.classList.add("hidden");pausePanel?.classList.add("hidden");
  const car=garage.getCar();car.position.set(0,0,0);car.rotation.set(0,0,0);
  race.start();paused=false;audio.start();
}
function pauseRace(){
  if(!race.running||paused)return;
  paused=true;race.stop();audio.stop();pausePanel?.classList.remove("hidden");
}
function resumeRace(){
  pausePanel?.classList.add("hidden");race.running=true;paused=false;audio.start();
}
function backToGarage(){
  race.stop();paused=true;audio.stop();
  garagePanel?.classList.remove("hidden");pausePanel?.classList.add("hidden");
  if(raceMessage)raceMessage.textContent="READY TO RACE?";
  const car=garage.getCar();car.position.set(0,0,0);car.rotation.set(0,0,0);
}
startButton?.addEventListener("click",startRace);
pauseButton?.addEventListener("click",pauseRace);
resumeButton?.addEventListener("click",resumeRace);
garageButton?.addEventListener("click",backToGarage);

function updateTraffic(dt,player){
  for(const vehicle of traffic){
    vehicle.position.z+=(race.speed/3.6+12)*dt;
    if(vehicle.position.z>player.position.z+16){
      vehicle.position.z=player.position.z-330-Math.random()*180;
      vehicle.position.x=[-5.5,-2.8,2.8,5.5][Math.floor(Math.random()*4)];
    }
    const closeZ=Math.abs(vehicle.position.z-player.position.z)<2.8;
    const closeX=Math.abs(vehicle.position.x-player.position.x)<1.8;
    if(closeZ&&closeX&&race.running){
      race.speed=Math.max(0,race.speed*.72);
      vehicle.position.z=player.position.z-22;
      if(raceMessage)raceMessage.textContent="TRAFFIC HIT!";
    }
  }
}
function updateCamera(car,dt){
  const target=new THREE.Vector3(car.position.x*.48,5.0,car.position.z+10.5);
  camera.position.lerp(target,1-Math.exp(-4*dt));
  camera.lookAt(car.position.x*.32,1,car.position.z-11);
}
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min((now-lastTime)/1000,.04);lastTime=now;
  const car=garage.getCar();
  if(race.running&&!paused){
    race.update(dt,controls,garage.getStats(),car);
    const movement=race.speed/3.6;
    car.position.z-=movement*dt;
    rotateWheels(car,movement*dt*1.8);
    updateTraffic(dt,car);
    audio.setSpeed(race.speed);
    audio.setNitro(race.nitroActive);
  }else{
    audio.setSpeed(0);audio.setNitro(false);
  }
  updateCamera(car,dt);
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);

window.addEventListener("resize",()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
});
window.addEventListener("error",event=>showError("Game error: "+event.message));
window.addEventListener("unhandledrejection",event=>showError("Loading error: "+String(event.reason)));

if("serviceWorker" in navigator && location.protocol!=="file:"){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(err=>console.warn("Service worker:",err)));
}
console.log("NSD — NITRO STORM DRIFT ready");
