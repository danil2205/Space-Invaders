'use strict';

const costMulti = document.querySelector('#costMulti');
const costPetUpgrade = document.querySelector('#costPetUpgrade');
const abilityPet = document.querySelector('#abilityPet');

const play = (...ids) => {
  backgroundAudio.load();
  for (const id of ids) changeTab(id);
  gameStates.active = true;
  gameStates.menu = false;
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

const upgradeItem = (itemName, price) => {
  if (game.coins >= price.innerText) {
    game.coins -= price.innerText;
    price.innerText *= 2;
    if (itemName === 'pet') game.levelPet++;
    else game.levelMultiplier++;
    saveProgress();
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

const claimReward = () => {
  const rewardMission = 100;
  game.coins += rewardMission;
  toggleScreen(false, 'claimReward');
  game.counterMission = NaN; // blocking counter
  saveProgress();
};

const back = (...tabNames) => {
  for (const tabName of tabNames) toggleScreen(false, tabName);
  toggleScreen(true, 'menu');
};

const exit = (...ids) => {
  back(...ids);
  gameStates.menu = true;
  gameStates.active = false;
  checkMissionProgress();
  saveProgress();
  refreshGame();
};
