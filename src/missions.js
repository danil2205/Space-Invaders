'use strict';

import { game } from './buttons.js';
import { gameGUI, missionsGUI, randomNum, toggleScreen } from './utils.js';

const dailyMissions = [
  'Collect 10 Cosmonauts',
  'Kill 1 Boss',
  'Score 100 points',
  'Beat Your Record',
];

const endDate = {
  'hours': '23',
  'minutes': '59',
  'seconds': '59',
};

const setDailyMission = () => {
  game.counterMission = 0;
  const randomMission = dailyMissions[randomNum(dailyMissions.length)];
  missionsGUI.dailyMission.innerHTML = randomMission;
  missionsGUI.progressMission.innerHTML = 'Progress - Uncompleted';
};

const addZeroInTime = (time, n = 2) => `${time}`.padStart(n, '0');

const updateMissions = () => {
  const timeRemains = document.querySelector('#timeRemains');
  const DELAY = 1000;
  const currentTime = new Date();

  const hours = addZeroInTime(endDate.hours - currentTime.getHours());
  const minutes = addZeroInTime(endDate.minutes - currentTime.getMinutes());
  const seconds = addZeroInTime(endDate.seconds - currentTime.getSeconds());
  const remainingTime = hours + ':' + minutes + ':' + seconds;

  timeRemains.innerHTML = `Times remaining: ${remainingTime}`;
  if (remainingTime === '00:00:00') setDailyMission();
  setTimeout(updateMissions, DELAY);
};

const setStatusMission = () => {
  toggleScreen(true, 'claimReward');
  missionsGUI.progressMission.innerHTML = 'Progress - Completed';
};

export const checkMissionProgress = () => {
  switch (missionsGUI.dailyMission.innerText) {
  case 'Collect 10 Cosmonauts':
    if (game.counterMission >= 10) setStatusMission();
    break;
  case 'Kill 1 Boss':
    if (game.counterMission >= 1) setStatusMission();
    break;
  case 'Score 100 points':
    if (game.score >= 100) setStatusMission();
    break;
  case 'Beat Your Record':
    if (game.score > gameGUI.bestScore.innerHTML) setStatusMission();
    break;
  default:
    console.log('Unknown mission');
  }
};

setDailyMission();
updateMissions();
