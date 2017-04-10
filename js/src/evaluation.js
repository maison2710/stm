$(document).ready(function() {
    $("#evaluation-layout").layout({
        resizeWhileDragging: true,
        initClosed: false,
        east__maxSize: .35,
        east__minSize: .2,
        useStateCookie:false, 
        onresize_end:function(){
            $(window).resize();
        }
    });

    generateConversionTable();
    generateRateGraph();
    generateActiveContact();
    generateTopMemberTable();

    $(window).resize(function() {
        $("#rate-graph").highcharts().setSize($("#rate-graph").width(), $("#rate-graph").height(), doAnimation = true);
        $("#contact-graph").highcharts().setSize($("#contact-graph").width(), $("#contact-graph").height(), doAnimation = true);
    });
});

function generateTopMemberTable( ){
	var data = new Array();

	for(var i=2;i<=5;i++){
		var obj = {};
		obj.name = usersObject[i].firstName;
		obj.rank = i-1;

		data.push(obj);
	}

    var table = $('#top-member').dataTable({
        "bDestroy": true,
        "aaData": data,
        "paging":   false,
        "info":     false,
        "searching": false,
        "order": [[ 1, "asc" ]],
        "aoColumns": [
            { "mDataProp": "name" },
            { "mDataProp": "rank" }
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });
}

function generateActiveContact(div){
    var categories = [1427860800000,1430452800000,1433131200000,1435723200000,1438401600000,1441080000000,1443672000000,1446350400000,1448942400000,1451620800000,1454299200000,1456848000000];
    var value_1 = [8,10,12,10,12,12,12,11,13,15,12,17];
    var value_2 = [6,7,7,9,9,10,12,9,9,12,10,12];
    var value_3 = [6,6,7,7,8,7,9,9,9,10,9,11];
    var value_4 = [5,5,6,8,8,7,8,9,9,10,11,13];
    var series_1=[];
    var series_2=[];
    var series_3=[];
    var series_4=[];

    for(var i=0; i < categories.length; i++){
        var element_1 = [];
        element_1.push(categories[i]);
        element_1.push(value_1[i]);
        series_1.push(element_1);

        var element_2 = [];
        element_2.push(categories[i]);
        element_2.push(value_2[i]);
        series_2.push(element_2);

        var element_3 = [];
        element_3.push(categories[i]);
        element_3.push(value_3[i]);
        series_3.push(element_3);

        var element_4 = [];
        element_4.push(categories[i]);
        element_4.push(value_4[i]);
        series_4.push(element_4);
    }

    $("#contact-graph").highcharts({
        chart: {
            zoomType: 'x'
        },
        title: {
            text: "Average Active Contact By Team Member"
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: "Number"
            }
        },
        legend: {
            enabled: true
        },
        tooltip: {
            xDateFormat: '%m-%Y',
            pointFormat: '<b>{point.y}</b>'
        },
        series: [{
            name: usersObject[2].firstName,
            data: series_1,
            dataLabels: {
                enabled: false,
            }
        },
        {
            name: usersObject[3].firstName,
            data: series_2,
            dataLabels: {
                enabled: true,
            }
        },
        {
            name: usersObject[4].firstName,
            data: series_3,
            dataLabels: {
                enabled: true,
            }
        },
        {
            name: usersObject[5].firstName,
            data: series_4,
            dataLabels: {
                enabled: true,
            }
        }]
    });
}

function generateRateGraph(){
	var series_1=[];
	var series_2=[];
	var series_3=[];
	var series_4=[];

	var categories = [1427860800000,1430452800000,1433131200000,1435723200000,1438401600000,1441080000000,1443672000000,1446350400000,1448942400000,1451620800000,1454299200000,1456848000000];
	var revenue_1 = [2.2,2.3,2.4,2.3,2.6,2.8,2.7,2.7,3.0,3.2,3.1,3.4];
	var revenue_2 = [1.8,1.9,1.8,2.0,2.0,2.1,2.0,2.2,2.4,2.3,2.5,2.7];
	var revenue_3 = [1.7,1.9,2.1,2.3,2.4,2.2,2.3,2.3,2.4,2.2,2.4,2.5];
	var revenue_4 = [1.5,1.6,1.6,1.8,1.8,2.0,2.0,2.1,2.3,2.3,2.2,2.4];

	console.log(categories.length);
	console.log(revenue_1.length);

	categories = categories.sort();
	for(var i=0; i < 12; i++){
		
		var element_1 = [];
	    element_1.push(parseFloat(categories[i]));
	    element_1.push(parseFloat(revenue_1[i]));
	    series_1.push(element_1);

	    var element_2 = [];
	    element_2.push(parseFloat(categories[i]));
	    element_2.push(parseFloat(revenue_2[i]));
	    series_2.push(element_2);

	    var element_3 = [];
	    element_3.push(parseFloat(categories[i]));
	    element_3.push(parseFloat(revenue_3[i]));
	    series_3.push(element_3);

	    var element_4 = [];
	    element_4.push(parseFloat(categories[i]));
	    element_4.push(parseFloat(revenue_4[i]));
	    series_4.push(element_4);
	}

	$("#rate-graph").highcharts({
	    chart: {
	      	type: "line",
	      	zoomType: 'x'
	    },
	    title: {
	      	text: "Revenue By Sale Member" 
	    },
	    global: {
			useUTC: false
		},
	    xAxis: {
	      	type: 'datetime'
	    },
	    yAxis: {
	      	title: {
	        	text: "value (M$)"
	      	}
	    },
	    legend: {
	      	enabled: true
	    },
	    tooltip: {
	    	xDateFormat: '%m-%Y',
	      	pointFormat: '<b>${point.y}M</b>'
	    },
	    series: [{
	      	name: usersObject[2].firstName,
	      	data: series_1,
	      	// color: 'pink',
	      	dataLabels: {
	        	enabled: false,
	      	}
	    },
	    {
	      	name: usersObject[3].firstName,
	      	data: series_2,
	      	// color: 'green',
	      	dataLabels: {
	        	enabled: false,
	      	}
	    },
	    {
	      	name: usersObject[4].firstName,
	      	data: series_3,
	      	// color: 'red',
	      	dataLabels: {
	        	enabled: true,
	      	}
	    }, {
	      	name: usersObject[5].firstName,
	      	data: series_4,
	      	// color: 'brown',
	      	dataLabels: {
	        	enabled: true,
	      	}
	    }]
	});
}

function generateConversionTable(){
	var data = new Array();
	var qualification = [0,0,10,8, 9, 6];
	var analysis = [0,0,90,85, 90, 80];
	var proposal = [0,0,85,75, 80, 70];
	var negotiation = [0,0,75,68, 65, 60];

	for(var i=2;i<=5;i++){
		var obj ={};
		obj.name = usersObject[i].firstName + " " + usersObject[i].lastName;
		obj.qualification = qualification[i];
		obj.analysis = analysis[i]+"%";
		obj.proposal = proposal[i]+"%";
		obj.negotiation = negotiation[i]+"%";

		data.push(obj);
	}

	table = $('#evaluation-table').DataTable({
        "bDestroy": true,
        "aaData": data,
        "paging":   false,
        "info":     false,
        "searching": false,
        "aoColumns": [
        	{ "mDataProp": "name" },
            { "mDataProp": "qualification" },
            { "mDataProp": "analysis" },
            { "mDataProp": "proposal" },
            { "mDataProp": "negotiation" },
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });


}