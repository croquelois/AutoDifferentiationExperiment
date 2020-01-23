/* jshint undef: true, unused: true, sub:true, loopfunc:true, esversion:6, node:true, browser:true */

(function(){

class AD {
  getGrad(a){ return {}; }
  
  cst(val){ return val; }
  variable(name, val){ return val; }
  multiply(a, b){ return a * b; }
  divide(a, b){ return a / b; }
  inv(a){ return 1 / a; }
  max0(v){
    if(v > 0)
      return v;
    return 0;
  }
  abs(v){ return Math.abs(v); }

  acc(a, b){
    // be carreful a is not updated
    return a+b;
  }

  minus(a, b){ return a-b; }
  add(a,b){ return a+b; };
  neg(a){ return -a; }

  sqrt(a){ return Math.sqrt(a); }
  exp(a){ return Math.exp(a); }
  ln(a){ return Math.log(a); }
  square(a){ return a*a; }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = AD;
else
  window.Method0 = AD;

})();