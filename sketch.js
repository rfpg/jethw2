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
        // Only allow landing on platform from above
        if (this.left <= player.right && this.right >= player.left && 
            player.bottom >= this.top && player.bottom <= this.top + abs(player.vy) + 5 &&
            player.vy >= 0) {
            // place player on top of platform and stop falling
            player.onPlatform = true;
            player.falling = false;
            player.jumping = false;
            player.vy = 0;
            // snap player to platform top
            player.y = this.top - player.h;
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

        // Physics tuned for 125px vertical platform spacing
        // Using kinematic equation: v² = u² + 2as
        // We need to reach at least 125px high
        // With gravity = 0.6, to reach height h: initialVelocity = sqrt(2 * gravity * height)
        // For h = 135 (with buffer): v = sqrt(2 * 0.6 * 135) ≈ 12.73
        this.speed = 5;           // horizontal speed
        this.gravity = 0.6;       // must match for physics calculations
        this.jumpSpeed = 16;      // calculated to clear 125px+ gaps
        this.maxVy = 18;          // allow full jump velocity

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
        // handle jump request: only jump if on a platform
        if (this.requestJump && this.onPlatform && !this.jumping) {
            this.jumping = true;
            this.falling = false;
            this.onPlatform = false;
            this.vy = -this.jumpSpeed;
        }
        this.requestJump = false;

        // apply gravity
        this.vy += this.gravity;
        this.vy = constrain(this.vy, -this.maxVy, this.maxVy);
        
        // apply vertical velocity
        this.y += this.vy;

        // update state based on velocity
        if (this.vy > 0) {
            this.jumping = false;
            this.falling = true;
        }

        // keep player within canvas bounds
        this.y = constrain(this.y, 0, height);

        // update bounds
        this.top = this.y;
        this.bottom = this.y + this.h;
        this.left = this.x;
        this.right = this.x + this.s;
    }

    fall(platformList) {
        // Reset platform flag before checking
        let wasOnPlatform = this.onPlatform;
        this.onPlatform = false;

        // Check if player is overlapping any platform
        for (let platform of platformList) {
            if (this.left <= platform.right && this.right >= platform.left && 
                this.top <= platform.bottom && this.bottom >= platform.top) {
                this.onPlatform = true;
                break;
            }
        }

        // If not on platform and not jumping, must be falling
        if (!this.onPlatform && !this.jumping) {
            this.falling = true;
        }
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.jumping = false;
        this.falling = false;
        this.onPlatform = false;
        this.requestJump = false;
    }
}

// Globals
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

let startS = 0;
let timeS;
let startM = 0;
let timeM;
let m = 0;
let i;

// Platform configuration constants
const PLATFORM_VERTICAL_SPACING = 125;
const PLATFORM_Y_START = 150;
const PLATFORM_COUNT = 6;

function setup() {
    createCanvas(800, 800);
    ellipseMode(CORNER);
    rectMode(CORNER);

    // initialize p5-derived time variables
    startS = second();
    startM = minute();
    m = millis() / 1000;

    // initialize coin
    coin = new Coin(int(random(790)) + 5, int(random(650)) + 100);

    // Create fixed platforms at regular intervals
    platformA = new Platform(0, 150, int(random(40, 65)) * 10);
    platformB = new Platform(0, 275, int(random(40, 65)) * 10);
    platformC = new Platform(0, 400, int(random(40, 65)) * 10);
    platformD = new Platform(0, 525, int(random(40, 65)) * 10);
    platformE = new Platform(0, 650, int(random(40, 65)) * 10);
    platformF = new Platform(0, 775, width); // floor platform

    platformList = [];
    platformList.push(platformA);
    platformList.push(platformB);
    platformList.push(platformC);
    platformList.push(platformD);
    platformList.push(platformE);
    platformList.push(platformF);

    // Add additional random platforms
    for (i = 0; i < 6; i++) {
        platformList.push(new Platform(
            int(random(31)) * 25, 
            (int(random(6)) * PLATFORM_VERTICAL_SPACING) + PLATFORM_Y_START, 
            int(random(25, 40)) * 10
        ));
    }

    player1 = new Player(300, 695, color(247, 224, 107), "wasd");
    player2 = new Player(500, 695, color(236, 177, 250), "arrow");
}

function draw() {
    background(13, 18, 54);

    if (gameStart) {
        drawStartScreen();
        return;
    }

    if (gameOver) {
        drawGameOverScreen();
        return;
    }

    // Update and display everything
    updateGame();
}

function updateGame() {
    // Reset platform collision flags before checking
    player1.onPlatform = false;
    player2.onPlatform = false;

    // Display and check platform collisions BEFORE moving players
    for (let platform of platformList) {
        platform.display();
        platform.collision(player1);
        platform.collision(player2);
    }

    // Now move players (physics happens after collision detection)
    player1.xMove();
    player1.yMove();
    player1.fall(platformList);
    player1.display();

    player2.xMove();
    player2.yMove();
    player2.fall(platformList);
    player2.display();

    // Update coin physics and display
    coin.update(platformList);
    coin.display();
    coin.collision(player1);
    coin.collision(player2);

    // Handle coin collection
    if (coin.activate) {
        handleCoinCollection();
    }

    // Check for game over
    if (player1.y >= height || player2.y >= height) {
        gameOver = true;
    }

    // Check for reset button (top-left corner click)
    if (mouseIsPressed && (mouseX <= 50 && mouseY <= 50)) {
        resetGame();
    }

    // Draw reset button indicator
    fill(255, 100);
    noStroke();
    rect(0, 0, 50, 50);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(10);
    text("RESET", 25, 25);
}

function handleCoinCollection() {
    // Randomize all platforms except floor
    for (let platform of platformList) {
        if (platform !== platformF) {
            platform.randomize();
        }
    }
    
    // Reset coin position and physics
    coin.x = int(random(785));
    coin.y = int(random(100, 400)); // spawn coin in upper half
    coin.vy = 0;
    coin.onPlatform = false;
    coin.activate = false;
}

function resetGame() {
    player1.reset(300, 695);
    player2.reset(500, 695);
    
    m = 0;
    
    // Reset platforms
    platformF.x = 0;
    platformF.y = 775;
    platformF.w = width;
    
    for (let platform of platformList) {
        if (platform !== platformF) {
            platform.randomize();
        }
    }
    
    gameStart = false;
    gameOver = false;
}

function drawStartScreen() {
    fill(13, 18, 54);
    noStroke();
    rect(0, 0, width, height);

    fill(255);
    textAlign(CENTER, CENTER);

    textFont("Comic Sans MS");
    textSize(80);
    text("CLICK TO START", width / 2, height / 2);

    textSize(20);
    text("W to jump, A/D to move (yellow)", width / 2, 550);
    text("↑ to jump, ←/→ to move (purple)", width / 2, 600);
    
    textSize(16);
    text("Platforms are 125px apart - jump height calibrated!", width / 2, 680);

    if (mouseIsPressed) {
        gameStart = false;
    }
}

function drawGameOverScreen() {
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
        resetGame();
    }
}

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
