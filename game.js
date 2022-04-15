'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const scoreText = document.querySelector('#score');
const scoreGameOver = document.querySelector('#scoreGameOver');
const bestScoreText = document.querySelector('#bestScore');

canvas.width = 850;    // 540
canvas.height = 960;   // 960


let speed = 1;
let frames = 0;
let score = 0;
let bestScore = 0;
let player = new Player();
let stones = [];
let particles = [];
let cosmonauts = [];
const keys = {
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
}
const game = {
    active: false,
    menu: true,
    pause: false,
    over: false,
}

function toggleScreen(id, toggle) {
    const element = document.querySelector(`#${id}`);
    const display = toggle ? 'block' : 'none';
    element.style.display = display;
}

function countDown() {
    const countDownTimer = document.querySelector('#countDownTimer');
    toggleScreen('countdown', true);
    setTimeout(() => countDownTimer.textContent = '2', 1000);
    setTimeout(() => countDownTimer.textContent = '1', 2000);
    countDownTimer.textContent = '3';
}

function play() {
    toggleScreen('menu', false);
    toggleScreen('canvas', true);
    toggleScreen('allScore', true);
    game.active = true;
    game.menu = false;
    animate();
}

function settings() {
    if (game.menu) toggleScreen('menu', false);
    else toggleScreen('pause', false);
    toggleScreen('settings', true);
}

function back() {
    toggleScreen('settings', false);
    if (game.menu) toggleScreen('menu', true);
    else {
        toggleScreen('pause', true);
    }
}

function exit() {
    toggleScreen('pause', false);
    toggleScreen('canvas', false);
    toggleScreen('allScore', false);
    toggleScreen('screen', false);
    toggleScreen('menu', true);
    game.menu = true;
    game.active = false;
    refreshGame();
}

function pause() {
    if (!game.active && !game.menu && !game.over) {
        toggleScreen('pause', false);
        countDown();
        setTimeout(() => {
            game.active = true;
            game.pause = false;
            toggleScreen('countdown', false);
            animate();
        }, 3000);

    }
    else if (game.active && !game.menu && !game.over) {
        game.active = false;
        game.pause = true;
        toggleScreen('pause', true);
    }
}


function spawnObjects() {
    if (frames % 50 === 0) stones.push(new Stone(0.02,{
        position: {
            x: Math.floor(Math.random() * canvas.width) , //  36 === stone.width
            y: Math.floor(Math.random() * 10),
        }
    }))

    if (frames % 150 === 0) stones.push(new Stone(0.07,{
        position: {
            x: Math.floor(Math.random() * canvas.width - 18), //  36 === stone.width
            y: Math.floor(Math.random() * 10),
        }
    }))

    if (frames % 80  === 0) cosmonauts.push(new Cosmonaut(0.02,{
        position: {
            x: Math.floor(Math.random() * canvas.width - 25), // 50 === cosmonauts.width
            y: Math.floor(Math.random() * 5),
        }
    }))

    if (frames % 250 === 0) speed += 0.1; // speed up stones and cosmonauts
}

function collectCosmonauts() {
    cosmonauts.forEach((cosmonaut, index) => {
        if (cosmonaut.image) {
            if (player.position.x + player.width >= cosmonaut.position.x &&
                player.position.x <= cosmonaut.position.x + cosmonaut.width &&
                player.position.y <= cosmonaut.position.y + cosmonaut.height) {
                score += 1;
                scoreText.innerHTML = score;
                cosmonauts.splice(index, 1);
                console.log(score);
            }
        }
    })
}
function changeBestScore() {
    if (score > bestScore) {
        bestScore = score;
        bestScoreText.innerHTML = bestScore;
    }
}

function refreshGame() {
    player = new Player();
    stones = [];
    particles = [];
    cosmonauts = [];
    speed = 1;
    frames = 0;
    score = 0
    scoreText.innerHTML = score;
    game.active = true;
    game.over = false;
    backgroundStars();
    if (!game.menu) {
        toggleScreen('screen', false);
        toggleScreen('canvas', true);
        animate();
    }
}

function backgroundStars() {
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle({
            position: {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
            },
            velocity: {
                x: 0,
                y: 2,
            },
            radius: Math.random() * 3,
            color: 'white',
        }))
    }
}
backgroundStars();

function animate() {
    if (!game.active) return;
    if (game.over) changeBestScore();
    requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    spawnObjects();
    collectCosmonauts();
    stones.forEach((stone) => {
        stone.update();
        if (stone.image) { // lose statement
            if (player.position.x <= stone.position.x + stone.width / 2  - 22 &&   // -22 - magic number   ???
                player.position.y <= stone.position.y + stone.height &&
                player.position.x + player.width - 33>= stone.position.x) {  //  -33 - magic number   ???
                console.log('Game Over');
                player.opacity = 0;
                game.over = true;
                setTimeout(() => {
                    game.active = false;
                    scoreGameOver.innerHTML = score;
                    toggleScreen('canvas', false);
                    toggleScreen('screen', true);
                }, 2000);
            }
        }
    })

    cosmonauts.forEach((cosmonaut) => {
        cosmonaut.update();
    })

    particles.forEach((particle, index) => {
        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.y = -particle.radius;
        }
        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(index, 1)
            })
        } else {
            particle.update();
        }
    })

    frames++;
}

animate();

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'a':
            keys.a.pressed = true;
            break;
        case 'd':
            keys.d.pressed = true;
            break;
        case 'Escape':
            pause()
            break;
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'a':
            keys.a.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }
})