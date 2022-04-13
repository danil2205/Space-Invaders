'use strict';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const scoreText = document.querySelector('#score');

canvas.width = 1920;
canvas.height = 1080;


let speed = 1;
let frames = 0;
let score = 0;
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
    active: true
}

function spawnObjects() {
    if (frames % 75 === 0) stones.push(new Stone(0.02,{
        position: {
            x: Math.floor(Math.random() * canvas.width - 36), //  36 === stone.width
            y: Math.floor(Math.random() * 10),
        }
    }))
    if (frames % 80 === 0) cosmonauts.push(new Cosmonaut(0.02,{
        position: {
            x: Math.floor(Math.random() * canvas.width + 50), // 50 === cosmonauts.width
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

function refreshGame() {
    player = new Player();
    stones = [];
    particles = [];
    cosmonauts = [];
    backgroundStars()
    speed = 1;
    frames = 0;
    score = 0
    scoreText.innerHTML = score;
    game.active = true;
    animate();
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
                y: 1.5,
            },
            radius: Math.random() * 3,
            color: 'white',
        }))
    }
}
backgroundStars();

function animate() {
    if (!game.active) return;
    requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    spawnObjects();
    collectCosmonauts();
    stones.forEach((stone) => {
        stone.update();
        if (stone.image) { // lose statement
            if (player.position.x <= stone.position.x + stone.width / 2 &&
                player.position.x + player.width >= stone.position.x &&
                player.position.y <= stone.position.y + stone.height) {
                console.log('Game Over');
                player.opacity = 0;
                setTimeout(() => game.active = false, 2000);
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