'use strict';

const costMulti = document.querySelector('#costMulti');
const costPetUpgrade = document.querySelector('#costPetUpgrade');
const abilityPet = document.querySelector('#abilityPet');

const play = (...ids) => {
  showLives();
  playAudio('background');
  toggleScreen(false, 'menu');
  for (const id of ids) toggleScreen(true, id);
  game.loadProgress();
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

const upgradeItem = (itemName, price, itemLevel) => {
  if (game.coins >= price.innerText) {
    game.coins -= price.innerText;
    price.innerText *= 2;
    if (itemName === 'pet') game.levelPetUpgrade++;
    else game.levelMultiplier++;
    saveProgress(itemName.concat('Price'), +price.innerText);
    saveProgress(itemName.concat('Level'), itemLevel);
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
  game.counterMission = NaN; // blocking counter
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
  checkMissionProgress();
  saveProgress('coins', game.coins);
  refreshGame();
};
