var Board = function(canvas) {
  this.selector = canvas;

  // cache canvas object & context
  this.canvas   = document.getElementById(this.selector);
  this.ctx      = this.canvas.getContext('2d');

  // default options
  this.options  = _merge({
    columns: 24,
    rows: 16,
    cellSize: 40
  }, arguments[1] || {});

  // current dimensions (in pixels)
  this.width  = this.options.columns * this.options.cellSize;
  this.height = this.options.rows * this.options.cellSize;

  // poor (un-)living creatures
  this.cells = [];
  for(var j = 0; j < this.options.rows; ++j) {
    for(var i = 0; i < this.options.columns; ++i) {
      this.cells.push(new Cell(this.selector, {
        x: i * this.options.cellSize,
        y: j * this.options.cellSize,
        size: this.options.cellSize,
        alive: false
      }));
    }
  }

  // scale & draw canvas
  this.scaleToFit().draw();

  // respond to events
  this.attachEventListeners();
};

Board.prototype.resize = function(width, height) {
  this.canvas.width = width;
  this.canvas.height = height;
  return this;
}

Board.prototype.scale = function(scaleX, scaleY) {
  this.scaleX = scaleX;
  this.scaleY = scaleY;
  this.ctx.scale(scaleX, scaleY);
  return this;
}

Board.prototype.scaleToFit = function() {
  if ( !this.body ) this.body = document.getElementsByTagName('body')[0];
  var rect = this.body.getBoundingClientRect();

  var w = this.width, h = this.height, nw = rect.width, nh = rect.height;
  if ( w === nw && h === nh ) return this;

  var rw = nw / w, rh = nh / h;

  return this.resize(nw, nh).scale(rw, rh);
}

Board.prototype.findCellAt = function(x, y) {
  var target = this.cells.filter(function(cell) { return cell.inside(x, y); });

  if ( target.length === 0 )
    return null;

  return target[0];
};

Board.prototype.attachEventListeners = function() {
  // respond on user clicks
  this.canvas.addEventListener('click', this.onBoardClick.bind(this));

  // respond on user keystrokes
  window.addEventListener('keypress', this.onKeypress.bind(this));

  // resize board on window size change
  window.addEventListener('resize', this.onBoardResize.bind(this));

  return this;
};

Board.prototype.draw = function() {
  for (var i = this.cells.length - 1; i >= 0; i--) {
    this.cells[i].draw();
  }

  this.ctx.strokeStyle = 'rgba(90,90,90,1)';
  this.ctx.strokeRect(0, 0, this.width, this.height);

  return this;
};

Board.prototype.onBoardResize = function(e) {
  this.scaleToFit().draw();
}

Board.prototype.onBoardClick = function(e) {
  var mx = e.clientX, my = e.clientY;
  var x = mx / this.scaleX, y = my / this.scaleY;

  var cell = this.findCellAt(x, y);
  if ( cell ) {
    cell.toggle();

    if ( e.altKey ) {
      this.neighbours(cell).forEach(function(c) { c.toggle(); });
    }
  }

  return false;
};

Board.prototype.onKeypress = function(e) {
  if ( e.keyCode === 32 ) {
    if ( this.timer ) {
      clearTimeout(this.timer);
      this.timer = null;
    } else {
      this.timer = setTimeout(this.tick.bind(this), 500);
    }
  }
}

Board.prototype.tick = function() {
  console.debug('tick', this);

  var next = new Array(this.cells.length);

  for (var i = this.cells.length - 1; i >= 0; i--) {
    var cell = this.cells[i].dup();
    var aliveNeighbours = this.aliveNeighbours(cell);

    // 1. Any live cell with fewer than two live neighbours dies, as if caused by under-population.
    if ( cell.alive && aliveNeighbours.length < 2 ) cell.die();

    // 2. Any live cell with two or three live neighbours lives on to the next generation.
    if ( cell.alive && (aliveNeighbours.length === 2 || aliveNeighbours.length === 3) ) cell.live();

    // 3. Any live cell with more than three live neighbours dies, as if by overcrowding.
    if ( cell.alive && aliveNeighbours.length > 3 ) cell.die();

    // 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    if ( !cell.alive && aliveNeighbours.length === 3 ) cell.live();

    next[i] = cell;
  };

  this.cells.length = 0;
  this.cells = next;
  this.draw();

  this.timer = setTimeout(this.tick.bind(this), 500);
}

Board.prototype.neighbours = function(cell) {
  var neighbours = [], c = this.options.columns, s = this.options.cellSize,
    l = this.cells.length;
  var i = (cell.x/s) + c*(cell.y/s);

  if ( i - (c+1) >= 0 ) neighbours.push(this.cells[i-(c+1)]);
  if ( i - c >= 0 )     neighbours.push(this.cells[i-c]);
  if ( i - (c-1) >= 0 ) neighbours.push(this.cells[i-(c-1)]);

  if ( i - 1 >= 0 )     neighbours.push(this.cells[i-1]);
  if ( i + 1 < l )      neighbours.push(this.cells[i+1]);

  if ( i + (c-1) < l )  neighbours.push(this.cells[i+(c-1)]);
  if ( i + c < l )      neighbours.push(this.cells[i+c]);
  if ( i + (c+1) < l )  neighbours.push(this.cells[i+(c+1)]);

  return neighbours;
}

Board.prototype.aliveNeighbours = function(cell) {
  var cells = [], neighbours = this.neighbours(cell);
  for (var i = neighbours.length - 1; i >= 0; i--) {
    var neighbour = neighbours[i];
    if ( neighbour.alive ) cells.push(neighbour);
  };
  return cells;
}
