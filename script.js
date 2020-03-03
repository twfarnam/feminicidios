var w = 500;
var h = 300;

var margin = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10
  }

  var width = w - margin.left - margin.right;
  var height = h - margin.top - margin.bottom;

var projection = d3.geoConicEqualArea()
      .parallels([10.5, 35.5])
  .rotate([96, 0])
  .center([-5.6, 25.7])
  .translate([w/2, h/2])
  .scale([800]);

//Define default path generator
var path = d3.geoPath()
  .projection(projection);

var svg = d3.select("body")
  .append("svg")
  .attr("id", "chart")
  .attr("viewBox", "0 0 " + w + " " + h)
  .append("g")
  .attr("tranform", "translate(0" + margin.left + "," + margin.top + ")");

  var color = d3.scaleQuantile()
    .range(["rgb(237, 248, 233)", "rgb(186, 228, 179)", "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);

d3.json("states_feminicide_sm.json", function(data){

  data = data.hd

  color.domain([ d3.min(data, function(d){ return d.rate; }),
    d3.max(data, function(d){ return d.rate; })
  ]);

  data = data.filter(d => d.date == '2018-03-01')

  d3.json("states.json", function(json){

    json.features.map(function(f) {
      var stateData = data.find(function(d) {
        if (f.properties.ADMIN_NAME == 'Distrito Federal') {
          return d.name == 'CIUDAD DE MÉXICO'
        }
        return d.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "") == f.properties.ADMIN_NAME.toLowerCase()
      })
      if (stateData) f.properties.rate = stateData.rate
    })

    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", function(d){
        var value = d.properties.rate;
        if(!isNaN(value)){
          return color(value);
        } else {
          return "#ccc"
        }
      });

    svg.append("g")
      .attr("class", "legendQuant")
      .attr("transform", "translate(20,20)");

    var legend = d3.legendColor()
      .labelFormat(d3.format('.1f'))
      .title('Feminicidios per 100,000 population')
      .titleWidth(100)
      .scale(color);

    svg.select(".legendQuant").call(legend);

  });

})

