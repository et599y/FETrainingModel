    //width = document.getElementById('my_dataviz').clientWidth;
    //height = document.getElementById('my_dataviz').clientWidth;

    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 60, bottom: 50, left: 60 },
        width9 = 1100 - margin.left - margin.right,
        height9 = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg99 = d3.select("#result4")
        .append("svg")
        .attr("viewBox", `0 0 ${width9 + margin.left + margin.right} ${height9 + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left} ${margin.top})`);
function dataError(file) {
    d3.json(file, function (error, data) {
        if (error) {
            console.log(error);
        } else {
            data = data;
        }

        var columns = [];
        var errorList = ["train_error", "test_error", "val_error"]

        data.forEach(function (d) {
            columns.push(d.Column);
        });

        d3.select("#selectCol")
            .selectAll('myOptions')
            .data(columns)
            .enter()
            .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d, i) { return i; }) // corresponding value returned by the button

        d3.select("#selectError")
            .selectAll('myOptions')
            .data(errorList)
            .enter()
            .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d, i) { return i; }) // corresponding value returned by the button

        var selectCol;
        var index = 0;
        var selectError;
        var error = "train_error";
        d3.selectAll(".select").on("change", function (d) {
            selectCol = d3.select("#selectCol option:checked")
            selectError = d3.select("#selectError option:checked")
            index = columns.indexOf(selectCol.text())
            error = selectError.text()
            updateSvg(selectCol.text(), index, error);//selectCol.property("value")
        })

        // Add X axis --> it is a date format
        var x9 = d3.scaleLinear()
            .domain(d3.extent([0, data[index][error].length - 1]))
            .range([0, width33]);
        xAxis9 = svg99.append("g")
            .attr("transform", "translate(0," + height9 + ")")
            .call(d3.axisBottom(x9));

        // Add Y axis
        var y9 = d3.scaleLinear()
            .domain([d3.min(data[index][error]), d3.max(data[index][error])])
            .range([height9, 0]);
        yAxis9 = svg99.append("g")
            .call(d3.axisLeft(y9));

        // Add a clipPath: everything out of this area won't be drawn.
        var clip9 = svg99.append("defs").append("svg99:clipPath")
            .attr("id", "clip9")
            .append("svg:rect")
            .attr("width", width9)
            .attr("height", height9)
            .attr("x", 0)
            .attr("y", 0);

        // Add brushing
        var brush9 = d3.brushX()                   // Add the brush feature using the d3.brush function
            .extent([[0, 0], [width9, height9]])  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            .on("end", updateChart9)               // Each time the brush selection changes, trigger the 'updateChart' function

        // Create the line variable: where both the line and the brush take place
        var line = svg99.append('g')
            .attr("clip-path", "url(#clip9)")
            .on('mouseover', mouseover9)
            .on('mousemove', mousemove9)
            .on('mouseout', mouseout9);

        // Add the line
        line.append("path")
            .datum(data[index].train_error)//data
            .attr("class", "line1")  // I add the class line to be able to modify this line later on.
            .attr("fill", "none")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d, i) { return x9(i); })
                .y(function (d) { return y9(d) })
            )
            .attr("stroke", "rgb(" + (Math.round(Math.random() * 200)) + "," + (Math.round(Math.random() * 200)) + ", " + (Math.round(Math.random() * 200)) + ")")

        // Add the brushing
        line
            .append("g")
            .attr("class", "brush")
            .call(brush9)
            .style("fill", "none")
            .style("pointer-events", "all")

        // This allows to find the closest X index of the mouse:
        var bisect = d3.bisector(function (d, i) { return x(d) }).left;

        function updateSvg(selectOption, index, error) {
            y9.domain([d3.min(data[index][error]), d3.max(data[index][error])])
            x9.domain(d3.extent([0, data[index][error].length - 1]))
            yAxis9.transition().duration(1000).call(d3.axisLeft(y9))
            xAxis9.transition().duration(1000).call(d3.axisBottom(x9))

            line
                .select('.line1')
                .datum(data[index][error])
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .x(function (d, i) { return x9((i)) })
                    .y(function (d) { return y9(d) })
                )
                .attr("stroke", "rgb(" + (Math.round(Math.random() * 200)) + "," + (Math.round(Math.random() * 200)) + ", " + (Math.round(Math.random() * 200)) + ")")
        }

        // Create the circle that travels along the curve of chart
        var focus9 = svg99
            .append('g')
            .append('circle')
            .attr("z-index", 0)
            .style("fill", "none")
            .style("stroke", "#1E90FF")
            .attr('r', 8.5)
            .style("opacity", 0)

        var tooltip9 = d3.select("#result4")
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
        function mouseover9() {
            focus9.style("opacity", 1)
            tooltip9
                .style("opacity", 1)
        }

        function mousemove9() {
            // recover coordinate we need
            var i = x9.invert(d3.mouse(this)[0]);            //
            selectedData = data[index][error][Math.round(i)]
            focus9
                .attr("cx", x9(i))
                .attr("cy", y9(selectedData))
            tooltip9
                .style("left", (d3.event.pageX + 30) + "px")//window.pageXOffset
                .style("top", (d3.event.pageY - 30) + "px")
                .html("Error: " + selectedData)
                .style("opacity", 1);
        }
        function mouseout9() {
            focus9.style("opacity", 0)
            tooltip9
                .style("opacity", 0)
        }


        // A function that set idleTimeOut to null
        var idleTimeout
        function idled() { idleTimeout = null; }

        // A function that update the chart for given boundaries
        function updateChart9() {

            // What are the selected boundaries?
            extent = d3.event.selection

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if (!extent) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                x9.domain([4, 8])
            } else {
                x9.domain([x9.invert(extent[0]), x9.invert(extent[1])])
                line.select(".brush").call(brush9.move, null) // This remove the grey brush area as soon as the selection has been done
            }

            // Update axis and line position
            xAxis9.transition().duration(1000).call(d3.axisBottom(x9))
            line
                .select('.line1')
                .datum(data[index][error])
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    // .x(function (d) { return x(d.date) })
                    // .y(function (d) { return y(d.value) })
                    .x(function (d, i) { return x9(i) })
                    .y(function (d) { return y9(d) })
                )
        }

        // If user double click, reinitialize the chart
        svg99.on("dblclick", function () {
            x9.domain(d3.extent([0, data[index][error].length - 1]))
            xAxis9.transition().call(d3.axisBottom(x9))
            line
                .select('.line1')
                .datum(data[index][error])
                .transition()
                .attr("d", d3.line()
                    .x(function (d, i) { return x9(i) })
                    .y(function (d) { return y9(d) })
                )
        });
    })
}
    
