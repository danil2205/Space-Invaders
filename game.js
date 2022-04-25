'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const scoreText = document.querySelector('#score');
const scoreGameOver = document.querySelector('#scoreGameOver');
const bestScoreText = document.querySelector('#bestScore');
const announcementText = document.querySelector('#announcementText');
const coinText = document.querySelector('#coins');
const audio = document.querySelector('#audio');
audio.volume = 0.1;

canvas.width = 850;
canvas.height = 960;

let coins = 0;
let levelMultiplier = 2;
let speed = 1;
let frames = 0;
let score = 0;
let bestScore = 0;
let player = new Player();
let stones = [];
let particles = [];
let cosmonauts = [];
let powerups = [];
const powerupList = ['Shield', 'Score Multiplier', 'Coin Multiplier'];
const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};
const game = {
  active: false,
  menu: true,
  pause: false,
  over: false,
};

const toggleScreen = (toggle, ...ids) => {
  for (const id of ids) {
    const element = document.querySelector(`#${id}`);
    const display = toggle ? 'block' : 'none';
    element.style.display = display;
  }
};

const countDown = () => {
  const countDownTimer = document.querySelector('#countDownTimer');
  toggleScreen(true, 'countdown');
  setTimeout(() => countDownTimer.textContent = '2', 1000);
  setTimeout(() => countDownTimer.textContent = '1', 2000);
  countDownTimer.textContent = '3';
};

const pause = () => {
  if (!game.active && !game.menu && !game.over) {
    toggleScreen(false, 'pause');
    countDown();
    setTimeout(() => {
      game.active = true;
      game.pause = false;
      toggleScreen(false, 'countdown');
      animate();
    }, 3000);
  } else if (game.active && !game.menu && !game.over) {
    game.active = false;
    game.pause = true;
    toggleScreen(true, 'pause');
  }
};

const spawnObject = (framesToSpawn, arrayName, className, scale) => {
  if (frames % Math.floor(framesToSpawn / speed) === 0) arrayName.push(new className(scale, {
    position: {
      x: Math.floor(Math.random() * canvas.width),
      y: 0,
    }
  }));
};

const spawnObjects = () => {
  const FRAMES_LIL_STONE = 50;
  const FRAMES_BIG_STONE = 150;
  const FRAMES_COSMONAUT = 80;
  const FRAMES_POWERUP = 1000;

  spawnObject(FRAMES_LIL_STONE, stones, Stone, 0.02);
  spawnObject(FRAMES_BIG_STONE, stones, Stone, 0.07);
  spawnObject(FRAMES_COSMONAUT, cosmonauts, Cosmonaut, 0.02);
  spawnObject(FRAMES_POWERUP, powerups, PowerUp, 0.1);
};

const collectCosmonauts = (LEFT_PLAYER_SIDE, RIGHT_PLAYER_SIDE, PLAYER_HEIGHT) => {
  for (const [index, cosmonaut] of cosmonauts.entries()) {
    cosmonaut.update();
    if (cosmonaut.image && !game.over) {
      const LEFT_COSMONAUT_SIDE = cosmonaut.position.x;
      const RIGHT_COSMONAUT_SIDE = cosmonaut.position.x + cosmonaut.width;
      const COSMONAUT_HEIGHT = cosmonaut.position.y + cosmonaut.height;

      if (
        RIGHT_PLAYER_SIDE >= LEFT_COSMONAUT_SIDE &&
        LEFT_PLAYER_SIDE <= RIGHT_COSMONAUT_SIDE &&
        PLAYER_HEIGHT <= COSMONAUT_HEIGHT
      ) {
        score += (player.powerUp === 'Score Multiplier') ? levelMultiplier : 1;
        scoreText.innerHTML = score;
        cosmonauts.splice(index, 1);
      }
    }
  }
};

const changeBestScore = () => {
  if (score > bestScore && game.over) {
    bestScore = score;
    bestScoreText.innerHTML = bestScore;
  }
};

const lose = () => {
  if (player.powerUp !== 'Shield' && !game.over) {
    player.opacity = 0;
    game.over = true;
    setTimeout(() => {
      game.active = false;
      scoreGameOver.innerHTML = score;
      toggleScreen(false, 'canvas');
      toggleScreen(true, 'screen');
    }, 2000);
  }
};

const backgroundStars = () => {
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle({
      position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      },
      velocity: {
        x: 0,
        y: 2,
      },
      radius: Math.random() * 3,
      color: 'white',
    }));
  }
};
backgroundStars();

const updateBackgroundStars = () => {
  for (const [index, particle] of particles.entries()) {
    if (particle.position.y - particle.radius >= canvas.height) particle.position.y = -particle.radius;
    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(index, 1);
      });
    } else {
      particle.update();
    }
  }
};

const updateStone = (LEFT_PLAYER_SIDE, RIGHT_PLAYER_SIDE, PLAYER_HEIGHT) => {
  for (const stone of stones) {
    stone.update();
    if (stone.image) {
      const LEFT_SIDE_STONE = stone.position.x + stone.width / 15;
      const RIGHT_SIDE_STONE = stone.position.x + stone.width / 1.2;
      const STONE_HEIGHT = stone.position.y + stone.height;

      // collision with stone
      if (
        RIGHT_PLAYER_SIDE >= LEFT_SIDE_STONE &&
        LEFT_PLAYER_SIDE <= RIGHT_SIDE_STONE &&
        PLAYER_HEIGHT <= STONE_HEIGHT
      ) lose();
    }
  }
};

const delPowerUp = () => {
  const ACTION_TIME = 5000;
  setTimeout(() => {
    toggleScreen(false, 'announcement');
    player.powerUp = null;
  }, ACTION_TIME);
};

const setPowerUp = () => {
  const randomPowerUp = powerupList[Math.floor(Math.random() * 3)];
  player.powerUp = randomPowerUp;
  if (player.powerUp !== null) {
    announcementText.textContent = `${player.powerUp} Activated!`;
    toggleScreen(true, 'announcement');
  }
  delPowerUp();
};

const updatePowerUps = (LEFT_PLAYER_SIDE, RIGHT_PLAYER_SIDE, PLAYER_HEIGHT) => {
  for (const [index, powerup] of powerups.entries()) {
    powerup.update();
    if (powerup.image) {
      const LEFT_POWERUP_SIDE = powerup.position.x;
      const RIGHT_POWERUP_SIDE = powerup.position.x + powerup.width;
      const POWERUP_HEIGHT = powerup.position.y + powerup.height;

      if (
        RIGHT_PLAYER_SIDE >= LEFT_POWERUP_SIDE &&
        LEFT_PLAYER_SIDE <= RIGHT_POWERUP_SIDE &&
        PLAYER_HEIGHT <= POWERUP_HEIGHT
      ) {
        setPowerUp();
        powerups.splice(index, 1);
      }
    }
  }
};

const getCoins = () => {
  if (frames % 150 === 0) {
    const AMOUNT_WITHOUT_MULTIPLIER = 1;
    const AMOUNT_WITH_MULTIPLIER = 2;
    coins += (player.powerUp === 'Coin Multiplier') ? AMOUNT_WITH_MULTIPLIER : AMOUNT_WITHOUT_MULTIPLIER;
    coinText.innerText = coins;
  }
};

const animate = () => {
  if (!game.active) return;
  requestAnimationFrame(animate);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  const LEFT_PLAYER_SIDE = player.position.x + player.width / 3.5;
  const RIGHT_PLAYER_SIDE = player.position.x + player.width / 1.7;
  const PLAYER_HEIGHT = player.position.y;

  if (frames % 500 === 0) speed += 0.1; // speed up
  spawnObjects();
  updateBackgroundStars();
  getCoins();
  collectCosmonauts(LEFT_PLAYER_SIDE, RIGHT_PLAYER_SIDE, PLAYER_HEIGHT);
  updateStone(LEFT_PLAYER_SIDE, RIGHT_PLAYER_SIDE, PLAYER_HEIGHT);
  updatePowerUps(LEFT_PLAYER_SIDE, RIGHT_PLAYER_SIDE, PLAYER_HEIGHT);
  changeBestScore()
  frames++;
};
animate();

const refreshGame = () => {
  player = new Player();
  stones = [];
  particles = [];
  cosmonauts = [];
  powerups = [];
  speed = 1;
  frames = 0;
  score = 0;
  scoreText.innerHTML = score;
  game.active = true;
  game.over = false;
  backgroundStars();
  if (!game.menu) {
    toggleScreen(false, 'screen');
    toggleScreen(true, 'canvas');
    animate();
  }
};

window.addEventListener('keydown', event => {
  switch (event.key) {
  case 'a':
    keys.a.pressed = true;
    break;
  case 'd':
    keys.d.pressed = true;
    break;
  case 'Escape':
    if (!game.pause) pause();
    break;
  }
});

window.addEventListener('keyup', event => {
  switch (event.key) {
  case 'a':
    keys.a.pressed = false;
    break;
  case 'd':
    keys.d.pressed = false;
    break;
  }
});
