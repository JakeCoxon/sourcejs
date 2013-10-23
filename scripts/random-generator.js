define(function(require, exports, module) {

  var Tile = require('tile');

  function RandomGenerator(width, height) {
    this.width = width; this.height = height;
  }

  function random(max) {
    return Math.floor(Math.random() * max);
  }


  RandomGenerator.prototype.generate = function(startX, startY) {
    var width = this.width,
        height = this.height;
    var i, j;

    var NORTH = 0, EAST = 1, SOUTH = 2, WEST = 3;

    var edgesToNodes = {}; // nodes -> [a, b]
    var nodesToEdges = {}; // edge -> [n, e, s, w]

    var edgeidx = -1;

    var pickEdges = {};
    var mazeNodes = {};
    var joinEdges = {};

    function addEdge(from, dir, to) {
      edgeidx++;
      nodesToEdges[from][dir] = edgeidx;
      nodesToEdges[to][(dir + 2) % 4] = edgeidx;
      edgesToNodes[edgeidx] = [from, to];
    }

    function neighbour(node, dir) {
      var nodes = edgesToNodes[nodesToEdges[node][dir]];
      if (nodes[0] == node) return nodes[1];
      return nodes[0];
    }

    function isEdge(edge) {
      return edge !== null && edge !== undefined;
    }

    function addPickEdgesForNode(node) {
      for (var i = 0; i < 4; i++) {
        var edge = nodesToEdges[node][i];
        if (isEdge(edge) && pickEdges[edge]) {
          delete pickEdges[edge];
        } else if (isEdge(edge) && !joinEdges[edge]) {
          pickEdges[edge] = true;
        }
      }
    }

    function joinDir(node, dir) {
      var edge = nodesToEdges[node][dir];
      joinEdges[edge] = true;

      var other = neighbour(node, dir);
      mazeNodes[other] = true;
      addPickEdgesForNode(other);
    }

    function removeEdge(node, dir) {
      var other = neighbour(node, dir);
      var edge = nodesToEdges[node][dir];
      nodesToEdges[node][dir] = null;
      nodesToEdges[other][(dir + 2) % 4] = null;
      delete edgesToNodes[edge];
    }

    function removeEdgesExceptDirection(node, dir) {
      removeEdge(node, (dir + 1) % 4);
      removeEdge(node, (dir + 2) % 4);
      removeEdge(node, (dir + 3) % 4);
    }

    function joinEdgeNodes(edge) {
      delete pickEdges[edge];
      joinEdges[edge] = true;
      var from = edgesToNodes[edge][0];
      var dest = edgesToNodes[edge][1];
      if (!mazeNodes[from]) {
        from = edgesToNodes[edge][1];
        dest = edgesToNodes[edge][0];
      }
      mazeNodes[dest] = true;
      addPickEdgesForNode(dest);

    }

    function pickEdge() {
      var result, count = 0;
      for (var edge in pickEdges)
        if (Math.random() < 1/++count)
          result = edge;
      return result;
    }



    for (i = 0; i < width * height; i++) nodesToEdges[i] = [null, null, null, null];

    for (i = 0; i < width; i++) {
      for (j = 0; j < height; j++) {
        if (i > 0) addEdge(i - 1 + j * width, EAST, i + j * width);
        if (j > 0) addEdge(i + (j - 1) * width, SOUTH, i + j * width);
      }
    }

    var startNode = startX + startY * width;
    mazeNodes[startNode] = true;
    var dir = random(4);
    joinDir(startNode, dir);
    removeEdgesExceptDirection(startNode, dir);

    var nodesLeft = width * height - 1;
    while (--nodesLeft > 0) {
      var edge = pickEdge();
      delete pickEdges[edge];
      joinEdgeNodes(edge);
    }

    console.log("mazeNodes", mazeNodes);
    console.log("joinEdges", joinEdges);
    console.log("pickEdges", pickEdges);

    var s = "";
    for (j = 0; j < height; j++) {

      for (i = 0; i < width; i++) {
        s += mazeNodes[i + j * width] ? "#" : " ";
        var eastEdge = nodesToEdges[i + j * width][EAST];
        s += (isEdge(eastEdge) && joinEdges[eastEdge]) ? "-" :
             (isEdge(eastEdge) && pickEdges[eastEdge]) ? "." : " ";
      }
      s += "\n";

      for (i = 0; i < width; i++) {
        var southEdge = nodesToEdges[i + j * width][SOUTH];
        s += (isEdge(southEdge) && joinEdges[southEdge]) ? "|" :
             (isEdge(southEdge) && pickEdges[southEdge]) ? "." : " ";
        s += " ";
      }


      s += "\n";
    }

    console.log(s);


    function makeTile(x, y, entryPoints) {
      for (var i = 0; i < 4; i++) {
        if (entryPoints == 15) /* 1111 */ return new Tile(0, i);
        if (entryPoints == 14) /* 1110 */ return new Tile(1, i);
        if (entryPoints == 12) /* 1100 */ return new Tile(2, i);
        if (entryPoints == 10) /* 1010 */ return new Tile(3, i);
        if (entryPoints ==  8) /* 1000 */ return new Tile(4, i);
        // rotate once
        entryPoints = (entryPoints << 1 & 15) | (entryPoints >> 3);
      }
      throw "Invalid entryPoints (" + entryPoints + ") for tile at "+x+","+y;
    }

    function getEntryPoints(node) {
      var edges = nodesToEdges[node];
      return ((isEdge(edges[0]) && joinEdges[edges[0]]) << 3) +
             ((isEdge(edges[1]) && joinEdges[edges[1]]) << 2) +
             ((isEdge(edges[2]) && joinEdges[edges[2]]) << 1) +
             ((isEdge(edges[3]) && joinEdges[edges[3]]) << 0);
    }

    var tiles = [];

    for (i = 0; i < width; i++) {
      for (j = 0; j < height; j++) {
        var entryPoints = getEntryPoints(i + j * width);
        tiles[i + j * width] = makeTile(i, j, entryPoints);
      }
    }
    return tiles;


  };


  return RandomGenerator;


});