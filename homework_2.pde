Coin coin;

ArrayList<Platform> platformList;
Platform platformA;
Platform platformB;
Platform platformC;
Platform platformD;
Platform platformE;
Platform platformF;

Player player1;
Player player2;

PFont myFont;

boolean gameStart = true;
boolean gameOver = false;

int startS = second();
int timeS;
int startM = minute();
int timeM;
int m = millis()/1000;
int i;


void setup() {
  size(800, 800);
  ellipseMode(CORNER);
  rectMode(CORNER);
  
  coin = new Coin(int(random(790))+5, int(random(650))+100);
  
  platformA = new Platform(0, 150, int(random(65))*10);
  platformB = new Platform(0, 275, int(random(65))*10);
  platformC = new Platform(0, 400, int(random(65))*10);
  platformD = new Platform(0, 525, int(random(65))*10);
  platformE = new Platform(0, 650, int(random(65))*10);
  platformF = new Platform(0, 775, width);
  platformList = new ArrayList<Platform>();
  platformList.add(platformA);
  platformList.add(platformB);
  platformList.add(platformC);
  platformList.add(platformD);
  platformList.add(platformE);
  platformList.add(platformF);
  for (int i = 0; i < 6; i++) {
    platformList.add(new Platform(int(random(31))*25, (int(random(6))*125)+150, int(random(40))*10));
  }
  
  player1 = new Player(300, 705, color(247, 224, 107), "wasd");
  player2 = new Player(500, 705, color(236, 177, 250), "arrow");
}

void draw() {
  background(13, 18, 54);
  
  //timeS = second() - startS; 
  //timeM = minute() - startM;
  //myFont = createFont("Comic Sans MS", 20);
  //fill(255);  
  //textFont(myFont);
  //textAlign(CENTER, CENTER);
  //text(timeM + " : " + timeS, width/2, 15);
  
  coin.display();
  coin.collision(player1);
  coin.collision(player2);

  for(Platform platform: platformList) {
    platform.display();
    platform.collision(player1);
    platform.collision(player2);
    if(coin.activate == true) {
      platform.randomize();
      coin.x = int(random(800));
      coin.y = int(random(800));
      coin.activate = false;
    }
  }
  
  player1.display();
  player1.xMove();
  player1.yMove();
  player1.fall(platformList);
  
  player2.display();
  player2.xMove();
  player2.yMove();
  player2.fall(platformList);
  
  if (gameStart == true) {
    fill(13, 18, 54);
    noStroke();
    rect(0, 0, width, height);
    
    fill(255);
    textAlign(CENTER, CENTER);
    
    myFont = createFont("Comic Sans MS", 80);
    textFont(myFont);
    text("CLICK TO START", width/2, height/2);
    
    myFont = createFont("Comic Sans MS", 20);
    textFont(myFont);
    text("WASD for yellow", 200, 600);
    text("ARROWS for purple", 550, 600);
    
    if (mousePressed) {
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
    
    myFont = createFont("Comic Sans MS", 100);
    textFont(myFont);
    text("GAME OVER", width/2, height/2);
    
    myFont = createFont("Comic Sans MS", 50);
    textFont(myFont);
    text("click anywhere to reset", width/2, (height/2)+100);
    
    if (mousePressed) {
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
      for(Platform platform: platformList) {
        platformF.x = 0;
        platformF.y = 775;
        platformF.w = width;
        platform.x = int(random(31))*25;
        platform.y = (int(random(6))*125)+150;
        platform.w = int(random(40))*10;
      }
    }
  } 
  
  if (mousePressed) {
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
      for(Platform platform: platformList) {
        platformF.x = 0;
        platformF.y = 775;
        platformF.w = width;
        platform.x = int(random(31))*25;
        platform.y = (int(random(6))*125)+150;
        platform.w = int(random(40))*10;
      }
    }
  }
}
