/* jshint undef: true, unused: true, sub:true, loopfunc:true, esversion:6, node:true, browser:true */

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
    let grad = {};
    let keys = Object.keys(a.grad).concat(Object.keys(b.grad));
    keys.forEach(k => grad[k] = ((a.grad[k] || 0) * b.val + a.val * (b.grad[k] || 0)));
    let val = a.val * b.val;
    return {val, grad};
  }
  
  divide(a, b){
    let grad = {};
    let keys = Object.keys(a.grad).concat(Object.keys(b.grad));
    keys.forEach(k => grad[k] = ((a.grad[k] || 0) * b.val - a.val * (b.grad[k] || 0))/ (b.val * b.val));
    let val = a.val / b.val;
    return {val, grad};
  }

  inv(a){
    let grad = {};
    let val = 1 / a.val;
    Object.keys(a.grad).forEach(k => grad[k] = - a.grad[k] * val * val);
    return {val, grad};
  }

  max0(v){
    if(v.val > 0)
      return v;
    return {val:0,grad:{}};
  }
  
  abs(v){
    if(v.val >= 0)
      return v;
    let grad = {};
    Object.keys(v.grad).forEach(k => grad[k] = - v.grad[k]);
    return {val:-v.val,grad};
  }

  acc(a, b){
    a.val += b.val;
    Object.keys(b.grad).forEach(k => a.grad[k] = (a.grad[k] || 0) + b.grad[k]);
    return a;
  }

  minus(a, b){
    let grad = {};
    Object.keys(a.grad).forEach(k => grad[k] = a.grad[k]);
    Object.keys(b.grad).forEach(k => grad[k] = (grad[k] || 0) - b.grad[k]);
    return {val: a.val-b.val, grad};
  }

  add(a,b){
    let grad = {};
    Object.keys(a.grad).forEach(k => grad[k] = a.grad[k]);
    Object.keys(b.grad).forEach(k => grad[k] = (grad[k] || 0) + b.grad[k]);
    return {val: a.val+b.val, grad};
  }

  neg(a){
    let grad = {};
    Object.keys(a.grad).forEach(k => grad[k] = -a.grad[k]);
    return {val: -a.val, grad};
  }

  sqrt(a){
    let sqrt_a = Math.sqrt(a.val);
    let grad = {};
    Object.keys(a.grad).forEach(k => grad[k] = 0.5*a.grad[k]/sqrt_a);
    return {val: sqrt_a, grad};
  }

  exp(a){
    let exp_a = Math.exp(a.val);
    let grad = {};
    Object.keys(a.grad).forEach(k => grad[k] = a.grad[k]*exp_a);
    return {val: exp_a, grad};
  }

  ln(a){
    let grad = {};
    Object.keys(a.grad).forEach(k => grad[k] = a.grad[k]/a.val);
    return {val: Math.log(a.val), grad};
  }

  square(a){
    let grad = {};
    Object.keys(a.grad).forEach(k => grad[k] = 2*a.val*a.grad[k]);
    return {val: a.val*a.val, grad};
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = AD;
else
  window.Method1 = AD;

})();