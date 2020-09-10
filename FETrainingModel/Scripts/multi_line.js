
// set the dimensions and margins of the graph
var marginMline = { top: 20, right: 30, bottom: 50, left: 60 },
    width_Mline = 1100 - marginMline.left - marginMline.right,
    height_Mline = 500 - marginMline.top - marginMline.bottom;

function multi(file) {
    d3.csv(file,
        function (data) {
            console.log(data)

            var columns = data.columns.slice(2);
            d3.select("#selectButton")
                .selectAll('myOptions')
                .data(columns)
                .enter()
                .append('option')
                .text(function (d) { return d; }) // text showed in the menu
                .attr("value", function (d, i) { return i; }) // corresponding value returned by the button

            var select;
            var colName = columns[0];
            console.log(colName)
            d3.select("#selectButton").on("change", function (d) {
                select = d3.select("#selectButton option:checked")
                colName = select.text()
                updateSvg(colName, select.property("value"));//
                console.log(colName)
            })

            var myColor = d3.scaleOrdinal()
                .domain(columns)
                .range(d3.schemeSet2);

            var svgMline = d3.select("#my_dataviz")
                .append("svg")
                .attr("viewBox", `0 0 ${width_Mline + marginMline.left + marginMline.right} ${height_Mline + marginMline.top + marginMline.bottom}`)
                .append("g")
                .attr("transform", `translate(${marginMline.left} ${marginMline.top})`);

            var x = d3.scaleLinear()
                .domain(d3.extent([0, data.length - 1]))//"2019/12/3 00:30"
                .range([0, width_Mline]);
            xAxis = svgMline.append("g")
                .attr("transform", "translate(0," + height_Mline + ")")
                .call(d3.axisBottom(x));

            var y = d3.scaleLinear()
                .domain([d3.min(data, function (d) { return +d[columns[0]]; }), d3.max(data, function (d) { return +d[columns[0]]; })])
                .range([height_Mline, 0]);
            yAxis = svgMline.append("g")
                .call(d3.axisLeft(y));

            // Add a clipPath: everything out of this area won't be drawn.
            var clip = svgMline.append("defs").append("svg:clipPath")
                .attr("id", "clip")
                .append("svg:rect")
                .attr("width", width_Mline)
                .attr("height", height_Mline)
                .attr("x", 0)
                .attr("y", 0);

            // Add brushing
            var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
                .extent([[0, 0], [width_Mline, height_Mline]])  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
                .on("end", updateChart)               // Each time the brush selection changes, trigger the 'updateChart' function

            var line = svgMline.append('g')
                .attr("clip-path", "url(#clip)")
                .attr('height', height_Mline)
                .on('mouseover', mouseover)
                .on('mousemove', mousemove)
                .on('mouseout', mouseout)

            line
                .append("path")
                .datum(data)//data
                .attr("class", "line")
                .attr("stroke-width", 1.5)
                .attr("fill", "none")
                .attr("d", d3.line()
                    .x(function (d, i) { return x(i) })
                    .y(function (d) { return y(+d[columns[0]]) })
                )
                .attr("stroke", "rgb(" + (Math.round(Math.random() * 200)) + "," + (Math.round(Math.random() * 200)) + ", " + (Math.round(Math.random() * 200)) + ")")


            line
                .append("g")
                .attr("class", "brush")
                .call(brush);

            function updateSvg(selectOption, optionValue) {
                y.domain([d3.min(data, function (d) { return +d[selectOption]; }), d3.max(data, function (d) { return +d[selectOption]; })])
                yAxis.transition().duration(1000).call(d3.axisLeft(y))

                line
                    .select('.line')
                    .datum(data)
                    .transition()
                    .duration(1000)
                    .attr("d", d3.line()
                        .x(function (d, i) { return x(i) })
                        .y(function (d) { return y(+d[selectOption]) })
                    )
                    .attr("stroke", "rgb(" + (Math.round(Math.random() * 200)) + "," + (Math.round(Math.random() * 200)) + ", " + (Math.round(Math.random() * 200)) + ")")
            }

            var tooltip = d3.select("#my_dataviz")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("pointer-events", "none")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "5px")
                .style("padding", "10px")

            // Create the circle that travels along the curve of chart
            var focus = svgMline
                .append('g')
                .append('circle')
                .style("fill", "none")
                .attr("stroke", "black")
                .attr('r', 8.5)
                .style("opacity", 0)
            // What happens when the mouse move -> show the annotations at the right positions.
            function mouseover() {
                focus.style("opacity", 1)
                tooltip
                    .style("opacity", 1)
            }

            function mousemove() {
                // recover coordinate we need
                var x0 = x.invert(d3.mouse(this)[0]);
                selectedData = data[Math.round(x0)]
                focus
                    .attr("cx", x(x0))
                    .attr("cy", y(selectedData[colName]))
                tooltip
                    .style("left", (d3.mouse(this)[0] - window.pageXOffset) + "px")
                    .style("top", (d3.mouse(this)[1]) + "px")
                    // .style("left", (d3.event.pageX + window.pageXOffset) + "px")
                    // .style("top", (d3.event.pageY - window.pageYOffset) + "px")
                    .html("Value: " + selectedData[colName])
                    .style("opacity", 1)
            }

            function mouseout() {
                focus.style("opacity", 0)
                //focusText.style("opacity", 0)
                tooltip
                    .style("opacity", 0)
            }


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
                        .x(function (d, i) { return x(i) })
                        .y(function (d) { return y(+d[colName]) })
                    )
            }

            // If user double click, reinitialize the chart
            svgMline.on("dblclick", function () {
                x.domain(d3.extent([0, data.length - 1]))
                xAxis.transition().call(d3.axisBottom(x))
                line
                    .select('.line')
                    .transition()
                    .attr("d", d3.line()
                        .x(function (d, i) { return x(i) })
                        .y(function (d) { return y(+d[colName]) })
                    )
            });

        })
}
