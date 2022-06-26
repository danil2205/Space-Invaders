'use strict';

const shopGUI = {
  costMulti: document.querySelector('#costMulti'),
  costPetUpgrade: document.querySelector('#costPetUpgrade'),
};

const play = (...ids) => {
  showLives();
  gameGUI.backgroundAudio.load();
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
  const lifePrice = 100;
  if (game.coins >= lifePrice) {
    game.coins -= lifePrice;
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
