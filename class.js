'use strict';

class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.lives = 3;
    this.opacity = 1;
    const image = new Image();
    image.src = './img/ship1.png';
    image.onload = () => {
      const scale = 0.05;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height / 2 + this.height + 250,  // magic
      };
    };
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    ctx.restore();
  }

  move() {
    if (keys.a.pressed && player.position.x + canvas.width > canvas.width) player.velocity.x = -5;
    else if (keys.d.pressed && player.position.x + player.width < canvas.width ) player.velocity.x = 5;
    else player.velocity.x = 0;
  }

  shoot() {
    shots.push(new Shot({
      position: {
        x: this.position.x + this.width / 2,
        y: this.position.y,
      },
      velocity: {
        x: 0,
        y: -5 * speed,
      },
      radius: 5,
      color: 'yellow',
    }));
  }

  deleteShots() {
    shots.forEach((shot, index) => {
      if (shot.position.x >= canvas.height) shots.splice(index, 1);
    });
  }

  removeLives() {
    if (!game.over && player.powerUp !== 'Shield') this.lives--;
  }

  update() {
    if (this.image) {
      this.draw();
      this.move();
      this.deleteShots();
      this.position.x += this.velocity.x;
    }
  }
}

class Boss {
  constructor(scale, { position }) {
    this.velocity = {
      x: 5,
      y: 3,
    };
    this.health = 200;
    const image = new Image();
    image.src = './img/boss.png';
    image.onload = () => {
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = position;
    };
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  };

  move() {
    if (
      this.position.x + this.width > canvas.width ||
      this.position.x + canvas.width < canvas.width
    ) this.velocity.x = -this.velocity.x;
    if (
      this.position.y + this.height > canvas.height ||
      this.position.y + canvas.height < canvas.height
    ) this.velocity.y = -this.velocity.y;
  }

  shoot() {
    shots.push(new Shot({
      position: {
        x: this.position.x + this.width / 2,
        y: this.position.y + this.height,
      },
      velocity: {
        x: 0,
        y: 7 * speed,
      },
      radius: 5,
      color: 'white',
    }));
  }

  deleteBoss() {
    const TIME_TO_DISAPPEAR = 30000;
    if (bosses.length > 0) setTimeout(() => {
      bosses = [];
      toggleScreen(false, 'bossAnnounce');
    }, TIME_TO_DISAPPEAR);
  }

  update() {
    if (this.image) {
      this.draw();
      this.move();
      this.deleteBoss();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
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
    };
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  move() {
    this.position.y += 3 * speed;
  }

  delete() {
    if (this.position.y >= canvas.height) {
      setTimeout(() => stones.splice(0, 1));
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
    };
  }

  delete() {
    if (this.position.y >= canvas.height) setTimeout(() => cosmonauts.splice(0, 1));
  }
}

class Particle {
  constructor({ position, velocity, radius, color }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
  }

  draw() {
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Shot extends Particle {
  constructor({ position, velocity, radius, color }) {
    super({ position, velocity, radius, color });
  }

  deleteShots() {
    if (
      this.position.y >= canvas.height ||
      this.position.y + canvas.height < canvas.height
    ) shots.splice(0, 1);
  }

  update() {
    this.draw();
    this.deleteShots();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class PowerUp {
  constructor(scale, { position }) {
    this.position = position;
    this.velocity = {
      x: 0,
      y: 5,
    };

    const image = new Image();
    image.src = `./img/powerup.png`;
    image.onload = () => {
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = position;
    };
  }

  draw() {
    if (this.image) ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  move() {
    this.position.y += this.velocity.y * speed;
  }

  delete() {
    if (this.position.y >= canvas.height) setTimeout(() => powerups.splice(0, 1));
  }

  update() {
    this.draw();
    this.move();
    this.delete();
  }
}
