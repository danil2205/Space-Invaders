import { canvas, canvasPos, ctx } from '../game.js';

export class Boss {
  constructor() {
    this.velocity = {
      x: 5,
      y: 3,
    };
    this.health = 200;
    this.isOnReload = false;
    const image = new Image();
    image.src = './img/boss.png';
    image.onload = () => {
      const scale = 0.35;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: canvas.width / 2,
        y: 0,
      };
    };
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  move() {
    if (
      this.position.x + this.width > canvas.width ||
      this.position.x < canvasPos.right
    ) this.velocity.x = -this.velocity.x;

    if (
      this.position.y + this.height > canvas.height / 2 ||
      this.position.y < canvasPos.top
    ) this.velocity.y = -this.velocity.y;
  }

  shoot() {
    if (this.isOnReload) return;
    this.reload();

    game.shots.push(
      new Shot(
        {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        {
          x: 0,
          y: 3 * game.speed,
        },
        'red'
      )
    );
  }

  reload() {
    this.isOnReload = true;
    setTimeout(() => this.isOnReload = false, 5000);
  }

  getDamage(dmg) {
    this.health -= dmg;
    document.querySelector('#bossHP').style.width = this.health;
  }

  update() {
    this.draw();
    this.move();
    this.shoot();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
