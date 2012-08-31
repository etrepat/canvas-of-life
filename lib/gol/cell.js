var Cell = function(canvas) {
  this.selector = canvas;
  this.canvas   = document.getElementById(this.selector);
  this.ctx      = this.canvas.getContext('2d');
  this.ctx.lineWidth = 1;

  var options   = _merge({x: 0, y: 0, size: 80, alive: false}, arguments[1] || {});

  this.x        = options.x;
  this.y        = options.y;
  this.size     = options.size;
  this.alive    = options.alive;
};

Cell.prototype.draw = function() {
  this.ctx.fillStyle = 'rgba(90,90,90,1)';

  this.ctx.fillRect(this.x, this.y, this.size, this.size);
  this.ctx.clearRect(this.x+1, this.y+1, this.size-1, this.size-1);

  if ( this.alive ) {
    this.ctx.fillStyle = 'rgba(234, 10, 10,1)';
    this.ctx.fillRect(this.x+1, this.y+1, this.size-1, this.size-1);
  }

  return this;
};

Cell.prototype.live = function() {
  this.alive = true;
  this.draw();

  return this;
};

Cell.prototype.die = function() {
  this.alive = false;
  this.draw();

  return this;
};

Cell.prototype.toggle = function() {
  if ( this.alive ) this.die();
  else this.live();
};

Cell.prototype.inside = function(x, y) {
  return (this.x <= x && (this.x+this.size) >= x && this.y <= y && (this.y + this.size) >= y);
};
