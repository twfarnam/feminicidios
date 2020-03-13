import * as d3 from 'd3'
import * as d3Legend from 'd3-svg-legend'
import { sortBy } from 'lodash'

// XXX
window.d3 = d3

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

var path = d3.geoPath().projection(projection);

var svg = d3.select("body")
  .append("svg")
  .attr("id", "chart")
  .attr("viewBox", "0 0 " + w + " " + h)
  .append("g")
  .attr("tranform", "translate(0" + margin.left + "," + margin.top + ")");

var color = d3.scaleQuantile()
  .range([
    "rgb(237, 248, 233)",
    "rgb(186, 228, 179)",
    "rgb(116,196,118)",
    "rgb(49,163,84)",
    "rgb(0,109,44)",
  ]);

d3.json("states_feminicide_sm.json").then(data => {

  data = data.hd

  color.domain([
    d3.min(data, d => d.count),
    d3.max(data, d => d.count),
  ]);

  // XXX make this dynamic
  var radius = d3.scaleSqrt([0, 500], [0, 15])

  var dates = data.reduce((dates, d) => {
    if (!dates.includes(d.date)) dates.push(d.date)
    return dates
  }, [])

  d3.json("states.json").then(json => {

    json.features.map(f => {
      var stateData = data.filter(d => {
        if (f.properties.ADMIN_NAME == 'Distrito Federal') {
          return d.name == 'CIUDAD DE MÉXICO'
        }
        return d.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "") == f.properties.ADMIN_NAME.toLowerCase()
      })
      stateData = sortBy(stateData, d => d.date)
      let sum = 0
      stateData = stateData.reduce((hash, d) => {
        sum += d.count
        d.sum = sum
        hash[d.date] = d
          return hash
        }, {})
      if (stateData) f.properties.data = stateData
      // console.log(f.properties.ADMIN_NAME, Object.values(stateData).map(d => d.count))
    })

    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", '#ddd')
      .style("stroke", "white")
      .style("stroke-width", "0.5")

    const sorted = sortBy(
      json.features,
      d => d.properties.data[dates[dates.length-1]].sum,
    )
    sorted.reverse()

    svg.append("g")
      .selectAll("circle")
      .data(sorted)
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("transform", d => "translate(" + path.centroid(d) + ")")

    d3.select('body')
      .append('div')
      .attr('class', 'date')

    d3.select('body')
      .append('input')
      .attr('type', 'range')
      .attr('min', 0)
      .attr('max', dates.length-1)
      .attr('value', dates.length-1)
      .on('input',  () => update(dates[document.querySelector('input').value]))

    update(dates[dates.length - 1])

    function update(date) {
      d3.select('.date').text(date)
      document.querySelector('input').value = dates.indexOf(date)

      svg.selectAll("circle")
        .attr("r", d => radius(d.properties.data[date].sum))

      // svg.selectAll("path")
      //   .style("fill", d => {
      //     var value = d.properties.data[date].count;
      //     if(!isNaN(value)){
      //       return color(value);
      //     } else {
      //       return "#ccc"
      //     }
      //   })
    }

    // svg.append("g")
    //   .attr("class", "legendQuant")
    //   .attr("transform", "translate(20,20)");

    // var legend = d3Legend.legendColor()
    //   .labelFormat(d3.format('.1f'))
    //   .title('Feminicidios per 100,000 population')
    //   .titleWidth(100)
    //   .scale(color);

    // svg.select(".legendQuant").call(legend);

    var timer

    d3.select('body')
      .append('div')
      .attr('class', 'date')
      .text('play')
      .on('click', () => {
        update(dates[0])
        var index = 0
        timer = d3.timer(elapsed => {
          var index = Math.floor(elapsed / 200)
          if (index < dates.length) {
            update(dates[index])
          } else {
            timer.stop()
          }
        })
      })

  })

})

