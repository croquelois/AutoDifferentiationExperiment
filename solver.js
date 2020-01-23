/* jshint undef: true, unused: true, sub:true, loopfunc:true, esversion:6, node:true, browser:true */

function bisection(f,a,b,eps){
  let va = f(a);
  let vb = f(b);
  if(va*vb > 0.0)
    throw new Error("f(a) and f(b) should be of different sign");
  let s = (va < vb ? 1.0 : -1.0);
  let m = 0.5*(a+b);
  while(b-a > eps){
    if(s*f(m) > 0.0){
      b = m;
    }else{
      a = m;
    }
    m = 0.5*(a+b);
  }
  return m;
}

function newton(f,df,x0,eps){
  let px = x0;
  let x = x0;
  do {
    px = x;
    x = px - f(x)/df(x);
  }while(Math.abs(px - x) > eps);
  return x;
}

function brent(f,xLower,xUpper,eps){
  if(xLower == xUpper) return xLower;
  let x1 = xLower;
  let x2 = xUpper;
  let x3 = xUpper;
  let delta = 0;
  let oldDelta = 0;
  let f1 = f(x1);
  let f2 = f(x2);
  let f3 = f2;
  let r1, r2, r3, r4, xMid, min1, min2;
  while(true){
    if (f2 > 0 && f3 > 0 || f2 < 0 && f3 < 0) {
      x3 = x1;
      f3 = f1;
      delta = x2 - x1;
      oldDelta = delta;
    }
    if (Math.abs(f3) < Math.abs(f2)) {
      x1 = x2;
      x2 = x3;
      x3 = x1;
      f1 = f2;
      f2 = f3;
      f3 = f1;
    }
    xMid = (x3 - x2) / 2;
    if(Math.abs(xMid) <= eps) return x2;
    if(Math.abs(oldDelta) >= eps && Math.abs(f1) > Math.abs(f2)){
      r4 = f2 / f1;
      if(Math.abs(x1 - x3) < 1e-16){
        r1 = 2 * xMid * r4;
        r2 = 1 - r4;
      }else{
        r2 = f1 / f3;
        r3 = f2 / f3;
        r1 = r4 * (2 * xMid * r2 * (r2 - r3) - (x2 - x1) * (r3 - 1));
        r2 = (r2 - 1) * (r3 - 1) * (r4 - 1);
      }
      if(r1 > 0) r2 *= -1;
      r1 = Math.abs(r1);
      min1 = 3 * xMid * r2 - Math.abs(eps * r2);
      min2 = Math.abs(oldDelta * r2);
      if(2 * r1 < (min1 < min2 ? min1 : min2)){
        oldDelta = delta;
        delta = r1 / r2;
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
    if(Math.abs(delta) > eps) x2 += delta;
    else x2 += (xMid<0?-eps:eps);
    f2 = f(x2);
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = {bisection,newton,brent};