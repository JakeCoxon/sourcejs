define(function(require, exports, module) {
  function Canvas(game, width, height) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    var c = this.context = canvas.getContext("2d");
    document.body.appendChild(canvas);

    document.addEventListener('touchstart', function(e) {
      game.touchstart(e);
    }, false);

    document.addEventListener('touchmove', function(e) {
      game.touchmove(e);
    }, false);


    var down = false;
    document.addEventListener('mousedown', function(e) {
      down = true;
      game.touchstart({touches: [{clientX: e.offsetX, clientY: e.offsetX}]});
    }, false);
    document.addEventListener('mouseup', function(e) {
      down = false;
    }, false);
    document.addEventListener('mousemove', function(e) {
      if (down) game.touchmove({touches: [{clientX: e.offsetX, clientY: e.offsetX}]});
    }, false);

    c.fillStyle = "white";
    c.font = "10px arial";
    c.fillText("Loading...", 10, 10);

    var self = this;
    var drawLoop = function(t) {
      game.draw(t, c, this);
      window.webkitRequestAnimationFrame(drawLoop);
    };
    drawLoop(1);

  }


  return Canvas;
});