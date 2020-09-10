//width = document.getElementById('my_dataviz').clientWidth;
//height = document.getElementById('my_dataviz').clientWidth;

// set the dimensions and margins of the graph
var margin = { top: 30, right: 100, bottom: 50, left: 60 },
    width22 = 1100 - margin.left - margin.right,
    height22 = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg22 = d3.select("#result2")
    .append("svg")
    .attr("viewBox", `0 0 ${width22 + margin.left + margin.right} ${height22 + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", `translate(${margin.left} ${margin.top})`);

function result_test(file) {
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
        d3.select("#selectButton2")
            .selectAll('myOptions')
            .data(columns)
            .enter()
            .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d, i) { return i; }) // corresponding value returned by the button

        var select;
        var index = 0;
        d3.select("#selectButton2").on("change", function (d) {
            select = d3.select("#selectButton2 option:checked")
            index = columns.indexOf(select.text())
            updateSvg2(select.text(), index);//
        })

        // Add X axis --> it is a date format
        var x22 = d3.scaleLinear()
            .domain(d3.extent([0, data[index].y_test.length - 1]))
            .range([0, width22]);
        xAxis22 = svg22.append("g")
            .attr("transform", "translate(0," + height22 + ")")
            .call(d3.axisBottom(x22));

        var valArray = data[index].y_test.concat(data[index].predict_test);
        // Add Y axis
        var y22 = d3.scaleLinear()
            .domain([d3.min(valArray), d3.max(valArray)])
            .range([height22, 0]);
        yAxis22 = svg22.append("g")
            .call(d3.axisLeft(y22));

        // Add a clipPath: everything out of this area won't be drawn.
        var clip22 = svg22.append("defs").append("svg:clipPath")
            .attr("id", "clip22")
            .append("svg:rect")
            .attr("width", width22)
            .attr("height", height22)
            .attr("x", 0)
            .attr("y", 0);

        // Add brushing
        var brush22 = d3.brushX()                   // Add the brush feature using the d3.brush function
            .extent([[0, 0], [width22, height22]])  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            .on("end", updateChart2)               // Each time the brush selection changes, trigger the 'updateChart' function

        // Create the line variable: where both the line and the brush take place
        var line = svg22.append('g')
            .attr("clip-path", "url(#clip22)")
            .on('mouseover', mouseover2)
            .on('mousemove', mousemove2)
            .on('mouseout', mouseout2);

        // Add the line
        line.append("path")
            .datum(data[index].y_test)//data
            .attr("class", "line1")  // I add the class line to be able to modify this line later on.
            .attr("fill", "none")
            .style("stroke", "#CA8EFF")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d, i) { return x22(i); })
                .y(function (d) { return y22(d) })
            )

        line.append("path")
            .datum(data[index].predict_test)
            .attr("class", "line2")  // I add the class line to be able to modify this line later on.
            .attr("fill", "none")
            .style("stroke", "#0033FF")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d, i) { return x22(i) })
                .y(function (d) { return y22(d) })
            )

        // Add the brushing
        line
            .append("g")
            .attr("class", "brush")
            .call(brush22)
            .style("fill", "none")
            .style("pointer-events", "all")

        // This allows to find the closest X index of the mouse:
        var bisect = d3.bisector(function (d, i) { return x(d) }).left;

        function updateSvg2(selectOption, index) {
            console.log(index)
            var valArray = data[index].y_test.concat(data[index].predict_test);
            y22.domain([d3.min(valArray), d3.max(valArray)])
            yAxis22.transition().duration(1000).call(d3.axisLeft(y22))

            line.select(".line1")
                .datum(data[index].y_test)//data
                .transition()
                .duration(1000)
                .attr("class", "line1")  // I add the class line to be able to modify this line later on.
                .attr("fill", "none")
                .style("stroke", "#CA8EFF")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d, i) { return x22(i); })
                    .y(function (d) { return y22(d) })
                )

            line.select(".line2")
                .datum(data[index].predict_test)
                .transition()
                .duration(1000)
                .attr("class", "line2")  // I add the class line to be able to modify this line later on.
                .attr("fill", "none")
                .style("stroke", "#0033FF")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d, i) { return x22(i) })
                    .y(function (d) { return y22(d) })
                )
        }

        // Create the circle that travels along the curve of chart
        var focus22 = svg22
            .append('g')
            .append('circle')
            .attr("z-index", 0)
            .style("fill", "none")
            .style("stroke", "#7D26CD")
            .attr('r', 8.5)
            .style("opacity", 0)

        var focus222 = svg22
            .append('g')
            .append('circle')
            .style("fill", "none")
            .style("stroke", "MidnightBlue")
            .attr('r', 8.5)
            .style("opacity", 0)

        var focusLine22 = svg22.append("g")
            .attr("class", "focusLine")
            .style("display", "none");

        focusLine22.append("line").attr("class", "lineHover") //draw line
            .style("stroke", "#B0C4DE")
            .attr("stroke-width", 1)
            .style("pointer-events", "none")
            .style("shape-rendering", "crispEdges")
            .style("opacity", 0.8)
            .attr("y1", -height22)
            .attr("y2", 0);

        var tooltip2 = d3.select("#result2")
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
        function mouseover2() {
            focus22.style("opacity", 1)
            focus222.style("opacity", 1)
            focusLine22.style("display", null)
            tooltip2
                .style("opacity", 1)
        }

        function mousemove2() {
            // recover coordinate we need
            var i = x22.invert(d3.mouse(this)[0]);
            var k = y22.invert(d3.mouse(this)[0]);
            //var i = bisect(y_train, x0, 1);//data  x0, 1

            //
            selectedData = data[index].y_test[Math.round(i)]
            selectedData2 = data[index].predict_test[Math.round(i)]
            focus22
                .attr("cx", x22(i))
                .attr("cy", y22(selectedData))
            focus222
                .attr("cx", x22(i))
                .attr("cy", y22(selectedData2))

            focusLine22.select(".lineHover")
                .attr("transform", "translate(" + x22(i) + "," + height22 + ")")
            tooltip2
                //.style("left", (d3.mouse(this)[0]) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
                //.style("top", (d3.mouse(this)[1]) + "px") //+document.getElementById("svg11").offsetLeft
                .style("left", (d3.event.pageX + 30) + "px")//window.pageXOffset
                .style("top", (d3.event.pageY - 30) + "px")
                .html("y_test: " + selectedData + "<br>" + "pred_test: " + selectedData2)
                .style("opacity", 1);
        }
        function mouseout2() {
            focus22.style("opacity", 0)
            focus222.style("opacity", 0)
            focusLine22.style("display", "none")
            tooltip2
                .style("opacity", 0)
        }


        // A function that set idleTimeOut to null
        var idleTimeout
        function idled() { idleTimeout = null; }

        // A function that update the chart for given boundaries
        function updateChart2() {
            // What are the selected boundaries?
            extent = d3.event.selection

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if (!extent) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                x22.domain([4, 8])
            } else {
                x22.domain([x22.invert(extent[0]), x22.invert(extent[1])])
                line.select(".brush").call(brush22.move, null) // This remove the grey brush area as soon as the selection has been done
            }

            // Update axis and line position
            xAxis22.transition().duration(1000).call(d3.axisBottom(x22))
            line
                .select('.line1')
                .datum(data[index].y_test)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .x(function (d, i) { return x22(i) })
                    .y(function (d) { return y22(d) })
                )

            line
                .select('.line2')
                .datum(data[index].predict_test)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .x(function (d, i) { return x22(i) })
                    .y(function (d) { return y22(d) })
                )
        }

        // If user double click, reinitialize the chart
        svg22.on("dblclick", function () {
            x22.domain(d3.extent([0, data[index].y_test.length - 1]))
            xAxis22.transition().call(d3.axisBottom(x22))
            line
                .select('.line1')
                .datum(data[index].y_test)
                .transition()
                .attr("d", d3.line()
                    .x(function (d, i) { return x22(i) })
                    .y(function (d) { return y22(d) })
                )

            line
                .select('.line2')
                .datum(data[index].predict_test)
                .transition()
                .attr("d", d3.line()
                    .x(function (d, i) { return x22(i) })
                    .y(function (d) { return y22(d) })
                )
        });
        // Handmade legend
        svg22.append("circle").attr("cx", 940).attr("cy", 0).attr("r", 6).style("fill", "#CA8EFF")
        svg22.append("circle").attr("cx", 940).attr("cy", 20).attr("r", 6).style("fill", "#0000FF")
        svg22.append("text").attr("x", 960).attr("y", 0).text("y_test").style("font-size", "15px").attr("alignment-baseline", "middle")
        svg22.append("text").attr("x", 960).attr("y", 20).text("pred_test").style("font-size", "15px").attr("alignment-baseline", "middle")
    })
}

