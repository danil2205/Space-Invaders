'use strict';

const canvasPos = canvas.getBoundingClientRect();

class Game {
  constructor() {
    this.player = new Player();
    this.pet = new Pet();
    this.boss = null;
    this.levelMultiplier = 2;
    this.levelPet = 0;
    this.coins = 0;
    this.speed = 1;
    this.frames = 0;
    this.score = 0;
    this.counterMission = 0;
    this.stones = [];
    this.particles = [];
    this.cosmonauts = [];
    this.powerups = [];
    this.shots = [];
    this.arrayOfGameObjects = {
      'particles': this.particles,
      'shots': this.shots,
      'cosmonauts': this.cosmonauts,
      'powerups': this.powerups,
      'stones': this.stones,
    };
  }

  speedUp() {
    const speedBoost = 0.1;
    if (this.frames % 500 === 0) this.speed += speedBoost;
  }

  spawnBoss() {
    const framesToSpawn = 10000;
    // if (this.frames !== 0 && this.frames % framesToSpawn === 0 && !this.boss) {
    if (this.frames % framesToSpawn === 0 && !this.boss) {
      this.boss = new Boss();
      document.querySelector('#bossHP').style.width = this.boss.health;
      toggleScreen(true, 'bossAnnounce');
    }
  }

  isBossAlive() {
    if (this.boss && this.boss.health <= 0) {
      this.coins += 20;
      this.boss = null;
      toggleScreen(false, 'bossAnnounce');
    }
  }

  updateObjects() {
    this.player.update();
    this.pet.update();
    updateShots();
    this.isBossAlive();
    if (this.boss) this.boss.update();
    for (const object of Object.keys(this.arrayOfGameObjects)) updateObject(object);
  }
}

class Player {
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

class Boss {
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

class Particle {
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

class Shot extends Particle {
  constructor(position,velocity, color, isPlayerShot = false) {
    super();
    this.position = { x: position.x, y: position.y};
    this.velocity = { x: velocity.x, y: velocity.y};
    this.radius = 5;
    this.color = color;
    this.isPlayerShot = isPlayerShot;
  }

  deleteShots() {
    if (
      this.position.y >= canvas.height ||
      this.position.y < canvasPos.top
    ) game.shots.splice(0, 1);
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

class GameObject {
  constructor(nameObject, arrayObjects, scale, { position }) {
    this.velocity = {
      x: 0,
      y: 3,
    };
    this.arrayObjects = arrayObjects;
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
    if (this.position.y >= canvas.height) this.arrayObjects.splice(0, 1);
  }

  update() {
    this.draw();
    this.move();
    this.delete();
  }
}
