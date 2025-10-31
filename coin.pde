class Coin {
  float x, y, w, h;
  color c;
  float top, bottom, left, right;
  boolean activate = false;
  
  
  Coin(int x, int y) {
    this.x = x;
    this.y = y;
    c = color(250, 171, 43);
  }

  void display() {
    strokeWeight(5);
    stroke(255);
    fill(c);
    
    top = y;
    bottom = y + h;
    left = x;
    right = x + w;
    
    ellipse(x, y, 15, 15);
  }
  
  void collision(Player player) {
    if (left <= player.right && right >= player.left && top <= player.bottom && bottom >= player.top) {
      activate = true;
    }
  }
}
