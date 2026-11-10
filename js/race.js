export class RaceManager {
  constructor() {
    this.speed = 0;
    this.distance = 0;
    this.elapsed = 0;
    this.nitro = 100;
    this.running = false;
    this.finished = false;

    this.speedElement = document.getElementById("speed");
    this.distanceElement = document.getElementById("distance");
    this.timerElement = document.getElementById("timer");
    this.nitroElement = document.getElementById("nitro-fill");
    this.messageElement = document.getElementById("race-message");
  }

  start() {
    this.speed = 0;
    this.distance = 0;
    this.elapsed = 0;
    this.nitro = 100;
    this.finished = false;
    this.running = true;
    this.messageElement.textContent = "GO! GO! GO!";
  }

  stop() {
    this.running = false;
  }

  update(dt, input, carData, car) {
    if (!this.running || this.finished) return;

    const acceleration = carData.acceleration;
    const maxSpeed = carData.maxSpeed;

    if (input.accelerate) {
      this.speed += acceleration * dt;
    } else {
      this.speed -= 10 * dt;
    }

    if (input.brake) {
      this.speed -= 45 * dt;
    }

    if (input.nitro && this.nitro > 0 && this.speed > 15) {
      this.speed += 45 * dt;
      this.nitro -= 24 * dt;
    } else {
      this.nitro += 7 * dt;
    }

    this.nitro = Math.max(0, Math.min(100, this.nitro));
    this.speed = Math.max(0, Math.min(maxSpeed + 45, this.speed));

    const speedFactor = this.speed / Math.max(maxSpeed, 1);
    const steerAmount = (input.right ? 1 : 0) - (input.left ? 1 : 0);

    car.position.x += steerAmount * (5 + speedFactor * 7) *
      carData.handling * dt;

    car.position.x = Math.max(-7.0, Math.min(7.0, car.position.x));

    car.rotation.z = -steerAmount * 0.13 * speedFactor;
    car.rotation.y = -steerAmount * 0.09 * speedFactor;

    const movement = this.speed / 3.6;
    this.distance += movement * dt;
    this.elapsed += dt;

    this.speedElement.textContent = Math.round(this.speed);
    this.distanceElement.textContent =
      (this.distance / 1000).toFixed(2) + " KM";

    const minutes = Math.floor(this.elapsed / 60);
    const seconds = Math.floor(this.elapsed % 60);

    this.timerElement.textContent =
      String(minutes).padStart(2, "0") + ":" +
      String(seconds).padStart(2, "0");

    this.nitroElement.style.width = this.nitro + "%";

    if (this.elapsed > 4) {
      this.messageElement.textContent = "";
    }
  }
}