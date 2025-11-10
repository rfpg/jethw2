class Player {
  int x, y, h;
  int top, bottom, left, right;
  float vx, vy;
  int s = 30;
  color c;
  String mover;
  float speed;
  boolean jumping;
  boolean falling;
  boolean onPlatform;
  float jH, topY;
  
  Player(int x, int y, color c, String mover) {
    this.x = x;
    this.y = y;
    this.c = c;
    this.mover = mover;
        
    speed = 5;
    jH = 125;
    topY = y - jH;
  }
  
  void display() {
    strokeWeight(5);
    stroke(255);
    fill(c);
    ellipse(x+5, y, s-10, s-10);
    rect(x, y+(s-10), s, s);
    arc(x, y+(s-10)+(s/2), s, s, 0, PI);
    
    h = (s*3)-10;
    top = y;
    bottom = y + h;
    left = x;
    right = x + s;
  }
  
  void xMove() {
    x = int(constrain(x, 0, width-s));
    x += vx;

    if(mover == "wasd") {
      if(keyPressed) {
        if(key == 'a') {
          vx = -speed;
        } else if(key == 'd') {
          vx = speed;
        }
      } else {
        vx = 0;
      }
    } if(mover == "arrow") {
      if(keyPressed) {
        if(key == CODED) {
          if(keyCode == LEFT) {
            vx = -speed;
          } else if(keyCode == RIGHT) {
            vx = speed;
          }
        }
      }
      else {
        vx = 0;
      }
    }
  }
  
  void yMove() {
    y = constrain(y, 0, 1000);
    y += vy;
    
    if(mover == "wasd") {
      if(keyPressed) {
        if(key == 'w') {
          jumping = true;
        }
      } else {
        vy = 0;
      }
    } if(mover == "arrow") {
      if(keyPressed) {
        if(key == CODED) {
          if(keyCode == UP) {
            jumping = true;
          }
        }
      } else {
        vy = 0;
      }
    }
    if (y <= topY) {
      jumping = false;
      falling = true;
    }
    if (jumping == true) {
      vy = -speed;
      falling = false;
    }
    if (falling == true) {
      vy = speed;
    }
  }
  
  void fall(ArrayList<Platform> platformList) {
    if (jumping == false) {
      onPlatform = false;
      
      for (Platform platform : platformList) {
        if (top <= platform.bottom && bottom >= platform.top && left <= platform.right && right >= platform.left) {
          onPlatform = true;
        }
      }
      
      if (onPlatform == false) {
        falling = true;
      }
    }
    if (jumping == true) {
      onPlatform = false;
    }
    if (onPlatform == true) {
      get (x, y);
      topY = y - jH;
    }
  }
}
