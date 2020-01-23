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
    tape.forEach(item => item.adj = 0);
    let N = result.idx;
    tape[N].adj = 1.0;
    console.log(N);
    for(let j=N; j>=0; --j){
      let t = tape[j];
      let adj = t.adj;
      if(adj != 0){
        t.next.forEach(item => tape[item.idx].adj += adj * item.der);
      }
    }
    return this.variables;
  }
  
  getGrad(a){
    this.calculateAdjoints(a);
    let grad = {};
    Object.keys(this.variables).forEach(name => grad[name] = this.variables[name].adj);
    return grad;
  }

  cst(val){
    this.tape.push({next: []});
    return {val, idx:this.tape.length-1};
  }

  variable(name, val){
    let item = {next: []};
    this.tape.push(item);
    this.variables[name] = item;
    return {val, idx:this.tape.length-1};
  }

  multiply(a, b){
    let val = a.val * b.val;
    this.tape.push({next:[
      {idx:a.idx,der:b.val},
      {idx:b.idx,der:a.val}
    ]});
    return {val, idx:this.tape.length-1};
  }
  
  divide(a, b){
    let inv_b = 1 / b.val
    let val = a.val * inv_b;
    this.tape.push({next:[
      {idx:a.idx,der:inv_b},
      {idx:b.idx,der:-a.val*inv_b*inv_b}
    ]});
    return {val, idx:this.tape.length-1};
  }

  inv(a){
    let val = 1 / a.val;
    this.tape.push({next:[
      {idx:a.idx,der:-val*val},
    ]});
    return {val, idx:this.tape.length-1};
  }

  max0(v){
    if(v.val > 0)
      return v;
    return this.zero;
    /*if(v.val > 0){
      this.tape.push({next:[
        {idx:v.idx,der:1},
      ]});
      return {val:v.val, idx:this.tape.length-1};
    }
    this.tape.push({next:[]});
    return {val:0, idx:this.tape.length-1};*/
  }

  abs(v){
    if(v.val >= 0)
      return v;
    return this.neg(v);
  }
  
  minus(a, b){
    this.tape.push({next:[
      {idx:a.idx,der:1},
      {idx:b.idx,der:-1},
    ]});
    return {val: a.val-b.val, idx:this.tape.length-1};
  }

  add(a,b){
    this.tape.push({next:[
      {idx:a.idx,der:1},
      {idx:b.idx,der:1},
    ]});
    return {val: a.val+b.val, idx:this.tape.length-1};
  }

  neg(a){
    this.tape.push({next:[
      {idx:a.idx,der:-1},
    ]});
    return {val: -a.val, idx:this.tape.length-1};
  }

  sqrt(a){
    let sqrt_a = Math.sqrt(a.val);
    this.tape.push({next:[
      {idx:a.idx,der:-0.5/sqrt_a}
    ]});
    return {val: sqrt_a, idx:this.tape.length-1};
  }

  exp(a){
    let exp_a = Math.exp(a.val);
    this.tape.push({next:[
      {idx:a.idx,der:exp_a}
    ]});
    return {val: exp_a, idx:this.tape.length-1};
  }

  ln(a){
    this.tape.push({next:[
      {idx:a.idx,der:1/a.val}
    ]});
    return {val: Math.log(a.val), idx:this.tape.length-1};
  }

  square(a){
    this.tape.push({next:[
      {idx:a.idx,der:2*a.val}
    ]});
    return {val: a.val*a.val, idx:this.tape.length-1};
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = AAD;
else
  window.Method3 = AAD;

})();