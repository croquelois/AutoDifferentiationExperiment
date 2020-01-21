/* jshint undef: true, unused: true, sub:true, loopfunc:true, esversion:6, node:true, browser:true */
/* globals foundLowerBound, normal */

/* jshint ignore:start */
if(typeof module !== 'undefined' && module.exports){
  var {foundLowerBound, normal} = require("./util.js");   
}
/* jshint ignore:end */

function linInt(ad,term,x,t){
  if(t == undefined){
    t = x;
    x = term;
    term = ad;
    ad = undefined;
  }
  idx = foundLowerBound(term,t);
  if(idx == -1) return x[0];
  if(idx == term.length-1) return x[idx];
  let alpha = (t - term[idx])/(term[idx+1] - term[idx]);
  if(!ad)
    return x[idx] + (x[idx+1] - x[idx]) * alpha;
  return ad.add(x[idx], ad.multiply(ad.minus(x[idx+1], x[idx]),ad.cst(alpha)));
}

function buildNormalRandomGenerator(ad, mean, vol){
  return function(){
    return ad.add(mean,ad.multiply(ad.cst(normal()),vol));
  }
}

function buildLognormalRandomGenerator(ad, spot, drift, vol, t){
  let driftPart = ad.multiply(ad.minus(drift, ad.divide(ad.square(vol),ad.cst(2))), t);
  let volPart = ad.multiply(vol,ad.sqrt(t));
  return function(){
    return ad.multiply(spot, ad.exp(ad.add(driftPart, ad.multiply(volPart, ad.cst(normal())))));
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = {linInt,buildNormalRandomGenerator,buildLognormalRandomGenerator};
