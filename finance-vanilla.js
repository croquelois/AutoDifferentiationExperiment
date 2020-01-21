/* jshint undef: true, unused: true, sub:true, loopfunc:true, esversion:6, node:true, browser:true */
/* globals normsdist */

/* jshint ignore:start */
if(typeof module !== 'undefined' && module.exports){
  var {normsdist} = require("./util.js");   
}
/* jshint ignore:end */
  
function vanillaCallPrice(strike,T,spot,rate,vol){
  let sqT = Math.sqrt(T);
  let fwd = spot*Math.exp(rate*T);
  let d1 = (Math.log(fwd/strike) + 0.5*vol*vol*T)/(vol*sqT);
  let d2 = d1 - vol*sqT;
  return {
    price: -Math.exp(-rate*T)*(strike*normsdist(d2) - fwd*normsdist(d1)),
    delta: normsdist(d1),
    vega: spot/Math.sqrt(2*Math.PI)*Math.exp(-d1*d1/2)*sqT
  };
}

function vanillaComputeOption(nbPath, strike, maturity, spot, rate, vol) {
  let driftPart = (rate - vol*vol/2)* maturity;
  let volPart = vol * Math.sqrt(maturity);
  
  let dist = function(){ return spot * Math.exp(driftPart + volPart * normal()); };
    
  let sum = 0;
  for (let i = 0;i < nbPath;i++) {
    let v = dist() - strike;
    if(v > 0)
      sum += v;
  }
  let df = Math.exp(-rate*maturity);
  return df * sum / nbPath;
}

function vanillaBootstrap(swaps){
  let dfAcc = 0;
  let pts = [];
  let prevT = 0;
  let prevC = 0;
  let curT = 0;
  swaps.forEach(function(swap){
    if(swap.t > 1 && swap.t != Math.floor(swap.t))
      throw new Error("unhandled case: more than one year swap with broken period");
  });
  swaps.forEach(function(swap){
    let t = swap.t;
    let c = swap.r;
    if(t < 1){
      let df = 1/(1 + c*t);
      pts.push({t,df});
    } else {
      let incC = (c-prevC)/(t-prevT);
      let curC = prevC;
      curT = prevT;
      while(curT != t){
        curT = prevT+1;
        curC += incC;
        let df = (1-curC*dfAcc)/(1+curC);
        pts.push({t: curT,df});
        dfAcc += df;
        prevT = curT;
        prevC = curC;
      }
    }
  });
  let term = pts.map(pt => pt.t);
  let zcRate = pts.map(pt => -Math.log(pt.df)/pt.t);
  return {
    getDF: t => Math.exp(-linInt(term, zcRate, t) * t),
    getRate: t => linInt(term, zcRate, t)
  };
}

function vanillaBondPrice(curve, bond){
  let curT = bond.t;
  let couponCashflow = bond.n * bond.c;
  let curV = bond.n * curve.getDF(curT);
  while(curT > 0){
    curV += couponCashflow * curve.getDF(curT);
    curT -= 1;
  }
  return curV;
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = {vanillaCallPrice,vanillaComputeOption,vanillaBootstrap,vanillaBondPrice};