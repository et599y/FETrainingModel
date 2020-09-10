
// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 120, left: 50 },
    width = 850 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#div2")
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", `translate(${margin.left} ${margin.top})`);

function featureBar(file) {
    // Parse the Data
    d3.json(file, function (data) {
        console.log(data)
        // X axis
        var x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(function (d) { return d.keys; }))
            .padding(0.2);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("stroke", "steelblue")
            .style("stroke-opacity", 0.5)
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return d.result; })])
            .range([height, 0]);
        svg.append("g")
            .attr("stroke", "steelblue")
            .call(d3.axisLeft(y));

        var myColor = d3.scaleLinear()
            .range(["#97CBFF", "#0000E3"])
            .domain([0, d3.max(data, function (d) { return d.result; })])

        // Bars
        var bar = svg.selectAll()
            .data(data)
            .enter()
            .append("g")

        bar.append("rect")
            .attr("x", function (d) { return x(d.keys); })
            .attr("width", x.bandwidth())
            .style("fill", function (d) { return myColor(d.result) })
            .attr("height", function (d) { return height - y(0); }) // always equal to 0
            .attr("y", function (d) { return y(0); })

        // Animation
        bar.selectAll("rect")
            .transition()
            .duration(800)
            .attr("y", function (d) { return y(d.result); })
            .attr("height", function (d) { return height - y(d.result); })
            .delay(function (d, i) { console.log(i); return (i * 100) })

        bar.append('text')
            .attr("x", function (d) { return x(d.keys); })
            .attr("y", function (d) { return y(d.result); })//y(0)
            .attr('dx', 12)
            .attr('dy', -2)
            .text(function (d) { return Math.round(d.result * 100) / 100 })
            .attr('text-anchor', 'middle')
            .style('font-size', '8px')
            .style("stroke", "#FFFFFF")
            //.style("fill", "none")
            .style("stroke-opacity", 0.3)
            .style("opacity", 1)
            .transition()
            .duration(2000)
            .tween("number", function () {
                var i = d3.interpolateRound(0, function (d) { return Math.round(d.result * 100) / 100 });
                return function (t) {
                    this.textContent = i(t);
                };
            })

    })
}
