// set the dimensions and margins of the graph
var margin_heatmap = { top: 0, right: 100, bottom: 100, left: 200 },
  width_heatmap = 600,
  height_heatmap = 600;

// Create the svg area


var svg = d3.select("#heatmap")
  .append("svg")
  .attr("viewBox", `0 0 ${width_heatmap + margin_heatmap.left + margin_heatmap.right} ${height_heatmap + margin_heatmap.top + margin_heatmap.bottom}`)

var svg_colorBar = svg
  .append("g")
  .attr("transform", "translate(20,5)");

// append the svg object to the body of the page
var svg_heatmap = svg.append("g")
  .attr("transform", `translate(${margin_heatmap.left + 20} ${margin_heatmap.top + 5})`);

//Read the data
function heatmap(file) {
    d3.csv(file, function (data) {
        var corColumns = data.columns.slice(1)
        // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
        var myGroups = d3.map(data, function (d) { return d.col1; }).keys()
        var myVars = d3.map(data, function (d) { return d.col2; }).keys()

        // Build X scales and axis:
        var x = d3.scaleBand()
            .range([0, width_heatmap])
            .domain(myGroups)
            .padding(0.05);
        svg_heatmap.append("g")
            //.style("font-size", 5)
            .style("stroke-opacity", 0.3)
            .attr("stroke", "steelblue")
            .attr("transform", "translate(0," + height_heatmap + ")")
            .call(d3.axisBottom(x).tickSize(0))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)")
        svg_heatmap.select(".domain").remove()

        // Build Y scales and axis:
        var y = d3.scaleBand()
            .range([height_heatmap, 0])
            .domain(myVars)
            .padding(0.05);
        svg_heatmap.append("g")
            //.style("font-size", 5)
            .style("stroke-opacity", 0.3)
            .attr("stroke", "steelblue")
            .call(d3.axisLeft(y).tickSize(0))
        svg_heatmap.select(".domain").remove()

        var myColor = d3.scaleLinear()
            .range(["#005757", "#00AEAE", "#00FFFF", "#BBFFFF", "#ECF5FF", "#97CBFF", "#46A3FF", "#0072E3", "#004B97"])
            .domain([-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1])

        // create a tooltip
        var tooltip = d3.select("#heatmap")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function (d) {
            tooltip
                .style("opacity", 1)
            d3.select(this)
                .style("stroke", "MidnightBlue")
                //.style("fill", "none")
                .style("stroke-opacity", 0.8)
                .style("stroke-width", 1.5)
                .style("opacity", 1)
        }
        var mousemove = function (d) {
            tooltip
                .html(d.col1 + " , " + d.col2 + "<br>The value is : " + d.value)
                .style("left", (d3.mouse(this)[0] + 100) + "px")
                .style("top", (d3.mouse(this)[1] + 100) + "px")
            // .style("left", (d3.event.pageX + 20) + "px")//window.pageXOffset
            // .style("top", (d3.event.pageY - 20) + "px")
        }
        var mouseleave = function (d) {
            tooltip
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
        }

        // add the squares
        var gg = svg_heatmap.selectAll()
            .data(data, function (d) { return d.col1 + ':' + d.col2; })
            .enter()
            .append("g")


        gg
            .append("rect")
            .attr("x", function (d) { return x(d.col1) })
            .attr("y", function (d) { return y(d.col2) })
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) { return myColor(d.value) })
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)
            // .append("text")
            // .text(function (d) { return Math.round(d.value * 100) / 100 })
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

        gg.append("text")
            .style("pointer-events", "none")
            .attr("x", function (d) { return x(d.col1) })
            .attr("y", function (d) { return y(d.col2) })
            .attr('dx', x.bandwidth() / 2)
            .attr('dy', (y.bandwidth() / 2) + 5)
            .text(function (d) { return Math.round(d.value * 100) / 100 })
            .attr('text-anchor', 'middle')
            .style('font-size', x.bandwidth()/4)
            .style("opacity", 1)

        //colorbar

        var aS = d3.scaleLinear()
            .range([0, height_heatmap - 5])
            .domain([1, -1]);

        var yA = d3.axisRight()
            .scale(aS)
            .tickPadding(7);

        var aG = svg_colorBar.append("g")
            .attr("class", "y axis")
            .call(yA)
            .attr("transform", "translate(0 ,0)")

        var iR = d3.range(-1, 1.01, 0.01);
        var h = height_heatmap / iR.length + 3;
        iR.forEach(function (d) {
            aG.append('rect')
                .style('fill', myColor(d))
                .style('stroke-width', 0)
                .style('stoke', 'none')
                .attr('height', h)
                .attr('width', 10)
                .attr('x', 0)
                .attr('y', aS(d))
        });
    })
}

