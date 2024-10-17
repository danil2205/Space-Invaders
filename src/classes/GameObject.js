import { canvas, ctx } from '../utils.js';

export class GameObject {
  constructor(nameObject, arrayObjects, scale, speed, { position }) {
    this.velocity = {
      x: 0,
      y: 3,
    };
    this.arrayObjects = arrayObjects;
    this.speed = speed;
    const image = new Image();
    image.src = `./img/${nameObject}.png`;
    image.onload = () => {
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = position;
    };
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.position?.x,
      this.position?.y,
      this.width,
      this.height
    );
  }

  move() {
    this.position.y += this.velocity.y * this.speed;
  }

  delete() {
    if (this.position.y >= canvas.height) this.arrayObjects.splice(0, 1);
  }

  update() {
    this.draw();
    this.move();
    this.delete();
  }
}
