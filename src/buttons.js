import { canvas, gameGUI, missionsGUI, shopGUI, toggleScreen } from './utils.js';
import { Game } from './classes/Game.js';
import { checkMissionProgress, saveMissionProgress } from './missions.js';

canvas.width = 850;
canvas.height = 960;

export let game = new Game();

gameGUI.backgroundAudio.volume = 0.1;

const saveProgress = () => {
  const saveState = {
    coins: game.coins,
    bestScore: gameGUI.bestScore.innerHTML,
    petLevel: game.levelPet,
    petPrice: shopGUI.costPetUpgrade.innerHTML,
    multiplierLevel: game.levelMultiplier,
    multiplierPrice: shopGUI.costMulti.innerHTML,
  };
  const saveStateString = JSON.stringify(saveState);
  localStorage.setItem('saveState', saveStateString);
};

const loadProgress = () => {
  const saveFile = JSON.parse(localStorage.getItem('saveState'));
  if (!saveFile) return;
  game.coins = saveFile.coins;
  gameGUI.bestScore.innerHTML = saveFile.bestScore;
  game.levelPet = saveFile.petLevel;
  game.levelMultiplier = saveFile.multiplierLevel;
  shopGUI.costPetUpgrade.innerHTML = saveFile.petPrice;
  shopGUI.costMulti.innerHTML = saveFile.multiplierPrice;
};

const getSkinShip = (skinValue) => {
  const img = `./img/ship${skinValue}.png`;
  document.querySelector('#shipImg').src = img;
  game.player.image.src = img;
};

const play = (...ids) => {
  game.showLives();
  gameGUI.backgroundAudio.load();
  for (const id of ids) changeTab(id);
  game.gameStates.active = true;
  game.gameStates.menu = false;
  game.animate();
};

const refreshGame = () => {
  saveProgress();
  game.player.removeEventListeners();
  game = new Game();
  window.game = game;
  loadProgress();
  game.showLives();
  document.querySelector('#score').innerHTML = game.score;
  game.gameStates.active = true;
  toggleScreen(false, 'screen');
  toggleScreen(false, 'bossAnnounce');
  if (!game.gameStates.menu) {
    toggleScreen(true, 'gameInterface');
    game.animate();
  }
}

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
    document.querySelector('#coinsPet').textContent = game.coins;
    document.querySelector('#coinsShop').textContent = game.coins;
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
    document.querySelector('#coinsShop').textContent = game.coins;
    document.querySelector('#coinsPet').textContent = game.coins;
    game.player.lives += 1;
    saveProgress();
  }
};

const claimReward = () => {
  const rewardMission = 100;
  game.coins += rewardMission;
  toggleScreen(false, 'claimReward');
  saveProgress();
  saveMissionProgress();
};

const back = (...tabNames) => {
  for (const tabName of tabNames) toggleScreen(false, tabName);
  toggleScreen(true, 'menu');
};

const exit = (...ids) => {
  back(...ids);
  game.gameStates.menu = true;
  game.gameStates.active = false;
  checkMissionProgress();
  saveProgress();
  saveMissionProgress();
  refreshGame();
};

loadProgress();
document.querySelector('#coinsShop').textContent = game.coins;
document.querySelector('#coinsPet').textContent = game.coins;

window.play = play;
window.changeDifficulty = changeDifficulty;
window.changeTab = changeTab;
window.exit = exit;
window.back = back;
window.claimReward = claimReward;
window.upgradeItem = upgradeItem;
window.getSkinShip = getSkinShip;
window.buyLife = buyLife;
window.shopGUI = shopGUI;
window.game = game;
