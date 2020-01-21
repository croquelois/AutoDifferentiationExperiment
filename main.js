
function doOneTest(test, cbFct){
  async.setImmediate(() => {
    let t0 = new Date();
    test();
    let t1 = new Date();
    return cbFct(null, t1-t0);
  });
}

function doNbTest(test, nb, cbFct){
  async.times(nb, (i,cb) => doOneTest(test, cb), (err,ret) => {
    return cbFct(err, (ret||[]).reduce((a,c) => a+c,0)/nb);
  });
}

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  switch($(e.target).attr('id')){
    case "montecarlo-tab":
      computeMontecarloTab();
    break;
    case "bootstrap-tab":
      computeBootstrapTab();
    break;
    case "calibration-tab":
      computeCalibrationTab();
    break;
  }
})

function computeBootstrapTab(){
  let verbose = false;
  let nbTest = 5
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
  function createOneBond(){
    let t = Math.max(0.1,5+10*normal());
    let c = Math.random()*0.1;
    let n = Math.random()*5000;
    return {n,t,c};
  }
  let bonds = [
  /*
    {n: 1000, t: 7.9, c: 4.0/100},
    {n: 1500, t: 5.3, c: 2.0/100},
    {n:  750, t: 9.8, c: 3.5/100},
    {n: 1000, t: 2.5, c: 0.9/100},
    */
  ];
  for(let i=0;i<1000;i++)
    bonds.push(createOneBond());
  
  function testBond(AD,verbose){
    let ad = new AD();
    let curve = bootstrap(ad,swaps);
    let res = ad.cst(0);
    bonds.forEach(bond => res = ad.add(res, bondPrice(ad, curve, bond)));
    let grad = ad.getGrad(res);
    if(verbose){
      console.log("value:", res.val);
      console.log(grad);
    }
  }

  function vanillaTestBond(verbose){
    let curve = vanillaBootstrap(swaps);
    let res = bonds.reduce((acc,bond) => acc + vanillaBondPrice(curve, bond), 0);
    if(verbose){
      console.log("value:", res);
    }
  }

  function computePerf(AD, nbTest, cbFct){
    doNbTest(() => testBond(AD, verbose),nbTest,cbFct);
  }

  function computePerfVanilla( nbTest, cbFct){
    doNbTest(() => vanillaTestBond(verbose),nbTest,cbFct);
  }
  
  googleGraph($("#chartDivBS1"),function(err, data, cbFct){
    if(err)
      return;
    data.addColumn('string', 'Method');
    data.addColumn('number', 'Time Taken');
    let bumpAndReprMul = 1 + swaps.length;
    async.parallel([
      cb => computePerfVanilla(      nbTest, (err,ret) => cb(err,['direct',ret*bumpAndReprMul])),
      cb => computePerf(Method0    , nbTest, (err,ret) => cb(err,['no AD',ret*bumpAndReprMul])),
      cb => computePerf(Method1Safe, nbTest, (err,ret) => cb(err,['AD Hash - Safe',ret])),
      cb => computePerf(Method1    , nbTest, (err,ret) => cb(err,['AD Hash',ret])),
      cb => computePerf(Method2    , nbTest, (err,ret) => cb(err,['AD Array',ret])),
      cb => computePerf(Method3    , nbTest, (err,ret) => cb(err,['AAD Tape',ret])),
      cb => computePerf(Method4    , nbTest, (err,ret) => cb(err,['AAD Tape Opt',ret])),
    ],function(err,rows){
      data.addRows(rows);
      return cbFct(err, "BarChart", {'title':'Automatic differentiation method, bootstrap IR curve'});
    });
  });
  
  googleGraph($("#chartDivBS2"),function(err, data, cbFct){
    if(err)
      return;
    data.addColumn('string', 'Maturity (Year)');
    data.addColumn('number', 'Risk (AD Hash)');
    data.addColumn('number', 'Risk (AAD Tape Opt)');
    let grad1, grad4;
    (function(){
      let AD = Method1;
      let ad = new AD();
      let curve = bootstrap(ad,swaps);
      let res = ad.cst(0);
      bonds.forEach(bond => res = ad.add(res, bondPrice(ad, curve, bond)));
      grad1 = ad.getGrad(res);
    })();
    (function(){
      let AD = Method4;
      let ad = new AD();
      let curve = bootstrap(ad,swaps);
      let res = ad.cst(0);
      bonds.forEach(bond => res = ad.add(res, bondPrice(ad, curve, bond)));
      grad4 = ad.getGrad(res);
    })();
    swaps.forEach(swap => data.addRows([[""+swap.t, -grad1["rate_"+swap.t], -grad4["rate_"+swap.t]]]));
    return cbFct(err, "ColumnChart", {'title':'KRR'});
  });
}

function computeCalibrationTab(){
  let verbose = false;
  let nbTest = 5;
  //TODO
}

function computeMontecarloTab(){
  let verbose = false;
  let nbTest = 5;

  function testMC(AD, nbPath, verbose){
    let ad = new AD();
    let spot = 3279.42;
    let maturity = 1; // 1y
    let strike = 3250;
    let rate = -0.02; // -2%
    let vol = 0.2; // 20%
  /*
    let analytic_res = vanillaCallPrice(strike,maturity,spot,rate,vol);
    console.log("Analytic price: " + analytic_res.price.toFixed(2));
    console.log("Analytic delta: " + analytic_res.delta.toFixed(2));
    console.log("Analytic vega: " + analytic_res.vega.toFixed(2));
  */
    let res = computeOption(ad,nbPath,strike,maturity,spot,rate,vol);
    let grad = ad.getGrad(res);
    if(verbose){
      console.log("Price: " + (res.val || res).toFixed(2));
      if(grad["spot"])
        console.log("Delta: " + grad["spot"].toFixed(2));
      if(grad["volatility"])
        console.log("Vega: " + grad["volatility"].toFixed(2));
    }
  }
  function testMCVanilla(nbPath, verbose){
    let spot = 3279.42;
    let maturity = 1; // 1y
    let strike = 3250;
    let rate = -0.02; // -2%
    let vol = 0.2; // 20%
  /*
    let analytic_res = vanillaCallPrice(strike,maturity,spot,rate,vol);
    console.log("Analytic price: " + analytic_res.price.toFixed(2));
    console.log("Analytic delta: " + analytic_res.delta.toFixed(2));
    console.log("Analytic vega: " + analytic_res.vega.toFixed(2));
  */
    let res = vanillaComputeOption(nbPath,strike,maturity,spot,rate,vol);
    if(verbose){
      console.log("Price: " + res);
    }
  }

  function computePerf(AD, nbPath, nbTest, cbFct){
    doNbTest(() => testMC(AD,nbPath,verbose),nbTest,cbFct);
  }

  function computePerfVanilla(nbPath, nbTest, cbFct){
    doNbTest(() => testMCVanilla(nbPath,verbose),nbTest,cbFct);
  }

  googleGraph($("#chartDivMC1"),function(err, data, cbFct){
    if(err)
      return;
    data.addColumn('string', 'Method');
    data.addColumn('number', 'Time Taken');
    async.parallel([
      cb => computePerfVanilla(     50000, nbTest, (err,ret) => cb(err,['pure MC',ret*3])), // Multiply by 3 to simulate bump and reprice
      cb => computePerf(Method0    ,50000, nbTest, (err,ret) => cb(err,['no AD',ret*3])),
      cb => computePerf(Method1Safe,50000, nbTest, (err,ret) => cb(err,['AD Hash - Safe',ret])),
      cb => computePerf(Method1    ,50000, nbTest, (err,ret) => cb(err,['AD Hash',ret])),
      cb => computePerf(Method2    ,50000, nbTest, (err,ret) => cb(err,['AD Array',ret])),
      cb => computePerf(Method3    ,50000, nbTest, (err,ret) => cb(err,['AAD Tape',ret])),
      cb => computePerf(Method4    ,50000, nbTest, (err,ret) => cb(err,['AAD Tape Opt',ret])),
    ],function(err,rows){
      data.addRows(rows);
      return cbFct(err,"BarChart", {'title':'Automatic differentiation method with montecarlo 50000 path'});
    });
  });

  googleGraph($("#chartDivMC2"),function(err, data, cbFct){
    if(err)
      return;
    data.addColumn('number', 'Nb Path');
    data.addColumn('number', 'AD Hash');
    data.addColumn('number', 'AD Array');
    data.addColumn('number', 'AAD Tape');
    data.addColumn('number', 'AAD Tape Opt');
    async.map([5000,10000,25000,50000],function(n,cb){
      computePerfVanilla(n, nbTest, function(err,base){
        if(err)
          return cb(err);
        base *= 3; // Multiply by 3 to simulate bump and reprice
        async.parallel([
          cb => computePerf(Method1, n, nbTest, cb),
          cb => computePerf(Method2, n, nbTest, cb),
          cb => computePerf(Method3, n, nbTest, cb),
          cb => computePerf(Method4, n, nbTest, cb),
        ], (err,ret) => cb(err, [n].concat((ret||[]).map(t => t/base))));
      });
    },function(err,rows){;
      data.addRows(rows);
      return cbFct(err,"LineChart", {'title':'cost MC with AD / cost for MC without AD'});
    });
  });
};