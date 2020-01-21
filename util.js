
function normsdist(x){
  let b1 = 0.319381530;
  let b2 = -0.356563782;
  let b3 = 1.781477937;
  let b4 = -1.821255978;
  let b5 = 1.330274429;
  let p = 0.2316419;
  let c = 0.39894228;

  if(x >= 0.0) {
    let t = 1.0 / ( 1.0 + p * x );
    return (1.0 - c * Math.exp( -x * x / 2.0 ) * t * ( t *( t * ( t * ( t * b5 + b4 ) + b3 ) + b2 ) + b1 ));
  } else {
    let t = 1.0 / ( 1.0 - p * x );
    return ( c * Math.exp( -x * x / 2.0 ) * t * ( t *( t * ( t * ( t * b5 + b4 ) + b3 ) + b2 ) + b1 ));
  }
}

var normal = (function(){
  // Marsaglia
  let acc = undefined;
  return function(){
    if(acc != undefined){
      let tmp = acc;
      acc = undefined;
      return tmp;
    }
    let x, y, r;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      r = x * x + y * y;
    } while (!r || r > 1);
    let lhs = Math.sqrt(-2 * Math.log(r) / r);
    acc = y * lhs;
    return x * lhs;
  };
})();

function foundLowerBound(set,key,start,end){
  if(set.length == 0) return -1;
  if(start === undefined) start = 0;
  if(end === undefined) end = set.length-1;
  if(start == end) return (start==0&&set[0]>key?-1:start);
  var mid = Math.ceil((end+start)/2);
  if(set[mid] < key) return foundLowerBound(set,key,mid,end);
  if(set[mid] > key) return foundLowerBound(set,key,start,mid-1);
  return mid;
}

function getFrame(set,key){
  var idxLow = foundLowerBound(set,key);
  var idxHigh = idxLow + 1;
  if(idxLow == -1) idxLow++;
  if(idxHigh == set.length) idxHigh--;
  var valLow = set[idxLow];
  var valHigh = set[idxHigh];
  var alpha = (valLow-key)/(valLow-valHigh);
  return {idxLow:idxLow,idxHigh:idxHigh,alpha:alpha};
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = {normsdist,normal,foundLowerBound,getFrame};
