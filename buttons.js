'use strict';

const play = () => {
    toggleScreen(false, 'menu');
    toggleScreen(true, 'canvas', 'allScore');
    game.active = true;
    game.menu = false;
    coinText.innerText = coins;
    animate();
};

const shop = () => {
    toggleScreen(false, 'menu');
    toggleScreen(true, 'shop');
};

const back = (id) => {
    toggleScreen(false, 'shop');
    toggleScreen(true, id);
};

const exit = (...ids) => {
    for (const id of ids) toggleScreen(false, id);
    toggleScreen(true, 'menu');
    game.menu = true;
    game.active = false;
    refreshGame();
};