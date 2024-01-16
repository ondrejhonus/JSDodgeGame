let player;
let blinkingBalls = [];
let guidedMissiles = [];
let lasers = [];
let hit = false;
let seconds = 0;
let topSecondsLived = localStorage.getItem('topSecondsLived') || 0;
let smallBalls = 12;
let playerImage;
let popSound1;
let popSound2;
let popSound3;

// Making cheating impossible ig idk who knows
// Meaning that when the user leaves the page, the counter pauses

document.addEventListener('visibilitychange', handleVisibilityChange);
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
    constructor(x = random(0, width), y = random(0, height), dirX = 0, dirY = 0, w = 40, h = 40, parent = true, appear = 1500, remove = false) {
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
        let elapsedTime = millis() - this.creationTime;
        return elapsedTime < this.appearDuration;
    }

    draw() {
        let elapsedTime = millis() - this.creationTime;


        if (this.drawn()) {
            // Red ball appearance
            fill('red');
            rectMode(CENTER);
            push();
            translate(this.x, this.y);
            rect(0, 0, this.w, this.h, 360, 360);
            this.x += this.dirX;
            this.y += this.dirY;
            pop();
        } else if (this.parent && elapsedTime < this.appearDuration + this.explosionDuration) {
            let newSize = map(elapsedTime - this.appearDuration, 0, this.explosionDuration, this.w, 50);
            let newColor = lerpColor(color('red'), color(255), (elapsedTime - this.appearDuration) / this.explosionDuration);

            if (this.explosions.length < 10) {
                if (this.explosions.length < 10) {
                    let nowSoundNumber = Math.floor(random(1, 4));
                    if (nowSoundNumber == 4) {
                        nowSoundNumber = 3;
                    }

                    let nowSound;
                    if (nowSoundNumber === 1) {
                        nowSound = popSound1;
                    } else if (nowSoundNumber === 2) {
                        nowSound = popSound2;
                    } else {
                        nowSound = popSound3;
                    }

                    console.log('Playing sound:', nowSoundNumber);

                    if (nowSound) {
                        nowSound.play();
                    }
                }
                for (let index = 0; index < smallBalls; index++) {
                    let angle = Math.random() * Math.PI * 2;
                    let distance = Math.random() * 2 + 5;
                    let x = Math.cos(angle) * distance;
                    let y = Math.sin(angle) * distance;
                    if (random(-1, 1) > 0) x *= -1;
                    if (random(-1, 1) > 0) y *= -1;
                    this.explosions.push(new BlinkingBall(this.x, this.y, x, y, 10, 10, false, 5000, true));
                }
            }

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
            // Remove ball from keš
            for (let index = 0; index < this.explosions.length; index++) {
                const element = this.explosions[index];
                if(this.x > width || this.y > height || this.x < 0 || this.y < 0 ){
                    this.explosions.splice(index, 1);
                }
                else if (!element.drawn()) this.explosions.splice(index, 1);
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
        this.color = 'orange';
        this.speed = 3;
        this.lifespan = 5000; 
        this.creationTime = millis();
    }

    update() {
        let angle = atan2(player.y - this.y, player.x - this.x);
        this.x += this.speed * cos(angle);
        this.y += this.speed * sin(angle);
    }

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
        this.speed = 40;
        this.w = 15;
        this.h = 15;
        this.creationTime = millis();
        this.lifespan = 5000;
        this.color = 'lime';
    }

    update() {
        this.x += this.speed * cos(this.angle);
        this.y += this.speed * sin(this.angle);
    }

    remove() {
        return millis() - this.creationTime > this.lifespan;
    }

    draw() {
        fill(this.color);
        ellipse(this.x, this.y, this.w, this.h);
    }
}

//**************************************************************//
//************************ EYE part of the laser **************************//
//**************************************************************//

class Laser {
    constructor(corner) {
        this.size = 100;
        this.color = 'rgb(255, 160, 153)';
        this.lifespan = 3000;
        this.corner = corner;
        this.calculatePosition();
        this.projectiles = [];
        this.creationTime = millis(); 
    }

    calculatePosition() {
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

    remove() {
        return millis() - this.creationTime > this.lifespan;
    }

    draw() {
        push();
        translate(this.x, this.y);

        let angle = atan2(player.y - this.y, player.x - this.x);

        fill('white');
        ellipse(0, 0, this.size);

        let eyeSize = this.size / 2;
        let eyeX = cos(angle) * (this.size / 4);
        let eyeY = sin(angle) * (this.size / 4);

        fill('blue');
        let blueSize = eyeSize / 2;
        ellipse(eyeX, eyeY, blueSize * 2);

        fill('black');
        let blackSize = blueSize / 2;
        ellipse(eyeX, eyeY, blackSize * 2);

        noFill();
        stroke('rgba(255, 0, 0, 0.5)'); 
        strokeWeight(2);
        line(eyeX, eyeY, eyeX + cos(angle) * 2000, eyeY + sin(angle) * 2000);
        if (frameCount % 500 == 0) {
            this.projectiles.push(new LaserProjectile(eyeX, eyeY, angle));
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.projectiles[i].update();
            this.projectiles[i].draw();
            if (this.projectiles[i].remove()) {
                this.projectiles.splice(i, 1);
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
    soundFormats('mp3', 'ogg');
    popSound1 = loadSound('../media/pop1');
    popSound2 = loadSound('../media/pop2');
    popSound3 = loadSound('../media/pop3');

}

function setup() {
    canvas = createCanvas(window.innerWidth - 75, window.innerHeight - 75);
    player = new Player(width / 2, height / 2);
    //    blinkingBalls = new BlinkingBall(Math.floor(Math.random() * (width-75)), Math.floor(Math.random() * (height-75)));

    // 60fps if ur potato pc can handle it
    frameRate(60);

}
function draw() {
    background('rgba(34, 34, 34, 1)');
    player.draw();

    document.getElementById("topSecondsLived").innerText = 'Best run: ' + topSecondsLived + 's';

    for (let i = guidedMissiles.length - 1; i >= 0; i--) {
        guidedMissiles[i].update();
        guidedMissiles[i].draw();
        if (guidedMissiles[i].remove()) {
            guidedMissiles.splice(i, 1);
        }
    }



    // Every 2s new missile
    if (frameCount % 120 == 0) {
        guidedMissiles.push(new GuidedMissile());
    }

    for (const guidedMissile of guidedMissiles) {
        hit = collideCircleCircle(player.x, player.y, player.w-2, guidedMissile.x, guidedMissile.y, guidedMissile.w-2);
        if (hit) {
            // Game over hah
            window.location.replace("../TryAgain/");
        }
    }

    for (let i = lasers.length - 1; i >= 0; i--) {
        lasers[i].draw();
        if (lasers[i].remove()) {
            lasers.splice(i, 1);
        }
    }

    if (frameCount % 420 == 0) {
        let corner = Math.floor(random(1, 5));
        console.log('Laser spawner at corner no.' + corner);
        lasers.push(new Laser(corner));
    }




    // If my math is good then this adds 2 balls every 10 seconds? i hope lol..
    if (frameCount % 600 == 0) {
        smallBalls += 2;
    }

    // Every 1s new ball
    if (frameCount % 60 == 0) {
        blinkingBalls.push(new BlinkingBall());
        console.log("new ball");
    }

    // Every second in Africa a second passes O_O
    if (frameCount % 60 == 0) {
        seconds++;
        document.getElementById("currentSeconds").innerText = seconds + 's';

        if (seconds > topSecondsLived) {
            topSecondsLived = seconds;
            localStorage.setItem('topSecondsLived', topSecondsLived);
        }
    }

    blinkingBalls.forEach(function (ball, idx, arr) {
        ball.draw();
        if (ball.remove) {
            arr.splice(idx, 1);
        } else if (!ball.explosions) {
            return;
        }

        for (const explosion of ball.explosions) {
            hit = collideCircleCircle(player.x, player.y, player.w-2, explosion.x, explosion.y, explosion.w-2);
            if (hit) {
                // Game over hah
                window.location.replace("../TryAgain/");
            }
        }
    });
}