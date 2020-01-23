/* jshint undef: true, unused: true, sub:true, loopfunc:true, esversion:6, node:true, browser:true */

(function(){

class AD {
  constructor(){
    this.variables = {};
    this.nbVar = 0;
  }
  
  getGrad(a){
    let grad = {};
    Object.keys(this.variables).forEach(name => grad[name] = a.grad[this.variables[name]]);
    return grad;
  }
  
  cst(val){
    return {val,grad:[]};
  }

  variable(name, val){
    this.variables[name] = this.nbVar;
    let grad = [];
    grad[this.nbVar] = 1;
    this.nbVar++;
    return {val,grad};
  }

  multiply(a, b){
    let grad = [];
    for(let i=0;i<this.nbVar;i++)
      grad[i] = ((a.grad[i] || 0) * b.val + a.val * (b.grad[i] || 0));
    let val = a.val * b.val;
    return {val, grad};
  }
  
  divide(a, b){
    let grad = [];
    for(let i=0;i<this.nbVar;i++)
      grad[i] = ((a.grad[i] || 0) * b.val - a.val * (b.grad[i] || 0))/ (b.val * b.val);
    let val = a.val / b.val;
    return {val, grad};
  }

  inv(a){
    let grad = [];
    let val = 1 / a.val;
    for(let i=0;i<this.nbVar;i++)
      grad[i] = - (a.grad[i] || 0) * (val * val);
    return {val, grad};
  }

  max0(v){
    if(v.val > 0)
      return v;
    return {val:0,grad:[]};
  }
  
  abs(v){
    if(v.val >= 0)
      return v;
    let grad = [];
    for(let i=0;i<this.nbVar;i++)
      grad[i] = - (v.grad[i] || 0);
    return {val:-v.val,grad};
  }

  acc(a, b){
    a.val += b.val;
    for(let i=0;i<this.nbVar;i++)
      a.grad[i] = (a.grad[i] || 0) + (b.grad[i] || 0);
    return a;
  }

  minus(a, b){
    let grad = [];
    for(let i=0;i<this.nbVar;i++)
      grad[i] = (a.grad[i] || 0) - (b.grad[i] || 0);
    return {val: a.val-b.val, grad};
  }

  add(a,b){
    let grad = [];
    for(let i=0;i<this.nbVar;i++)
      grad[i] = (a.grad[i] || 0) + (b.grad[i] || 0);
    return {val: a.val+b.val, grad};
  }

  neg(a){
    let grad = [];
    for(let i=0;i<this.nbVar;i++)
      grad[i] = -(a.grad[i] || 0);
    return {val: -a.val, grad};
  }

  sqrt(a){
    let sqrt_a = Math.sqrt(a.val);
    let grad = [];
    for(let i=0;i<this.nbVar;i++)
      grad[i] = -0.5*(a.grad[i] || 0)/sqrt_a;
    return {val: sqrt_a, grad};
  }

  exp(a){
    let exp_a = Math.exp(a.val);
    let grad = [];
    for(let i=0;i<this.nbVar;i++)
      grad[i] = (a.grad[i] || 0)*exp_a;
    return {val: exp_a, grad};
  }

  ln(a){
    let grad = [];
    for(let i=0;i<this.nbVar;i++)
      grad[i] = (a.grad[i] || 0)/a.val;
    return {val: Math.log(a.val), grad};
  }

  square(a){
    let grad = [];
    for(let i=0;i<this.nbVar;i++)
      grad[i] = 2*a.val*(a.grad[i] || 0);
    return {val: a.val*a.val, grad};
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = AD;
else
  window.Method2 = AD;

})();