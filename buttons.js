'use strict';

const play = (...ids) => {
  showLives();
  audio.load();
  audio.play();
  toggleScreen(false, 'menu');
  for (const id of ids) toggleScreen(true, id);
  game.active = true;
  game.menu = false;
  coinText.innerText = coins;
  animate();
};

const shop = () => {
  toggleScreen(false, 'menu');
  toggleScreen(true, 'shop');
};

const tutorial = () => {
  toggleScreen(false, 'menu');
  toggleScreen(true, 'tutorial');
}

const back = (id) => {
  toggleScreen(false, 'shop');
  toggleScreen(false, 'tutorial');
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
