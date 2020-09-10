// 定义svg的宽度和高度
var width2 = 1100,
    height2 = 500,
    margin = { left: 50, top: 30, right: 20, bottom: 20 },
    g_width2 = width2 - margin.left - margin.right,
    g_height2 = height2 - margin.top - margin.bottom;

//var file = "result1.json"
// svg
var svg2 = d3.select("#result2")
    .append("svg")
    // 添加宽度和高度属性 width,height
    .attr("width", width2) //attribute
    .attr("height", height2)


var g2 = svg2.append("g")
    // 设置x,y轴偏移量
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

//var data = [1,3,5,7,8,4,3,7]
function start2(file) {
    console.log(file)
    d3.json(file, function (error, data) {
        if (error) {
            console.log(error);
        } else {
            data = data;
            console.log(data)
            var y_test = data.y_test;
            var predict_test = data.predict_test;
        }

        // 设置缩放
        var scale_x = d3.scale.linear().domain([0, y_test.length - 1]).range([0, g_width2])
        var scale_y = d3.scale.linear().domain([d3.min(y_test), d3.max(y_test)]).range([g_height2, 0])
        var line_generator = d3.svg.line()  //svg.line()
            // d表示传进来的数据 i表示数据的下标
            .x(function (d, i) { return scale_x(i); }) // 0,1,2,3
            .y(function (d) { return scale_y(d); }) // 1,3,5
        // 去除线的棱角 使其顺滑
        //.interpolate("cardinal")

        var line_generator2 = d3.svg.line()  //.line()
            // d表示传进来的数据 i表示数据的下标
            .x(function (d, i) { return scale_x(i); }) // 0,1,2,3
            .y(function (d) { return scale_y(d); }) // 1,3,5
        // 去除线的棱角 使其顺滑
        //.interpolate("cardinal")

        g2.append("path")
            .style("stroke", "Gold")
            //.style("opacity", 0.8)
            // d 是 path data的缩写 将data数据传人
            .attr("d", line_generator(y_test)) // d = "M1,0L20,40L40,50L100,100L0,200"

        g2.append("path")
            .style("stroke", "Blue")
            .style("opacity", 0.8)
            // d 是 path data的缩写 将data数据传人
            .attr("d", line_generator2(predict_test)) // d = "M1,0L20,40L40,50L100,100L0,200"

        // 生成坐标轴
        var x_axis = d3.svg.axis().scale(scale_x),
            // y轴在左侧
            y_axis = d3.svg.axis().scale(scale_y).orient("left");

        g2.append("g")
            .call(x_axis)
            //.append("text")
            //.text("Count")
            //.attr("transform", "rotate(-90)")
            //.attr("text-anchor", "end")
            .attr("transform", "translate(0," + g_height2 + ")")

        g2.append("g")
            .call(y_axis)
            //添加坐标轴叙述
            .append("text")
            //.text("Price($)")
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "end")
            .attr("dy", "1em")

        // Handmade legend
        svg2.append("circle").attr("cx", 1000).attr("cy", 20).attr("r", 6).style("fill", "#FFD700")
        svg2.append("circle").attr("cx", 1000).attr("cy", 50).attr("r", 6).style("fill", "#0000FF")
        svg2.append("text").attr("x", 1020).attr("y", 20).text("y_test").style("font-size", "15px").attr("alignment-baseline", "middle")
        svg2.append("text").attr("x", 1020).attr("y", 50).text("pred_test").style("font-size", "15px").attr("alignment-baseline", "middle")

    });
};
