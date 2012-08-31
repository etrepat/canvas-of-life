// Simplest of all object merge function
var _merge = function(dst, src) {
  for(var prop in src) dst[prop] = src[prop];
  return dst;
};
