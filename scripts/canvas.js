define(function(require, exports, module) {
  function Canvas(game, width, height) {
    var canvas = document.createElement("canvas");
    // canvas.style.width = '100%';
    // canvas.style.height = '100%';

    var c = this.context = canvas.getContext("2d");
    document.body.appendChild(canvas);
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      game.resize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', resize);
    resize();

    document.addEventListener('touchstart', function(e) {
      game.touchstart(e);
    }, false);

    document.addEventListener('touchmove', function(e) {
      game.touchmove(e);
      e.preventDefault();
    }, false);
    
    document.addEventListener('touchend', function(e) {
      game.touchend(e);
    }, false);



    var down = false;
    document.addEventListener('mousedown', function(e) {
      down = true;
      game.touchstart({touches: [{clientX: e.offsetX, clientY: e.offsetY}]});
    }, false);
    document.addEventListener('mouseup', function(e) {
      down = false;
      game.touchend({touches: []});
    }, false);
    document.addEventListener('mousemove', function(e) {
      if (down) game.touchmove({touches: [{clientX: e.offsetX, clientY: e.offsetY}]});
    }, false);
    document.addEventListener('mousewheel', function(e) {
      var delta = e.detail ? e.detail : e.wheelDelta / -120;
      game.scroll(delta);
    }, false)

    c.fillStyle = "white";
    c.font = "10px arial";
    c.fillText("Loading...", 10, 10);

    var self = this;
    var drawLoop = function(t) {
      game.draw(t, c, canvas);
      window.webkitRequestAnimationFrame(drawLoop);
    };
    drawLoop(1);

  }


  return Canvas;
});