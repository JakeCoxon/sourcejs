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
    this.scale = 2;

    this.width = 10; this.height = 10;
    this.startX = 5; this.startY = 5;
    this.boardX = 0; this.boardY = 0;
    this.boardWidth = this.width * T;
    this.boardHeight = this.height * T;

    this.background = new Background(T * this.width + T, T * this.height + T);

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

    this.dragger = new RectDragger(T * this.width, T * this.height, 0, 0, 32);

    this.spriteCache = {};


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


    if (this.invalidated) {
      this.invalidated = false;

      var _ctx = this.cache.getContext('2d');
      _ctx.setTransform(1, 0, 0, 1, -this.background.x, -this.background.y);

      var i, j;

      for (i = 0; i < this.background.cols; i++) {
        for (j = 0; j < this.background.rows; j++) {
          this.drawSprite(_ctx, 5, 0, this.background.x + T * i, this.background.y + T * j, 0);
        }
      }

      _ctx.save();
      _ctx.translate(this.boardX, this.boardY);

      for (i = 0; i < this.width; i++) {
        for (j = 0; j < this.height; j++) {

          var tile = this.tiles[i + j * this.width];

          var sprite = tile.type, on = this.filled[i + j * this.width] ? 1 : 0;
          if (i == this.startX && j == this.startY) {
            sprite = 5; on = 1;
          }

          this.drawSprite(_ctx, sprite, on, T * i, T * j, tile.rotation);

        }
      }
      _ctx.restore();

    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.windowWidth, this.windowHeight);
    

    ctx.setTransform(1, 0, 0, 1, this.dragger.x, this.dragger.y);

    ctx.drawImage(this.cache, this.background.x, this.background.y);



  };

  Game.prototype.rotateImage = function(image, sx, sy, w, h, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var offscreenCtx = offscreenCanvas.getContext('2d');

    var size = Math.max(w, h);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;

    offscreenCtx.translate(size/2, size/2);
    offscreenCtx.rotate(angle * Math.PI / 2);
    offscreenCtx.drawImage(image, sx, sy, w, h, -w/2, -h/2, w, h);

    return offscreenCanvas;
  };

  Game.prototype.createCache = function(w, h) {
    var offscreenCanvas = document.createElement('canvas');

    var size = Math.max(w, h);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;

    return offscreenCanvas;
  }

  Game.prototype.drawSprite = function(ctx, tx, ty, x, y, angle) {
    
    var c = "" + tx + ty + angle;
    if (!this.spriteCache[c])
      this.spriteCache[c] = this.rotateImage(this.sprites, tx * 64, ty * 64, 64, 64, angle);

    ctx.drawImage(this.spriteCache[c], x, y);
  }

  Game.prototype.resize = function(width, height) {
    this.windowWidth = width;
    this.windowHeight = height;
    this.boardX = (width - this.width * T) / 2;
    this.boardY = (height - this.height * T) / 2;
    this.background.setSize(width, height);

    this.cache = this.createCache(this.background.cols * T, this.background.rows *  T);
    this.invalidated = true;

    this.dragger.containerWidth = width;
    this.dragger.containerHeight = height;
    this.dragger.contain();
  };

  Game.prototype.touchstart = function(e) {
    this.dragger.press(e.touches[0].clientX, e.touches[0].clientY);
    this.click = true;
  };
  Game.prototype.touchmove = function(e) {
    this.dragger.drag(e.touches[0].clientX, e.touches[0].clientY);

    if (Math.abs(this.dragger.mouseDistX) > 10 || Math.abs(this.dragger.mouseDistY) > 10)
      this.click = false;
    
  };
  Game.prototype.touchend = function(e) {

    if (!this.click) return;

    var x = this.dragger.localMouseX(-this.boardX),
        y = this.dragger.localMouseY(-this.boardY);

    var xTile = Math.floor(x / T),
        yTile = Math.floor(y / T);

    this.tiles[xTile + yTile * 10].rotate();
    this.resetAll();
    this.setFilled(this.startX, this.startY, true);
    this.invalidated = true;
  };

  Game.prototype.scroll = function(delta) {
    this.scale += delta / 20;
  };

  function Background(minWidth, minHeight) {
    this.minWidth = minWidth; this.minHeight = minHeight;
  }
  Background.prototype.setSize = function(width, height) {
    var bgWidth = Math.max(this.minWidth, width),
        bgHeight = Math.max(this.minHeight, height);
    this.cols = Math.floor(bgWidth / T / 2) * 2 + 2;
    this.rows = Math.floor(bgHeight / T / 2) * 2 + 2;
    this.x = (width - this.cols * T) / 2;
    this.y = (height - this.rows * T) / 2;
  };

  function MouseHandler() {
    this.mouseDownX = 0; this.mouseDownY = 0;
    this.mouseX = 0; this.mouseY = 0;
    this.x = 0; this.y = 0;
    this.startX = 0; this.startY = 0;
  }
  MouseHandler.prototype.localMouseX = function(offset) {
    return this.mouseX + offset - this.x;
  };
  MouseHandler.prototype.localMouseY = function(offset) {
    return this.mouseY + offset - this.y;
  };
  MouseHandler.prototype.press = function(x, y) {
    this.mouseDownX = x; this.mouseDownY = y;
    this.mouseX = x; this.mouseY = y;
    this.startX = this.x; this.startY = this.y;
  };
  MouseHandler.prototype.drag = function(x, y) {
    this.mouseX = x; this.mouseY = y;
    this.mouseDistX = x - this.mouseDownX;
    this.mouseDistY = y - this.mouseDownY;
    this.x = this.startX + this.mouseDistX;
    this.y = this.startY + this.mouseDistY;
  };

  function RectDragger(iw, ih, cw, ch, margin) {
    this.innerWidth = iw; this.innerHeight = ih;
    this.containerWidth = cw; this.containerHeight = ch;
    this.margin = margin;
  }

  RectDragger.prototype = new MouseHandler();

  RectDragger.prototype.drag = function(x, y) {
    MouseHandler.prototype.drag.call(this, x, y);
    this.contain();
  }
  RectDragger.prototype.contain = function() {
    var top = Math.max(0, (this.innerHeight - this.containerHeight)/2 + this.margin);
    var left = Math.max(0, (this.innerWidth - this.containerWidth)/2 + this.margin);

    this.x = Math.min(Math.max(this.x, -left), left);
    this.y = Math.min(Math.max(this.y, -top), top);
  };





  return Game;

});