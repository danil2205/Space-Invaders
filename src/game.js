'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const bestScoreText = document.querySelector('#bestScore');
const APShell = document.querySelector('#APShell');
const HEASShell = document.querySelector('#HEASShell');
const HEShell = document.querySelector('#HEShell');
const progressBar = document.querySelector('#reloadGun');
const backgroundAudio = document.querySelector('#background');
backgroundAudio.volume = 0.1;

canvas.width = 850;
canvas.height = 960;

let game = new Game();
game.loadProgress();

const powerupList = ['Shield', 'Score Multiplier', 'Coin Multiplier'];

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

const playAudio = (nameAudio) => {
  const audio = new Audio();
  audio.src = `./music/${nameAudio}.mp3`;
  audio.volume = 0.1;
  audio.play();
};

const changeProgressReload = () => {
  const DELAY = 50;
  if (progressBar.value >= progressBar.max) return;
  progressBar.value += 0.05;
  setTimeout(changeProgressReload, DELAY);
};

const changeAmmo = (ammoType, selectedAmmo) => {
  for (const ammoImage of ammoTypesImage) ammoImage.style.border = '';
  selectedAmmo.style.border = '1px solid white';
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

const saveProgress = (key, value) => {
  localStorage.setItem(key, value);
};

const toggleAudio = () => {
  backgroundAudio.muted = !backgroundAudio.muted;
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

const reloadAdrenaline = () => {
  const ADRENALINE_COOLDOWN = 100000;
  setTimeout(() => {
    game.player.adrenalineCooldown = false;
  }, ADRENALINE_COOLDOWN);
};

const useAdrenaline = () => {
  if (game.player.adrenalineCooldown && gameStates.active) return;
  const ACTION_OF_ADRENALINE = 10000;
  progressBar.max = 2;
  game.player.isAdrenalineUsed = true;
  game.player.adrenalineCooldown = true;

  setTimeout(() => {
    progressBar.max = 3;
    game.player.isAdrenalineUsed = false;
  }, ACTION_OF_ADRENALINE);
  reloadAdrenaline();
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

const spawnObject = (framesToSpawn, nameObject, arrayObjects, scale) => {
  if (game.frames % Math.floor(framesToSpawn / game.speed) === 0) {
    arrayObjects.push(new GameObject(nameObject, arrayObjects, scale, {
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
    spawnObject(FRAMES_LIL_STONE, 'mars', game.stones, 0.02);
    spawnObject(FRAMES_BIG_STONE, 'mars', game.stones, 0.07);
    game.spawnBoss();
  }
  spawnObject(FRAMES_COSMONAUT, 'cosmonaut', game.cosmonauts, 0.02);
  spawnObject(FRAMES_POWERUP, 'powerup', game.powerups, 0.1);
};

const changeBestScore = () => {
  if (game.score > game.bestScore && gameStates.over) {
    game.bestScore = game.score;
    bestScoreText.innerHTML = game.bestScore;
    saveProgress('bestScore', bestScoreText.innerHTML);
  }
};

const lose = () => {
  const scoreGameOver = document.querySelector('#scoreGameOver');
  const DELAY_TO_DIE = 2000;
  if (!gameStates.over) {
    playAudio('boom');
    setOpacity(0);
    gameStates.over = true;
    setTimeout(() => {
      gameStates.active = false;
      scoreGameOver.innerHTML = game.score;
      toggleScreen(false, 'gameInterface');
      toggleScreen(true, 'screen');
    }, DELAY_TO_DIE);
  }
};

const backgroundStars = () => {
  for (let i = 0; i < 100; i++) game.particles.push(new Particle());
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

const checkCollisionShot = ({ object1, object2 }) => (
  object1.position.x + object1.width >= object2.position.x &&
  object1.position.x <= object2.position.x + object2.radius &&
  object1.position.y >= object2.position.y
);

const updateFunctions = (nameArray) => {
  const functionCollection = {
    [game.cosmonauts]: () => getPoints(),
    [game.stones]: () => delLives(),
    [game.bosses]: () => delLives(),
    [game.powerups]: () => setPowerUp(),
  };
  return functionCollection[nameArray]();
};

const updateObject = (nameArray) => {
  for (const [index, object] of nameArray.entries()) {
    object.update();
    if (object.image && checkCollision({
      object1: object,
      object2: game.player
    })) {
      nameArray.splice(index, 1);
      updateFunctions(nameArray);
    }
  }
};

const updateShots = () => {
  const boss = game.bosses[0];
  for (const [index, shot] of game.shots.entries()) {
    shot.update();
    if (checkCollisionShot({
      object1: boss,
      object2: shot
    })) {
      boss.health -= game.player.ammoDamage;
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
  game.updateObjects();
  game.speedUp();
  spawnObjects();
  getCoins();
  changeBestScore();
  game.frames++;
};
animate();

const pause = () => {
  if (!gameStates.active && !gameStates.menu) {
    toggleScreen(false, 'pause');
    countDown();
  } else if (gameStates.active && !gameStates.menu) {
    playAudio('pause');
    gameStates.active = false;
    gameStates.pause = true;
    toggleScreen(true, 'pause');
  }
};

const refreshGame = () => {
  saveProgress('coins', game.coins);
  game = new Game();
  document.querySelector('#score').innerHTML = game.score;
  gameStates.active = true;
  gameStates.over = false;
  toggleScreen(false, 'screen');
  showLives();
  backgroundStars();
  if (!gameStates.menu) {
    toggleScreen(true, 'gameInterface');
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
