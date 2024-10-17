import { Particle } from './Particle.js';
import { canvas, canvasPos } from '../utils.js';

export class Shot extends Particle {
  constructor(shotsArray, position, velocity, color, isPlayerShot = false) {
    super();
    this.position = { x: position.x, y: position.y};
    this.velocity = { x: velocity.x, y: velocity.y};
    this.radius = 5;
    this.color = color;
    this.isPlayerShot = isPlayerShot;
    this.shotsArray = shotsArray;
  }

  deleteShots() {
    if (
      this.position.y >= canvas.height ||
      this.position.y < canvasPos.top
    ) this.shotsArray.splice(0, 1);
  }

  collideWith(obj) {
    return (
      obj.position.x + obj.width >= this.position.x &&
      obj.position.x <= this.position.x + this.radius &&
      (this.isPlayerShot ?
        obj.position.y >= this.position.y :
        obj.position.y <= this.position.y)
    );
  }

  update() {
    this.draw();
    this.deleteShots();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
