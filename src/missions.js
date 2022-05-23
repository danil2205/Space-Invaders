'use strict';

const dailyMission = document.querySelector('#dailyMission');
const progressMission = document.querySelector('#progressMission');

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
  dailyMission.innerHTML = randomMission;
  progressMission.innerHTML = 'Progress - Uncompleted';
};
setDailyMission();

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
updateMissions();

const setStatusMission = () => {
  toggleScreen(true, 'claimReward');
  progressMission.innerHTML = 'Progress - Completed';
};

const checkMissionProgress = () => {
  switch (dailyMission.innerText) {
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
    if (game.score > game.bestScore) setStatusMission();
    break;
  default:
    console.log('Unknown mission');
  }
};
