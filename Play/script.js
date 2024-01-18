let player;
let blinkingBalls = [];
let guidedMissiles = [];
let lasers = [];
let projectiles = [];
let hit = false;
let seconds = 0;
let topSecondsLived = localStorage.getItem("topSecondsLived") || 0;
let smallBalls = 1;
let playerImage;
let popSound1;
let popSound2;
let popSound3;

// Making cheating impossible ig idk who knows
// Meaning that when the user leaves the page, the counter pauses
document.addEventListener("visibilitychange", handleVisibilityChange);
function handleVisibilityChange() {
  if (document.hidden) {
    clearInterval(timerInterval);
  } else {
    timerInterval = setInterval(updateCounter, 1000);
  }
}
//**************************************************************//
//************************PLAYER**************************//
//**************************************************************//

class Player {
  constructor(posX, posY) {
    this.x = posX;
    this.y = posY;
    this.w = 40;
    this.h = 40;
    this.v = 10;
  }

  // MOVEMENT SYSTEM

  move() {
    if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
      if (this.y > this.h / 2) this.y -= this.v;
    }
    if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
      if (this.y < height - this.h / 2) this.y += this.v;
    }
    if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
      if (this.x > this.w / 2) this.x -= this.v;
    }
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
      if (this.x < width - this.w / 2) this.x += this.v;
    }
  }
  draw() {
    this.move();
    rectMode(CENTER);
    push();
    translate(this.x, this.y);
    image(playerImage, -25, -25, 45, 45);
    pop();
  }
}

//**************************************************************//
//************************BALL**************************//
//**************************************************************//

class BlinkingBall {
  constructor(
    x = random(0, width),
    y = random(0, height),
    dirX = 0,
    dirY = 0,
    w = 40,
    h = 40,
    parent = true,
    appear = 1500,
    remove = false
  ) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dirX = dirX;
    this.dirY = dirY;
    this.creationTime = millis();
    this.appearDuration = appear;
    this.explosionDuration = 200;
    this.explosions = [];
    this.parent = parent;
    this.remove = remove;

    if (this.parent) {
      blinkingBalls.push(this);
    }
  }

  drawn() {
    // Check if ball is supposed to be still here
    let elapsedTime = millis() - this.creationTime;
    return elapsedTime < this.appearDuration;
  }

  draw() {
    let elapsedTime = millis() - this.creationTime;

    if (this.drawn()) {
      // make red ball
      fill("red");
      rectMode(CENTER);
      push();
      translate(this.x, this.y);
      rect(0, 0, this.w, this.h, 360, 360);
      this.x += this.dirX;
      this.y += this.dirY;
      pop();
    } else if (
      // if ball is drawn and it has is a parent
      this.parent &&
      elapsedTime < this.appearDuration + this.explosionDuration
    ) {
      // make explosion animation, changing size and color
      let newSize = map(
        elapsedTime - this.appearDuration,
        0,
        this.explosionDuration,
        this.w,
        50
      );
      let newColor = lerpColor(
        color("red"),
        color(255),
        (elapsedTime - this.appearDuration) / this.explosionDuration
      );

      // Make explosion sound
      if (this.explosions.length < 10) {
        if (this.explosions.length < 10) {
          let explodeSoundNumber = Math.floor(random(1, 4));
          if (explodeSoundNumber == 4) {
            explodeSoundNumber = 3;
          }

          // Make a random pop sound from 1-3, there is a small chance that it will be 4, but that is just a 3
          let explodeSound;
          if (explodeSoundNumber === 1) {
            explodeSound = popSound1;
          } else if (explodeSoundNumber === 2) {
            explodeSound = popSound2;
          } else {
            explodeSound = popSound3;
          }
          // Play the sound
          if (explodeSound) {
            explodeSound.play();
          }
        }
        // Make the small balls go in random directions from the big ball
        for (let index = 0; index < smallBalls; index++) {
          // random angle
          let angle = Math.random() * Math.PI * 2;
          // random distance
          let distance = Math.random() * 2 + 5;
          let x = Math.cos(angle) * distance;
          let y = Math.sin(angle) * distance;
          if (random(-1, 1) > 0) x *= -1;
          if (random(-1, 1) > 0) y *= -1;
          // draw the small balls
          this.explosions.push(
            new BlinkingBall(this.x, this.y, x, y, 10, 10, false, 5000, true)
          );
        }
      }
      // make explosion
      fill(newColor);
      rectMode(CENTER);
      push();
      translate(this.x, this.y);
      rect(0, 0, newSize, newSize, 360, 360);
      pop();
    } else {
      if (!this.explosions) return;
      for (const explosion of this.explosions) {
        if (explosion.parent) continue;
        explosion.draw();
      }
      // Remove ball from array if it is out of canvas or if it is older than 5 seconds
      for (let index = 0; index < this.explosions.length; index++) {
        const element = this.explosions[index];
        if (this.x > width || this.y > height || this.x < 0 || this.y < 0) {
          this.explosions.splice(index, 1);
        } else if (!element.drawn()) this.explosions.splice(index, 1);
      }
      return;
    }
  }
}

//**************************************************************//
//************************ GUIDED MISSILE **************************//
//**************************************************************//

class GuidedMissile {
  constructor() {
    this.w = 20;
    this.x = random(0, width);
    this.y = random(0, height);
    this.color = "orange";
    this.speed = 3;
    this.lifespan = 5000;
    this.creationTime = millis();
  }
  // the missile follows the player
  update() {
    let angle = atan2(player.y - this.y, player.x - this.x);
    this.x += this.speed * cos(angle);
    this.y += this.speed * sin(angle);
  }
  // the missile disappears after 5 seconds
  remove() {
    return millis() - this.creationTime > this.lifespan;
  }

  draw() {
    fill(this.color);
    rectMode(CENTER);
    push();
    translate(this.x, this.y);
    rect(0, 0, this.w, this.w, 360, 360);
    pop();
  }
}

//**************************************************************//
//************************ Deadly part of the laser **************************//
//**************************************************************//

class LaserProjectile {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 27;
    this.w = 15;
    this.h = 15;
    this.creationTime = millis();
    this.lifespan = 4000;
    this.color = "lime";
  }
  // the laser projectile follows the player
  update() {
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
  }
  // the laser projectile disappears after 5 seconds
  remove() {
    return millis() - this.creationTime > this.lifespan;
  }
  // the laser projectile is made into a circle
  draw() {
    fill(this.color);
    circle(this.x, this.y, this.w);
  }
}

//**************************************************************//
//************************ EYE part of the laser **************************//
//**************************************************************//

class Laser {
  constructor(corner) {
    this.size = 100;
    this.color = "rgb(255, 160, 153)";
    this.lifespan = 5000;
    this.corner = corner;
    this.calculatePosition();
    this.creationTime = millis();
    this.isFiring = false;
  }

  calculatePosition() {
    // Only calculate position if not firing
    let eyeOffset = this.size / 4;
    if (this.corner == 1) {
      this.x = 0 + eyeOffset;
      this.y = 0 + eyeOffset;
    } else if (this.corner == 2) {
      this.x = width - eyeOffset;
      this.y = 0 + eyeOffset;
    } else if (this.corner == 3) {
      this.x = width - eyeOffset;
      this.y = height - eyeOffset;
    } else {
      this.x = 0 + eyeOffset;
      this.y = height - eyeOffset;
    }
  }
  // the laser disappears after 5 seconds
  remove() {
    return millis() - this.creationTime > this.lifespan;
  }

  draw() {
    push();
    translate(this.x, this.y);

    // Calculate angle between player and laser
    let angle = atan2(player.y - this.y, player.x - this.x);

    fill("white");
    circle(0, 0, this.size);

    let eyeSize = this.size / 2;
    let eyeX = cos(angle) * (this.size / 4);
    let eyeY = sin(angle) * (this.size / 4);

    fill("blue");
    let blueSize = eyeSize / 2;
    circle(eyeX, eyeY, blueSize * 2);

    fill("black");
    let blackSize = blueSize / 2;
    circle(eyeX, eyeY, blackSize * 2);

    noFill();
    stroke("rgba(255, 0, 0, 0.5)");
    if (this.isFiring) {
      // Make the laser invisible after it has fired
      stroke("rgba(0, 0, 0, 0)");
    }
    line(eyeX, eyeY, eyeX + cos(angle) * 2000, eyeY + sin(angle) * 2000);
    // spawn 5 projectiles every after every 500 frames
    if (frameCount % 500 == 0) {
      const delays = [0, 20, 50, 75, 100];
      for (const delay of delays) {
        setTimeout(() => {
          projectiles.push(new LaserProjectile(eyeX, eyeY, angle));
        }, delay);
      }
      this.isFiring = true; // Set isFiring to true when projectile fires
    }

    /////////////////////////// LASER PROJECTILES ///////////////////////////
    for (let i = projectiles.length - 1; i >= 0; i--) {
      projectiles[i].update();
      projectiles[i].draw();
      // remove projectiles older than lifespan
      if (projectiles[i].remove()) {
        projectiles.splice(i, 1);
        this.isFiring = false; // Set isFiring to false when projectile is removed
      }
    }

    // remove those out of viewframe
    // projectiles = projectiles.filter((projectile) => {
    //     return (
    //        projectile.x > 0 && projectile.x < width && projectile.y > 0 && projectile.y < height
    //     );
    // });

    for (const laserProjectile of projectiles) {
    // calculate distance between player and laser projectile
      const distance = dist(
        player.x,
        player.y,
        laserProjectile.x,
        laserProjectile.y
      );
 // if distance is less than 100, game over
      if (distance < 100) {
        window.location.replace("../TryAgain/");
      }

      // if laser projectile hits player, game over
      hit = collideCircleCircle(
        player.x,
        player.y,
        player.w + 15,
        laserProjectile.x - 20,
        laserProjectile.y - 20,
        laserProjectile.w + 40
      );
      if (hit) {
        // Game over hah
          window.location.replace("../TryAgain/");
      }
    }

    pop();
  }
}

//**************************************************************//
//************************SETUP / DRAW**************************//
//**************************************************************//

function preload() {
  playerImage = loadImage("../img/doge.png");
  soundFormats("mp3", "ogg");
  popSound1 = loadSound("../media/pop1");
  popSound2 = loadSound("../media/pop2");
  popSound3 = loadSound("../media/pop3");
}

function setup() {
  canvas = createCanvas(window.innerWidth - 75, window.innerHeight - 75);
  player = new Player(width / 2, height / 2);
  //    blinkingBalls = new BlinkingBall(Math.floor(Math.random() * (width-75)), Math.floor(Math.random() * (height-75)));

  // 60fps if ur potato pc can handle it
  frameRate(60);
}
function draw() {
  background("rgba(34, 34, 34, 1)");
  player.draw();

  /////////////////////////// COUNTER ///////////////////////////
  document.getElementById("topSecondsLived").innerText =
    "Best run: " + topSecondsLived + "s";
  // Every second in Africa a second passes O_O (and the counter goes up)
  if (frameCount % 60 == 0) {
    seconds++;
    // Update the counter
    document.getElementById("currentSeconds").innerText = seconds + "s";

    // If the user has lived longer than the topSecondsLived, then set the topSecondsLived to the current seconds
    if (seconds > topSecondsLived) {
      topSecondsLived = seconds;
      localStorage.setItem("topSecondsLived", topSecondsLived);
    }
  }

  /////////////////////////// BALLS ///////////////////////////

  blinkingBalls.forEach(function (ball, idx, arr) {
    ball.draw();
    // Remove ball from array after 5 seconds
    if (ball.remove) {
      arr.splice(idx, 1);
    } else if (!ball.explosions) {
      return;
    }
    // collision detection between player and ball
    for (const explosion of ball.explosions) {
      hit = collideCircleCircle(
        player.x,
        player.y,
        player.w - 2,
        explosion.x,
        explosion.y,
        explosion.w - 2
      );
      if (hit) {
        // Game over hah
        window.location.replace("../TryAgain/");
      }
    }
  });

  // If my math is good then this adds 2 balls every 10 seconds? i hope lol..
  if (frameCount % 600 == 0) {
    smallBalls += 2;
  }

  // Every 1s new ball
  if (frameCount % 60 == 0) {
    blinkingBalls.push(new BlinkingBall());
  }

  /////////////////////////// MISSILES ///////////////////////////

  // Every 2s new missile
  if (frameCount % 120 == 0) {
    guidedMissiles.push(new GuidedMissile());
  }
  // update missile position and draw it
  for (let i = guidedMissiles.length - 1; i >= 0; i--) {
    guidedMissiles[i].update();
    guidedMissiles[i].draw();
    // remove missiles older than lifespan
    if (guidedMissiles[i].remove()) {
      guidedMissiles.splice(i, 1);
    }
  }
  // collision detection between player and missile
  for (const guidedMissile of guidedMissiles) {
    hit = collideCircleCircle(
      player.x,
      player.y,
      player.w,
      guidedMissile.x,
      guidedMissile.y,
      guidedMissile.w
    );
    if (hit) {
      // Game over hah
      window.location.replace("../TryAgain/");
    }
  }

  /////////////////////////// LASERS ///////////////////////////
  // Spawn a laser every 7 seconds
  if (frameCount % 420 == 0) {
    // Spawn laser in random corner
    let corner = Math.floor(random(1, 5));
    lasers.push(new Laser(corner));
  }
  // Draw lasers, remove lasers older than lifespan
  for (let i = lasers.length - 1; i >= 0; i--) {
    lasers[i].draw();
    if (lasers[i].remove()) {
      lasers.splice(i, 1);
    }
  }
}
