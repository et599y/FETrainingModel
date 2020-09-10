
// set the dimensions and margins of the graph
var width = 200
height = 200
margin = 0

var width_donut = document.getElementById('donut_row').clientWidth;

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin

// append the svg object to the div called 'my_dataviz'
var svg2 = d3.select("#donut_chart")
  .append("svg")
  //.attr("viewBox", `0 0 ${width} ${height}`)
  .attr("width", width)
  .attr("height", height)
  .append("g")
  //.attr("transform", `translate(${width / 2}, ${height / 2})`)
  .attr("transform", "translate(" + (width / 2) + "," + height / 2 + ")");

// Create dummy data
var data = { a: 9, b: 20, c: 30, d: 8 }

// set the color scale
var color = d3.scaleOrdinal()
  .domain(["a", "b", "c", "d"])
  .range(["#98abc5", "#8a89a6", "#7b6888", "#ffc1c1"]); //, "#fff68f", "#7ccd7c", "#48d1cc", "#4682b4"

// Compute the position of each group on the pie:
var pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function (d) { return d.value; })
var data_ready = pie(d3.entries(data))

// The arc generator
var arc = d3.arc()
  .innerRadius(radius * 0.5)         // This is the size of the donut hole
  .outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positioning
var outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg2
  .selectAll('allSlices')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function (d) { return (color(d.data.key)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)

svg2
  .append('text')
  .text('TC1')
  .attr('text-anchor', 'middle')
/*
// Add the polylines between chart and labels:
svg2
  .selectAll('allPolylines')
  .data(data_ready)
  .enter()
  .append('polyline')
  .attr("stroke", "black")
  .style("fill", "none")
  .attr("stroke-width", 1)
  .attr('points', function (d) {
    var posA = arc.centroid(d) // line insertion in the slice
    var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
    var posC = outerArc.centroid(d); // Label position = almost the same as posB
    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
    posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
    return [posA, posB, posC]
  })

// Add the polylines between chart and labels:
svg2
  .selectAll('allLabels')
  .data(data_ready)
  .enter()
  .append('text')
  .text(function (d) { console.log(d.data.key); return d.data.key })
  .attr('transform', function (d) {
    var pos = outerArc.centroid(d);
    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
    pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
    return 'translate(' + pos + ')';
  })
  .style('text-anchor', function (d) {
    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
    return (midangle < Math.PI ? 'start' : 'end')
  })*/
///////////////////////////////////
//第二個donut
var svg3 = d3.select("#donut_chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`)
//.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Create dummy data
var data = { c: 30, d: 8, e: 12, f: 3 }

// set the color scale
var color = d3.scaleOrdinal()
  .domain(["a", "b", "c", "d"])
  .range(["#ffc1c1", "#fff68f", "#7ccd7c", "#98abc5"]);

// Compute the position of each group on the pie:
var pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function (d) { return d.value; })
var data_ready = pie(d3.entries(data))

// The arc generator
var arc = d3.arc()
  .innerRadius(radius * 0.5)         // This is the size of the donut hole
  .outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positioning
var outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg3
  .selectAll('allSlices')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function (d) { return (color(d.data.key)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)

svg3
  .append('text')
  .text('TC2')
  .attr('text-anchor', 'middle')
// Add the polylines between chart and labels:
////////////////
//第三個donut
var svg4 = d3.select("#donut_chart2")
  .append("svg")
  .attr("width", width_donut / 5)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + radius * 0.8 + "," + height / 2 + ")");

// Create dummy data
var data = { c: 30, d: 8, e: 12, f: 3 }

// set the color scale
var color = d3.scaleOrdinal()
  .domain(["a", "b", "c", "d"])
  .range(["#ffc1c1", "#fff68f", "#7ccd7c", "#4682b4"]);

// Compute the position of each group on the pie:
var pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function (d) { return d.value; })
var data_ready = pie(d3.entries(data))

// The arc generator
var arc = d3.arc()
  .innerRadius(radius * 0.5)         // This is the size of the donut hole
  .outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positioning
var outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg4
  .selectAll('allSlices')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function (d) { return (color(d.data.key)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)

svg4
  .append('text')
  .text('MEFAE0')
  .attr('text-anchor', 'middle')
// Add the polylines between chart and labels:

//第四個donut
var svg5 = d3.select("#donut_chart2")
  .append("svg")
  .attr("width", width_donut / 5)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + radius * 0.8 + "," + height / 2 + ")");
//.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Create dummy data
var data = { c: 30, d: 8, e: 12, f: 3 }

// set the color scale
var color = d3.scaleOrdinal()
  .domain(["a", "b", "c", "d"])
  .range(["#ffc1c1", "#fff68f", "#7ccd7c", "#4682b4"]);

// Compute the position of each group on the pie:
var pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function (d) { return d.value; })
var data_ready = pie(d3.entries(data))

// The arc generator
var arc = d3.arc()
  .innerRadius(radius * 0.5)         // This is the size of the donut hole
  .outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positioning
var outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg5
  .selectAll('allSlices')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function (d) { return (color(d.data.key)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)

svg5
  .append('text')
  .text('MEFA00')
  .attr('text-anchor', 'middle')
/////////////
//第六個donut
var svg6 = d3.select("#donut_chart2")
  .append("svg")
  .attr("width", width_donut / 5)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + radius * 0.8 + "," + height / 2 + ")");
//.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Create dummy data
var data = { c: 30, d: 8, e: 12, f: 3 }

// set the color scale
var color = d3.scaleOrdinal()
  .domain(["a", "b", "c", "d"])
  .range(["#ffc1c1", "#fff68f", "#7ccd7c", "#4682b4"]);

// Compute the position of each group on the pie:
var pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function (d) { return d.value; })
var data_ready = pie(d3.entries(data))

// The arc generator
var arc = d3.arc()
  .innerRadius(radius * 0.5)         // This is the size of the donut hole
  .outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positioning
var outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg6
  .selectAll('allSlices')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function (d) { return (color(d.data.key)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)

svg6
  .append('text')
  .text('HL')
  .attr('text-anchor', 'middle')

////////

//第6個donut
var svg7 = d3.select("#donut_chart2")
  .append("svg")
  .attr("width", width_donut / 5)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + radius * 0.8 + "," + height / 2 + ")");
//.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Create dummy data
var data = { c: 30, d: 8, e: 12, f: 3 }

// set the color scale
var color = d3.scaleOrdinal()
  .domain(["a", "b", "c", "d"])
  .range(["#ffc1c1", "#fff68f", "#7ccd7c", "#4682b4"]);

// Compute the position of each group on the pie:
var pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function (d) { return d.value; })
var data_ready = pie(d3.entries(data))

// The arc generator
var arc = d3.arc()
  .innerRadius(radius * 0.5)         // This is the size of the donut hole
  .outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positioning
var outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg7
  .selectAll('allSlices')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function (d) { return (color(d.data.key)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)

svg7
  .append('text')
  .text('LK')
  .attr('text-anchor', 'middle')

////////////

//第6個donut
var svg8 = d3.select("#donut_chart2")
  .append("svg")
  .attr("width", width_donut / 5)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + radius * 0.8 + "," + height / 2 + ")");
//.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Create dummy data
var data = { c: 30, d: 8, e: 12, f: 3 }

// set the color scale
var color = d3.scaleOrdinal()
  .domain(["a", "b", "c", "d"])
  .range(["#ffc1c1", "#fff68f", "#7ccd7c", "#4682b4"]);

// Compute the position of each group on the pie:
var pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function (d) { return d.value; })
var data_ready = pie(d3.entries(data))

// The arc generator
var arc = d3.arc()
  .innerRadius(radius * 0.5)         // This is the size of the donut hole
  .outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positioning
var outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg8
  .selectAll('allSlices')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function (d) { return (color(d.data.key)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)

svg8
  .append('text')
  .text('TC3')
  .attr('text-anchor', 'middle')