const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1920;
canvas.height = 1000;


class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0,
        }

        const image = new Image();
        image.src = './img/ship.png';
        image.onload = () => {
            const scale = 0.05;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height / 2 + this.height + 250,
            }
        }
    }

    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        if (this.image) {
            this.draw();
            this.position.x += this.velocity.x;
        }
    }
}

class Stone {
    constructor({ position }) {
        const image = new Image();
        image.src = './img/mars.png';
        image.onload = () => {
            const scale = 0.03;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = position;
        }
    }

    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    move() {
        if (this.position.y < canvas.height - this.height) {
            this.position.y += 3;
        }
    }

    delete() {
        if (this.position.y + this.height >= canvas.height) {
            setTimeout(() => {
                stones.splice(0, 1);
            }, 0);
        }
    }

    update() {
        if (this.image) {
            this.draw();
            this.move();
            this.delete();
        }
    }
}

function spawnStones() {
    if (frames % 75 === 0) stones.push(new Stone({
        position: {
            x: Math.floor(Math.random() * canvas.width),
            y: Math.floor(Math.random() * 10),
        }
    }))
}


const player = new Player();
const stones = [];
const keys = {
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
}

let frames = 0;

function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.update();

    spawnStones();

    stones.forEach((stone) => {
        stone.update();

        if (stone.image) {
            if (player.position.x <= stone.position.x + stone.width &&
                player.position.x + player.width >= stone.position.x &&
                player.position.y <= stone.position.y + stone.height) {
                console.log('Game Over');
            }
        }

    })

    if (keys.a.pressed && player.position.x > 0) player.velocity.x = -5
    else if (keys.d.pressed && player.position.x < canvas.width - player.width) player.velocity.x = 5;
    else player.velocity.x = 0;



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