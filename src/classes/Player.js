import { canvas, canvasPos, ctx } from '../game.js';

export class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.lives = 3;
    this.ammoDamage = 15;
    this.ammoColor = 'red';
    this.adrenalineCooldown = false;
    this.powerUp = null;
    this.opacity = 1;

    const image = new Image();
    image.src = './img/ship1.png';
    image.onload = () => {
      const scale = 0.05;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height / 2 + this.height + 250,
      };
    };
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );

    ctx.restore();
  }

  move() {
    if (keys.a.pressed && this.position.x > canvasPos.right) {
      this.velocity.x = -5;
    } else if (keys.d.pressed && this.position.x + this.width < canvas.width) {
      this.velocity.x = 5;
    } else this.velocity.x = 0;
  }

  playerDie() {
    if (this.lives === 0) lose();
  }

  shoot() {
    if (gameGUI.progressBar.value === gameGUI.progressBar.max) {
      gameGUI.progressBar.value = 0;
      game.shots.push(
        new Shot(
          {
            x: this.position.x + this.width / 2,
            y: this.position.y,
          },
          {
            x: 0,
            y: -5 * game.speed,
          },
          this.ammoColor,
          true
        )
      );
      changeProgressReload();
    }
  }

  collideWith(obj) {
    return !(
      ((this.position.y + this.height) < (obj.position.y)) ||
      (this.position.y > (obj.position.y + obj.height)) ||
      ((this.position.x + this.width) < obj.position.x) ||
      (this.position.x > (obj.position.x + obj.width))
    );
  }

  removeLives() {
    if (this.powerUp === 'Shield' || game.pet.ability === 'Shield') return;
    this.lives--;
    const flashDelay = 500;
    setTimeout(setOpacity(0.1), 0);
    setTimeout(setOpacity(1), flashDelay);
    gameGUI.imgLives.removeChild(gameGUI.imgLives.lastElementChild);
  }

  update() {
    this.draw();
    this.move();
    this.playerDie();
    this.position.x += this.velocity.x;
  }
}
