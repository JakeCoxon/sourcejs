define(function(require, exports, module) {

  var Tile = require('tile');

  function Game() {
    var self = this;
    this.loaded = false;

    this.sprites = new Image();
    this.sprites.onload = function() { self.loaded = true; };
    this.sprites.src = "assets/sprites.png";

    this.tiles = [];
    for (var i = 0; i < 10 * 10; i++) {
      var tile = new Tile(Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
      this.tiles.push(tile);
    }
    window.game = this;
  }
  
  var T = 128;
  Game.prototype.draw = function(time, ctx, canvas) {

    if (!this.loaded) return;
    this.ctx = ctx;

    var sprites = this.sprites;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 1136, 640);
    ctx.restore();

    // for (var i = 0; i < 10; i++) {
    //   for (var j = 0; j < 10; j++) {
    //     ctx.drawImage(sprites, 256 + 64, 0, 64, 64,
    //       i * T, j * T, T, T);
    //   }
    // }

    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < 10; j++) {

        ctx.save();
        var tile = this.tiles[i + j * 10];
        ctx.translate(T * i + T/2, T * j + T/2);
        ctx.rotate(tile.rotation * Math.PI / 2);
        ctx.translate(-T * i - T/2, -T * j - T/2);
        ctx.drawImage(sprites, tile.type * 64, 0, 64, 64, T * i, T * j, T, T);

        ctx.restore();
      }
    }
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