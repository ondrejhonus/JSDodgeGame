let player;
let blinkingBalls = [];
let hit = false;
let seconds = 0;
let topSecondsLived = localStorage.getItem('topSecondsLived') || 0;
let smallBalls = 12;
let playerImage;
let popSound1;
let popSound2;
let popSound3;

// Making cheating impossible ig idk who knows

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
    constructor(x = random(0, width), y = random(0, height), dirX = 0, dirY = 0, w = 40, h = 40, parent = true, appear = 1500) {
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
                    
                    // Check if the sound object exists before playing
                    if (nowSound) {
                        nowSound.play();
                    }
                }
                for (let index = 0; index < smallBalls; index++) {
                    let angle = Math.random() * Math.PI * 2;
                    let distance = Math.random() * 2 + 2;
                    let x = Math.cos(angle) * distance;
                    let y = Math.sin(angle) * distance;
                    if (random(-1, 1) > 0) x *= -1;
                    if (random(-1, 1) > 0) y *= -1;
                    this.explosions.push(new BlinkingBall(this.x, this.y, x, y, 10, 10, false, 5000));
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
                if (!element.drawn()) this.explosions.splice(index, 1);
            }
            return;
        }
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

    // If my math is good then this adds 2 balls every 10 seconds? i hope lol..
    if(frameCount % 600 == 0){
        smallBalls += 2;
    }

    // Every 2s new ball
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
    /* blinkingBalls.forEach((blinkingBall) => {
         blinkingBall.draw();
     });
     */


    blinkingBalls.forEach(function (ball, idx, arr) {
        ball.draw();
        if (!ball.explosions) return;
        for (const explosion of ball.explosions) {
            hit = collideCircleCircle(player.x, player.y, player.w, explosion.x, explosion.y, explosion.w);
            if (hit) {
                // Game over hah
                window.location.replace("../TryAgain/");
            }
        }


    });

}
