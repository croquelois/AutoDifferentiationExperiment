/* jshint undef: true, unused: true, sub:true, loopfunc:true, esversion:6, node:true, browser:true */

(function(){

class AAD {
  constructor(){
    this.variables = {};
    this.tape = [];
    this.nbVar = 0;
    this.zero = this.cst(0);
    this.one = this.cst(1);
  }

  calculateAdjoints(result){
    let tape = this.tape;
    let N = result.idx;
    let adjArr = new Array(N+1).fill(0);
    adjArr[N] = 1.0;
    //console.log(N);
    for(let j=N; j>=0; --j){
      let adj = adjArr[j];
      if(adj != 0){
        tape[j].forEach(item => adjArr[item.idx] += adj * item.der);
      }
    }
    return adjArr;
  }
  
  getGrad(a){
    let adj = this.calculateAdjoints(a);
    let grad = {};
    Object.keys(this.variables).forEach(name => grad[name] = adj[this.variables[name]]);
    return grad;
  }

  cst(val){
    this.tape.push([]);
    return {val, idx:this.tape.length-1};
  }

  variable(name, val){
    let idx = this.tape.length;
    this.tape.push([]);
    this.variables[name] = idx;
    return {val, idx};
  }

  multiply(a, b){
    let val = a.val * b.val;
    this.tape.push([
      {idx:a.idx,der:b.val},
      {idx:b.idx,der:a.val}
    ]);
    return {val, idx:this.tape.length-1};
  }
  
  divide(a, b){
    let inv_b = 1 / b.val
    let val = a.val * inv_b;
    this.tape.push([
      {idx:a.idx,der:inv_b},
      {idx:b.idx,der:-a.val*inv_b*inv_b}
    ]);
    return {val, idx:this.tape.length-1};
  }

  inv(a){
    let val = 1 / a.val;
    this.tape.push([
      {idx:a.idx,der:-val*val},
    ]);
    return {val, idx:this.tape.length-1};
  }

  max0(v){
    if(v.val > 0)
      return v;
    return this.zero;
  }

  abs(v){
    if(v.val >= 0)
      return v;
    return this.neg(v);
  }
  
  minus(a, b){
    this.tape.push([
      {idx:a.idx,der:1},
      {idx:b.idx,der:-1},
    ]);
    return {val: a.val-b.val, idx:this.tape.length-1};
  }

  add(a,b){
    this.tape.push([
      {idx:a.idx,der:1},
      {idx:b.idx,der:1},
    ]);
    return {val: a.val+b.val, idx:this.tape.length-1};
  }

  neg(a){
    this.tape.push([
      {idx:a.idx,der:-1},
    ]);
    return {val: -a.val, idx:this.tape.length-1};
  }

  sqrt(a){
    let sqrt_a = Math.sqrt(a.val);
    this.tape.push([
      {idx:a.idx,der:-0.5/sqrt_a}
    ]);
    return {val: sqrt_a, idx:this.tape.length-1};
  }

  exp(a){
    let exp_a = Math.exp(a.val);
    this.tape.push([
      {idx:a.idx,der:exp_a}
    ]);
    return {val: exp_a, idx:this.tape.length-1};
  }

  ln(a){
    this.tape.push([
      {idx:a.idx,der:1/a.val}
    ]);
    return {val: Math.log(a.val), idx:this.tape.length-1};
  }

  square(a){
    this.tape.push([
      {idx:a.idx,der:2*a.val}
    ]);
    return {val: a.val*a.val, idx:this.tape.length-1};
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = AAD;
else
  window.Method4 = AAD;

})();