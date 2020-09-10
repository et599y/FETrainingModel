//width = document.getElementById('my_dataviz').clientWidth;
//height = document.getElementById('my_dataviz').clientWidth;

// set the dimensions and margins of the graph
var margin = { top: 30, right: 100, bottom: 50, left: 60 },
    width33 = 1100 - margin.left - margin.right,
    height33 = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg33 = d3.select("#result3")
    .append("svg")
    .attr("viewBox", `0 0 ${width33 + margin.left + margin.right} ${height33 + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", `translate(${margin.left} ${margin.top})`);

function result_val(file) {
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
        d3.select("#selectButton3")
            .selectAll('myOptions')
            .data(columns)
            .enter()
            .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d, i) { return i; }) // corresponding value returned by the button

        var select;
        var index = 0;
        d3.select("#selectButton3").on("change", function (d) {
            select = d3.select("#selectButton3 option:checked")
            index = columns.indexOf(select.text())
            updateSvg3(select.text(), index);//
        })

        // Add X axis --> it is a date format
        var x33 = d3.scaleLinear()
            .domain(d3.extent([0, data[index].y_val.length - 1]))
            .range([0, width33]);
        xAxis33 = svg33.append("g")
            .attr("transform", "translate(0," + height33 + ")")
            .call(d3.axisBottom(x33));

        var valArray = data[index].y_val.concat(data[index].predict_val);
        // Add Y axis
        var y33 = d3.scaleLinear()
            .domain([d3.min(valArray), d3.max(valArray)])
            .range([height33, 0]);
        yAxis33 = svg33.append("g")
            .call(d3.axisLeft(y33));

        // Add a clipPath: everything out of this area won't be drawn.
        var clip33 = svg33.append("defs").append("svg:clipPath")
            .attr("id", "clip33")
            .append("svg:rect")
            .attr("width", width33)
            .attr("height", height33)
            .attr("x", 0)
            .attr("y", 0);

        // Add brushing
        var brush33 = d3.brushX()                   // Add the brush feature using the d3.brush function
            .extent([[0, 0], [width33, height33]])  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            .on("end", updateChart3)               // Each time the brush selection changes, trigger the 'updateChart' function

        // Create the line variable: where both the line and the brush take place
        var line = svg33.append('g')
            .attr("clip-path", "url(#clip33)")
            .on('mouseover', mouseover3)
            .on('mousemove', mousemove3)
            .on('mouseout', mouseout3);

        // Add the line
        line.append("path")
            .datum(data[index].y_val)//data
            .attr("class", "line1")  // I add the class line to be able to modify this line later on.
            .attr("fill", "none")
            .style("stroke", "#7EC0EE")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d, i) { return x33(i); })
                .y(function (d) { return y33(d) })
            )

        line.append("path")
            .datum(data[index].predict_val)
            .attr("class", "line2")  // I add the class line to be able to modify this line later on.
            .attr("fill", "none")
            .style("stroke", "#0033FF")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d, i) { return x33(i) })
                .y(function (d) { return y33(d) })
            )

        // Add the brushing
        line
            .append("g")
            .attr("class", "brush")
            .call(brush33)
            .style("fill", "none")
            .style("pointer-events", "all")

        // This allows to find the closest X index of the mouse:
        var bisect = d3.bisector(function (d, i) { return x(d) }).left;

        function updateSvg3(selectOption, index) {
            var valArray = data[index].y_val.concat(data[index].predict_val);
            y33.domain([d3.min(valArray), d3.max(valArray)])
            yAxis33.transition().duration(1000).call(d3.axisLeft(y33))

            line.select(".line1")
                .datum(data[index].y_val)//data
                .transition()
                .duration(1000)
                .attr("class", "line1")  // I add the class line to be able to modify this line later on.
                .attr("fill", "none")
                .style("stroke", "#7EC0EE")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d, i) { return x33(i); })
                    .y(function (d) { return y33(d) })
                )

            line.select(".line2")
                .datum(data[index].predict_val)
                .transition()
                .duration(1000)
                .attr("class", "line2")  // I add the class line to be able to modify this line later on.
                .attr("fill", "none")
                .style("stroke", "#0033FF")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d, i) { return x33(i) })
                    .y(function (d) { return y33(d) })
                )
        }

        // Create the circle that travels along the curve of chart
        var focus33 = svg33
            .append('g')
            .append('circle')
            .attr("z-index", 0)
            .style("fill", "none")
            .style("stroke", "#00B2EE")
            .attr('r', 8.5)
            .style("opacity", 0)

        var focus233 = svg33
            .append('g')
            .append('circle')
            .style("fill", "none")
            .style("stroke", "MidnightBlue")
            .attr('r', 8.5)
            .style("opacity", 0)

        var focusLine33 = svg33.append("g")
            .attr("class", "focusLine")
            .style("display", "none");

        focusLine33.append("line").attr("class", "lineHover") //draw line
            .style("stroke", "#B0C4DE")
            .attr("stroke-width", 1)
            .style("pointer-events", "none")
            .style("shape-rendering", "crispEdges")
            .style("opacity", 0.8)
            .attr("y1", -height33)
            .attr("y2", 0);

        var tooltip3 = d3.select("#result3")
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
        function mouseover3() {
            focus33.style("opacity", 1)
            focus233.style("opacity", 1)
            focusLine33.style("display", null)
            tooltip3
                .style("opacity", 1)
        }

        function mousemove3() {
            // recover coordinate we need
            var i = x33.invert(d3.mouse(this)[0]);
            var k = y33.invert(d3.mouse(this)[0]);
            //var i = bisect(y_train, x0, 1);//data  x0, 1

            //
            selectedData = data[index].y_val[Math.round(i)]
            selectedData2 = data[index].predict_val[Math.round(i)]
            focus33
                .attr("cx", x33(i))
                .attr("cy", y33(selectedData))
            focus233
                .attr("cx", x33(i))
                .attr("cy", y33(selectedData2))

            focusLine33.select(".lineHover")
                .attr("transform", "translate(" + x33(i) + "," + height33 + ")")
            tooltip3
                //.style("left", (d3.mouse(this)[0]) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
                //.style("top", (d3.mouse(this)[1]) + "px") //+document.getElementById("svg11").offsetLeft
                .style("left", (d3.event.pageX + 30) + "px")//window.pageXOffset
                .style("top", (d3.event.pageY - 30) + "px")
                .html("y_val: " + selectedData + "<br>" + "pred_val: " + selectedData2)
                .style("opacity", 1);
        }
        function mouseout3() {
            focus33.style("opacity", 0)
            focus233.style("opacity", 0)
            focusLine33.style("display", "none")
            tooltip3
                .style("opacity", 0)
        }


        // A function that set idleTimeOut to null
        var idleTimeout
        function idled() { idleTimeout = null; }

        // A function that update the chart for given boundaries
        function updateChart3() {
            // What are the selected boundaries?
            extent = d3.event.selection

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if (!extent) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                x33.domain([4, 8])
            } else {
                x33.domain([x33.invert(extent[0]), x33.invert(extent[1])])
                line.select(".brush").call(brush33.move, null) // This remove the grey brush area as soon as the selection has been done
            }

            // Update axis and line position
            xAxis33.transition().duration(1000).call(d3.axisBottom(x33))
            line
                .select('.line1')
                .datum(data[index].y_val)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .x(function (d, i) { return x33(i) })
                    .y(function (d) { return y33(d) })
                )

            line
                .select('.line2')
                .datum(data[index].predict_val)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .x(function (d, i) { return x33(i) })
                    .y(function (d) { return y33(d) })
                )
        }

        // If user double click, reinitialize the chart
        svg33.on("dblclick", function () {
            x33.domain(d3.extent([0, data[index].y_val.length - 1]))
            xAxis33.transition().call(d3.axisBottom(x33))
            line
                .select('.line1')
                .datum(data[index].y_val)
                .transition()
                .attr("d", d3.line()
                    .x(function (d, i) { return x33(i) })
                    .y(function (d) { return y33(d) })
                )

            line
                .select('.line2')
                .datum(data[index].predict_val)
                .transition()
                .attr("d", d3.line()
                    .x(function (d, i) { return x33(i) })
                    .y(function (d) { return y33(d) })
                )
        });
        // Handmade legend
        svg33.append("circle").attr("cx", 940).attr("cy", 0).attr("r", 6).style("fill", "#7EC0EE")
        svg33.append("circle").attr("cx", 940).attr("cy", 20).attr("r", 6).style("fill", "#0000FF")
        svg33.append("text").attr("x", 960).attr("y", 0).text("y_val").style("font-size", "15px").attr("alignment-baseline", "middle")
        svg33.append("text").attr("x", 960).attr("y", 20).text("pred_val").style("font-size", "15px").attr("alignment-baseline", "middle")
    })
}

