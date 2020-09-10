function donut(data) {
    //data
    const obj = JSON.parse(JSON.stringify(data));
    console.log(obj)
    am4core.ready(function () {

        // Themes begin
        //am4core.useTheme(am4themes_frozen);
        am4core.useTheme(am4themes_animated);
        // Themes end

        for (i = 1; i <= 7; i++) {
            var div_name = "chartdiv" + i;
            var chart = am4core.create(div_name, am4charts.PieChart);

            // Add label
            var label = chart.seriesContainer.createChild(am4core.Label);
            label.text = obj[i-1].Site;
            label.horizontalCenter = "middle";
            label.verticalCenter = "middle";
            label.fontSize = 18;

            // Add data
            chart.data = obj[i - 1].SiteData;
            chart.innerRadius = am4core.percent(50);
            chart.logo.height = -15000;

            // Add and configure Series
            var pieSeries = chart.series.push(new am4charts.PieSeries());
            pieSeries.dataFields.value = "Num";
            pieSeries.dataFields.category = "ClassName";
            pieSeries.slices.template.stroke = am4core.color("#fff");
            pieSeries.slices.template.strokeWidth = 2;
            pieSeries.slices.template.strokeOpacity = 1;
            pieSeries.labels.template.disabled = true;
            pieSeries.ticks.template.disabled = true;

            // This creates initial animation
            pieSeries.hiddenState.properties.opacity = 1;
            pieSeries.hiddenState.properties.endAngle = -90;
            pieSeries.hiddenState.properties.startAngle = -90;
        }

    }); // end am4core.ready()
}
