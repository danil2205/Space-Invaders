'use strict';

import { Player } from './Player.js';
import { Pet } from './Pet.js';

export class Game {
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



