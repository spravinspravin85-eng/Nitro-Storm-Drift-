import { createCar, CAR_DATA } from "./cars.js";

export class Garage {
  constructor(scene) {
    this.scene = scene;
    this.currentType = "storm";
    this.car = null;
    this.select = document.getElementById("car-select");

    this.select.addEventListener("change", () => {
      this.setCar(this.select.value);
    });

    this.setCar(this.currentType);
  }

  setCar(type) {
    if (!CAR_DATA[type]) type = "storm";

    if (this.car) {
      this.scene.remove(this.car);
    }

    this.currentType = type;
    this.car = createCar(type);
    this.car.position.set(0, 0, 0);
    this.scene.add(this.car);

    return this.car;
  }

  getCar() {
    return this.car;
  }

  getStats() {
    return CAR_DATA[this.currentType];
  }
}