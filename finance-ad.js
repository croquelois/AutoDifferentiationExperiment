/* jshint undef: true, unused: true, sub:true, loopfunc:true, esversion:6, node:true, browser:true */
/* globals buildLognormalRandomGenerator, linInt */

/* jshint ignore:start */
if(typeof module !== 'undefined' && module.exports){
  var {buildLognormalRandomGenerator,linInt} = require("./util-ad.js");   
}
/* jshint ignore:end */

function computeOption(ad, nbPath, strike, maturity, spot, rate, vol) {
  spot = ad.variable("spot", spot);
  rate = ad.variable("rate", rate);
  vol = ad.variable("volatility", vol);
  strike = ad.cst(strike);
  maturity = ad.cst(maturity);
  let dist = buildLognormalRandomGenerator(ad, spot, rate, vol, maturity);
    
  let sum = ad.cst(0);
  for (let i = 0;i < nbPath;i++) {
    sum = ad.add(sum, ad.max0(ad.minus(dist(), strike)));
  }
  let df = ad.exp(ad.multiply(ad.neg(rate),maturity));
  return ad.multiply(df, ad.divide(sum, ad.cst(nbPath)));
}

function bootstrap(ad, swaps){
  let dfAcc = ad.cst(0);
  let pts = [];
  let prevT = 0;
  let prevC = ad.cst(0);
  let curT = 0;
  let one = ad.cst(1);
  swaps.forEach(function(swap){
    if(swap.t > 1 && swap.t != Math.floor(swap.t))
      throw new Error("unhandled case: more than one year swap with broken period");
  });
  swaps.forEach(function(swap){
    let t = swap.t;
    let c = ad.variable("rate_"+t,swap.r);
    if(t < 1){
      let df = ad.inv(ad.add(one,ad.multiply(c,ad.cst(t))));
      pts.push({t,df});
    } else {
      let incC = ad.divide(ad.minus(c,prevC),ad.cst(t-prevT));
      let curC = prevC;
      curT = prevT;
      while(curT != t){
        curT = prevT+1;
        curC = ad.add(curC, incC);
        let df = ad.divide(ad.minus(one,ad.multiply(curC,dfAcc)),ad.add(one,curC));
        pts.push({t: curT,df});
        dfAcc = ad.add(dfAcc, df);
        prevT = curT;
        prevC = curC;
      }
    }
  });
  let term = pts.map(pt => pt.t);
  let zcRate = pts.map(pt => ad.divide(ad.ln(pt.df),ad.cst(-pt.t)));
  return {
    getDF: t => ad.exp(ad.multiply(linInt(ad, term, zcRate, t), ad.cst(-t))),
    getRate: t => linInt(ad, term, zcRate, t)
  };
}

function bondPrice(ad,curve, bond){
  let curT = bond.t;
  let nominal = ad.cst(bond.n);
  let coupon = ad.cst(bond.c);
  let couponCashflow = ad.multiply(nominal, coupon);
  let curV = ad.multiply(nominal, curve.getDF(curT));
  while(curT > 0){
    curV = ad.add(curV, ad.multiply(couponCashflow, curve.getDF(curT)));
    curT = curT-1;
  }
  return curV;
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = {computeOption, bootstrap, bondPrice};
