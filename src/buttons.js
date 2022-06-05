'use strict';

const costMulti = document.querySelector('#costMulti');
const costPetUpgrade = document.querySelector('#costPetUpgrade');
const abilityPet = document.querySelector('#abilityPet');

const play = (...ids) => {
  showLives();
  backgroundAudio.load();
  for (const id of ids) changeTab(id);
  game.loadProgress();
  gameStates.active = true;
  gameStates.menu = false;
  document.querySelector('#coins').innerText = game.coins;
  animate();
};

const changeTab = (tabName) => {
  toggleScreen(true, tabName);
  toggleScreen(false, 'menu');
};

const changeDifficulty = (difficultySpeed) => {
  game.speed = difficultySpeed;
  changeTab('difficulty');
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
    saveProgress('coins', game.coins);
  }
};

const claimReward = () => {
  const rewardMission = 100;
  game.coins += rewardMission;
  toggleScreen(false, 'claimReward');
  game.counterMission = NaN; // blocking counter
  saveProgress('coins', game.coins);
};

const back = (tabName) => {
  toggleScreen(false, tabName);
  toggleScreen(true, 'menu');
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
