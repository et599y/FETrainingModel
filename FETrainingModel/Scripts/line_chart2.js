
// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("Small_measurement.csv",

    // When reading the csv, I must format variables:
    function (d) {
        return { date: d3.timeParse("%Y-%m-%d")(d.date), value: +d.PM10, value2: +d.PM2_5 }
    },
    // Now I can use this dataset:
    function (data) {
        console.log(data)
        // Add X axis --> it is a date format
        var x = d3.scaleTime()
            .domain(d3.extent(data, function (d) { return d.date; }))
            .range([0, width]);
        xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return +d.value; })])
            .range([height, 0]);
        yAxis = svg.append("g")
            .call(d3.axisLeft(y));

        // Add a clipPath: everything out of this area won't be drawn.
        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        // Add brushing
        var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
            .extent([[0, 0], [width, height]])  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            .on("end", updateChart)               // Each time the brush selection changes, trigger the 'updateChart' function

        // Create the line variable: where both the line and the brush take place
        var line = svg.append('g')
            .attr("clip-path", "url(#clip)")

        // Add the line
        line.append("path")
            .datum(data)
            .attr("class", "line")  // I add the class line to be able to modify this line later on.
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d) { return x(d.date) })
                .y(function (d) { return y(d.value) })
            )

        // Add the brushing
        line
            .append("g")
            .attr("class", "brush")
            .call(brush)
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('width', width)
            .attr('height', height)
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseout', mouseout);

        // This allows to find the closest X index of the mouse:
        var bisect = d3.bisector(function (d) { return d.date; }).left;

        // Create the circle that travels along the curve of chart
        var focus = svg
            .append('g')
            .append('circle')
            .style("fill", "none")
            .attr("stroke", "black")
            .attr('r', 8.5)
            .style("opacity", 0)

        var focus2 = svg.append("g")
            .attr("class", "focus2")
            .style("display", "none");

        focus2.append("line").attr("class", "lineHover") //draw line
            .style("stroke", "#999")
            .attr("stroke-width", 1)
            .style("shape-rendering", "crispEdges")
            .style("opacity", 0.5)
            .attr("y1", -height)
            .attr("y2", 0);

        // Create the text that travels along the curve of chart
        var focusText = svg
            .append('g')
            .append('text')
            .style("opacity", 0)
            .attr("text-anchor", "left")
            .attr("alignment-baseline", "middle")

        // What happens when the mouse move -> show the annotations at the right positions.
        function mouseover() {
            focus.style("opacity", 1)
            focusText.style("opacity", 1)
            focus2.style("display", null)
        }

        function mousemove() {
            // recover coordinate we need
            var x0 = x.invert(d3.mouse(this)[0]);
            var i = bisect(data, x0, 1);
            selectedData = data[i]
            focus
                .attr("cx", x(selectedData.date))
                .attr("cy", y(selectedData.value))
            focusText
                .html("y:" + selectedData.value)
                .html("x:" + d3.timeFormat("%Y-%m-%d")(selectedData.date) + "  -  " + "y:" + selectedData.value)
                .attr("x", x(selectedData.date) + 15)
                .attr("y", y(selectedData.value))
            focus2.select(".lineHover")
                .attr("transform", "translate(" + x(selectedData.date) + "," + height + ")");
        }
        function mouseout() {
            focus.style("opacity", 0)
            focusText.style("opacity", 0)
            focus2.style("display", "none")
        }


        // A function that set idleTimeOut to null
        var idleTimeout
        function idled() { idleTimeout = null; }

        // A function that update the chart for given boundaries
        function updateChart() {

            // What are the selected boundaries?
            extent = d3.event.selection

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if (!extent) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                x.domain([4, 8])
            } else {
                x.domain([x.invert(extent[0]), x.invert(extent[1])])
                line.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            }

            // Update axis and line position
            xAxis.transition().duration(1000).call(d3.axisBottom(x))
            line
                .select('.line')
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .x(function (d) { return x(d.date) })
                    .y(function (d) { return y(d.value) })
                )
        }

        // If user double click, reinitialize the chart
        svg.on("dblclick", function () {
            x.domain(d3.extent(data, function (d) { return d.date; }))
            xAxis.transition().call(d3.axisBottom(x))
            line
                .select('.line')
                .transition()
                .attr("d", d3.line()
                    .x(function (d) { return x(d.date) })
                    .y(function (d) { return y(d.value) })
                )
        });

    })
