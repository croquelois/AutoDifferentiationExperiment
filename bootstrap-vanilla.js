
function bootstrap(swaps){
  let dfAcc = 0;
  let ret = []; // return: discount factor
  let prevT = 0;
  let prevC = 0;
  let curT = 0;
  swaps.forEach(function(swap,i){
    let t = swap.t;
    let c = swap.r;
    if(t > 1 && t != Math.floor(t))
      throw new Error("unhandled case: more than one year swap with broken period");
    if(t < 1){
      let df = 1/(1+c*t);
      ret.push({t,df});
    } else {
      let incC = (c-prevC)/(t-prevT);
      let curC = prevC;
      curT = prevT;
      while(curT != t){
        curT = prevT+1;
        curC = curC + incC;
        let df = (1-curC*dfAcc)/(1+curC);
        ret.push({t:curT,df});
        dfAcc += df;
        prevT = curT;
        prevC = curC;
      }
    }
  });
  return ret;
}

let swaps = [
  {t: 0.25, r:-0.0045},
  {t: 0.5 , r:-0.0045},
  {t: 1   , r:-0.0032},
  {t: 2   , r:-0.0031},
  {t: 3   , r:-0.0028},
  {t: 4   , r:-0.0023},
  {t: 5   , r:-0.0018},
  {t: 6   , r:-0.0013},
  {t: 7   , r:-0.0007},
  {t: 8   , r:-0.0001},
  {t: 9   , r: 0.0005},
  {t:10   , r: 0.0011},
  {t:12   , r: 0.0023},
  {t:15   , r: 0.0037},
  {t:20   , r: 0.0050},
  {t:30   , r: 0.0053},
]
let curve = bootstrap(swaps);
curve.forEach(function(pt){
  console.log("T: " + pt.t + /*" df: " + pt.df +*/ " r: " + (-100*Math.log(pt.df)/pt.t).toFixed(2)+ "%");
});