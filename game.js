'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const scoreText = document.querySelector('#score');
const scoreGameOver = document.querySelector('#scoreGameOver');
const bestScoreText = document.querySelector('#bestScore');
const announcementText = document.querySelector('#announcementText');

canvas.width = 850;
canvas.height = 960;


let speed = 1;
let frames = 0;
let score = 0;
let bestScore = 0;
let player = new Player();
let stones = [];
let particles = [];
let cosmonauts = [];
let powerups = [];
const powerupList = ['Shield', 'X2 Score'];
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

function toggleScreen(id, toggle) {
  const element = document.querySelector(`#${id}`);
  const display = toggle ? 'block' : 'none';
  element.style.display = display;
}

function countDown() {
  const countDownTimer = document.querySelector('#countDownTimer');
  toggleScreen('countdown', true);
  setTimeout(() => countDownTimer.textContent = '2', 1000);
  setTimeout(() => countDownTimer.textContent = '1', 2000);
  countDownTimer.textContent = '3';
}

function play() {
  toggleScreen('menu', false);
  toggleScreen('canvas', true);
  toggleScreen('allScore', true);
  game.active = true;
  game.menu = false;
  animate();
}

function settings() {
  toggleScreen('settings', true);
  if (game.menu) return toggleScreen('menu', false);
  toggleScreen('pause', false);
}

function back() {
  toggleScreen('settings', false);
  if (game.menu) return toggleScreen('menu', true);
  toggleScreen('pause', true);
}

function exit() {
  toggleScreen('pause', false);
  toggleScreen('canvas', false);
  toggleScreen('allScore', false);
  toggleScreen('screen', false);
  toggleScreen('menu', true);
  game.menu = true;
  game.active = false;
  refreshGame();
}

function pause() {
  if (!game.active && !game.menu && !game.over) {
    toggleScreen('pause', false);
    countDown();
    setTimeout(() => {
      game.active = true;
      game.pause = false;
      toggleScreen('countdown', false);
      animate();
    }, 3000);

  } else if (game.active && !game.menu && !game.over) {
    game.active = false;
    game.pause = true;
    toggleScreen('pause', true);
  }
}


function spawnObjects() {
  if (frames % Math.floor(50 / speed) === 0) stones.push(new Stone(0.02, {
    position: {
      x: Math.floor(36 + Math.random() * canvas.width) - 36, //  36 === stone.width
      y: Math.floor(Math.random() * 10),
    }
  }));

  if (frames % 150 === 0) stones.push(new Stone(0.07, {
    position: {
      x: Math.floor(84 + Math.random() * canvas.width) - 84, //  84 === stone.width
      y: Math.floor(Math.random() * 10),
    }
  }));

  if (frames % Math.floor(80 / speed)  === 0) cosmonauts.push(new Cosmonaut(0.02, {
    position: {
      x: Math.floor(50 + Math.random() * canvas.width) - 50, // 50 === cosmonauts.width
      y: Math.floor(Math.random() * 5),
    }
  }));

  if (frames % 1000 === 0) powerups.push(new PowerUp({
    position: {
      x: Math.floor(5 + Math.random() * canvas.width) - 5,
      y: 0,
    },
  }));

  if (frames % 250 === 0) speed += 0.1; // speed up stones and cosmonauts
}

function collectCosmonauts() {
  cosmonauts.forEach((cosmonaut, index) => {
    cosmonaut.update();
    if (cosmonaut.image && !game.over) {
      const LEFT_COSMONAUT_SIDE = cosmonaut.position.x;
      const RIGHT_COSMONAUT_SIDE = cosmonaut.position.x + cosmonaut.width;
      const COSMONAUT_HEIGHT = cosmonaut.position.y + cosmonaut.height;

      const LEFT_PLAYER_SIDE = player.position.x + player.width / 3.5; // magic number D:
      const RIGHT_PLAYER_SIDE = player.position.x + player.width / 1.7; // magic number D:
      const PLAYER_HEIGHT = player.position.y;

      if (RIGHT_PLAYER_SIDE >= LEFT_COSMONAUT_SIDE &&
                LEFT_PLAYER_SIDE  <= RIGHT_COSMONAUT_SIDE &&
                PLAYER_HEIGHT <= COSMONAUT_HEIGHT) {
        score += 1;
        if (player.powerUp === 'X2 Score') score += 1;
        scoreText.innerHTML = score;
        cosmonauts.splice(index, 1);
      }
    }
  });
}

function changeBestScore() {
  if (score > bestScore) {
    bestScore = score;
    bestScoreText.innerHTML = bestScore;
  }
}

function refreshGame() {
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
    toggleScreen('screen', false);
    toggleScreen('canvas', true);
    animate();
  }
}

function lose() {
  if (player.powerUp !== 'Shield') {
    player.opacity = 0;
    game.over = true;
    setTimeout(() => {
      game.active = false;
      scoreGameOver.innerHTML = score;
      toggleScreen('canvas', false);
      toggleScreen('screen', true);
    }, 2000);
  }
}

function backgroundStars() {
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
}
backgroundStars();

function updateBackgroundStars() {
  particles.forEach((particle, index) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.y = -particle.radius;
    }
    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(index, 1);
      });
    } else {
      particle.update();
    }
  });
}

function updateStone() {
  stones.forEach(stone => {
    stone.update();
    if (stone.image) {
      const LEFT_PLAYER_SIDE = player.position.x + player.width / 3.5; // magic number :(
      const RIGHT_PLAYER_SIDE = player.position.x + player.width / 1.7; // magic number :C
      const PLAYER_HEIGHT = player.position.y;

      const LEFT_SIDE_STONE = stone.position.x + stone.width / 15; // magic number D:
      const RIGHT_SIDE_STONE = stone.position.x + stone.width / 1.2; // magic number D:
      const STONE_HEIGHT = stone.position.y + stone.height;

      if (RIGHT_PLAYER_SIDE >= LEFT_SIDE_STONE &&
                LEFT_PLAYER_SIDE <= RIGHT_SIDE_STONE &&
                PLAYER_HEIGHT <= STONE_HEIGHT) { // collision with stone
        lose();
      }
    }
  });
}

function updatePowerUps() {
  powerups.forEach((powerup, index) => {
    powerup.update();
    if (powerup.image) {
      const LEFT_POWERUP_SIDE = powerup.position.x;
      const RIGHT_POWERUP_SIDE = powerup.position.x + powerup.width;
      const POWERUP_HEIGHT = powerup.position.y + powerup.height;

      const LEFT_PLAYER_SIDE = player.position.x + player.width / 3.5; // magic number D:
      const RIGHT_PLAYER_SIDE = player.position.x + player.width / 1.7; // magic number D:
      const PLAYER_HEIGHT = player.position.y;

      if (RIGHT_PLAYER_SIDE >= LEFT_POWERUP_SIDE &&
                LEFT_PLAYER_SIDE <= RIGHT_POWERUP_SIDE &&
                PLAYER_HEIGHT <= POWERUP_HEIGHT) {
        setPowerUp();
        powerups.splice(index, 1);
      }
    }
  });
}

function setPowerUp() {
  const randomPowerUp = powerupList[Math.floor(Math.random() * 2)];
  player.powerUp = randomPowerUp;
  if (player.powerUp === 'Shield') {
    announcementText.textContent = 'GodMode For 5 Second Activated!';
    toggleScreen('announcement', true);
  }
  if (player.powerUp === 'X2 Score') {
    announcementText.textContent = 'Cosmonauts Give You X2 Points For 5 Second!';
    toggleScreen('announcement', true);
  }
  setTimeout(() => {
    player.powerUp = null;
    toggleScreen('announcement', false);
    console.log(`${randomPowerUp} ended`);
  }, 5000);
}


function animate() {
  if (!game.active) return;
  if (game.over) changeBestScore();
  requestAnimationFrame(animate);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  spawnObjects();
  updateBackgroundStars();
  collectCosmonauts();
  updateStone();
  updatePowerUps();
  frames++;
}
animate();

window.addEventListener('keydown', event => {
  switch (event.key) {
  case 'a':
    keys.a.pressed = true;
    break;
  case 'd':
    keys.d.pressed = true;
    break;
  case 'Escape':
    pause();
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
