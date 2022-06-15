'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const bestScoreText = document.querySelector('#bestScore');
const APShell = document.querySelector('#APShell');
const HEASShell = document.querySelector('#HEASShell');
const HEShell = document.querySelector('#HEShell');
const progressBar = document.querySelector('#reloadGun');
const imgLives = document.querySelector('#imgLives');
const backgroundAudio = document.querySelector('#background');
backgroundAudio.volume = 0.1;

canvas.width = 850;
canvas.height = 960;

let game = new Game();

const powerupList = ['Shield', 'Score Multiplier', 'Coin Multiplier'];

const keys = {
  a: { pressed: false },
  d: { pressed: false },
};

const gameStates = {
  active: false,
  menu: true,
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

const saveProgress = () => {
  const saveState = {
    coins: game.coins,
    bestScore: bestScoreText.innerHTML,
    petLevel: game.levelPet,
    petPrice: costPetUpgrade.innerHTML,
    multiplierLevel: game.levelMultiplier,
    multiplierPrice: costMulti.innerHTML,
  };
  const saveStateString = JSON.stringify(saveState);
  localStorage.setItem('saveState', saveStateString);
};

const loadProgress = () => {
  const saveFile = JSON.parse(localStorage.getItem('saveState'));
  game.coins = saveFile.coins;
  bestScoreText.innerHTML = saveFile.bestScore;
  game.levelPet = saveFile.petLevel;
  game.levelMultiplier = saveFile.multiplierLevel;
  costPetUpgrade.innerHTML = saveFile.petPrice;
  costMulti.innerHTML = saveFile.multiplierPrice;
};

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
    const img = `./img/ship${skinID.value}.png`;
    game.player.image.src = img;
    skinPNG.src = img;
  };
};

const randomNum = (maxNumber) => ~~(Math.random() * maxNumber);

const toggleAudio = () => {
  backgroundAudio.muted = !backgroundAudio.muted;
};

const showLives = () => {
  imgLives.innerHTML = '';
  for (let i = 0; i < game.player.lives; i++) {
    const image = new Image();
    imgLives.append(image);
  }
};

const setOpacity = (opacity) => () => {
  game.player.opacity = opacity;
};

const toggleScreen = (toggle, ...ids) => {
  for (const id of ids) {
    const element = document.querySelector(`#${id}`);
    const display = toggle ? 'block' : 'none';
    element.style.display = display;
  }
};

const reloadAdrenaline = () => {
  const cooldown = 100000;
  setTimeout(() => {
    game.player.adrenalineCooldown = false;
  }, cooldown);
};

const useAdrenaline = () => {
  if (game.player.adrenalineCooldown) return;
  const actionTime = 10000;
  progressBar.max--;
  game.player.adrenalineCooldown = true;

  setTimeout(() => {
    progressBar.max++;
  }, actionTime);
  reloadAdrenaline();
};

const countDown = () => {
  const countDownTimer = document.getElementById('countDownTimer');
  const DELAY = 1000;
  const DEFAULT_VALUE = 3;
  toggleScreen(true, 'countdown');

  const timer = setInterval(() => {
    if (countDownTimer.innerHTML === '0') {
      clearInterval(timer);
      countDownTimer.innerHTML = DEFAULT_VALUE;
      gameStates.active = true;
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
  const framesStone = 50;
  const framesBigStone = 150;
  const framesCosmonaut = 80;
  const framesPower = 1000;

  if (game.pet.ability !== 'No Enemies') {
    spawnObject(framesStone, 'mars', game.stones, 0.02);
    spawnObject(framesBigStone, 'mars', game.stones, 0.07);
    game.spawnBoss();
  }
  spawnObject(framesCosmonaut, 'cosmonaut', game.cosmonauts, 0.02);
  spawnObject(framesPower, 'powerup', game.powerups, 0.1);
};

const changeBestScore = () => {
  if (game.score > bestScoreText.innerHTML) {
    bestScoreText.innerHTML = game.score;
  }
};

const lose = () => {
  const scoreGameOver = document.querySelector('#scoreGameOver');
  if (!gameStates.over) {
    playAudio('boom');
    changeBestScore();
    gameStates.over = true;
    gameStates.active = false;
    scoreGameOver.innerHTML = game.score;
    toggleScreen(false, 'gameInterface');
    toggleScreen(true, 'screen');
  }
};

const backgroundStars = () => {
  for (let i = 0; i < 100; i++) game.particles.push(new Particle());
};

const delPowerUp = () => {
  const actionTime = 5000;
  setTimeout(() => {
    toggleScreen(false, 'announcement');
    game.player.powerUp = null;
  }, actionTime);
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
    const coinsWithoutPower = 1;
    const coinsWithPower = 2;
    if (
      game.player.powerUp === 'Coin Multiplier' ||
      game.pet.ability === 'Double Coins'
    ) {
      game.coins += coinsWithPower;
    } else {
      game.coins += coinsWithoutPower;
    }
    coinText.innerText = game.coins;
  }
};

const getPoints = () => {
  const scoreText = document.querySelector('#score');
  if (dailyMission.innerText === 'Collect 10 Cosmonauts') game.counterMission++;
  if (game.player.powerUp === 'Score Multiplier') {
    game.score += game.levelMultiplier;
  } else {
    game.score += 1;
  }
  scoreText.innerHTML = game.score;
};

const updateFunctions = (nameArray) => {
  const functionCollection = {
    [game.cosmonauts]: () => getPoints(),
    [game.stones]: () => game.player.removeLives(),
    [game.powerups]: () => setPowerUp(),
    [game.bosses]: () => game.player.removeLives(),
  };
  return functionCollection[nameArray]();
};

const updateObject = (nameArray) => {
  for (const [index, object] of nameArray.entries()) {
    object.update();
    if (game.player.collideWith(object)) {
      nameArray.splice(index, 1);
      updateFunctions(nameArray);
    }
  }
};

const updateShots = () => {
  const boss = game.bosses[0];
  for (const [index, shot] of game.shots.entries()) {
    shot.update();
    if (shot.collideWith(boss)) {
      boss.health -= game.player.ammoDamage;
      game.shots.splice(index, 1);
    }
  }
};

const animate = () => {
  if (!gameStates.active) return;
  requestAnimationFrame(animate);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  game.updateObjects();
  game.speedUp();
  spawnObjects();
  getCoins();
  game.frames++;
};

const pause = () => {
  if (!gameStates.active && !gameStates.menu) {
    toggleScreen(false, 'pause');
    countDown();
  } else if (gameStates.active && !gameStates.menu) {
    playAudio('pause');
    gameStates.active = false;
    toggleScreen(true, 'pause');
  }
};

const refreshGame = () => {
  saveProgress();
  game = new Game();
  loadProgress();
  showLives();
  document.querySelector('#score').innerHTML = game.score;
  gameStates.over = false;
  gameStates.active = true;
  toggleScreen(false, 'screen');
  backgroundStars();
  if (!gameStates.menu) {
    toggleScreen(true, 'gameInterface');
    animate();
  }
};

const keyFunctions = {
  'KeyA': () => keys.a.pressed = true,
  'KeyD': () => keys.d.pressed = true,
  'KeyX': () => game.pet.getAbility(),
  'Escape': () => pause(),
  'KeyM': () => toggleAudio(),
  'Space': () => game.player.shoot(),
  'Digit1': () => changeAmmo('APShell', APShell),
  'Digit2': () => changeAmmo('HEASShell', HEASShell),
  'Digit3': () => changeAmmo('HEShell', HEShell),
  'Digit4': () => useAdrenaline(),
};

window.addEventListener('keydown', (event) => {
  try {
    keyFunctions[event.code]();
  } catch {
    return true;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.code) {
  case 'KeyA':
    keys.a.pressed = false;
    break;
  case 'KeyD':
    keys.d.pressed = false;
    break;
  }
});

getSkinShip();
backgroundStars();
loadProgress();
animate();
