'use strict';

class Game {
  constructor() {
    this.player = new Player();
    this.pet = new Pet();
    this.boss = new Boss();
    this.levelMultiplier = 2 || localStorage['levelMultiplier'];
    this.levelPetUpgrade = 0 || localStorage['levelPetUpgrade'];
    this.bestScore = 0 || localStorage['bestScore'];
    this.coins = 0 || +localStorage['coins'];
    this.speed = 1;
    this.frames = 0;
    this.score = 0;
    this.adrenalineCooldown = false;
    this.counterMission = 0;
    this.stones = [];
    this.particles = [];
    this.cosmonauts = [];
    this.powerups = [];
    this.shots = [];
  }

  speedUp() {
    const SPEED_BOOST = 0.1;
    if (this.frames % 500 === 0) this.speed += SPEED_BOOST;
  }

}

class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.lives = 3;
    this.ammoType = 'APShell';
    this.ammoDamage = 15;
    this.ammoColor = 'red';
    this.isAdrenalineUsed = false;
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
        y: canvas.height / 2 + this.height + 250,  // magic
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
    if (keys.a.pressed && this.position.x + canvas.width > canvas.width) this.velocity.x = -5;
    else if (keys.d.pressed && this.position.x + this.width < canvas.width) this.velocity.x = 5;
    else this.velocity.x = 0;
  }

  playerDie() {
    if (game.player.lives === 0) lose('bossAnnounce', 'abilityPet', 'canvas', 'ammoTypes', 'reloadGun', 'consumables');
  }

  shoot() {
    const RELOAD_TIME = 3;
    const RELOAD_TIME_ADRENALINE = 2;
    if (progressBar.value === RELOAD_TIME || (progressBar.value === RELOAD_TIME_ADRENALINE && this.isAdrenalineUsed)) {
      progressBar.value = 0;
      game.shots.push(new Shot({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y,
        },
        velocity: {
          x: 0,
          y: -5 * game.speed,
        },
        radius: 5,
        color: this.ammoColor,
      }));
      changeProgressReload();
    }
  }

  deleteShots() {
    for (const [index, shot] of game.shots.entries()) {
      if (shot.position.x >= canvas.height) game.shots.splice(index, 1);
    }
  }

  removeLives() {
    if (this.powerUp !== 'Shield' && game.pet.ability !== 'Shield') this.lives--;
  }

  update() {
    if (this.image) {
      this.draw();
      this.move();
      this.deleteShots();
      this.playerDie();
      this.position.x += this.velocity.x;
    }
  }
}

class Boss {
  constructor() {
    this.velocity = {
      x: 5,
      y: 3,
    };
    this.health = 200;
    this.scale = 0.35;
    const image = new Image();
    image.src = './img/boss.png';
    image.onload = () => {
      this.image = image;
      this.width = image.width * this.scale;
      this.height = image.height * this.scale;
      this.position = {
        x: randomNum(canvas.width),
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
      this.position.x + canvas.width < canvas.width
    ) this.velocity.x = -this.velocity.x;

    if (
      this.position.y + this.height > canvas.height ||
      this.position.y + canvas.height < canvas.height
    ) this.velocity.y = -this.velocity.y;
  }

  shoot() {
    if (game.frames % 100 === 0) {
      game.shots.push(new Shot({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 7 * game.speed,
        },
        radius: 5,
        color: 'white',
      }));
    }
  }

  enableAnnounce() {
    if (game.boss.health === 0) toggleScreen(false, 'bossAnnounce');
    else toggleScreen(true, 'bossAnnounce');
  }

  deleteBoss() {
    if (this.health <= 0) {
      game.coins += 20;
      game.boss = undefined;
      if (dailyMission.innerText === 'Kill 5 Bosses') game.counterMission++;
    }
  }

  update() {
    if (this.image) {
      this.draw();
      this.move();
      this.shoot();
      this.enableAnnounce();
      this.deleteBoss();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }
}

class Stone {
  constructor(scale, { position }) {
    const image = new Image();
    image.src = `./img/mars.png`;
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
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }


  move() {
    this.position.y += 3 * game.speed;
  }

  delete() {
    if (this.position.y >= canvas.height) game.stones.splice(0, 1);
  }

  update() {
    if (this.image) {
      this.draw();
      this.move();
      this.delete();
    }
  }
}

class Cosmonaut extends Stone {
  constructor(scale, { position }) {
    super(scale, position);

    const image = new Image();
    image.src = `./img/cosmonaut.png`;
    image.onload = () => {
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = position;
    };
  }

  delete() {
    if (this.position.y >= canvas.height) game.cosmonauts.splice(0, 1);
  }
}

class Pet {
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
    if (this.position.x >= game.player.position.x + game.player.width) this.velocity.x = -3;
    else if (this.position.x <= game.player.position.x - game.player.width) this.velocity.x = 3;
  }

  healShip() {
    if (this.ability === 'Heal') {
      game.player.lives += 1;
      this.ability = null;
    }
  }

  cosmonautsCollect() {
    for (const [index, cosmonaut] of game.cosmonauts.entries()) {
      if (!checkCollision({ object1: cosmonaut, object2: game.player })) {
        getPoints();
        game.cosmonauts.splice(index, 1);
      }
    }
  }

  coinDoubling() {
    if (this.ability === 'Double Coins') getCoins();
  }

  setCooldown() {
    if (this.isCooldown) setTimeout(() => {
      this.isCooldown = false;
      abilityPet.innerHTML = 'Ability of your Pet is Ready';
    }, 30000);
  }

  getAbility() {
    if (!this.isCooldown) {
      this.isCooldown = true;
      abilityPet.innerHTML = 'Ability of your Pet is NOT Ready';
      this.ability = this.abilityMenu;
      setTimeout(() => {
        this.ability = null;
      }, 2000 + 250 * game.levelPetUpgrade); // 2 seconds + 0.25 seconds for each upgrade
    }
  }

  update() {
    if (this.image) {
      this.draw();
      this.move();
      this.setCooldown();
      this.healShip();
      if (this.ability === 'collectCosmonauts') this.cosmonautsCollect();
      this.coinDoubling();
      this.position.x += this.velocity.x;
    }
  }
}

class Particle {
  constructor({ position, velocity, radius, color }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
  }

  draw() {
    ctx.globalAlpha = this.opacity;
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

class Shot extends Particle {
  constructor({ position, velocity, radius, color }) {
    super({ position, velocity, radius, color });
  }

  deleteShots() {
    if (
      this.position.y >= canvas.height ||
      this.position.y + canvas.height < canvas.height
    ) game.shots.splice(0, 1);
  }

  update() {
    this.draw();
    this.deleteShots();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class PowerUp {
  constructor(scale, { position }) {
    this.position = position;
    this.velocity = {
      x: 0,
      y: 5,
    };

    const image = new Image();
    image.src = `./img/powerup.png`;
    image.onload = () => {
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = position;
    };
  }

  draw() {
    if (this.image) ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  move() {
    this.position.y += this.velocity.y * game.speed;
  }

  delete() {
    if (this.position.y >= canvas.height) game.powerups.splice(0, 1);
  }

  update() {
    this.draw();
    this.move();
    this.delete();
  }
}
