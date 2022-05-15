'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const bestScoreText = document.querySelector('#bestScore');
const dailyMission = document.querySelector('#dailyMission');
const progressMission = document.querySelector('#progressMission');
const APShell = document.querySelector('#APShell');
const HEASShell = document.querySelector('#HEASShell');
const HEShell = document.querySelector('#HEShell');
const progressBar = document.querySelector('#reloadGun');
const audio = document.querySelector('#audio');
audio.volume = 0.1;

canvas.width = 850;
canvas.height = 960;


let coins = 0;
let speed = 1;
let frames = 0;
let score = 0;
let bestScore = 0;
let player = new Player();
let pet = new Pet();
let stones = [];
let particles = [];
let cosmonauts = [];
let powerups = [];
let bosses = [];
let shots = [];
const rewardMission = 100;
let counterMission = 0;
let adrenalineCooldown = false;

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

const difficulties = {
  'easy': 0.7,
  'medium': 1,
  'hard': 1.2,
  'master': 1.5,
  'impossible': 2,
};

const ammoDamages = {
  APShell: 15,
  HEASShell: 10,
  HEShell: 30,
};

const ammoColors = {
  APShell: 'red',
  HEASShell: 'yellow',
  HEShell: 'orange',
};

const ammoTypesImage = [APShell, HEASShell, HEShell];

const changeProgressReload = () => {
  if (progressBar.value >= progressBar.max) return;
  progressBar.value += 0.05;
  setTimeout(changeProgressReload, 50);
};

const changeAmmoType = (ammoTypeImage) => {
  for (const ammoImage of ammoTypesImage) ammoImage.style.border = '';
  ammoTypeImage.style.border = '1px solid white';
};

const changeAmmoStats = (ammoType) => {
  player.ammoType = ammoType;
  player.ammoDamage = ammoDamages[ammoType];
  player.ammoColor = ammoColors[ammoType];
};

const getSkinShip = () => {
  const skinID = document.querySelector('#skinID');
  const skinPNG = document.querySelector('#shipImg');
  skinID.oninput = () => {
    const img = `./ship${skinID.value}.png`;
    player.image.src = `./img/${img}`;
    skinPNG.src = `./img/${img}`;
  };
};

const randomNum = (maxNumber) => ~~(Math.random() * maxNumber);

const addZeroInTime = (time, n = 2) => `${time}`.padStart(n, '0');

const setDailyMission = () => {
  let randomMission = dailyMissions[randomNum(dailyMissions.length)];
  dailyMission.innerHTML = randomMission;
};
setDailyMission();

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
    setDailyMission();
    progressMission.innerHTML = 'Progress - Uncompleted';
  }
  setTimeout(updateMissions, 1000);
};
updateMissions();

const saveProgress = (key, value) => {
  localStorage.setItem(key, value);
};

const loadProgress = () => {
  coins = ~~localStorage.getItem('coins');
  bestScoreText.innerHTML = +localStorage.getItem('bestScore');
  bestScore = bestScoreText.innerHTML;
  levelMultiplier = +localStorage.getItem('levelMultiplier');
  costMulti.innerText = +localStorage.getItem('costMultiplier');
  levelPetUpgrade = +localStorage.getItem('levelPetUpgrade');
  costPetUpgrade.innerText = +localStorage.getItem('costPetUpgrade');
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

const useAdrenaline = () => {
  if (adrenalineCooldown || !game.active) return;
  const actionTimeAdrenaline = document.querySelector('#actionTimeAdrenaline');
  toggleScreen(true, 'actionTimeAdrenaline');
  const ACTION_OF_ADRENALINE = 10;
  const ADRENALINE_COOLDOWN = 100000;
  progressBar.max = 2;
  player.isAdrenalineUsed = true;
  adrenalineCooldown = true;

  const timer = setInterval(() => {
    if (actionTimeAdrenaline.innerHTML === '0') {
      clearInterval(timer);
      progressBar.max = 3;
      player.isAdrenalineUsed = false;
      toggleScreen(false, 'actionTimeAdrenaline');
      actionTimeAdrenaline.innerHTML = ACTION_OF_ADRENALINE;
    }
    actionTimeAdrenaline.innerHTML--;
  }, 1000);

  setTimeout(() => adrenalineCooldown = false, ADRENALINE_COOLDOWN);
};

const setStatusMission = () => {
  toggleScreen(true, 'claimReward');
  progressMission.innerHTML = 'Progress - Completed';
};

const checkMissionProgress = () => {
  switch (dailyMission.innerText) {
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

const countDown = () => {
  const countDownTimer = document.getElementById('countDownTimer');
  toggleScreen(true, 'countdown');

  const timer = setInterval(() => {
    if (countDownTimer.innerHTML === '0') {
      clearInterval(timer);
      game.active = true;
      game.pause = false;
      toggleScreen(false, 'countdown');
      animate();
    }
    countDownTimer.innerHTML--;
  }, 1000);
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

  if (pet.ability !== 'No Enemies') {
    spawnObject(FRAMES_LIL_STONE, stones, Stone, 0.02);
    spawnObject(FRAMES_BIG_STONE, stones, Stone, 0.07);
    if (bosses.length === 0) spawnObject(FRAMES_BOSS, bosses, Boss, 0.35);
  }
  spawnObject(FRAMES_COSMONAUT, cosmonauts, Cosmonaut, 0.02);
  spawnObject(FRAMES_POWERUP, powerups, PowerUp, 0.1);

};

const changeBestScore = () => {
  if (score > bestScore && game.over) {
    bestScore = score;
    bestScoreText.innerHTML = bestScore;
    saveProgress('bestScore', bestScoreText.innerHTML);
  }
};

const lose = (...ids) => {
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
      for (const id of ids) toggleScreen(false, id);
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
    if (particle.opacity < 1) particles.splice(index, 1);
    particle.update();
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
    coins += (pet.ability === 'Double Coins') ? COINS_WITH_MULTIPLIER : 0;
    coinText.innerText = coins;
  }
};

const getPoints = () => {
  const scoreText = document.querySelector('#score');
  score += (player.powerUp === 'Score Multiplier') ? levelMultiplier : 1;
  scoreText.innerHTML = score;
};

const checkCollision = ({ object1, object2 }) => (
  object1.position.x + object1.width >= object2.position.x &&
  object1.position.x <= object2.position.x + object2.width &&
  object1.position.y + object1.height >= object2.position.y
);

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

const updateCosmonaut = () => {
  for (const [index, cosmonaut] of cosmonauts.entries()) {
    cosmonaut.update();

    if (cosmonaut.image && !game.over) {
      if (checkCollision({ object1: cosmonaut, object2: player })) {
        getPoints();
        if (dailyMission.innerText === 'Collect 10 Cosmonauts') counterMission++;
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
        if (player.lives === 0) lose('bossAnnounce', 'abilityPet', 'canvas', 'ammoTypes', 'reloadGun', 'consumables');
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

const updateShots = () => {
  const explosionSound = document.querySelector('#explosionSound');
  for (const [index, shot] of shots.entries()) {
    shot.update();
    if (checkCollisionBossShot({ object1: shot, object2: player })) {
      explosionSound.play();
      delLives();
      if (player.lives === 0) lose('bossAnnounce', 'abilityPet', 'canvas', 'ammoTypes', 'reloadGun', 'reloadGun');
      shots.splice(index, 1);
    }
    for (const boss of bosses) {
      if (checkCollisionPlayerShot({ object1: boss, object2: shot })) {
        explosionSound.play();
        boss.health -= player.ammoDamage;
        document.querySelector('#bossHP').style.width = boss.health;
        shots.splice(index, 1);
      }
    }
  }
};

const animate = () => {
  getSkinShip();
  if (!game.active) return;
  requestAnimationFrame(animate);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  audio.play();
  if (frames % 500 === 0) speed += 0.1; // speed up
  pet.update();
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

const pause = () => {
  if (!game.active && !game.menu && !game.over) {
    toggleScreen(false, 'pause');
    countDown();
  } else if (game.active && !game.menu && !game.over) {
    const pauseSound = document.querySelector('#pauseSound');
    pauseSound.play();
    audio.pause();
    game.active = false;
    game.pause = true;
    toggleScreen(true, 'pause');
  }
};

const refreshGame = () => {
  player = new Player();
  pet = new Pet();
  pet.isCooldown = false;
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
    toggleScreen(true, 'abilityPet');
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
  case 'x':
    pet.getAbility();
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
  case '1':
    changeAmmoStats('APShell');
    changeAmmoType(APShell);
    break;
  case '2':
    changeAmmoStats('HEASShell');
    changeAmmoType(HEASShell);
    break;
  case '3':
    changeAmmoStats('HEShell');
    changeAmmoType(HEShell);
    break;
  case '4':
    useAdrenaline();
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
