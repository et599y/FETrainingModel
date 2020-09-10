var data;
function buildTable(results) {
	var markup = "<table class='table'>";
    data = results.data;
	for(i=0;i<data.length;i++){
		markup+= "<tr>";
		var row = data[i];
		var cells = row.join(",").split(",");
		for(j=0;j<cells.length;j++){
			markup+= "<td>";
			console.log(cells[j]);
			markup+= cells[j];
			markup+= "</th>";
		}
		markup+= "</tr>";
	}
	markup+= "</table>";
	$("#app").html(markup);
	document.getElementById('connectnote').style.display = 'block';
}

function buildJsonTable(results) {
    var markup = "<table class='table'>";
    data = results.data;
    for (i = 0; i < data.length; i++) {
        markup += "<tr>";
        var row = data[i];
        var cells = row.join(",").split(",");
        for (j = 0; j < cells.length; j++) {
            markup += "<td>";
            console.log(cells[j]);
            markup += cells[j];
            markup += "</td>";
        }
        markup += "</tr>";
    }
    markup += "</table>";
    $("#app").html(markup);
    $('#connectnote').attr("style", "display: block");
    $('#ToCheckJsonType').attr("style", "display: block");
    $('#connectmap').attr("style", "display: block");
    $('#JsonType')[0].selectedIndex = 0;
    $("#propName").html('');
}

function SentToMap() {
    parent.SentToMap(data);
}
function SentToMap2() {
    parent.SentToMap2(data, $('#coorid').val());
}
function SentToMapCNT() {
    parent.SentToMapCNT(data);
}
function SentToMapCOA() {
    parent.SentToMapCOA(data);
}
function SentToMapB21() {
    parent.SentToMapB21(data);
}


$(document).ready(function(){
		$('#submit').on("click",function(e){
			e.preventDefault();
			if (!$('#files')[0].files.length){
				alert("未選擇任何檔案！");
            }
            var fname = '';
            fname = $('#files')[0].files["0"].name;
            if (fname.includes('.kml')) {
                $('#files').parse({
                    config: {
                        delimiter: "auto",
                        complete: SentToMap3
                    },
                    before: function (file, inputElem) {
                        //console.log("Parsing file...", file);
                    },
                    error: function (err, file) {
                        console.log("�o�Ϳ��~:", err, file);
                    },
                    complete: function () {
                        //console.log("Done with all files");
                    }
                });
            }
            else if (fname.includes('.json')) {
                $('#files').parse({
                    config: {
                        delimiter: "auto",
                        complete: buildJsonTable
                    },
                    before: function (file, inputElem) {
                        //console.log("Parsing file...", file);
                    },
                    error: function (err, file) {
                        console.log("�o�Ϳ��~:", err, file);
                    },
                    complete: function () {
                        //console.log("Done with all files");
                    }
                });
            }
            else {
                $('#files').parse({
                    config: {
                        delimiter: "auto",
                        complete: buildTable,
                    },
                    before: function (file, inputElem) {
                        //console.log("Parsing file...", file);
                    },
                    error: function (err, file) {
                        console.log("�o�Ϳ��~:", err, file);
                    },
                    complete: function () {
                        //console.log("Done with all files");
                    }
                });
            }
		});
});