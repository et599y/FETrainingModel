// tree list code here 
// set the dimensions and margins of the graph
var margin = { top: 10, right: 10, bottom: 30, left: 40 },
    width2 = 750,
    height2 = 350;

// append the svg object to the body of the page
var svg = d3.select("#stackedBar")
    .append("svg")
    .attr("viewBox", `0 0 ${width2 + margin.left + margin.right} ${height2 + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", `translate(${margin.left} ${margin.top})`);

// Parse the Data
var x = d3.scaleBand()
    .rangeRound([0, width2])
    .paddingInner(0.1)
    .align(0.1)
    .padding([0.6]); //間距

var y = d3.scaleLinear()
    .rangeRound([height2, 0]);

var z = d3.scaleOrdinal()
    .range(['#27408B', '#1874CD', '#4F94CD', '#A4D3EE', '#85C1E9', '#2980B9', '#BB8FCE']);

var xAxis = d3.axisBottom(x)

function update2(data) {
    // d3.json(siteData, (error, data) => {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log(data);
    //   }
    console.log(data)
    var keys = [];
    data.forEach(function (d) {
        d.total = 0;
        d.SiteData.forEach(function (e) {
            if (keys.indexOf(e.ClassName) == -1) {
                keys.push(e.ClassName);
            }
            d.total += e.Num;
        })
    });
    console.log(keys)
    newData = [];
    data.forEach(d => {
        var tempObj = {}
        tempObj['Site'] = d.Site;
        tempObj['total'] = d.total;
        d.SiteData.forEach(e => {
            tempObj[e.ClassName] = e.Num;
        })
        newData.push(tempObj);
    });
    console.log(newData)
    x.domain(data.map(function (d) { return d.Site; }));
    y.domain([0, d3.max(data, function (d) { return d.total; })]).nice();
    z.domain(keys);

    // ----------------
    // Create a tooltip
    // ----------------

    var tooltip = d3.select("#stackedBar")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        var Site = d.data.Site
        var subgroupName = d3.select(this.parentNode).datum().key;
        var subgroupValue = d.data[subgroupName];
        d3.selectAll(".bar").style("opacity", 0.2);
        // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
        d3.select(this).style("opacity", 1);
        tooltip
            .html("Tech: " + subgroupName + "<br>" + "Number: " + subgroupValue)
            .style("opacity", 1)
    }
    var mousemove = function (d) {
        tooltip
            .style("left", (d3.mouse(this)[0] + 90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (d3.mouse(this)[1]) + "px")
    }
    var mouseleave = function (d) {
        tooltip
            .style("opacity", 0)
        d3.selectAll("rect")
            .style("opacity", 0.8)
    }

    svg.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(newData))
        .enter().append("g")
        .classed("bar-group", true)
        .attr("fill", function (d) { return z(d.key); })
        .attr("class", function (d) { return "rect " + d.key }) //new Add a class to each subgroup: their name
        .selectAll("rect")
        .data(function (d) { return d; }, d => d.data.Site)
        .enter().append("rect")
        .classed("bar", true)
        .attr("x", function (d) { return x(d.data.Site); })
        .attr("y", function (d) { return y(d[1]); })
        .attr("height", function (d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth()) //x.bandwidth()
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    svg.append("g")
        .attr("class", "axis x")
        .attr("class", "line")
        //.attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        //.attr("transform", "translate(0," + height2 + ")")
        .attr("transform", `translate(0, ${height2})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis y")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Project");

    var legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "start")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width2 - 97)//width2 - 19
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width2 - 70)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        //.style("text-align","left")
        .text(function (d) { return d; });

}
