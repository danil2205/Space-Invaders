'use strict';

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0,
        }

        this.opacity = 1;

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
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        ctx.restore();
    }

    move() {
        if (keys.a.pressed && player.position.x > -30) player.velocity.x = -5
        else if (keys.d.pressed && player.position.x < canvas.width - 70) player.velocity.x = 5;
        else player.velocity.x = 0;
    }

    update() {
        if (this.image) {
            this.draw();
            this.move();
            this.position.x += this.velocity.x;
        }
    }
}

class Stone {
    constructor(scale, { position }) {
        const image = new Image();
        image.src = `./img/mars.png`;
        image.onload = () => {
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
        this.position.y += 3 * speed;
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

class Cosmonaut extends Stone {
    constructor(scale, { position }) {
        super(scale, position);

        const image = new Image();
        image.src = `./img/cosmonaut.png`;
        image.onload = () => {
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = position;
        }
    }

    delete() {
        if (this.position.y + this.height >= canvas.height) {
            setTimeout(() => {
                cosmonauts.splice(0, 1);
            }, 0);
        }
    }
}

class Particle {
    constructor({ position, velocity, radius, color, fades}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.fades = fades;
        this.opacity = 1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.fades) {
            this.opacity -= 0.01
        }
    }
}