
// set the dimensions and margins of the graph
var margin = { top: 10, right: 110, bottom: 30, left: 60 },
    width11 = 1100 - margin.left - margin.right,
    height11 = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg11 = d3.select("#result1")
    .append("svg")
    .attr("viewBox", `0 0 ${width11 + margin.left + margin.right} ${height11 + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", `translate(${margin.left} ${margin.top})`);

function result_predict(file) {
    d3.json(file, function (error, data) {
        if (error) {
            console.log(error);
        } else {
            data = data;
            console.log(data)
        }
        var columns = [];
        data.forEach(function (d) {
            columns.push(d.Column);
        });
        console.log(columns)
        d3.select("#selectButton1")
            .selectAll('myOptions')
            .data(columns)
            .enter()
            .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d, i) { return i; }) // corresponding value returned by the button

        var select;
        var index = 0;
        d3.select("#selectButton1").on("change", function (d) {
            select = d3.select("#selectButton1 option:checked")
            console.log(select.text())
            index = columns.indexOf(select.text())
            updateSvg1(select.text(), index);//
        })

        // Add X axis --> it is a date format
        var x11 = d3.scaleLinear()
            .domain(d3.extent([0, data[index].predict.length - 1]))
            .range([0, width11]);
        xAxis11 = svg11.append("g")
            .attr("transform", "translate(0," + height11 + ")")
            .call(d3.axisBottom(x11));

        var valArray = data[index].predict.concat(data[index].y);
        // Add Y axis
        var y11 = d3.scaleLinear()
            .domain([d3.min(valArray), d3.max(valArray)])
            .range([height11, 0]);
        yAxis11 = svg11.append("g")
            .call(d3.axisLeft(y11));

        // Add a clipPath: everything out of this area won't be drawn.
        var clip11 = svg11.append("defs").append("svg:clipPath")
            .attr("id", "clip11")
            .append("svg:rect")
            .attr("width", width11)
            .attr("height", height11)
            .attr("x", 0)
            .attr("y", 0);

        // Add brushing
        var brush11 = d3.brushX()                   // Add the brush feature using the d3.brush function
            .extent([[0, 0], [width11, height11]])  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            .on("end", updateChart1)               // Each time the brush selection changes, trigger the 'updateChart' function

        // Create the line variable: where both the line and the brush take place
        var line = svg11.append('g')
            .attr("clip-path", "url(#clip11)")
            .on('mouseover', mouseover1)
            .on('mousemove', mousemove1)
            .on('mouseout', mouseout1);

        // Add the line
        line.append("path")
            .datum(data[index].predict)//data
            .attr("class", "line1")  // I add the class line to be able to modify this line later on.
            .attr("fill", "none")
            .style("stroke", "#FFB6C1")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d, i) { return x11(i); })
                .y(function (d) { return y11(d) })
            )

        line.append("path")
            .datum(data[index].y)
            .attr("class", "line2")  // I add the class line to be able to modify this line later on.
            .attr("fill", "none")
            .style("stroke", "#0033FF")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d, i) { return x11(i) })
                .y(function (d) { return y11(d) })
            )

        // Add the brushing
        line
            .append("g")
            .attr("class", "brush")
            .call(brush11)
            .style("fill", "none")
            .style("pointer-events", "all")

        // This allows to find the closest X index of the mouse:
        var bisect = d3.bisector(function (d, i) { return x(d) }).left;

        function updateSvg1(selectOption, index) {
            console.log(index)
            var valArray = data[index].predict.concat(data[index].y);
            y11.domain([d3.min(valArray), d3.max(valArray)])
            yAxis11.transition().duration(1000).call(d3.axisLeft(y11))

            line.select(".line1")
                .datum(data[index].predict)//data
                .transition()
                .duration(1000)
                .attr("class", "line1")  // I add the class line to be able to modify this line later on.
                .attr("fill", "none")
                .style("stroke", "#FFB6C1")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d, i) { return x11(i); })
                    .y(function (d) { return y11(d) })
                )

            line.select(".line2")
                .datum(data[index].y)
                .transition()
                .duration(1000)
                .attr("class", "line2")  // I add the class line to be able to modify this line later on.
                .attr("fill", "none")
                .style("stroke", "#0033FF")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d, i) { return x11(i) })
                    .y(function (d) { return y11(d) })
                )
        }

        // Create the circle that travels along the curve of chart
        var focus11 = svg11
            .append('g')
            .append('circle')
            .attr("z-index", 0)
            .style("fill", "none")
            .style("stroke", "#EE9A00")
            .attr('r', 8.5)
            .style("opacity", 0)

        var focus211 = svg11
            .append('g')
            .append('circle')
            .style("fill", "none")
            .style("stroke", "MidnightBlue")
            .attr('r', 8.5)
            .style("opacity", 0)

        var focusLine11 = svg11.append("g")
            .attr("class", "focusLine")
            .style("display", "none");

        focusLine11.append("line").attr("class", "lineHover") //draw line
            .style("stroke", "#B0C4DE")
            .attr("stroke-width", 1)
            .style("pointer-events", "none")
            .style("shape-rendering", "crispEdges")
            .style("opacity", 0.8)
            .attr("y1", -height11)
            .attr("y2", 0);

        var tooltip1 = d3.select("#result1")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("pointer-events", "none")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")

        // What happens when the mouse move -> show the annotations at the right positions.
        function mouseover1() {
            focus11.style("opacity", 1)
            focus211.style("opacity", 1)
            focusLine11.style("display", null)
            tooltip1
                .style("opacity", 1)
        }

        function mousemove1() {
            // recover coordinate we need
            var i = x11.invert(d3.mouse(this)[0]);
            var k = y11.invert(d3.mouse(this)[0]);
            //var i = bisect(y_train, x0, 1);//data  x0, 1

            //
            selectedData = data[index].predict[Math.round(i)]
            selectedData2 = data[index].y[Math.round(i)]
            focus11
                .attr("cx", x11(i))
                .attr("cy", y11(selectedData))
            focus211
                .attr("cx", x11(i))
                .attr("cy", y11(selectedData2))

            focusLine11.select(".lineHover")
                .attr("transform", "translate(" + x11(i) + "," + height11 + ")")
            tooltip1
                //.style("left", (d3.mouse(this)[0] - window.pageXOffset) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
                //.style("top", (d3.mouse(this)[1] - window.pageYOffset) + "px") //+document.getElementById("svg11").offsetLeft
                .style("left", (d3.event.pageX + 30) + "px")//window.pageXOffset
                .style("top", (d3.event.pageY - 30) + "px")
                .html("predict: " + selectedData + "<br>" + "y: " + selectedData2)
                .style("opacity", 1);
        }
        function mouseout1() {
            focus11.style("opacity", 0)
            focus211.style("opacity", 0)
            focusLine11.style("display", "none")
            tooltip1
                .style("opacity", 0)
        }


        // A function that set idleTimeOut to null
        var idleTimeout
        function idled() { idleTimeout = null; }

        // A function that update the chart for given boundaries
        function updateChart1() {
            console.log(index)
            // What are the selected boundaries?
            extent = d3.event.selection

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if (!extent) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                x11.domain([4, 8])
            } else {
                x11.domain([x11.invert(extent[0]), x11.invert(extent[1])])
                line.select(".brush").call(brush11.move, null) // This remove the grey brush area as soon as the selection has been done
            }

            // Update axis and line position
            xAxis11.transition().duration(1000).call(d3.axisBottom(x11))
            line
                .select('.line1')
                .datum(data[index].predict)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .x(function (d, i) { return x11(i) })
                    .y(function (d) { return y11(d) })
                )

            line
                .select('.line2')
                .datum(data[index].y)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .x(function (d, i) { return x11(i) })
                    .y(function (d) { return y11(d) })
                )
        }

        // If user double click, reinitialize the chart
        svg11.on("dblclick", function () {
            x11.domain(d3.extent([0, data[index].predict.length - 1]))
            xAxis11.transition().call(d3.axisBottom(x11))
            line
                .select('.line1')
                .datum(data[index].predict)
                .transition()
                .attr("d", d3.line()
                    .x(function (d, i) { return x11(i) })
                    .y(function (d) { return y11(d) })
                )

            line
                .select('.line2')
                .datum(data[index].y)
                .transition()
                .attr("d", d3.line()
                    .x(function (d, i) { return x11(i) })
                    .y(function (d) { return y11(d) })
                )
        });
        // Handmade legend
        svg11.append("circle").attr("cx", 940).attr("cy", 0).attr("r", 6).style("fill", "#FFB6C1")
        svg11.append("circle").attr("cx", 940).attr("cy", 20).attr("r", 6).style("fill", "#0000FF")
        svg11.append("text").attr("x", 960).attr("y", 0).text("predict").style("font-size", "15px").attr("alignment-baseline", "middle")
        svg11.append("text").attr("x", 960).attr("y", 20).text("y").style("font-size", "15px").attr("alignment-baseline", "middle")
    })
}


