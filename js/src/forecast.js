var allHistoricalForecastArray = new Array();
var allHistoricalForecastObject = {};
// var currentForecast = new Array();
var currentForecast = {};
$(document).ready(function() {
    $("#forecast-layout").layout({
        resizeWhileDragging: true,
        initClosed: false,
        east__maxSize: .35,
        east__minSize: .2,
        useStateCookie:true, 
        onresize_end:function(){
            $(window).resize();
        }
    });

    initiateForecastPage();

    $("#forecast-select").change(function(){
		var ownerId = $("#forecast-select").val();
		generateForecastPage(ownerId);
	});

	$("#forecast-time-select").change(function(){
		currentForecast = getCurrentForecast(allHistoricalForecastArray);
		generateForecastPage($("#forecast-select").val());
	});
	
	$(window).resize(function() {
	    height = $("#forecast-graph").height();
	    width = $(".ui-layout-center").width();;
	    $("#forecast-graph").highcharts().setSize(width, height, doAnimation = true);
	});
});

function initiateForecastPage(){
	var end = moment().valueOf() + 12*3600*1000;
	var start = end - 400*24*3600*1000;
	var url = localDomain+"/stm/getForecastByTime?start=" + start + "&end=" + end;
    $.getJSON( url, {
    }).done(function(data) {
    	data.sort(sortByTime);
    	allHistoricalForecastArray = process(data);
        for(var i=0; i<allHistoricalForecastArray.length;i++){
        	var tmp =allHistoricalForecastArray[i];
        	if(!allHistoricalForecastObject.hasOwnProperty(tmp.ownerId)){
        		allHistoricalForecastObject[tmp.ownerId] = new Array();
        		allHistoricalForecastObject[tmp.ownerId].push(tmp);
        	} else {
        		allHistoricalForecastObject[tmp.ownerId].push(tmp);
        	}
        }
        currentForecast = getCurrentForecast(allHistoricalForecastArray);
        $("#forecast-select").html('<option value="0">Forecast for All</option>');
        $.each(allHistoricalForecastObject, function(k,v){
        	// currentForecast.k = 0;
        	if(k != 0){
        		$("#forecast-select").append('<option value="'+k+'">Forecast for '+usersObject[k].firstName + ' ' + usersObject[k].lastName+'</option>');
        	}
        });
        generateForecastPage(0);
    });
}

function process(data){
	var result = new Array();
	for(var i=0; i < data.length; i++){
		var tmp = data[i];
		tmp.month = moment.tz(tmp.time, "Asia/Singapore").format('MM-YYYY');

		result.push(tmp);
	}

	return result;
}

function generateForecastPage(ownerId){
	var thres = moment($("#forecast-time-select").val(), "MM-YYYY").valueOf();
	var historicalData = allHistoricalForecastObject[ownerId];
	var currentObj = currentForecast[ownerId];
	var name;
	if(ownerId==0){
		name = "All";
		$("#forecast-panel-title").html("Forecast for All - " + $("#forecast-time-select").val());
	} else {
		name = usersObject[ownerId].firstName + " " + usersObject[ownerId].lastName;
		$("#forecast-panel-title").html("Forecast for " + usersObject[ownerId].firstName + " - " + $("#forecast-time-select").val());
	}
	drawForecastHighGraph($("#forecast-graph"), historicalData, currentObj,name,thres);

	generateForecastTable(currentForecast);

}

function generateForecastTable(currentForecast){
	var data = new Array();
	var totalObj = currentForecast[0];
	$("#total-forecast").html('Total Forecast: <span contenteditable="true" value="'+totalObj.id+'" user="0" class="exe-forecast">'+totalObj.forecast+'</span>');
	$.each(currentForecast, function(k,v){
		var tmp = v;
		if(k==0){
			return;
		}
		if(k == 2){
			tmp.idealForecast = totalObj.forecast * 0.40;
		} else if (k == 3){
			tmp.idealForecast = totalObj.forecast * 0.29;
		} else if (k == 4){
			tmp.idealForecast = totalObj.forecast * 0.31;
		}
		//<h2 contenteditable="true" id="note-subject"></h2>
		var id = -1;
		if(tmp.hasOwnProperty("id")){
			id = tmp.id;
		}
		tmp.forecastDiv = '$<span contenteditable="true" value="'+id+'" user="'+k+'" class="exe-forecast">'+tmp.forecast+'</span>';
		tmp.idealForecast = "$" + parseInt(tmp.idealForecast);
		data.push(tmp);
	});

	console.log(data);

	var table = $('#exe-forecast-by-total-table').DataTable({
        "bDestroy": true,
        "aaData": data,
        "paging":   false,
        "info":     false,
        "searching": false,
        "order": [[ 1, "desc" ]],
        "aoColumns": [
            { "mDataProp": "name" },
            { "mDataProp": "idealForecast" },
            { "mDataProp": "forecastDiv" }
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });
}

$('#note-subject').blur(function() {
        if($(this).html()!=chosenNote.subject){
            $('.list-group-note[value="'+chosenNote.id+'"] .note-item').html($(this).html());
            chosenNote.subject = $(this).html();
            var url = localDomain+"/stm/updateNote";
            postRequest(url, chosenNote, function(e){
                if(e.result){
                    toastr["success"]("Save successfully");
                } else {
                    toastr["error"]("Error saving");
                }
            });
        }
    });

$(document).on("blur", ".exe-forecast", function() {
	// if($(this).html()!=chosenNote.subject){}
	console.log($(this).attr("value"));
	console.log($(this).attr("user"));
	var object = currentForecast[$(this).attr("user")];

	if($(this).html()!= object.forecast){
		var id = $(this).attr("value");
		object.forecast = $(this).html();
		var url;
		if(id == -1){
			url =localDomain+"/stm/insertForecast"; 
		} else {
			url =localDomain+"/stm/updateForecast";
		}

		postRequest(url, object, function(e){
            if(e.result){
            	toastr["success"]("Update forecast successfully");
            	initiateForecastPage();
            } else {
               	toastr["error"]("Can not delete lead");
            }
        });
	}
});

function getCurrentForecast(data){
	var thres = moment($("#forecast-time-select").val(), "MM-YYYY").valueOf();
	var result = {};
	for(var i=0; i < data.length; i++){
		var tmp = data[i];
		var exeId = tmp.ownerId;
		if(!result.hasOwnProperty(exeId)){
			var uOb = {};
			if(exeId==0){
				uOb.name = "All";
			} else {
				uOb.name = usersObject[exeId].firstName + ' ' + usersObject[exeId].lastName;
			}
			uOb.forecast = 0;
			result[exeId] = uOb;
		}
		if(tmp.time > thres){
			result[exeId].forecast = tmp.forecast;
			result[exeId].id = tmp.id;
		}
	}

	$.each(result, function(k,v){
		result[k].time = thres + 2*24*3600*1000;
	});

	return result;
}

function drawForecastHighGraph(div, historicalData, currentObj, name, thres){
	div.empty();
	var series_1=[];
	var series_2=[];
	var series_3=[];
	var last;
	historicalData.sort(sortByTime);
	var increment;
	if(name=="All"){
  		increment = 200000;
  	} else {
  		increment = 100000;
  	}
	for(var i=0; i < historicalData.length; i++){
		if(historicalData[i].time < thres){
			var element1 = [];
		    element1.push(parseFloat(historicalData[i]["time"]));
		    element1.push(parseFloat(historicalData[i]["forecast"]));
		    series_1.push(element1);

		    var element2 = [];
		    element2.push(parseFloat(historicalData[i]["time"]));
		    element2.push(parseFloat(historicalData[i]["revenue"]));
		    series_2.push(element2);
		    if(historicalData[i]["revenue"] == 0){
		    	last += increment;
		    } else {
		    	last = historicalData[i]["revenue"];
		    }
		    
		} 
	}

  	var current = [];
  
	current.push(parseFloat(currentObj["time"]));
	current.push(last+ increment);
	series_3.push(current);

	div.highcharts({
	    chart: {
	      	type: "",
	      	zoomType: 'x'
	    },
	    title: {
	      	text: "Forecast versus Actual Revenue ( for " + name + ")" 
	    },
	    global: {
			useUTC: false
		},
	    xAxis: {
	      	type: 'datetime'
	    },
	    yAxis: {
	      	title: {
	        	text: "value ($)"
	      	}
	    },
	    legend: {
	      	enabled: true
	    },
	    tooltip: {
	    	xDateFormat: '%m-%Y',
	      	pointFormat: '<b>${point.y}</b>'
	    },
	    series: [{
	      	name: 'forecast',
	      	data: series_1,
	      	color: 'pink',
	      	dataLabels: {
	        	enabled: false,
	      	}
	    },
	    {
	      	name: 'actual revenue',
	      	data: series_2,
	      	color: 'green',
	      	dataLabels: {
	        	enabled: false,
	      	}
	    },
	    {
	      	name: 'recommended forecast by historical data',
	      	data: series_3,
	      	color: 'red',
	      	dataLabels: {
	        	enabled: true,
	      	}
	    }]
	});


}