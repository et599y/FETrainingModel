// set the dimensions and margins of the graph

function scatter(file) {
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 50, bottom: 30, left: 50 },
        widthScatter = 850 - margin.left - margin.right,
        heightScatter = 400 - margin.top - margin.bottom;
    // append the svg object to the body of the page

    var svgScatter = d3.select("#scatterPlot")
        .append("svg")
        .attr("viewBox", `0 0 ${widthScatter + margin.left + margin.right} ${heightScatter + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left} ${margin.top})`);

    //Read the data
    d3.csv(file, function (data) {
        console.log(data)
        var columns = data.columns.slice(2)
        console.log(columns)
        // Add X axis
        var x2 = d3.scaleLinear()
            .domain([d3.min(data, function (d) { return +d[columns[0]]; }), d3.max(data, function (d) { return +d[columns[0]]; })])
            //.domain([0, 0])
            .range([0, widthScatter]);
        svgScatter.append("g")
            .attr("class", "myXaxis") // Note that here we give a class to the X axis, to be able to call it later and modify it
            .attr("transform", "translate(0," + heightScatter + ")")
            .call(d3.axisBottom(x2))
            .attr("opacity", "0.8")

        // Add Y axis
        var y2 = d3.scaleLinear()
            .domain([d3.min(data, function (d) { return +d[columns[0]]; }), d3.max(data, function (d) { return +d[columns[0]]; })])
            //.domain([0, 0]) //500000
            .range([heightScatter, 0]);
        svgScatter.append("g")
            .attr("class", "myYaxis") // Note that here we give a class to the X axis, to be able to call it later and modify it
            .attr("opacity", "0.8")
            .call(d3.axisLeft(y2));

        d3.select("#selectX")
            .selectAll('myOptions')
            .data(columns)
            .enter()
            .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d, i) { return i; }) // corresponding value returned by the button

        d3.select("#selectY")
            .selectAll('myOptions')
            .data(columns)
            .enter()
            .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d, i) { return i; }) // corresponding value returned by the button

        var selectX, selectY;
        d3.selectAll(".select").on("change", function (d) {
            selectX = d3.select("#selectX option:checked")
            selectY = d3.select("#selectY option:checked")
            updateSvg(selectX.text(), selectY.text());//selectCol.property("value")
        })

        // Add dots
        scatter = svgScatter.append('g')
        scatter.selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .style("pointer-events", "all")
            .attr("r", 2)
            .attr("cx", function (d) { return x2(d[columns[0]]); })
            .attr("cy", function (d) { return y2(d[columns[0]]); })
            .attr("fill", "rgb(" + (Math.round(Math.random() * 200)) + "," + (Math.round(Math.random() * 200)) + ", " +
                (Math.round(Math.random() * 200)) + ")")
            .attr("opacity", "0.7")
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseout', mouseout)

        function updateSvg(selectedX, selectedY) {

            // new X axis
            x2.domain([d3.min(data, function (d) { return +d[selectedX]; }) - 10, d3.max(data, function (d) { return +d[selectedX]; }) + 10])
            svgScatter.select(".myXaxis")
                .transition()
                .duration(1000)
                .attr("opacity", "1")
                .call(d3.axisBottom(x2));

            y2.domain([d3.min(data, function (d) { return +d[selectedY]; }), d3.max(data, function (d) { return +d[selectedY]; })])
            svgScatter.select(".myYaxis")
                .transition()
                .duration(1000)
                .attr("opacity", "1")
                .call(d3.axisLeft(y2));

            svgScatter.selectAll("circle")
                .style("pointer-events", "all")
                .transition()
                .delay(function (d, i) { return (i * 0.2) })
                .duration(1000)
                .attr("cx", function (d) { return x2(d[selectedX]); })
                .attr("cy", function (d) { return y2(d[selectedY]); })
                .attr("opacity", "1")
                .attr("fill", "rgb(" + (Math.round(Math.random() * 200)) + "," + (Math.round(Math.random() * 200)) + ", " +
                    (Math.round(Math.random() * 200)) + ")")
        }
        var tooltip = d3.select("#scatterPlot")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("pointer-events", "all")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")

        var mouseover = function (d) {
            tooltip
                .style("opacity", 1)
        }

        var mousemove = function (d) {
            tooltip
                .html("The exact value of<br>the Ground Living area is: " + d.GrLivArea)
                .style("left", (d3.mouse(this)[0] + 90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
                .style("top", (d3.mouse(this)[1]) + "px")
        }

        // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
        var mouseleave = function (d) {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
        }

    })
}

