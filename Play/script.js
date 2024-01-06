let player;


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
    move() {
        if (keyIsDown(87)) {
            if (this.y > this.h / 2) this.y -= this.v;
        }
        if (keyIsDown(83)) {
            if (this.y < height - this.h / 2) this.y += this.v;
        }
        if (keyIsDown(65)) {
            if (this.x > this.w / 2) this.x -= this.v;
        }
        if (keyIsDown(68)) {
            if (this.x < width - this.w / 2) this.x += this.v;
        }
    }
    draw() {
        this.move();
        fill('f');
        rectMode(CENTER);
        push();
        translate(this.x, this.y);
        rect(0, 0, this.w, this.h, 360, 360);
        pop();
      }
    }

//**************************************************************//
//************************SETUP / DRAW**************************//
//**************************************************************//

    function setup() {
        canvas = createCanvas(window.innerWidth-75, window.innerHeight-75);
        player = new Player(width / 2, height / 2);
      }
      function draw() {
        background(0);
        player.draw();
    }

//**************************************************************//
//************************LEVEL SYSTEM**************************//
//**************************************************************//


function saveTopLevel(level) {
    localStorage.setItem('topLevel', level.toString());
}

function getTopLevel() {
    const savedLevel = localStorage.getItem('topLevel');
    return savedLevel ? parseInt(savedLevel, 10) : 1;
}

document.addEventListener('keydown', function (event) {
    if (event.code === 'Space') {
        let currentLevel = parseInt(document.getElementById('currentLevelDisplay').textContent.split(":")[1].trim(), 10) || 0;
        let topLevel = getTopLevel();

        currentLevel++;

        if (currentLevel > topLevel) {
            topLevel = currentLevel;
            saveTopLevel(topLevel);
            updateLevelDisplay('top', topLevel);
        }
        updateLevelDisplay('current', currentLevel);
    }
});
function updateLevelDisplay(type, level) {
    const displayElement = document.getElementById(type + 'LevelDisplay');
    displayElement.textContent = (type === 'current' ? 'Level: ' : 'Top Level: ') + level;
}
const initialTopLevel = getTopLevel();
updateLevelDisplay('top', initialTopLevel);