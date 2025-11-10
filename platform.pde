class Platform {
  float x, y, w, h;
  float top, bottom, left, right;
  
  Platform(int x, int y, int w) {
    this.x = x;
    this.y = y;
    this.w = w;
    
    h = 25;
  }
  
  void display() {
    strokeWeight(5);
    stroke(255);
    noFill();
    
    top = y;
    bottom = y + h;
    left = x;
    right = x + w;
    
    rect(x, y, w, h);
    
    x = constrain(x, 0, 800);
  }
  
  void collision(Player player) {
    if (left <= player.right && right >= player.left && top <= player.bottom && bottom >= player.top) {
      player.falling = false;
    }
  }
  
  void randomize() {
    x = int(random(31))*25;
    y = (int(random(6))*125)+150;
    w = int(random(40))*10;
  }
}
