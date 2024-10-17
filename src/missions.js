'use strict';

import { game } from './buttons.js';
import { gameGUI, missionsGUI, randomNum, toggleScreen } from './utils.js';

const dailyMissions = [
  'Collect 10 Cosmonauts',
  'Kill 1 Boss',
  'Score 25 points',
  'Beat Your Record',
];

const endDate = {
  'hours': '23',
  'minutes': '59',
  'seconds': '59',
};

export const saveMissionProgress = (date) => {
  const isCompleted = missionsGUI.progressMission.innerHTML === 'Progress - Completed';
  const isRewardClaimed = isCompleted && missionsGUI.claimReward.style.display === 'none';
  const parsedProgress = JSON.parse(localStorage.getItem('missionProgress'));

  const missionState = {
    task: missionsGUI.dailyMission.innerHTML,
    isCompleted: isCompleted,
    setDate: date || parsedProgress?.setDate,
    isRewardClaimed: isRewardClaimed,
  }

  const missionProgress = JSON.stringify(missionState);
  localStorage.setItem('missionProgress', missionProgress);
};

const setDailyMission = () => {
  const missionProgress = JSON.parse(localStorage.getItem('missionProgress'));
  let date;
  if (new Date().toLocaleDateString() === missionProgress?.setDate) {
    date = missionProgress.setDate;
    missionsGUI.dailyMission.innerHTML = missionProgress.task;
    missionsGUI.progressMission.innerHTML = missionProgress.isCompleted ? 'Progress - Completed' : 'Progress - Uncompleted';
  } else {
    date = new Date().toLocaleDateString();
    const randomMission = dailyMissions[randomNum(dailyMissions.length)];
    missionsGUI.dailyMission.innerHTML = randomMission;
    missionsGUI.progressMission.innerHTML = 'Progress - Uncompleted';
  }

  saveMissionProgress(date);
};

const addZeroInTime = (time, n = 2) => `${time}`.padStart(n, '0');

const updateMissions = () => {
  const missionProgress = JSON.parse(localStorage.getItem('missionProgress'));
  const timeRemains = document.querySelector('#timeRemains');
  const DELAY = 1000;
  const currentTime = new Date();

  const hours = addZeroInTime(endDate.hours - currentTime.getHours());
  const minutes = addZeroInTime(endDate.minutes - currentTime.getMinutes());
  const seconds = addZeroInTime(endDate.seconds - currentTime.getSeconds());
  const remainingTime = hours + ':' + minutes + ':' + seconds;

  timeRemains.innerHTML = `Times remaining: ${remainingTime}`;
  if (new Date().toLocaleDateString() !== missionProgress.setDate) setDailyMission();
  setTimeout(updateMissions, DELAY);
};

const setStatusMission = () => {
  const missionProgress = JSON.parse(localStorage.getItem('missionProgress'));
  if (!missionProgress.isRewardClaimed) toggleScreen(true, 'claimReward');
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
  case 'Score 25 points':
    if (game.score >= 25) setStatusMission();
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
