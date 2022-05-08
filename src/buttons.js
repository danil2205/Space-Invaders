'use strict';

const play = (...ids) => {
  showLives();
  audio.load();
  audio.play();
  toggleScreen(false, 'menu');
  for (const id of ids) toggleScreen(true, id);
  game.active = true;
  game.menu = false;
  document.querySelector('#coins').innerText = coins;
  animate();
};

const changeDifficulty = () => {
  toggleScreen(true, 'difficulty');
  toggleScreen(false, 'menu');
};

const petMenu = () => {
  toggleScreen(true, 'pet');
  toggleScreen(false, 'menu');
};

const shop = () => {
  toggleScreen(false, 'menu');
  toggleScreen(true, 'shop');
};

const missions = () => {
  toggleScreen(false, 'menu');
  toggleScreen(true, 'missions');
};

const claimReward = () => {
  coins += rewardMission;
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
  game.pause = false;
  game.menu = true;
  game.active = false;
  refreshGame();
  saveProgress();
};
