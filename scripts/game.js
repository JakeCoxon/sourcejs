define(function(require, exports, module) {

  var Tile = require('tile'),
      RandomGenerator = require('random-generator');

  var T = 64;

  function Game() {
    var self = this;
    this.loaded = false;

    this.sprites = new Image();
    this.sprites.onload = function() { self.loaded = true; };
    this.sprites.src = "assets/sprites.png";

    // this.tiles = [];
    // for (var i = 0; i < 10 * 10; i++) {
    //   var tile = new Tile(Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
    //   this.tiles.push(tile);
    // }
    this.scale = 1;

    this.width = 10; this.height = 10;
    this.startX = 5; this.startY = 5;
    this.boardX = 0; this.boardY = 0;
    this.boardWidth = this.width * T;
    this.boardHeight = this.height * T;

    this.background = new Background();

    this.tiles = new RandomGenerator(this.width, this.height).generate(this.startX, this.startY);

    this.dirty = [];
    this.filled = [];

    this.resetAll();

    for (var i = 0; i < this.width * this.height; i++) {
      var r = Math.floor(Math.random() * 4);
      for (var j = 0; j < r; j++) {
        this.tiles[i].rotate();
      }
    }

    this.setFilled(this.startX, this.startY, true);


    window.game = this;
  }
  Game.prototype.getTile = function(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return Tile.emptyTile;
    return this.tiles[x + y * this.width];
  };

  Game.prototype.resetAll = function() {
    for (var i = 0; i < this.width * this.height; i++) {
      this.filled[i] = false;
      this.dirty[i] = true;
    }
  };

  Game.prototype.setFilled = function(x, y, filled) {
    var idx = x + y * this.width;
    if (!this.dirty[idx]) return 0;

    var tile = this.getTile(x, y);
    this.filled[idx] = filled;
    this.dirty[idx] = false;

    var num = 1;
    if (tile.entryNorth() && this.getTile(x, y - 1).entrySouth())
      num += this.setFilled(x, y - 1, true);

    if (tile.entryEast() && this.getTile(x + 1, y).entryWest())
      num += this.setFilled(x + 1, y, true);

    if (tile.entrySouth() && this.getTile(x, y + 1).entryNorth())
      num += this.setFilled(x, y + 1, true);

    if (tile.entryWest() && this.getTile(x - 1, y).entryEast())
      num += this.setFilled(x - 1, y, true);

    return num;
  };
  
  Game.prototype.draw = function(time, ctx, canvas) {

    if (!this.loaded) return;
    this.ctx = ctx;

    var sprites = this.sprites;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.windowWidth, this.windowHeight);

    // for (var i = 0; i < 10; i++) {
    //   for (var j = 0; j < 10; j++) {
    //     ctx.drawImage(sprites, 256 + 64, 0, 64, 64,
    //       i * T, j * T, T, T);
    //   }
    // }

    ctx.translate(0,0);

    for (var i = 0; i < this.background.cols; i++) {
      for (var j = 0; j < this.background.rows; j++) {
        ctx.drawImage(sprites, 5 * 64, 0, 64, 64, this.background.x + T * i, this.background.y + T * j, T, T);
      }
    }

    for (var i = 0; i < this.width; i++) {
      for (var j = 0; j < this.height; j++) {

        ctx.save();
        var tile = this.tiles[i + j * this.width];
        ctx.translate(T * i + T/2 + this.boardX, T * j + T/2 + this.boardY);
        ctx.rotate(tile.rotation * Math.PI / 2);
        ctx.translate(-T * i - T/2 - this.boardX, -T * j - T/2 - this.boardY);

        var sprite = tile.type, on = this.filled[i + j * this.width] ? 1 : 0;
        if (i == this.startX && j == this.startY) {
          sprite = 5; on = 1;
        }
        ctx.drawImage(sprites, sprite * 64, on * 64, 64, 64, T * i + this.boardX, T * j + this.boardY, T, T);

        ctx.restore();
      }
    }
  };

  Game.prototype.resize = function(width, height) {
    this.windowWidth = width;
    this.windowHeight = height;
    this.boardX = (width - this.width * T) / 2;
    this.boardY = (height - this.height * T) / 2;
    this.background.setSize(width, height);
  };

  var drag = {x: 0, y: 0};
  var offsetX = 0, offsetY = 0;
  var mouseX = 0, mouseY = 0;
  var boardX = 0, boardY = 0;
  var tboardX = 0, tboardY = 0;
  var click = true;

  Game.prototype.touchstart = function(e) {
    drag.x = e.touches[0].clientX;
    drag.y = e.touches[0].clientY;
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    click = true;
  };
  Game.prototype.touchmove = function(e) {
    offsetX = e.touches[0].clientX - drag.x;
    offsetY = e.touches[0].clientY - drag.y;



    tboardX = Math.min(Math.max(boardX + offsetX, 568 - this.width * T), 0);
    tboardY = Math.min(Math.max(boardY + offsetY, 320 - this.height * T), 0);
    // var s = (100 + offsetX) / 100;
    // this.scale = s;
    this.ctx.setTransform(1, 0, 0, 1, tboardX, tboardY);
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;

    if (Math.abs(offsetX) > 10 || Math.abs(offsetY) > 10)
      click = false;
    
  };
  Game.prototype.touchend = function(e) {
    boardX = tboardX;
    boardY = tboardY;

    if (!click) return;
    var x = mouseX - (this.boardX + boardX) * this.scale,
        y = mouseY - (this.boardY + boardY) * this.scale;

    var xTile = Math.floor(x / T),
        yTile = Math.floor(y / T);

    this.tiles[xTile + yTile * 10].rotate();
    this.resetAll();
    this.setFilled(this.startX, this.startY, true);
  };

  function Background() {

  }
  Background.prototype.setSize = function(width, height) {
    this.cols = Math.floor(width / T / 2) * 2 + 2;
    this.rows = Math.floor(height / T / 2) * 2 + 2;
    this.x = (width - this.cols * T) / 2;
    this.y = (height - this.rows * T) / 2;
  };





  return Game;

});