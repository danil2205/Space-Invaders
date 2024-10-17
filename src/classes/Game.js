'use strict';

import { Player } from './Player.js';
import { Pet } from './Pet.js';
import { GameObject } from './GameObject.js';
import { Boss } from './Boss.js';
import { Particle } from './Particle.js';
import { canvas, ctx, gameGUI, randomNum, toggleScreen, missionsGUI } from '../utils.js';

export class Game {
  constructor() {
    this.player = new Player(this);
    this.pet = new Pet(this);
    this.boss = null;
    this.levelMultiplier = 2;
    this.levelPet = 1;
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

    gameGUI.progressBar.value = gameGUI.progressBar.max

    this.arrayOfGameObjects = {
      'particles': this.particles,
      'shots': this.shots,
      'cosmonauts': this.cosmonauts,
      'powerups': this.powerups,
      'stones': this.stones,
    };

    this.spawnConfig = [
      { framesToSpawn: 50, name: 'mars', array: this.stones, scale: 0.02 },
      { framesToSpawn: 150, name: 'mars', array: this.stones, scale: 0.07 },
      { framesToSpawn: 80, name: 'cosmonaut', array: this.cosmonauts, scale: 0.02 },
      { framesToSpawn: 1000, name: 'powerup', array: this.powerups, scale: 0.1 },
    ];

    this.powerupList = ['Shield', 'Score Multiplier', 'Coin Multiplier'];

    this.gameStates = { active: false, menu: true, over: false, };

    this.animate = this.animate.bind(this);
    this.backgroundStars();
  }

  speedUp() {
    const speedBoost = 0.1;
    if (this.frames % 500 === 0) this.speed += speedBoost;
  }

  spawnObject(framesToSpawn, nameObject, arrayObjects, scale) {
    if (this.frames % Math.floor(framesToSpawn / this.speed) === 0) {
      arrayObjects.push(new GameObject(nameObject, arrayObjects, scale, this.speed, {
        position: {
          x: randomNum(canvas.width),
          y: 0,
        }
      }));
    }
  }

  spawnObjects() {
    if (this.pet.ability !== 'No Enemies') {
      this.spawnConfig.slice(0, 2).forEach((config) =>
        this.spawnObject(config.framesToSpawn, config.name, config.array, config.scale)
      );
      this.spawnBoss();
    }

    this.spawnConfig.slice(2).forEach((config) =>
      this.spawnObject(config.framesToSpawn, config.name, config.array, config.scale)
    );
  }

  spawnBoss() {
    const framesToSpawn = 2000;
    if (this.frames !== 0 && this.frames % framesToSpawn === 0 && !this.boss) {
      this.boss = new Boss(this);
      document.querySelector('#bossHP').style.width = this.boss.health;
      toggleScreen(true, 'bossAnnounce');
    }
  }

  isBossAlive() {
    if (this.boss && this.boss.health <= 0) {
      this.coins += 20;
      if (missionsGUI.dailyMission.innerText === 'Kill 1 Boss') this.counterMission++;
      this.boss = null;
      toggleScreen(false, 'bossAnnounce');
    }
  }

  updateShots() {
    const boss = this.boss;
    for (const [index, shot] of this.shots.entries()) {
      shot.update();

      if (boss && shot.isPlayerShot && shot.collideWith(boss)) {
        boss.getDamage(this.player.ammoDamage);
        this.shots.splice(index, 1);
      }

      if (!shot.isPlayerShot && shot.collideWith(this.player)) {
        this.player.removeLives();
        this.shots.splice(index, 1);
      }
    }
  }

  playAudio(nameAudio) {
    const audio = new Audio();
    audio.src = `./music/${nameAudio}.mp3`;
    audio.volume = 0.1;
    audio.play();
  }

  backgroundStars() {
    for (let i = 0; i < 100; i++) this.particles.push(new Particle());
  }

  delPowerUp() {
    const actionTime = 5000;
    setTimeout(() => {
      toggleScreen(false, 'announcement');
      this.player.powerUp = null;
    }, actionTime);
  }

  setPowerUp() {
    const announcementText = document.querySelector('#announcementText');
    const amountOfPowers = this.powerupList.length;
    const randomPowerUp = this.powerupList[randomNum(amountOfPowers)];
    this.player.powerUp = randomPowerUp;
    if (this.player.powerUp !== null) {
      announcementText.textContent = `${this.player.powerUp} Activated!`;
      toggleScreen(true, 'announcement');
    }
    this.delPowerUp();
  };

  getCoins() {
    const coinText = document.querySelector('#coins');
    if (this.frames % 150 === 0) {
      const coinsWithoutPower = 1;
      const coinsWithPower = 2;
      if (
        this.player.powerUp === 'Coin Multiplier' ||
        this.pet.ability === 'Double Coins'
      ) {
        this.coins += coinsWithPower;
      } else {
        this.coins += coinsWithoutPower;
      }
      coinText.innerText = this.coins;
    }
  };

  getPoints() {
    const scoreText = document.querySelector('#score');
    if (missionsGUI.dailyMission.innerText === 'Collect 10 Cosmonauts') this.counterMission++;
    if (this.player.powerUp === 'Score Multiplier') {
      this.score += this.levelMultiplier;
    } else {
      this.score += 1;
    }
    scoreText.innerHTML = this.score;
  };

  changeBestScore() {
    if (this.score > gameGUI.bestScore.innerHTML) {
      gameGUI.bestScore.innerHTML = this.score;
    }
  };

  getCollideFunctions(nameArray) {
    const collideFunctions = {
      'cosmonauts': () => this.getPoints(),
      'stones': () => this.player.removeLives(),
      'powerups': () => this.setPowerUp(),
    };

    return collideFunctions[nameArray] || null;
  };

  updateObject(nameArray) {
    const arrOfObjects = this.arrayOfGameObjects[nameArray]

    for (const [index, object] of arrOfObjects.entries()) {
      object.update();
      if (this.player.collideWith(object)) {
        const collideFunction = this.getCollideFunctions(nameArray);
        if (collideFunction) {
          arrOfObjects.splice(index, 1);
          collideFunction();
        }
      }
    }
  };

  updateObjects() {
    this.player.update();
    this.pet.update();
    this.updateShots();
    this.isBossAlive();
    this.boss?.update();
    for (const object of Object.keys(this.arrayOfGameObjects)) {
      this.updateObject(object);
    }
  }

  showLives() {
    gameGUI.imgLives.innerHTML = '';
    for (let i = 0; i < this.player.lives; i++) {
      const image = new Image();
      gameGUI.imgLives.append(image);
    }
  };

  animate() {
    if (!this.gameStates.active) return;
    requestAnimationFrame(this.animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.updateObjects();
    this.speedUp();
    this.spawnObjects();
    this.getCoins();
    this.frames++;
  }

  pause() {
    if (!this.gameStates.active && !this.gameStates.menu) {
      toggleScreen(false, 'pause');
      this.countDown();
    } else if (this.gameStates.active && !this.gameStates.menu) {
      this.playAudio('pause');
      this.gameStates.active = false;
      toggleScreen(true, 'pause');
    }
  }

  countDown() {
    const countDownTimer = document.getElementById('countDownTimer');
    const DELAY = 1000;
    const defaultValue = 3;
    toggleScreen(true, 'countdown');

    const timer = setInterval(() => {
      if (countDownTimer.innerHTML === '0') {
        clearInterval(timer);
        countDownTimer.innerHTML = defaultValue;
        this.gameStates.active = true;
        toggleScreen(false, 'countdown');
        this.animate();
      }
      countDownTimer.innerHTML--;
    }, DELAY);
  };

  lose() {
    const scoreGameOver = document.querySelector('#scoreGameOver');
    if (!this.gameStates.over) {
      this.playAudio('boom');
      this.changeBestScore();
      this.gameStates.over = true;
      this.gameStates.active = false;
      scoreGameOver.innerHTML = this.score;
      toggleScreen(false, 'gameInterface');
      toggleScreen(true, 'screen');
    }
  };

}



