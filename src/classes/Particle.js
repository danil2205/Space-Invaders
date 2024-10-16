import { canvas, ctx } from '../game.js';

export class Particle {
  constructor() {
    this.position = {
      x: randomNum(canvas.width),
      y: randomNum(canvas.height),
    };
    this.velocity = {
      x: 0,
      y: 2,
    };
    this.radius = randomNum(3);
    this.color = 'white';
  }

  draw() {
    ctx.beginPath();
    ctx.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  saveParticles() {
    if (this.position.y - this.radius >= canvas.height) {
      this.position.y = -this.radius;
    }
  }

  update() {
    this.draw();
    this.saveParticles();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
