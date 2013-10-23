define(function(require, exports, module) {


  var types = {
    0: [true, true, true, true],
    1: [true, true, true, false],
    2: [true, true, false, false],
    3: [true, false, true, false],
    4: [true, false, false, false]
  };

  function Tile(type, rotation) {
    this.type = type;
    this.entryPoints = types[type];
    this.rotation = 0;
    for (var i = 0; i < rotation; i++) this.rotate();
  }

  Tile.prototype.rotate = function() {
    this.rotation ++;
    // 1010
    this.entryPoints = [this.entryPoints[3], this.entryPoints[0],
                        this.entryPoints[1], this.entryPoints[2]];
  };

  Tile.prototype.entryNorth = function() { return this.entryPoints[0]; };
  Tile.prototype.entryEast = function() { return this.entryPoints[1]; };
  Tile.prototype.entrySouth = function() { return this.entryPoints[2]; };
  Tile.prototype.entryWest = function() { return this.entryPoints[3]; };

  Tile.emptyTile = {
    rotation: 0,
    rotate: function() {},
    entryNorth: function() { return false; },
    entryEast: function() { return false; },
    entrySouth: function() { return false; },
    entryWest: function() { return false; },
  };


  return Tile;
});