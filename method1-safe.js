/* jshint undef: true, unused: true, sub:true, loopfunc:true, esversion:6, node:true, browser:true */
/* globals assert */

/* jshint ignore:start */
if(typeof module !== 'undefined' && module.exports){
  var assert = require("assert");
}else{
  var assert = console.assert;
}
/* jshint ignore:end */

(function(){

class AD {
  getGrad(a){
    return a.grad;
  }
  
  cst(val){
    return {val,grad:{}};
  }

  variable(name, val){
    let grad = {};
    grad[name] = 1;
    return {val,grad};
  }

  multiply(a, b){
    assert(a.grad);
    assert(b.grad);
    let grad = {};
    let keys = Object.keys(a.grad).concat(Object.keys(b.grad));
    keys.forEach(k => grad[k] = ((a.grad[k] || 0) * b.val + a.val * (b.grad[k] || 0)));
    let val = a.val * b.val;
    assert(isFinite(val));
    return {val, grad};
  }
  
  divide(a, b){
    assert(a.grad);
    assert(b.grad);
    let grad = {};
    let keys = Object.keys(a.grad).concat(Object.keys(b.grad));
    keys.forEach(k => grad[k] = ((a.grad[k] || 0) * b.val - a.val * (b.grad[k] || 0))/ (b.val * b.val));
    let val = a.val / b.val;
    assert(isFinite(val));
    return {val, grad};
  }

  inv(a){
    assert(a.grad);
    let grad = {};
    let val = 1 / a.val;
    Object.keys(a.grad).forEach(k => grad[k] = - a.grad[k] * val * val);
    assert(isFinite(val));
    return {val, grad};
  }

  max0(v){
    assert(v.grad);
    if(v.val > 0)
      return v;
    return {val:0,grad:{}};
  }
  
  abs(v){
    assert(v.grad);
    if(v.val >= 0)
      return v;
    let grad = {};
    Object.keys(v.grad).forEach(k => grad[k] = - v.grad[k]);
    return {val:-v.val,grad};
  }

  acc(a, b){
    assert(a.grad);
    assert(b.grad);
    a.val += b.val;
    Object.keys(b.grad).forEach(k => a.grad[k] = (a.grad[k] || 0) + b.grad[k]);
    assert(isFinite(a));
    return a;
  }

  minus(a, b){
    assert(a.grad);
    assert(b.grad);
    assert(isFinite(a.val));
    assert(isFinite(b.val));
    let grad = {};
    Object.keys(a.grad).forEach(k => grad[k] = a.grad[k]);
    Object.keys(b.grad).forEach(k => grad[k] = (grad[k] || 0) - b.grad[k]);
    let val = a.val-b.val;
    assert(isFinite(val));
    return {val, grad};
  }

  add(a,b){
    assert(a.grad);
    assert(b.grad);
    let grad = {};
    Object.keys(a.grad).forEach(k => grad[k] = a.grad[k]);
    Object.keys(b.grad).forEach(k => grad[k] = (grad[k] || 0) + b.grad[k]);
    let val = a.val+b.val;
    assert(isFinite(val));
    return {val, grad};
  }

  neg(a){
    assert(a.grad);
    let grad = {};
    Object.keys(a.grad).forEach(k => grad[k] = -a.grad[k]);
    let val = -a.val;
    assert(isFinite(val));
    return {val, grad};
  }

  sqrt(a){
    assert(a.grad);
    let sqrt_a = Math.sqrt(a.val);
    let grad = {};
    Object.keys(a.grad).forEach(k => grad[k] = 0.5*a.grad[k]/sqrt_a);
    assert(isFinite(sqrt_a));
    return {val: sqrt_a, grad};
  }

  exp(a){
    assert(a.grad);
    let exp_a = Math.exp(a.val);
    let grad = {};
    Object.keys(a.grad).forEach(k => grad[k] = a.grad[k]*exp_a);
    assert(isFinite(exp_a));
    return {val: exp_a, grad};
  }

  ln(a){
    assert(a.grad);
    let grad = {};
    Object.keys(a.grad).forEach(k => grad[k] = a.grad[k]/a.val);
    let val = Math.log(a.val);
    assert(isFinite(val));
    return {val, grad};
  }

  square(a){
    assert(a.grad);
    let grad = {};
    Object.keys(a.grad).forEach(k => grad[k] = 2*a.val*a.grad[k]);
    let val = a.val*a.val;
    assert(isFinite(val));
    return {val, grad};
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = AD;
else
  window.Method1Safe = AD;

})();