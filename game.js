const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1920;
canvas.height = 1000;


class Player {
    constructor() {
        this.width = 100;
        this.height = 50;

        this.position = {
            x: canvas.width / 2 - this.width / 2,
            y: canvas.height / 2 + this.height + 350,
        }
        this.velocity = {
            x: 0,
            y: 0,
        }

    }
    draw() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
    }
}

const player = new Player();
const keys = {
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
}


function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.update();

    if (keys.a.pressed && player.position.x > 0) player.velocity.x = -5
    else if (keys.d.pressed && player.position.x < canvas.width - player.width) player.velocity.x = 5;
    else player.velocity.x = 0;

}

animate();

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'a':
            keys.a.pressed = true;
            // player.velocity.x = -5
            break;
        case 'd':
            // player.velocity.x = 5;
            keys.d.pressed = true;
            break;
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'a':
            keys.a.pressed = false;
            // player.velocity.x = 0;
            break;
        case 'd':
            // player.velocity.x = 0;
            keys.d.pressed = false;
            break;
    }
})