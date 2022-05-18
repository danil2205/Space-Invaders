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

let game = new Game();

const powerupList = ['Shield', 'Score Multiplier', 'Coin Multiplier'];

const dailyMissions = [
  'Collect 10 Cosmonauts',
  'Kill 5 Bosses',
  'Score 100 points',
  'Beat Your Record',
];

const keys = {
  a: { pressed: false },
  d: { pressed: false },
};

const gameStates = {
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
  const DELAY = 50;
  if (progressBar.value >= progressBar.max) return;
  progressBar.value += 0.05;
  setTimeout(changeProgressReload, DELAY);
};

const changeAmmo = (ammoType, ammoTypeImage) => {
  for (const ammoImage of ammoTypesImage) ammoImage.style.border = '';
  ammoTypeImage.style.border = '1px solid white';

  game.player.ammoType = ammoType;
  game.player.ammoDamage = ammoDamages[ammoType];
  game.player.ammoColor = ammoColors[ammoType];
};

const getSkinShip = () => {
  const skinID = document.querySelector('#skinID');
  const skinPNG = document.querySelector('#shipImg');
  skinID.oninput = () => {
    const img = `./ship${skinID.value}.png`;
    game.player.image.src = `./img/${img}`;
    skinPNG.src = `./img/${img}`;
  };
};

const randomNum = (maxNumber) => ~~(Math.random() * maxNumber);

const addZeroInTime = (time, n = 2) => `${time}`.padStart(n, '0');

const setDailyMission = () => {
  game.counterMission = 0;
  const randomMission = dailyMissions[randomNum(dailyMissions.length)];
  dailyMission.innerHTML = randomMission;
  progressMission.innerHTML = 'Progress - Uncompleted';
};
setDailyMission();

const updateMissions = () => {
  const timeRemains = document.querySelector('#timeRemains');
  const NEW_DAY_HOURS = 23;
  const NEW_DAY_MINUTES = 59;
  const NEW_DAY_SECONDS = 59;
  const DELAY = 1000;
  const currentTime = new Date();

  const hours = addZeroInTime(NEW_DAY_HOURS - currentTime.getHours());
  const minutes = addZeroInTime(NEW_DAY_MINUTES - currentTime.getMinutes());
  const seconds = addZeroInTime(NEW_DAY_SECONDS - currentTime.getSeconds());
  const remainingTime = hours + ':' + minutes + ':' + seconds;

  timeRemains.innerHTML = `Times remaining: ${remainingTime}`;
  if (remainingTime === '00:00:00') setDailyMission();
  setTimeout(updateMissions, DELAY);
};
updateMissions();

const saveProgress = (key, value) => {
  localStorage.setItem(key, value);
};

const loadProgress = () => {
  bestScoreText.innerHTML = game.bestScore;
  costMulti.innerText = +localStorage.getItem('costMultiplier');
  costPetUpgrade.innerText = +localStorage.getItem('costPetUpgrade');
};
loadProgress();

const toggleAudio = () => {
  audio.muted = !audio.muted;
};

const showLives = () => {
  const imgLives = document.querySelector('#imgLives');
  imgLives.innerHTML = ''; // to delete all lives from screen
  for (let i = 0; i < game.player.lives; i++) {
    const image = new Image();
    imgLives.append(image);
  }
};

const setOpacity = (opacity) => () => {
  game.player.opacity = opacity;
};

const delLives = () => {
  const FLASH_DELAY = 500;
  game.player.removeLives();
  if (game.player.lives > 0) {
    setTimeout(setOpacity(0.1), 0);
    setTimeout(setOpacity(1), FLASH_DELAY);
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
  if (game.adrenalineCooldown && gameStates.active) return;
  const actionTimeAdrenaline = document.querySelector('#actionTimeAdrenaline');
  toggleScreen(true, 'actionTimeAdrenaline');
  const ACTION_OF_ADRENALINE = 10;
  const ADRENALINE_COOLDOWN = 100000;
  progressBar.max = 2;
  game.player.isAdrenalineUsed = true;
  game.adrenalineCooldown = true;

  const timer = setInterval(() => {
    if (actionTimeAdrenaline.innerHTML === '0') {
      clearInterval(timer);
      progressBar.max = 3;
      game.player.isAdrenalineUsed = false;
      toggleScreen(false, 'actionTimeAdrenaline');
      actionTimeAdrenaline.innerHTML = ACTION_OF_ADRENALINE;
    }
    actionTimeAdrenaline.innerHTML--;
  }, 1000);

  setTimeout(() => game.adrenalineCooldown = false, ADRENALINE_COOLDOWN);
};

const setStatusMission = () => {
  toggleScreen(true, 'claimReward');
  progressMission.innerHTML = 'Progress - Completed';
};

const checkMissionProgress = () => {
  switch (dailyMission.innerText) {
  case 'Collect 10 Cosmonauts':
    if (game.counterMission >= 10) setStatusMission();
    break;
  case 'Kill 5 Bosses':
    if (game.counterMission >= 5) setStatusMission();
    break;
  case 'Score 100 points':
    if (game.score >= 100) setStatusMission();
    break;
  case 'Beat Your Record':
    if (game.score > game.bestScore) setStatusMission();
    break;
  default:
    console.log('Unknown mission');
  }
};

const countDown = () => {
  const countDownTimer = document.getElementById('countDownTimer');
  const DELAY = 1000;
  const DEFAULT_VALUE = 3;
  toggleScreen(true, 'countdown');

  const timer = setInterval(() => {
    if (countDownTimer.innerHTML === '0') {
      countDownTimer.innerHTML = DEFAULT_VALUE;
      clearInterval(timer);
      gameStates.active = true;
      gameStates.pause = false;
      toggleScreen(false, 'countdown');
      animate();
    }
    countDownTimer.innerHTML--;
  }, DELAY);
};

const spawnObject = (framesToSpawn, arrayName, className, scale) => {
  if (game.frames % Math.floor(framesToSpawn / game.speed) === 0) {
    arrayName.push(new className(scale, {
      position: {
        x: randomNum(canvas.width),
        y: 0,
      }
    }));
  }
};


const spawnObjects = () => {
  const FRAMES_LIL_STONE = 50;
  const FRAMES_BIG_STONE = 150;
  const FRAMES_COSMONAUT = 80;
  const FRAMES_POWERUP = 1000;

  if (game.pet.ability !== 'No Enemies') {
    spawnObject(FRAMES_LIL_STONE, game.stones, Stone, 0.02);
    spawnObject(FRAMES_BIG_STONE, game.stones, Stone, 0.07);
  }
  spawnObject(FRAMES_COSMONAUT, game.cosmonauts, Cosmonaut, 0.02);
  spawnObject(FRAMES_POWERUP, game.powerups, PowerUp, 0.1);
};

const changeBestScore = () => {
  if (game.score > game.bestScore && gameStates.over) {
    game.bestScore = game.score;
    bestScoreText.innerHTML = game.bestScore;
    saveProgress('bestScore', bestScoreText.innerHTML);
  }
};

const lose = (...ids) => {
  const scoreGameOver = document.querySelector('#scoreGameOver');
  const boomSound = document.querySelector('#boomSound');
  if (!gameStates.over) {
    boomSound.play();
    game.player.opacity = 0;
    gameStates.over = true;
    setTimeout(() => {
      gameStates.active = false;
      audio.pause();
      scoreGameOver.innerHTML = game.score;
      for (const id of ids) toggleScreen(false, id);
      toggleScreen(true, 'screen');
    }, 2000);
  }
};

const backgroundStars = () => {
  for (let i = 0; i < 100; i++) {
    game.particles.push(new Particle({
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

const delPowerUp = () => {
  const ACTION_TIME = 5000;
  setTimeout(() => {
    toggleScreen(false, 'announcement');
    game.player.powerUp = null;
  }, ACTION_TIME);
};

const setPowerUp = () => {
  const announcementText = document.querySelector('#announcementText');
  const amountOfPowers = powerupList.length;
  const randomPowerUp = powerupList[randomNum(amountOfPowers)];
  game.player.powerUp = randomPowerUp;
  if (game.player.powerUp !== null) {
    announcementText.textContent = `${game.player.powerUp} Activated!`;
    toggleScreen(true, 'announcement');
  }
  delPowerUp();
};

const getCoins = () => {
  const coinText = document.querySelector('#coins');
  if (game.frames % 150 === 0) {
    const COINS_WITHOUT_MULTIPLIER = 1;
    const COINS_WITH_MULTIPLIER = 2;
    game.coins += (game.player.powerUp === 'Coin Multiplier') ? COINS_WITH_MULTIPLIER : COINS_WITHOUT_MULTIPLIER;
    game.coins += (game.pet.ability === 'Double Coins') ? COINS_WITH_MULTIPLIER : 0;
    coinText.innerText = game.coins;
  }
};

const getPoints = () => {
  const scoreText = document.querySelector('#score');
  if (dailyMission.innerText === 'Collect 10 Cosmonauts') game.counterMission++;
  game.score += (game.player.powerUp === 'Score Multiplier') ? game.levelMultiplier : 1;
  scoreText.innerHTML = game.score;
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
  object1.position.y >= object2.position.y
);

const updateFunctions = (nameArray) => {
  const functionCollection = {
    [game.cosmonauts]: () => getPoints(),
    [game.stones]: () => delLives(),
    [game.powerups]: () => setPowerUp(),
    [game.shots]: () => delLives(),
  };
  return functionCollection[nameArray]();
};

const updateObject = (nameArray) => {
  for (const [index, object] of nameArray.entries()) {
    object.update();
    if (object.image && checkCollision({ object1: object, object2: game.player })) {
      nameArray.splice(index, 1);
      updateFunctions(nameArray);
    }
  }
};

const updateShots = () => {
  for (const [index, shot] of game.shots.entries()) {
    shot.update();
    if (checkCollisionBossShot({ object1: shot, object2: game.player })) {
      delLives();
      game.shots.splice(index, 1);
    }
    if (checkCollisionPlayerShot({ object1: game.boss, object2: shot })) {
      console.log(game.boss.health)
      game.boss.health -= game.player.ammoDamage;
      document.querySelector('#bossHP').style.width = game.boss.health;
      game.shots.splice(index, 1);
    }
  }
};

const animate = () => {
  getSkinShip();
  if (!gameStates.active) return;
  requestAnimationFrame(animate);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  game.player.update();
  game.pet.update();
  if (game.boss.health > 0) game.boss.update();
  audio.play();
  game.speedUp();
  spawnObjects();
  getCoins();
  updateShots();
  updateObject(game.particles);
  updateObject(game.cosmonauts);
  updateObject(game.powerups);
  updateObject(game.stones);
  changeBestScore();
  checkMissionProgress();
  game.frames++;
};
animate();

const pause = () => {
  if (!gameStates.active && !gameStates.menu && !gameStates.over) {
    toggleScreen(false, 'pause');
    countDown();
  } else if (gameStates.active && !gameStates.menu && !gameStates.over) {
    const pauseSound = document.querySelector('#pauseSound');
    pauseSound.play();
    audio.pause();
    gameStates.active = false;
    gameStates.pause = true;
    toggleScreen(true, 'pause');
  }
};

const refreshGame = () => {
  game = new Game();
  audio.load();
  document.querySelector('#score').innerHTML = game.score;
  gameStates.active = true;
  gameStates.over = false;
  toggleScreen(false, 'screen');
  showLives();
  backgroundStars();
  if (!gameStates.menu) {
    toggleScreen(true, 'canvas');
    animate();
  }
};

const getKeyFunc = (keydown) => {
  const keyCollection = {
    'a': () => keys.a.pressed = true,
    'd': () => keys.d.pressed = true,
    'x': () => game.pet.getAbility(),
    'Escape': () => pause(),
    'm': () => toggleAudio(),
    ' ': () => game.player.shoot(),
    '1': () => changeAmmo('APShell', APShell),
    '2': () => changeAmmo('HEASShell', HEASShell),
    '3': () => changeAmmo('HEShell', HEShell),
    '4': () => useAdrenaline(),
  };
  return keyCollection[keydown]();
};


window.addEventListener('keydown', (event) => {
  getKeyFunc(event.key);
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
