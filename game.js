'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const scoreText = document.querySelector('#score');
const scoreGameOver = document.querySelector('#scoreGameOver');
const bestScoreText = document.querySelector('#bestScore');
const announcementText = document.querySelector('#announcementText');
const coinText = document.querySelector('#coins');

canvas.width = 850;
canvas.height = 960;

let coins = 0;
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
}

const countDown = () => {
  const countDownTimer = document.querySelector('#countDownTimer');
  toggleScreen(true, 'countdown');
  setTimeout(() => countDownTimer.textContent = '2', 1000);
  setTimeout(() => countDownTimer.textContent = '1', 2000);
  countDownTimer.textContent = '3';
}

const play = () => {
  toggleScreen(false, 'menu');
  toggleScreen(true, 'canvas', 'allScore');
  game.active = true;
  game.menu = false;
  coinText.innerText = coins;
  animate();
}

const shop = () => {
  toggleScreen(false, 'menu');
  toggleScreen(true, 'shop');
}

const upgradeMultiplier = () => {
  let costMulti = document.querySelector('#costMulti');
  let levelMulti = document.querySelector('#multiplierLevel');
  let levelsMulti = 2;
  if (costMulti.innerText <= coins) {
    coins -= costMulti.innerText;
    costMulti.innerText = costMulti.innerText * 2;
    levelMulti.innerText = 'Level ' + levelsMulti;
    levelsMulti++;
  }
}

const upgradeShield = () => {
  let costShield = document.querySelector('#costShield');
  let levelShield = document.querySelector('#shieldLevel');
  let levelsShield = 2;
  if (costShield.innerText <= coins) {
    coins -= costShield.innerText;
    costShield.innerText = costShield.innerText * 2;
    levelShield.innerText = 'Level ' + levelsShield;
    levelsShield++;
  }
}

const settings = () => {
  toggleScreen(true, 'settings');
  toggleScreen(false, 'menu', 'pause');
}

const back = () => {
  toggleScreen(false, 'settings', 'shop');
  if (game.menu) return toggleScreen(true, 'menu');
  toggleScreen(true, 'pause');
}

const exit = () => {
  toggleScreen(false, 'pause', 'canvas', 'allScore', 'screen');
  toggleScreen(true, 'menu');
  game.menu = true;
  game.active = false;
  refreshGame();
}

const pause = () => {
  if (!game.active && !game.menu && !game.over) {
    toggleScreen(false, 'pause');
    countDown();
    setTimeout(() => {
      game.active = true;
      game.pause = false;
      toggleScreen(false,'countdown');
      animate();
    }, 3000);

  } else if (game.active && !game.menu && !game.over) {
    game.active = false;
    game.pause = true;
    toggleScreen(true, 'pause');
  }
}

const spawnObjects = () => {
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

const collectCosmonauts = () => {
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
        if (player.powerUp === 'Score Multiplier') score += levelsMulti - 2;
        scoreText.innerHTML = score;
        cosmonauts.splice(index, 1);
      }
    }
  });
}

const changeBestScore = () => {
  if (score > bestScore) {
    bestScore = score;
    bestScoreText.innerHTML = bestScore;
  }
}

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
}

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
}

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
}
backgroundStars();

const updateBackgroundStars = () => {
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

const updateStone = () => {
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

const updatePowerUps = () => {
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

const setPowerUp = () => {
  const randomPowerUp = powerupList[Math.floor(Math.random() * 2)];
  player.powerUp = randomPowerUp;
  if (player.powerUp !== null) {
    announcementText.textContent = `${player.powerUp} Activated!`;
    toggleScreen(true, 'announcement');
  }
  delPowerUp();
}

const delPowerUp = () => {
  setTimeout(() => {
    toggleScreen(false, 'announcement');
    console.log(`${player.powerUp} ended`);
    player.powerUp = null;
  }, 5000);
}

const animate = () => {
  if (!game.active) return;
  if (game.over) changeBestScore();
  requestAnimationFrame(animate);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  spawnObjects();
  updateBackgroundStars();
  if (frames % 150 === 0) {
    player.powerUp === 'Coin Multiplier' ? coins = +coins + 2 : coins = +coins + 1;
    coinText.innerText = coins;
  }

  collectCosmonauts();
  updateStone();
  updatePowerUps();
  console.log(coins)
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
