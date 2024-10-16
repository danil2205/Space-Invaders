import { ctx } from '../game.js';

export class Pet {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.abilityMenu = null;
    this.ability = null;
    this.isCooldown = false;

    const image = new Image();
    image.src = `./img/satellite1.png`;
    image.onload = () => {
      const scale = 0.1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: game.player.position.x - game.player.width,
        y: game.player.position.y - game.player.height,
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
    if (this.position.x >= game.player.position.x + game.player.width) {
      this.velocity.x = -3;
    } else if (this.position.x <= game.player.position.x - game.player.width) {
      this.velocity.x = 3;
    }
  }

  healShip() {
    if (this.ability === 'Heal') {
      game.player.lives += 1;
      this.ability = null;
    }
  }

  cosmonautsCollect() {
    if (this.ability !== 'collectCosmonauts') return;
    for (const [index, cosmonaut] of game.cosmonauts.entries()) {
      if (!game.player.collideWith(cosmonaut)) {
        getPoints();
        game.cosmonauts.splice(index, 1);
      }
    }
  }

  coinDoubling() {
    if (this.ability === 'Double Coins') getCoins();
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
      const actionTime = 20000 + 250 * game.levelPet;
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
    this.coinDoubling();
    this.position.x += this.velocity.x;
  }
}
