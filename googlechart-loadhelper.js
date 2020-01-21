let googleChartIsLoaded = false;
let cbList = [];
function loadGoogleChart(){
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(function(){
    googleChartIsLoaded = true;
    cbList.forEach(cb => setTimeout(() => cb(), 0));
  });
}
function callWhenGoogleChartLoaded(cb){
  if(googleChartIsLoaded)
    return setTimeout(() => cb(), 0);
  cbList.push(cb);
}
loadGoogleChart();

function googleGraph(div, cbFct){
  div.empty();
  div.css("width", 400).css("height", 300).addClass("d-flex justify-content-center");
  let spin = $("<div>").addClass("spinner-border text-primary");
  div.append($("<strong>").text("Loading..."));
  div.append(spin);
  
  callWhenGoogleChartLoaded(function(){
    let data = new google.visualization.DataTable();
    cbFct(null,data,function(err,type,options){
      if(err){
        div.empty();
        div.append($("<strong>").text("Error: " + err));
        return;
      }
      options.width = 400;
      options.height = 300;
      div.empty();
      let chart = new google.visualization[type](div[0]);
      chart.draw(data, options);
    });
  });
}
