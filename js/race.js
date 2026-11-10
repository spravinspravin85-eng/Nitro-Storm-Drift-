export class RaceManager {
  constructor() {
    this.speed = 0; this.distance = 0; this.elapsed = 0; this.nitro = 100;
    this.running = false; this.finished = false; this.nitroActive = false;
    this.speedElement = document.getElementById("speed");
    this.distanceElement = document.getElementById("distance");
    this.timerElement = document.getElementById("timer");
    this.nitroElement = document.getElementById("nitro-fill");
    this.messageElement = document.getElementById("race-message");
  }
  start() {
    this.speed = 0; this.distance = 0; this.elapsed = 0; this.nitro = 100;
    this.finished = false; this.running = true; this.nitroActive = false;
    if (this.messageElement) this.messageElement.textContent = "GO! GO! GO!";
    this.renderHUD();
  }
  stop() { this.running = false; this.nitroActive = false; }
  update(dt,input,carData,car) {
    if (!this.running || this.finished) return;
    const acceleration = carData.acceleration;
    const maxSpeed = carData.maxSpeed;
    if (input.accelerate) this.speed += acceleration*dt;
    else this.speed -= 10*dt;
    if (input.brake) this.speed -= 48*dt;
    this.nitroActive = Boolean(input.nitro && this.nitro > 0 && this.speed > 15);
    if (this.nitroActive) { this.speed += 48*dt; this.nitro -= 25*dt; }
    else this.nitro += 7*dt;
    this.nitro = Math.max(0,Math.min(100,this.nitro));
    this.speed = Math.max(0,Math.min(maxSpeed+40,this.speed));
    const steer = (input.right?1:0)-(input.left?1:0);
    const speedFactor = this.speed/Math.max(maxSpeed,1);
    car.position.x = Math.max(-7,Math.min(7,car.position.x + steer*(5+speedFactor*7)*carData.handling*dt));
    car.rotation.z = -steer*0.13*speedFactor;
    car.rotation.y = -steer*0.09*speedFactor;
    this.distance += (this.speed/3.6)*dt;
    this.elapsed += dt;
    this.renderHUD();
    if (this.elapsed > 4 && this.messageElement) this.messageElement.textContent = "";
  }
  renderHUD() {
    if (this.speedElement) this.speedElement.textContent = Math.round(this.speed);
    if (this.distanceElement) this.distanceElement.textContent = (this.distance/1000).toFixed(2)+" KM";
    if (this.timerElement) {
      const m = Math.floor(this.elapsed/60), s = Math.floor(this.elapsed%60);
      this.timerElement.textContent = String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
    }
    if (this.nitroElement) this.nitroElement.style.width = this.nitro+"%";
  }
}
