var Board = function(canvas) {
  this.selector = canvas;

  // cache canvas object & context
  this.canvas   = document.getElementById(this.selector);
  this.ctx      = this.canvas.getContext('2d');

  // default options
  this.options  = _merge({
    columns: 12,
    rows: 8,
    cellSize: 80
  }, arguments[1] || {});

  // current dimensions (in pixels)
  this.width  = this.options.columns * this.options.cellSize;
  this.height = this.options.rows * this.options.cellSize;
  this.scaleX = 1.0;
  this.scaleY = 1.0;

  // set canvas size
  this.canvas.width  = this.width;
  this.canvas.height = this.height;

  // poor living creatures
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

  // draw canvas
  this.resize().draw();

  // respond to events
  this.attachEventListeners();
};

Board.prototype.resize = function(e) {
  var body = document.getElementsByTagName('body')[0];
  var rect = body.getBoundingClientRect();

  var w = this.width, h = this.height, nw = rect.width, nh = rect.height;
  if ( w === nw && h === nh ) return this;

  var rw = nw / w, rh = nh / h;

  this.canvas.width   = nw;
  this.canvas.height  = nh;

  this.scaleX = rw;
  this.scaleY = rh;

  this.ctx.scale(rw, rh);

  return this;
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
  this.resize().draw();
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

    var neighbours      = this.neighbours(cell);
    var aliveNeighbours = neighbours.filter(function(n) { return n.alive; });

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
  var cells   = [];
  var index   = (cell.x/80) + 12*(cell.y/80);
  var length  = this.cells.length;

  if ( index - 13 >= 0 ) cells.push(this.cells[index-13]);
  if ( index - 12 >= 0 ) cells.push(this.cells[index-12]);
  if ( index - 11 >= 0 ) cells.push(this.cells[index-11]);

  if ( index - 1 >= 0 ) cells.push(this.cells[index-1]);
  if ( index + 1 < length ) cells.push(this.cells[index+1]);

  if ( index + 11 < length ) cells.push(this.cells[index+11]);
  if ( index + 12 < length ) cells.push(this.cells[index+12]);
  if ( index + 13 < length ) cells.push(this.cells[index+13]);

  return cells;
}

Board.prototype.aliveNeighbours = function(cell) {
  var cells = [], neighbours = this.neighbours(cell);
  for (var i = neighbours.length - 1; i >= 0; i--) {
    var neighbour = neighbours[i];
    if ( neighbour.alive ) cells.push(neighbour);
  };
  return cells;
}
