'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const bestScoreText = document.querySelector('#bestScore');
const costMulti = document.querySelector('#costMulti');
const dailyMission = document.querySelector('#dailyMission');
const progressMission = document.querySelector('#progressMission');
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
let bosses = [];
let shots = [];
const rewardMission = 100;

const powerupList = ['Shield', 'Score Multiplier', 'Coin Multiplier'];
const dailyMissions = [
  'Collect 10 Cosmonauts',
  'Kill 5 Bosses',
  'Score 100 points',
  'Beat Your Record',
];
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

const skinsShip = [
  'ship1.png',
  'ship2.png',
  'ship3.png',
  'ship4.png',
  'ship5.png',
];

const difficulties = {
  'easy': 0.7,
  'medium': 1,
  'hard': 1.2,
  'master': 1.5,
  'impossible': 2,
};

const changeSpeed = (difficultySpeed) => {
  speed = difficultySpeed;
  toggleScreen(false, 'difficulty');
  toggleScreen(true, 'menu');
};

const getSkinShip = () => {
  const skinID = document.querySelector('#skinID');
  const skinPNG = document.querySelector('#shipImg');
  skinID.oninput = () => {
    player.image.src = `./img/${skinsShip[skinID.value]}`;
    skinPNG.src = `./img/${skinsShip[skinID.value]}`;
  };
};

const randomNum = (maxNumber) => ~~(Math.random() * maxNumber);

let counterMission = 0;
let randomMission = dailyMissions[randomNum(dailyMissions.length)];
dailyMission.innerHTML = randomMission;

const setStatusMission = () => {
  toggleScreen(true, 'claimReward');
  progressMission.innerHTML = 'Progress - Completed';
};

const checkMissionProgress = () => {
  switch (randomMission) {
  case 'Collect 10 Cosmonauts':
    if (counterMission >= 10) setStatusMission();
    break;
  case 'Kill 5 Bosses':
    if (counterMission >= 5) setStatusMission();
    break;
  case 'Score 100 points':
    if (score >= 100) setStatusMission();
    break;
  case 'Beat Your Record':
    if (score > bestScore) setStatusMission();
    break;
  default:
    console.log('Unknown mission');
  }
};

const addZeroInTime = (time, n = 2) => `${time}`.padStart(n, '0');

const updateMissions = () => {
  const timeRemains = document.querySelector('#timeRemains');
  const currentTime = new Date();
  const hours = addZeroInTime(23 - currentTime.getHours());
  const minutes = addZeroInTime(60 - currentTime.getMinutes());
  const seconds = addZeroInTime(60 - currentTime.getSeconds());

  const remainingTime = hours + ':' + minutes + ':' + seconds;
  timeRemains.innerHTML = `Times remaining: ${remainingTime}`;
  if (remainingTime === '00:00:00') {
    counterMission = 0; // reset counter
    progressMission.innerHTML = 'Progress - Uncompleted';
    randomMission = dailyMissions[randomNum(dailyMissions.length)];
    dailyMission.innerHTML = randomMission;
  }
  setTimeout(updateMissions, 1000);
};
updateMissions();

const saveProgress = () => {
  localStorage.setItem('coins', coins);
  localStorage.setItem('bestScore', bestScoreText.innerHTML);
  localStorage.setItem('levelMultiplier', levelMultiplier);
  localStorage.setItem('costMultiplier', +costMulti.innerHTML);
};

const loadProgress = () => {
  coins = ~~localStorage.getItem('coins');
  bestScoreText.innerHTML = +localStorage.getItem('bestScore');
  bestScore = bestScoreText.innerHTML;
  levelMultiplier = +localStorage.getItem('levelMultiplier');
  costMulti.innerText = +localStorage.getItem('costMultiplier');
};
loadProgress();

const toggleAudio = () => {
  audio.muted = !audio.muted;
};

const showLives = () => {
  const imgLives = document.querySelector('#imgLives');
  imgLives.innerHTML = ''; // to delete all lives from screen
  for (let i = 0; i < player.lives; i++) {
    const image = new Image();
    image.src = './img/heart.png';
    image.width = 30;
    image.height = 30;
    imgLives.append(image);
  }
};

const delLives = () => {
  player.removeLives();
  if (player.lives > 0) {
    setTimeout(() => player.opacity = 0.1); // effect flash when ship faces with stone
    setTimeout(() => player.opacity = 1, 500);
  }
  showLives(); // to show lives again, but -1 live
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
    const pauseSound = document.querySelector('#pauseSound');
    pauseSound.play();
    audio.pause();
    game.active = false;
    game.pause = true;
    toggleScreen(true, 'pause');
  }
};

const spawnObject = (framesToSpawn, arrayName, className, scale) => {
  if (frames % Math.floor(framesToSpawn / speed) === 0 && frames !== 0) arrayName.push(new className(scale, {
    position: {
      x: randomNum(canvas.width),
      y: 0,
    }
  }));
};

const spawnObjects = () => {
  const FRAMES_LIL_STONE = 50;
  const FRAMES_BIG_STONE = 150;
  const FRAMES_COSMONAUT = 80;
  const FRAMES_POWERUP = 1000;
  const FRAMES_BOSS = 6000;

  spawnObject(FRAMES_LIL_STONE, stones, Stone, 0.02);
  spawnObject(FRAMES_BIG_STONE, stones, Stone, 0.07);
  spawnObject(FRAMES_COSMONAUT, cosmonauts, Cosmonaut, 0.02);
  spawnObject(FRAMES_POWERUP, powerups, PowerUp, 0.1);
  if (bosses.length === 0) spawnObject(FRAMES_BOSS, bosses, Boss, 0.35);
};

const changeBestScore = () => {
  if (score > bestScore && game.over) {
    bestScore = score;
    bestScoreText.innerHTML = bestScore;
  }
};

const lose = () => {
  const scoreGameOver = document.querySelector('#scoreGameOver');
  const boomSound = document.querySelector('#boomSound');
  if (!game.over) {
    boomSound.play();
    player.opacity = 0;
    game.over = true;
    setTimeout(() => {
      game.active = false;
      audio.pause();
      scoreGameOver.innerHTML = score;
      toggleScreen(false, 'bossAnnounce');
      toggleScreen(false, 'canvas');
      toggleScreen(true, 'screen');
    }, 2000);
  }
};

const backgroundStars = () => {
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle({
      position: {
        x: randomNum(canvas.width),
        y: randomNum(canvas.height),
      },
      velocity: {
        x: 0,
        y: 2,
      },
      radius: randomNum(3),
      color: 'white',
    }));
  }
};
backgroundStars();

const updateBackgroundStars = () => {
  for (const [index, particle] of particles.entries()) {
    if (particle.position.y - particle.radius >= canvas.height) particle.position.y = -particle.radius;
    if (particle.opacity < 1) setTimeout(() => particles.splice(index, 1));
    particle.update();
  }
};

const upgradeMultiplier = () => {
  if (costMulti.innerText <= coins) {
    coins -= costMulti.innerText;
    costMulti.innerText *= 2;
    levelMultiplier++;
    saveProgress();
  }
};

const buyLife = () => {
  const LIFE_COST = 100;
  if (coins >= LIFE_COST) {
    coins -= LIFE_COST;
    player.lives += 1;
    saveProgress();
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
  const announcementText = document.querySelector('#announcementText');
  const amountOfPowers = powerupList.length;
  const randomPowerUp = powerupList[randomNum(amountOfPowers)];
  player.powerUp = randomPowerUp;
  if (player.powerUp !== null) {
    announcementText.textContent = `${player.powerUp} Activated!`;
    toggleScreen(true, 'announcement');
  }
  delPowerUp();
};

const getCoins = () => {
  const coinText = document.querySelector('#coins');
  if (frames % 150 === 0) {
    const COINS_WITHOUT_MULTIPLIER = 1;
    const COINS_WITH_MULTIPLIER = 2;
    coins += (player.powerUp === 'Coin Multiplier') ? COINS_WITH_MULTIPLIER : COINS_WITHOUT_MULTIPLIER;
    coinText.innerText = coins;
  }
};

const checkCollision = ({ object1, object2 }) => (
  object1.position.x + object1.width >= object2.position.x &&
  object1.position.x <= object2.position.x + object2.width &&
  object1.position.y + object1.height >= object2.position.y
);

const updateCosmonaut = () => {
  const scoreText = document.querySelector('#score');
  for (const [index, cosmonaut] of cosmonauts.entries()) {
    cosmonaut.update();

    if (cosmonaut.image && !game.over) {
      if (checkCollision({ object1: cosmonaut, object2: player })) {
        randomMission === 'Collect 10 Cosmonauts' ? counterMission++ : randomMission;
        score += (player.powerUp === 'Score Multiplier') ? levelMultiplier : 1;
        scoreText.innerHTML = score;
        cosmonauts.splice(index, 1);
      }
    }
  }
};

const updateStone = () => {
  for (const [index, stone] of stones.entries()) {
    stone.update();

    if (stone.image) {
      if (checkCollision({ object1: stone, object2: player })) {
        stones.splice(index, 1);
        delLives();
        if (player.lives === 0) lose();
      }
    }
  }
};

const updatePowerUps = () => {
  for (const [index, powerup] of powerups.entries()) {
    powerup.update();

    if (powerup.image) {
      if (checkCollision({ object1: powerup, object2: player })) {
        setPowerUp();
        powerups.splice(index, 1);
      }
    }
  }
};

const updateBoss = () => {
  if (bosses.length !== 0) toggleScreen(true, 'bossAnnounce');
  for (const boss of bosses) {
    boss.update();
  }
};

const checkCollisionBossShot = ({ object1, object2 }) => (
  object1.position.x + object1.radius >= object2.position.x &&
  object1.position.x <= object2.position.x + object2.width &&
  object1.position.y >= object2.position.y
);

const checkCollisionPlayerShot = ({ object1, object2 }) => (
  object1.position.x + object1.width >= object2.position.x &&
  object1.position.x <= object2.position.x + object2.radius &&
  object1.position.y >= object2.position.y + object2.radius
);


const updateShots = () => {
  for (const [index, shot] of shots.entries()) {
    shot.update();
    if (checkCollisionBossShot({ object1: shot, object2: player })) {
      delLives();
      if (player.lives === 0) lose();
      shots.splice(index, 1);
    }
    for (const boss of bosses) {
      if (checkCollisionPlayerShot({ object1: boss, object2: shot })) {
        boss.health -= 20;
        document.querySelector('#bossHP').style.width = boss.health;
        shots.splice(index, 1);
      }
    }
  }
};

const bossShoot = () => {
  if (frames % 100 === 0) {
    bosses.forEach((boss) => boss.shoot());
  }
};

const animate = () => {
  getSkinShip();
  if (!game.active) return;
  requestAnimationFrame(animate);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  if (frames % 500 === 0) speed += 0.1; // speed up
  audio.play();
  bossShoot();
  spawnObjects();
  updateBackgroundStars();
  getCoins();
  updateCosmonaut();
  updateStone();
  updatePowerUps();
  updateBoss();
  updateShots();
  changeBestScore();
  checkMissionProgress();
  frames++;
};
animate();

const refreshGame = () => {
  player = new Player();
  speed = 1;
  frames = 0;
  score = 0;
  stones = [];
  particles = [];
  cosmonauts = [];
  powerups = [];
  bosses = [];
  shots = [];
  audio.load();
  document.querySelector('#score').innerHTML = score;
  game.active = true;
  game.over = false;
  showLives();
  backgroundStars();
  if (!game.menu) {
    toggleScreen(false, 'screen');
    toggleScreen(true, 'canvas');
    animate();
  }
};

window.addEventListener('keydown', (event) => {
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
  case 'm':
    toggleAudio();
    break;
  case ' ':
    if (!game.over) player.shoot();
    break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
  case 'a':
    keys.a.pressed = false;
    break;
  case 'd':
    keys.d.pressed = false;
    break;
  }
});
