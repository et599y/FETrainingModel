function bubble(file) {
    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_myTheme);
        // am4core.useTheme(am4themes_dataviz);
        // am4core.useTheme(am4themes_animated);
        // Themes end
        function am4themes_myTheme(target) {
            if (target instanceof am4core.ColorSet) {
                target.list = [
                    am4core.color("#003060"), am4core.color("#003D79"), am4core.color("#004B97"), am4core.color("#004B97"),
                    am4core.color("#0000C6"), am4core.color("#005AB5"), am4core.color("#0000E3"), am4core.color("#0072E3"),
                    am4core.color("#2894FF"), am4core.color("#46A3FF"), am4core.color("#66B3FF"), am4core.color("#000080"), am4core.color("#4169E1"),
                    am4core.color("#1E90FF"), am4core.color("#00BFFF"), am4core.color("#87CEEB"), am4core.color("#87CEFA"),
                    am4core.color("#4682B4"), am4core.color("#00CED1"), am4core.color("#48D1CC"), am4core.color("#00FFFF"),
                    am4core.color("#1E90FF"), am4core.color("#00BFFF"), am4core.color("#B0E2FF")
                ];
            }
        }
        // var chart = am4core.create("chartdiv", am4plugins_forceDirected.ForceDirectedTree);

        // load the amCharts chart's config from a JSON file
        var amChartsConfig = new am4core.DataSource();
        amChartsConfig.url = file;
        amChartsConfig.load();

        // create the amChart chart using the JSON config
        amChartsConfig.events.on("done", function (ev) {
            chart = am4core.createFromConfig(
                data = amChartsConfig.data,
                container = "chartdiv",
                //chart_type_class = "PieChart",
                am4plugins_forceDirected.ForceDirectedTree
            );
            var networkSeries = chart.series.push(new am4plugins_forceDirected.ForceDirectedSeries())

            chart.data = data;
            chart.logo.height = -150000;
            console.log(data)
            networkSeries.dataFields.value = "result";
            networkSeries.dataFields.name = "keys";
            networkSeries.dataFields.children = "children";
            networkSeries.nodes.template.tooltipText = "{keys}:{result}";
            networkSeries.tooltip.autoTextColor = false;
            networkSeries.tooltip.label.fill = am4core.color("#191970");
            networkSeries.nodes.template.fillOpacity = 1;
            networkSeries.dataFields.id = "keys";
            networkSeries.dataFields.linkWith = "linkWith";

            networkSeries.nodes.template.label.text = "{keys}"
            networkSeries.fontSize = 14;
            networkSeries.minRadius = am4core.percent(4)
            networkSeries.maxRadius = am4core.percent(16)

            var selectedNode;

            networkSeries.nodes.template.events.on("up", function (event) {
                var node = event.target;
                if (!selectedNode) {
                    node.outerCircle.disabled = false;
                    node.outerCircle.strokeDasharray = "3,3";
                    selectedNode = node;
                }
                else if (selectedNode == node) {
                    node.outerCircle.disabled = true;
                    node.outerCircle.strokeDasharray = "";
                    selectedNode = undefined;
                }
                else {
                    var node = event.target;

                    var link = node.linksWith.getKey(selectedNode.uid);

                    if (link) {
                        node.unlinkWith(selectedNode);
                    }
                    else {
                        node.linkWith(selectedNode, 0.2);
                    }
                }
            })
        });
    }); // end am4core.ready()
}
