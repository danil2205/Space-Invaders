'use strict';

class Game {
  constructor() {
    this.player = new Player();
    this.pet = new Pet();
    this.levelMultiplier = 2;
    this.levelPetUpgrade = 0;
    this.coins = 0;
    this.speed = 1;
    this.frames = 0;
    this.score = 0;
    this.counterMission = 0;
    this.stones = [];
    this.bosses = [];
    this.particles = [];
    this.cosmonauts = [];
    this.powerups = [];
    this.shots = [];
  }

  speedUp() {
    const SPEED_BOOST = 0.1;
    if (this.frames % 500 === 0) this.speed += SPEED_BOOST;
  }

  loadProgress() {
    if (localStorage['bestScore'] !== undefined) {
      bestScoreText.innerHTML = localStorage['bestScore'];
      this.coins = +localStorage['coins'];
    }
    if (localStorage['multiplierLevel'] > 0) {
      this.levelMultiplier = localStorage['multiplierLevel'];
      costMulti.innerText = +localStorage['multiplierPrice'];
    }
    if (localStorage['petLevel'] > 0) {
      this.levelPetUpgrade = localStorage['petLevel'];
      costPetUpgrade.innerText = +localStorage['petPrice'];
    }
  }

  spawnBoss() {
    const framesToSpawn = 10000;
    if (game.frames % framesToSpawn === 0) {
      game.bosses.push(new Boss());
    }
  }

  updateObjects() {
    const arrayOfObjects = [
      this.particles,
      this.bosses,
      this.cosmonauts,
      this.powerups,
      this.stones,
    ];
    this.player.update();
    this.pet.update();
    updateShots();
    for (const object of arrayOfObjects) updateObject(object);
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
    if (keys.a.pressed && this.position.x + canvas.width > canvas.width) {
      this.velocity.x = -5;
    } else if (keys.d.pressed && this.position.x + this.width < canvas.width) {
      this.velocity.x = 5;
    } else this.velocity.x = 0;
  }

  playerDie() {
    if (game.player.lives === 0) lose();
  }

  shoot() {
    if (progressBar.value === progressBar.max && game.bosses.length !== 0) {
      progressBar.value = 0;
      game.shots.push(new Shot());
      changeProgressReload();
    }
  }

  removeLives() {
    if (this.powerUp !== 'Shield' && game.pet.ability !== 'Shield') this.lives--;
  }

  update() {
    if (this.image) {
      this.draw();
      this.move();
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
    const image = new Image();
    image.src = './img/boss.png';
    image.onload = () => {
      const scale = 0.35;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
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

  deleteBoss() {
    if (this.health <= 0 || game.bosses.length === 0) {
      game.coins += 20;
      game.bosses = [];
      toggleScreen(false, 'bossAnnounce');
      if (dailyMission.innerText === 'Kill 1 Bosses') game.counterMission++;
    } else {
      document.querySelector('#bossHP').style.width = game.bosses[0].health;
      toggleScreen(true, 'bossAnnounce');
    }
  }

  update() {
    if (this.image) {
      this.draw();
      this.move();
      this.deleteBoss(); // bug: after collision with player, announce doesn't disappear
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
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
    for (const [index, cosmonaut] of game.cosmonauts.entries()) {
      if (!checkCollision({
        object1: cosmonaut,
        object2: game.player
      })) {
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
  constructor() {
    super();
    this.position = {
      x: game.player.position.x + game.player.width / 2,
      y: game.player.position.y,
    };
    this.velocity = {
      x: 0,
      y: -5 * game.speed,
    };
    this.radius = 5;
    this.color = game.player.ammoColor;
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
    if (this.image) {
      ctx.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }
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
