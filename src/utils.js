export const canvas = document.querySelector('canvas');
export const ctx = canvas.getContext('2d');
export const canvasPos = canvas.getBoundingClientRect();

export const gameGUI = {
  bestScore: document.querySelector('#bestScore'),
  APShell: document.querySelector('#APShell'),
  HEASShell: document.querySelector('#HEASShell'),
  HEShell: document.querySelector('#HEShell'),
  progressBar: document.querySelector('#reloadGun'),
  imgLives: document.querySelector('#imgLives'),
  backgroundAudio: document.querySelector('#background'),
  abilityPet: document.querySelector('#abilityPet'),
};

export const missionsGUI = {
  dailyMission: document.querySelector('#dailyMission'),
  progressMission: document.querySelector('#progressMission'),
  claimReward: document.querySelector('#claimReward'),
};

export const shopGUI = {
  costMulti: document.querySelector('#costMulti'),
  costPetUpgrade: document.querySelector('#costPetUpgrade'),
};

export const randomNum = (maxNumber) => ~~(Math.random() * maxNumber);

export const toggleScreen = (toggle, id) => {
  const element = document.querySelector(`#${id}`);
  const display = toggle ? 'block' : 'none';
  element.style.display = display;
};

export const toggleAudio = () => {
  gameGUI.backgroundAudio.muted = !gameGUI.backgroundAudio.muted;
};
