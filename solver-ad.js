/* jshint undef: true, unused: true, sub:true, loopfunc:true, esversion:6, node:true, browser:true */

function bisectionAD(ad,f,a,b,eps){
  let va = f(a).val;
  let vb = f(b).val;
  if(va*vb > 0)
    throw new Error("f(a) and f(b) should be of different sign");
  let s = (va < vb ? 1 : -1);
  let m = ad.multiply(ad.cst(0.5),ad.add(a,b));
  while(b.val-a.val > eps){
    if(s*f(m).val > 0){
      b = m;
    }else{
      a = m;
    }
    m = ad.multiply(ad.cst(0.5),ad.add(a,b));
  }
  return m;
}

function newtonAD(ad,f,df,x0,eps){
  let px = x0;
  let x = x0;
  do {
    px = x;
    x = ad.minus(px, ad.divide(f(x),df(x)));
  }while(Math.abs(px.val - x.val) > eps);
  return x;
}

function brentAD(ad,f,xLower,xUpper,eps){
  let x1 = xLower;
  let x2 = xUpper;
  let x3 = xUpper;
  let cst0p5 = ad.cst(0.5);
  let cst1 = ad.cst(1);
  let cst2 = ad.cst(2);
  let cstEps = ad.cst(eps);
  let cstMinusEps = ad.cst(-eps);
  let delta = ad.cst(0);
  let oldDelta = delta;
  let f1 = f(x1);
  let f2 = f(x2);
  let f3 = f2;
  let r1, r2, r3, r4, xMid;
  while(true){
    if (f2.val > 0 && f3.val > 0 || f2.val < 0 && f3.val < 0) {
      x3 = x1;
      f3 = f1;
      delta = ad.minus(x2, x1);
      oldDelta = delta;
    }
    if (Math.abs(f3.val) < Math.abs(f2.val)) {
      x1 = x2;
      x2 = x3;
      x3 = x1;
      f1 = f2;
      f2 = f3;
      f3 = f1;
    }
    xMid = ad.multiply(cst0p5, ad.minus(x3, x2));
    if(Math.abs(xMid.val) <= eps) return x2;
    if(Math.abs(oldDelta.val) >= eps && Math.abs(f1.val) > Math.abs(f2.val)){
      r4 = ad.divide(f2, f1);
      if(Math.abs(x1.val - x3.val) < 1e-16){
        r1 = ad.multiply(ad.multiply(cst2, xMid), r4);
        r2 = ad.minus(cst1, r4);
      }else{
        r2 = ad.divide(f1, f3);
        r3 = ad.divide(f2, f3);
        r1 = ad.multiply(r4, ad.minus(ad.multiply(cst2, ad.multiply(xMid, ad.multiply(r2, ad.minus(r2, r3)))), ad.multiply(ad.minus(x2, x1), ad.minus(r3, cst1))));
        r2 = ad.multiply(ad.minus(r2, cst1), ad.multiply(ad.minus(r3, cst1), ad.minus(r4, cst1)));
      }
      if(r1.val > 0)
        r2 = ad.neg(r2);
      r1 = ad.abs(r1);
      let min1 = 3 * xMid.val * r2.val - Math.abs(eps * r2.val);
      let min2 = Math.abs(oldDelta.val * r2.val);
      let min = (min1 < min2 ? min1 : min2);
      if(2 * r1.val < min){
        oldDelta = delta;
        delta = ad.divide(r1, r2);
      }else{
        delta = xMid;
        oldDelta = delta;
      }
    }else{
      delta = xMid;
      oldDelta = delta;
    }
    x1 = x2;
    f1 = f2;
    if(Math.abs(delta.val) > eps) x2 = ad.add(x2, delta);
    else x2 = ad.add(x2, (xMid.val<0?cstMinusEps:cstEps));
    f2 = f(x2);
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = {bisection,newton,brent};