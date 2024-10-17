import { Shot } from './Shot.js';
import { canvas, canvasPos, ctx, gameGUI, toggleAudio } from '../utils.js';

export class Player {
  constructor(game) {
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
    this.game = game;

    this.keys = {
      a: { pressed: false },
      d: { pressed: false },
    };

    this.ammoCharacteristics = {
      APShell: { damage: 15, color: 'red' },
      HEASShell: { damage: 10, color: 'yellow' },
      HEShell: { damage: 30, color: 'orange' },
    };

    this.ammoTypesImage = [gameGUI.APShell, gameGUI.HEASShell, gameGUI.HEShell];

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


    this.setupEventListeners();
  }

  setupEventListeners() {
    this.keyDownHandler = this.handleKeyDown.bind(this);
    this.keyUpHandler = this.handleKeyUp.bind(this);

    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);
  }

  removeEventListeners() {
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);
  }

  handleKeyDown({ code }) {
    const keyFunctions = {
      'KeyA': () => this.keys.a.pressed = true,
      'KeyD': () => this.keys.d.pressed = true,
      'KeyX': () => this.game.pet.getAbility(),
      'Escape': () => this.game.pause(),
      'KeyM': () => toggleAudio(),
      'Space': () => this.shoot(),
      'Digit1': () => this.changeAmmo('APShell', gameGUI.APShell),
      'Digit2': () => this.changeAmmo('HEASShell', gameGUI.HEASShell),
      'Digit3': () => this.changeAmmo('HEShell', gameGUI.HEShell),
      'Digit4': () => this.useAdrenaline(),
    };

    if (keyFunctions[code]) {
      try {
        keyFunctions[code]();
      } catch {
        return true;
      }
    }
  }

  handleKeyUp({ code }) {
    switch (code) {
      case 'KeyA':
        this.keys.a.pressed = false;
        break;
      case 'KeyD':
        this.keys.d.pressed = false;
        break;
    }
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
    if (this.keys.a.pressed && this.position.x > canvasPos.right) {
      this.velocity.x = -5;
    } else if (this.keys.d.pressed && this.position.x + this.width < canvas.width) {
      this.velocity.x = 5;
    } else this.velocity.x = 0;
  }

  playerDie() {
    if (this.lives === 0) this.game.lose();
  }

  changeProgressReload() {
    const DELAY = 50;
    if (gameGUI.progressBar.value >= gameGUI.progressBar.max) return;
    gameGUI.progressBar.value += 0.05;
    setTimeout(() => this.changeProgressReload() , DELAY);
  }

  changeAmmo(ammoType, selectedAmmo) {
    for (const ammoImage of this.ammoTypesImage) ammoImage.style.border = '';
    selectedAmmo.style.border = '1px solid white';
    this.ammoDamage = this.ammoCharacteristics[ammoType].damage;
    this.ammoColor = this.ammoCharacteristics[ammoType].color;
  }

  reloadAdrenaline() {
    const cooldown = 100000;
    setTimeout(() => {
      this.adrenalineCooldown = false;
    }, cooldown);
  }

  useAdrenaline() {
    if (this.adrenalineCooldown) return;
    const actionTime = 10000;
    gameGUI.progressBar.max--;
    this.adrenalineCooldown = true;

    setTimeout(() => {
      gameGUI.progressBar.max++;
    }, actionTime);

    this.reloadAdrenaline();
  };

  shoot() {
    if (gameGUI.progressBar.value === gameGUI.progressBar.max) {
      gameGUI.progressBar.value = 0;
      this.game.shots.push(
        new Shot(
          this.game.shots,
          {
            x: this.position.x + this.width / 2,
            y: this.position.y,
          },
          {
            x: 0,
            y: -5 * this.game.speed,
          },
          this.ammoColor,
          true
        )
      );
      this.changeProgressReload();
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

  setOpacity = (opacity) => () => {
    this.opacity = opacity;
  };

  removeLives() {
    if (this.powerUp === 'Shield' || this.game.pet.ability === 'Shield') return;
    this.lives--;
    const flashDelay = 500;
    setTimeout(this.setOpacity(0.1), 0);
    setTimeout(this.setOpacity(1), flashDelay);
    gameGUI.imgLives.removeChild(gameGUI.imgLives.lastElementChild);
  }

  update() {
    this.draw();
    this.move();
    this.playerDie();
    this.position.x += this.velocity.x;
  }
}
