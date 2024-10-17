import { ctx, gameGUI } from '../utils.js';

export class Pet {
  constructor(game) {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.abilityMenu = 'Shield';
    this.ability = null;
    this.isCooldown = false;
    this.game = game;
    gameGUI.abilityPet.innerHTML = 'Ability of your Pet is Ready';

    const image = new Image();
    image.src = `./img/satellite1.png`;
    image.onload = () => {
      const scale = 0.1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: this.game.player.position?.x - this.game.player.width,
        y: this.game.player.position?.y - this.game.player.height,
      };
    };

    this.abilities = {
      'Heal': this.healShip,
      'collectCosmonauts': this.cosmonautsCollect,
    }
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
    if (this.position.x >= this.game.player.position.x + this.game.player.width) {
      this.velocity.x = -3;
    } else if (this.position.x <= this.game.player.position.x - this.game.player.width) {
      this.velocity.x = 3;
    }
  }

  healShip() {
    if (this.ability !== 'Heal') return;
    this.game.player.lives += 1;
    this.game.showLives();
    this.ability = null;
  }

  cosmonautsCollect() {
    if (this.ability !== 'collectCosmonauts') return;
    for (const [index, cosmonaut] of this.game.cosmonauts.entries()) {
      if (!this.game.player.collideWith(cosmonaut)) {
        this.game.getPoints();
        this.game.cosmonauts.splice(index, 1);
      }
    }
  }

  reloadAbility() {
    const cooldown = 30000;
    if (this.isCooldown) setTimeout(() => {
      this.isCooldown = false;
      gameGUI.abilityPet.innerHTML = 'Ability of your Pet is Ready';
    }, cooldown);
  }

  getAbility() {
    if (!this.isCooldown) {
      const actionTime = 5000 + 250 * this.game.levelPet;
      this.isCooldown = true;
      this.reloadAbility();
      gameGUI.abilityPet.innerHTML = 'Ability of your Pet is NOT Ready';
      this.ability = this.abilityMenu;
      setTimeout(() => {
        this.ability = null;
      }, actionTime);
    }
  }

  update() {
    this.draw();
    this.move();
    this.healShip();
    this.cosmonautsCollect();
    if (isNaN(this.position.x)) {
      console.log(this.position)
      this.position.x = this.game.player.position.x - this.game.player.width;
      this.position.y = this.game.player.position?.y - this.game.player.height
    }
    this.position.x += this.velocity.x;
  }
}
