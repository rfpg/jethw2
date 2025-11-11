let mySound;

function preload() {
    mySound = loadSound('foghorn.mp3');
}

class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.c = color(250, 171, 43);

        this.w = 15;
        this.h = 15;

        this.top = 0;
        this.bottom = 0;
        this.left = 0;
        this.right = 0;

        this.activate = false;

        // gravity / fall properties
        this.vy = 0;
        this.gravity = 0.6;
        this.maxVy = 12;
        this.onPlatform = false;
    }

    update(platformList) {
        // apply gravity if not on a platform
        if (!this.onPlatform) {
            this.vy = min(this.vy + this.gravity, this.maxVy);
            this.y += this.vy;
        }

        // update bounds
        this.top = this.y;
        this.bottom = this.y + this.h;
        this.left = this.x;
        this.right = this.x + this.w;

        // check collision with platforms so the coin can land on them
        this.onPlatform = false;
        for (let p of platformList) {
            if (this.left <= p.right && this.right >= p.left && this.top <= p.bottom && this.bottom >= p.top) {
                // place coin on top of platform and stop falling
                this.onPlatform = true;
                this.vy = 0;
                this.y = p.top - this.h;
                this.top = this.y;
                this.bottom = this.y + this.h;
                break;
            }
        }

        // prevent falling past bottom of canvas
        if (this.y + this.h > height) {
            this.y = height - this.h;
            this.vy = 0;
            this.onPlatform = true;
            this.top = this.y;
            this.bottom = this.y + this.h;
        }
    }

    display() {
        strokeWeight(5);
        stroke(255);
        fill(this.c);

        // bounds are maintained in update(); still safe to ensure they match
        this.top = this.y;
        this.bottom = this.y + this.h;
        this.left = this.x;
        this.right = this.x + this.w;

        ellipse(this.x, this.y, this.w, this.h);
    }

    collision(player) {
        if (this.left <= player.right && this.right >= player.left && this.top <= player.bottom && this.bottom >= player.top) {
            this.activate = true;
        }
    }
}

class Platform {
    constructor(x, y, w) {
        this.x = x;
        this.y = y;
        this.w = w;

        this.top = 0;
        this.bottom = 0;
        this.left = 0;
        this.right = 0;

        this.h = 25;
    }

    display() {
        strokeWeight(5);
        stroke(255);
        noFill();

        this.top = this.y;
        this.bottom = this.y + this.h;
        this.left = this.x;
        this.right = this.x + this.w;

        rect(this.x, this.y, this.w, this.h);

        this.x = constrain(this.x, 0, 800);
    }

    collision(player) {
        if (this.left <= player.right && this.right >= player.left && this.top <= player.bottom && this.bottom >= player.top) {
            // place player on top of platform and stop falling
            player.falling = false;
            player.vy = 0;
            // optional: snap player to platform top
            player.y = this.top - (player.h - player.s);
            player.top = player.y;
            player.bottom = player.y + player.h;
        }
    }

    randomize() {
        this.x = int(random(31)) * 25;
        this.y = (int(random(6)) * 125) + 150;
        this.w = int(random(40)) * 10;
    }
}

class Player {
    constructor(x, y, c, mover) {
        this.x = x;
        this.y = y;
        this.c = c;
        this.mover = mover;
        this.h = 0;
        this.s = 30;
        this.vx = 0;
        this.vy = 0;

        // physics
        this.speed = 5;      // horizontal speed
        this.gravity = 0.8;
        this.jumpSpeed = 14; // initial jump impulse
        this.maxVy = 14;

        this.jumping = false;
        this.falling = false;
        this.onPlatform = false;

        // request jump flag so we only start jump once per key press
        this.requestJump = false;
    }

    display() {
        strokeWeight(5);
        stroke(255);
        fill(this.c);

        // body/head: use this.* everywhere
        ellipse(this.x + 5, this.y, this.s - 10, this.s - 10);
        rect(this.x, this.y + (this.s - 10), this.s, this.s);
        arc(this.x, this.y + (this.s - 10) + (this.s / 2), this.s, this.s, 0, PI);

        this.h = (this.s * 3) - 10;
        this.top = this.y;
        this.bottom = this.y + this.h;
        this.left = this.x;
        this.right = this.x + this.s;
    }

    xMove() {
        // apply horizontal velocity
        this.x += this.vx;
        this.x = int(constrain(this.x, 0, width - this.s));

        if (this.mover == "wasd") {
            if (keyIsPressed) {
                if (key == 'a' || key == 'A') {
                    this.vx = -this.speed;
                } else if (key == 'd' || key == 'D') {
                    this.vx = this.speed;
                }
            } else {
                this.vx = 0;
            }
        } else if (this.mover == "arrow") {
            if (keyIsPressed) {
                if (keyCode == LEFT_ARROW) {
                    this.vx = -this.speed;
                } else if (keyCode == RIGHT_ARROW) {
                    this.vx = this.speed;
                }
            } else {
                this.vx = 0;
            }
        }
    }

    yMove() {
        // handle jump request: turn request into a single impulse if standing
        if (this.requestJump && !this.falling && !this.jumping && this.onPlatform) {
            this.jumping = true;
            this.vy = -this.jumpSpeed;
        }
        this.requestJump = false;

        // apply gravity and vertical velocity
        this.vy += this.gravity;
        this.vy = constrain(this.vy, -this.maxVy, this.maxVy);
        this.y += this.vy;

        // update flags from velocity
        if (this.vy > 0) {
            this.jumping = false;
            this.falling = true;
        } else if (this.vy < 0) {
            this.falling = false;
        }

        // keep player within a reasonable vertical range
        this.y = constrain(this.y, 0, 1000);

        // update bounds (display also updates bounds but make sure they're set)
        this.top = this.y;
        this.bottom = this.y + this.h;
        this.left = this.x;
        this.right = this.x + this.s;
    }

    fall(platformList) {
        // check whether player is on any platform; if not, set falling true
        if (!this.jumping) {
            this.onPlatform = false;

            for (let platform of platformList) {
                if (this.top <= platform.bottom && this.bottom >= platform.top && this.left <= platform.right && this.right >= platform.left) {
                    this.onPlatform = true;
                    this.falling = false;
                    this.vy = 0;
                    break;
                }
            }

            if (!this.onPlatform) {
                this.falling = true;
            }
        } else {
            this.onPlatform = false;
        }
    }
}

// Globals (initialized safely — don't call p5 functions at global eval time)
let coin;

let platformList = [];
let platformA;
let platformB;
let platformC;
let platformD;
let platformE;
let platformF;

let player1;
let player2;

let gameStart = true;
let gameOver = false;

// DON'T call p5 functions (second(), minute(), millis(), etc.) here.
// Initialize them in setup() instead.
let startS = 0;
let timeS;
let startM = 0;
let timeM;
let m = 0;
let i;

function setup() {
    createCanvas(800, 800);
    ellipseMode(CORNER);
    rectMode(CORNER);

    // initialize p5-derived time variables now that p5 is ready
    startS = second();
    startM = minute();
    m = millis() / 1000;

    // initialize coin and platforms into the already-declared globals
    coin = new Coin(int(random(790)) + 5, int(random(650)) + 100);

    platformA = new Platform(0, 150, int(random(65)) * 10);
    platformB = new Platform(0, 275, int(random(65)) * 10);
    platformC = new Platform(0, 400, int(random(65)) * 10);
    platformD = new Platform(0, 525, int(random(65)) * 10);
    platformE = new Platform(0, 650, int(random(65)) * 10);
    platformF = new Platform(0, 775, width);

    platformList = []; // ensure empty
    platformList.push(platformA);
    platformList.push(platformB);
    platformList.push(platformC);
    platformList.push(platformD);
    platformList.push(platformE);
    platformList.push(platformF);

    for (i = 0; i < 6; i++) {
        platformList.push(new Platform(int(random(31)) * 25, (int(random(6)) * 125) + 150, int(random(40)) * 10));
    }

    player1 = new Player(300, 705, color(247, 224, 107), "wasd");
    player2 = new Player(500, 705, color(236, 177, 250), "arrow");
}

function draw() {
    background(13, 18, 54);

    // Update players first so their bounds are current for collisions
    player1.xMove();
    player1.yMove();
    player1.display();

    player2.xMove();
    player2.yMove();
    player2.display();

    // Update coin physics (so it can land on platforms) and display it
    coin.update(platformList);
    coin.display();
    coin.collision(player1);
    coin.collision(player2);

    // Display platforms and resolve platform collisions against up-to-date player bounds
    for (let platform of platformList) {
        platform.display();
        platform.collision(player1);
        platform.collision(player2);
    }

    // if coin was collected, randomize platforms and move coin (reset its velocity)
    if (coin.activate == true) {
        for (let platform of platformList) {
            if (platform !== platformF) {
                platform.randomize();
            }
        }
        coin.x = int(random(800));
        coin.y = int(random(800));
        coin.vy = 0;
        coin.onPlatform = false;
        coin.activate = false;
    }

    // After collisions, update fall state derived from platform overlaps
    player1.fall(platformList);
    player2.fall(platformList);

    if (gameStart == true) {
        fill(13, 18, 54);
        noStroke();
        rect(0, 0, width, height);

        fill(255);
        textAlign(CENTER, CENTER);

        // Use system/browser font name and set text size instead of createFont()
        textFont("Comic Sans MS");
        textSize(80);
        text("CLICK TO START", width / 2, height / 2);

        textSize(20);
        text("WASD for yellow", 200, 600);
        text("ARROWS for purple", 550, 600);

        if (mouseIsPressed) {
            gameStart = false;
        }
    }

    if (player1.y >= height || player2.y >= height) {
        gameOver = true;
    }

    if (gameOver == true) {
        fill(13, 18, 54);
        noStroke();
        rect(0, 0, width, height);

        fill(255);
        textAlign(CENTER, CENTER);

        textFont("Comic Sans MS");
        textSize(100);
        text("GAME OVER", width / 2, height / 2);

        textSize(50);
        text("click anywhere to reset", width / 2, (height / 2) + 100);

        if (mouseIsPressed) {
            gameOver = false;
            player1.x = 300;
            player1.y = 705;
            player2.x = 500;
            player2.y = 705;
            player1.vy = 0;
            player2.vy = 0;
            m = 0;
            player1.falling = false;
            player2.falling = false;
            for (let platform of platformList) {
                platformF.x = 0;
                platformF.y = 775;
                platformF.w = width;
                platform.x = int(random(31)) * 25;
                platform.y = (int(random(6)) * 125) + 150;
                platform.w = int(random(40)) * 10;
            }
        }
    }

    if (mouseIsPressed) {
        if (mouseX <= 50 || mouseY <= 50) {
            player1.x = 300;
            player1.y = 705;
            player2.x = 500;
            player2.y = 705;
            player1.vy = 0;
            player2.vy = 0;
            m = 0;
            player1.falling = false;
            player2.falling = false;
            for (let platform of platformList) {
                platformF.x = 0;
                platformF.y = 775;
                platformF.w = width;
                platform.x = int(random(31)) * 25;
                platform.y = (int(random(6)) * 125) + 150;
                platform.w = int(random(40)) * 10;
            }
        }
    }
}

// handle jump input once per key press
function keyPressed() {
    // WASD player jump
    if (key == 'w' || key == 'W') {
        player1.requestJump = true;
    }
    // Arrow player jump
    if (keyCode == UP_ARROW) {
        player2.requestJump = true;
    }
}
