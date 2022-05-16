'use strict';

const costMulti = document.querySelector('#costMulti');
const costPetUpgrade = document.querySelector('#costPetUpgrade');
const abilityPet = document.querySelector('#abilityPet');

const play = (...ids) => {
  showLives();
  audio.load();
  audio.play();
  toggleScreen(false, 'menu');
  for (const id of ids) toggleScreen(true, id);
  gameStates.active = true;
  gameStates.menu = false;
  document.querySelector('#coins').innerText = game.coins;
  animate();
};

const changeDifficulty = () => {
  toggleScreen(true, 'difficulty');
  toggleScreen(false, 'menu');
};

const changeSpeed = (difficultySpeed) => {
  game.speed = difficultySpeed;
  toggleScreen(false, 'difficulty');
  toggleScreen(true, 'menu');
};

const petMenu = () => {
  toggleScreen(true, 'pet');
  toggleScreen(false, 'menu');
};

const shop = () => {
  toggleScreen(false, 'menu');
  toggleScreen(true, 'shop');
};

const upgradeMultiplier = () => {
  if (costMulti.innerText <= game.coins) {
    game.coins -= costMulti.innerText;
    costMulti.innerText *= 2;
    game.levelMultiplier++;
    saveProgress('costMultiplier', +costMulti.innerHTML);
    saveProgress('levelMultiplier', game.levelMultiplier);
    saveProgress('coins', game.coins);
  }
};

const upgradePet = () => {
  if (game.coins >= costPetUpgrade.innerText) {
    game.coins -= costPetUpgrade.innerText;
    costPetUpgrade.innerText *= 2;
    game.levelPetUpgrade++;
    saveProgress('costPetUpgrade', +costPetUpgrade.innerHTML);
    saveProgress('levelPetUpgrade', game.levelPetUpgrade);
    saveProgress('coins', game.coins);
  }
};

const buyLife = () => {
  const LIFE_COST = 100;
  if (game.coins >= LIFE_COST) {
    game.coins -= LIFE_COST;
    game.player.lives += 1;
    saveProgress();
  }
};

const missions = () => {
  toggleScreen(false, 'menu');
  toggleScreen(true, 'missions');
};

const claimReward = () => {
  const rewardMission = 100;
  game.coins += rewardMission;
  toggleScreen(false, 'claimReward');
  counterMission = NaN; // blocking counter
};

const tutorial = () => {
  toggleScreen(false, 'menu');
  toggleScreen(true, 'tutorial');
};

const back = (id) => {
  toggleScreen(false, 'shop');
  toggleScreen(false, 'tutorial');
  toggleScreen(false, 'missions');
  toggleScreen(false, 'pet');
  toggleScreen(false, 'difficulty');
  toggleScreen(true, id);
};

const exit = (...ids) => {
  for (const id of ids) toggleScreen(false, id);
  toggleScreen(true, 'menu');
  gameStates.pause = false;
  gameStates.menu = true;
  gameStates.active = false;
  refreshGame();
  saveProgress('coins', game.coins);
};
