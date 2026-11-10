import { createNSDCar, NSD_CARS } from "../assets/models/car-models.js";
import { CAR_DATA } from "./cars.js";

export class Garage {
  constructor(scene) {
    this.scene = scene;
    this.currentType = "storm";
    this.car = null;
    this.select = document.getElementById("car-select");
    this.nameElement = document.getElementById("selected-car-name");
    this.select?.addEventListener("change", () => this.setCar(this.select.value));
    this.setCar(this.currentType);
  }
  setCar(type) {
    const definition = NSD_CARS.find(item => item.type === type) || NSD_CARS[0];
    if (this.car) {
      this.scene.remove(this.car);
      this.car.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
      });
    }
    this.currentType = definition.type;
    this.car = createNSDCar(definition.color, definition.style);
    this.car.position.set(0,0,0);
    this.scene.add(this.car);
    if (this.nameElement) this.nameElement.textContent = definition.name;
    if (this.select && this.select.value !== this.currentType) this.select.value = this.currentType;
    return this.car;
  }
  getCar() { return this.car; }
  getStats() { return CAR_DATA[this.currentType] || CAR_DATA.storm; }
}
