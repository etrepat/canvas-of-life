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

  // poor living creatures
  this.cells    = [];

  // current dimensions (in pixels)
  this.width  = this.options.columns * this.options.cellSize;
  this.height = this.options.rows * this.options.cellSize;

  // set canvas size
  this.canvas.width = this.width;
  this.canvas.height = this.height;

  this.draw();

  this.attachEventListeners();
  // this.resize();
};

Board.prototype.resize = function(e) {
  var body = document.getElementsByTagName('body')[0];
  var rect = body.getBoundingClientRect();

  if ( this.canvas.width === rect.width && this.canvas.height === rect.height )
    return this;

  this.canvas.width   = rect.width;
  this.canvas.height  = rect.height;

  this.draw();

  return this;
};

// Board.prototype.resize = function(e) {
//   var body = document.getElementsByTagName('body')[0];
//   var rect = body.getBoundingClientRect();

//   var w = this.canvas.width, h = this.canvas.height,
//     nw = rect.width, nh = rect.height;

//   if ( w === nw && h === nh ) return this;

//   var rw = nw / w, rh = nh / h;
//   this.ctx.scale(rw, rh);


//   return this;
// }


Board.prototype.click = function(e) {
  var x = e.clientX, y = e.clientY;

  var cell = this.findCellAt(x, y);
  if ( cell ) cell.toggle();

  return false;
};

Board.prototype.findCellAt = function(x, y) {
  var target = this.cells.filter(function(cell) { return cell.inside(x, y); });

  if ( target.length === 0 )
    return null;

  return target[0];
};

Board.prototype.attachEventListeners = function() {
  // respond on user clicks
  this.canvas.addEventListener('click', this.click.bind(this));

  // resize board on window size change
  window.addEventListener('resize', this.resize.bind(this));

  return this;
};

Board.prototype.draw = function() {
  this.build();
  this.cells.forEach(function(cell) { cell.draw(); });
};

Board.prototype.build = function() {
  var cellSize = parseInt(this.options.cellSize);

  this.cells.length = 0;

  for(var y=-cellSize, my=this.canvas.height+cellSize; y < my; y += cellSize)
    for(var x=-cellSize, mx=this.canvas.width+cellSize; x < mx; x += cellSize)
      this.cells.push(new Cell(this.selector, {x: x, y: y, size: cellSize, alive: false}));
};
