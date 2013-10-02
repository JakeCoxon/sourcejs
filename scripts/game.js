define(function(require, exports, module) {

  function Game() {
    var self = this;
    this.loaded = false;

    this.sprites = new Image();
    this.sprites.onload = function() { self.loaded = true; };
    this.sprites.src = "assets/sprites.png";
  }
  
  var T = 128;
  Game.prototype.draw = function(time, ctx, canvas) {

    if (!this.loaded) return;
    this.ctx = ctx;
    var sprites = this.sprites;

    ctx.save();

    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Restore the transform
    ctx.restore();

    var o = -128 + (time / 8) % 128;

    var offset = time / 10 % 128;
    for (var i = 0; i < 20; i++) {
      for (var j = 0; j < 10; j++) {
        ctx.drawImage(sprites, 256 + 64, 0, 64, 64,
          o + i * T, o + j * T, T, T);
      }
    }

    ctx.drawImage(sprites, 0, 64, 64, 64, T, T, T, T);
    ctx.drawImage(sprites, 64, 0, 64, 64, 2 * T, T, T, T);
    ctx.drawImage(sprites, 64, 0, 64, 64, 2 * T, 2 * T, T, T);
    ctx.drawImage(sprites, 64, 64, 64, 64, T, 2 * T, T, T);
  };

  var drag = {x: 0, y: 0};
  var offsetX = 0, offsetY = 0;
  Game.prototype.touchstart = function(e) {
    console.log(e);
    drag.x = e.touches[0].clientX;
    drag.y = e.touches[0].clientY;
  };
  Game.prototype.touchmove = function(e) {
    offsetX = e.touches[0].clientX - drag.x;
    var s = (100 + offsetX) / 100;
    this.ctx.setTransform(s, 0, 0, s, 0, 0);
    
  };




  return Game;

});