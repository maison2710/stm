var oppArray=new Array();
var currentForecast = {};
$(document).ready(function() {
    $("#dashboard-layout").layout({
        resizeWhileDragging: true,
        initClosed: false,
        east__maxSize: .35,
        east__minSize: .2,
        useStateCookie:true, 
        onresize_end:function(){
            $(window).resize();
        }
    });

    var month = moment.tz(moment().valueOf(), "Asia/Singapore").format('MM-YYYY');
    var start = moment(month, "MM-YYYY").valueOf();
    var end = start + 3*24*3600*1000;

    var url = localDomain+"/stm/getForecastByTime?start=" + start + "&end=" + end;
    $.getJSON( url, {
    }).done(function(data) {
        currentForecast = getCurrentForecast(data);
        if(userInfo.title == "Sale Executive"){
            generateExecutiveDashboard(userInfo.id);
            $("#dashboard-select").html('<option value="'+userInfo.id+'">Dashboard for '+userInfo.firstName + ' ' + userInfo.lastName+'</option>');
        } else if (userInfo.title == "Sale Manager"){
            $("#dashboard-select").html('<option value="0">Forecast for All</option>')
            $.each(usersObject, function(k,v){
                if(k != 0 && k!= 1){
                $("#dashboard-select").append('<option value="'+k+'">Dashboard for '+v.firstName + ' ' + v.lastName+'</option>');
            }
            generateManagerDashboard();
        });
        }
    });

    $("#dashboard-select").change(function(){
        var userId = $("#dashboard-select").val();
        if(userId == 0){
            generateManagerDashboard();
        } else {
            generateExecutiveDashboard(userId);
        }
    });
	
    $(window).resize(function() {
        if($("#dashboard-select").val()=="0"){
            $("#manager-pipeline-by-stage").highcharts().setSize($("#manager-pipeline-by-stage").width(), $("#manager-pipeline-by-stage").height(), doAnimation = true);
            $("#m-avq").highcharts().setSize($("#m-avq").width(), $("#m-avq").height(), doAnimation = true);
            $("#manager-top-opportunity").highcharts().setSize($("#manager-top-opportunity").width(), $("#manager-top-opportunity").height(), doAnimation = true);
            $("#manager-active-contact").highcharts().setSize($("#manager-active-contact").width(), $("#manager-active-contact").height(), doAnimation = true);
            $("#team-progress").highcharts().setSize($("#team-progress").width(), $("#team-progress").height(), doAnimation = true);
        } else {
            $("#pipeline-by-stage").highcharts().setSize($("#pipeline-by-stage").width(), $("#pipeline-by-stage").height(), doAnimation = true);
            $("#avq").highcharts().setSize($("#avq").width(), $("#avq").height(), doAnimation = true);
            $("#active-contact").highcharts().setSize($("#active-contact").width(), $("#active-contact").height(), doAnimation = true);
            $("#task-stat").highcharts().setSize($("#task-stat").width(), $("#task-stat").height(), doAnimation = true);
            $("#top-opportunity").highcharts().setSize($("#top-opportunity").width(), $("#top-opportunity").height(), doAnimation = true);
        }
    });

});

function generateManagerDashboard(){
    $("#executive-view").hide();
    $("#manager-view").show();
    $("#info").html("Sale Manager Dashboard");
    $("#home-panel-title").html(usersObject[1].firstName+"'s Dashboard - Sale Manager");
    generateToDoList(1);
    generateTeamProgress($("#manager-active-contact"));
    generateActiveContact($("#manager-active-contact"),0);

    var url = localDomain+"/stm/getAllOpportunity";
    $.getJSON( url, {
    }).done(function(data) {
        oppArray = data;
        generateAVQ(oppArray,$('#m-avq'),0);
        generatePipelineByStage(oppArray,$("#manager-pipeline-by-stage"),0);
        generateTopOpportunity($("#manager-top-opportunity"));
        genrateNoUpdateRecently(oppArray);
    });
}

function generateExecutiveDashboard(userId){
    $("#manager-view").hide();
    $("#executive-view").show();
    // $("#info").html("Sale Executive Dashboard");
    $("#home-panel-title").html(usersObject[userId].firstName+"'s Dashboard - Sale Executive");
    generateToDoList(userId);
    generateActiveContact($("#active-contact"),userId);
    generateTaskDistribution();

    var url = localDomain+"/stm/getOpportunityByOwner?ownerId=" + userId;
    $.getJSON( url, {
    }).done(function(data) {
        oppArray = data;
        generateAVQ(oppArray,$('#avq'),userId);
        generatePipelineByStage(oppArray,$("#pipeline-by-stage"),userId);
        generateTopOpportunity($("#top-opportunity"));
        genrateNoUpdateRecently(oppArray);
    });
    
}

function genrateNoUpdateRecently(oppArray){
    var list = oppArray.sort(sortByLastUpdate);
    $("#no-update-group").empty();

    for(var i=0; i< 5; i++){
        var tmp = list[i];

        var href = "opportunity-browse.html?id="+ tmp.id;
        var duration = moment.duration(tmp.lastUpdate - moment().valueOf(), "milliseconds").humanize(true);
        $("#no-update-group").append('<li class="list-group-item" style="background-color: #F5F8FA;"><div class="row"><div class="col-xs-8"><a href="'+href+'">'+tmp.name+'</a></div><div class="col-xs-4"><p style="float:right">'+duration+'</p></div></div></li>');
    }
}

function getCurrentForecast(data){
    var month = moment.tz(moment().valueOf(), "Asia/Singapore").format('MM-YYYY');
    var thres = moment(month, "MM-YYYY").valueOf();
    var result = {};

    for(var exeId=0; exeId <=4; exeId++){
        if(exeId==1){
            continue;
        }

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
    }
    for(var i=0; i < data.length; i++){
        var tmp = data[i];
        // console.log(tmp);
        var exeId = tmp.ownerId;
       
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

function generateToDoList(userId){
    var url = localDomain+'/stm/getActivityByToDo?ownerId=' + userId;

    $.getJSON( url, {
    }).done(function(data) {
        var toDoList = new Array();
        for(var i =0; i < data.length; i++){
            if(data[i].action == "call"){
                data[i].icon = 'glyphicon-phone-alt';
            } else if(data[i].action == "meeting"){
                data[i].icon = 'glyphicon-calendar';
            } else if(data[i].action == "mail"){
                data[i].icon = 'glyphicon-envelope';
            } else {
                data[i].icon = 'glyphicon-briefcase';
            }

            toDoList.push(data[i]);
            activitiesObject[data[i].id] = data[i];
        }

        toDoList.sort(sortByDue);

        $("#next-step-list").empty();
        for(var i =toDoList.length-1; i >= 0 ; i--){
            var task = toDoList[i];
            var type = task.type;
            var taskId = task.id;
            var warningIcon;
            var color;
            if(task.due >= moment().valueOf()){
                warningIcon = "glyphicon-flag";
                color = "orange";
            } else {
                warningIcon = "glyphicon-warning-sign";
                color = "red";
            }
            var time = moment.tz(task.due, "Asia/Singapore").format('MM/DD H:mm');
            var relatedName = task.relate.relatedName;
            var relatedLink = task.relate.relatedType == "opportunity" ? "opportunity-browse.html" : "lead-browse.html";
            var href = relatedLink + "?id=" + task.relate.relatedId;
            $("#next-step-list").append('<div class="row"><div class="col-xs-2"><a class="step-item-icon activity-next" style="background-color: '+color+'"> <span class="glyphicon '+task.icon+'" aria-hidden="true" style="color:white;font-size: 18px;"></span></a><div class="step-item-line" style="height: 60px;"><div style="background-color:'+color+';height:50px"></div></div></div><div class="col-xs-8" style="padding-left: 6px"><h5 class="opportunity-item-list-name"><span class="glyphicon '+warningIcon+'" aria-hidden="true" style="color:'+color+';margin-right: 5px"></span>'+task.subject+'</h5><div class="side-list-item-info"><span style="font-style: italic"><strong>'+time+'</strong> - </span>'+task.comment+'</div><a href="'+href+'" >Related - '+relatedName+'</a></div><div class="col-xs-2"><div class="dropdown"><span class="glyphicon glyphicon-cog dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"></span><ul class="dropdown-menu pull-right" style="min-width: 50px"><li><a href="#" data-toggle="tooltip" data-placement="bottom" title="Success" class="win-task" value="'+taskId+'"><span class="glyphicon glyphicon-thumbs-up" aria-hidden="true" style="color:green"></span></a></li><li role="separator" class="divider"></li><li><a href="#" data-toggle="tooltip" data-placement="bottom" title="Lost" class="lose-task" value="'+taskId+'"><span class="glyphicon glyphicon-thumbs-down" aria-hidden="true" style="color:red"></span></a></li><li role="separator" class="divider"></li><li><a href="#" data-toggle="tooltip" data-placement="bottom" title="Delete" class="delete-task" value="'+taskId+'"><span class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red"></span></a></li><li role="separator" class="divider"></li><li><a href="#" data-toggle="tooltip" data-placement="bottom" title="Edit" class="edit-task" value="'+taskId+'"><span class="glyphicon glyphicon-edit" aria-hidden="true" style="color:black"></span></a></li></ul></div></div></div>');
        }
    });
}

function generateAVQ(data, div,fsId){
    var monthTarget = currentForecast[fsId].forecast;
    var myIdealToday = monthTarget*(moment().date())/30;
    var myIdealTodayRatio = myIdealToday/monthTarget;
    myIdealTodayRatio = parseInt(myIdealTodayRatio);
    myIdealToday = parseInt(myIdealToday);
    var valueByStageObject = calculateTotalValueByStage(data);
    var actualAttainment = valueByStageObject.close;

    var myIdealTodayTooltip = parseInt(myIdealToday/1000) + "k";
    var myActualAttainmentText = parseInt(actualAttainment/1000) + "k";

    var gaugeOptions = {
        lang: {
            thousandsSep: ','
        },
        chart: {
            type: 'solidgauge'
        },
        pane: {
            center: ['50%', '69%'],
            size: '100%',
            startAngle: -90,
            endAngle: 90,
            background: {
                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc'
            }
        },
        tooltip: {
            enabled: true
        },
        // the value axis
        yAxis: {
            stops: [
                [myIdealTodayRatio, '#DF5353'], // red
                [1, '#55BF3B'] // green
            ],
            lineWidth: 0,
            minorTickInterval: null,
            tickPixelInterval: 400,
            tickWidth: 0,
            title: {
                y: -50
            },
            labels: {
                y: 16
            }
        },
        plotOptions: {
            solidgauge: {
                dataLabels: {
                    y: 5,
                    borderWidth: 0,
                    useHTML: true
                }
            }
        }
    };

    div.highcharts(Highcharts.merge(gaugeOptions, {
        yAxis: {
            min: 0,
            max: monthTarget,
            title: {
                text: 'Quota'
            }
        },
        title: {
            text: 'Closed Opportunities'
        },
        subtitle: {
            text: 'Total attaiment versus quota'
        },
        credits: {
            enabled: false
        },

        series: [{
            name: 'Attainment',
            data: [actualAttainment],
            dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                    ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">$'+myActualAttainmentText+'</span><br/>' +
                       '<span style="font-size:12px;color:silver">attainment</span></div>'
            },
            tooltip: {
                pointFormat: "Ideal: $"+myIdealTodayTooltip,
                // valueSuffix: ' km/h'
            }
        }]

    }));
}

function generateActiveContact(div,userId){
    var categories = [1427860800000,1430452800000,1433131200000,1435723200000,1438401600000,1441080000000,1443672000000,1446350400000,1448942400000,1451620800000,1454299200000,1456848000000];
    var value = [8,10,12,10,8,15,8,9,9,15,10,12];
    var series_1=[];
    var series_2=[];

    var total=0;
    for(var i=0; i < categories.length; i++){
        var element = [];
        var tmp;
        if(userId==0){
            tmp=3*value[i];
        } else {
            tmp= value[i];
        }
        element.push(categories[i]);
        element.push(tmp);
        series_1.push(element);
        total+= tmp;
    }
    var average = total/value.length

    var current = [];
  
    current.push(1459526400000);
    if(userId==0){
        current.push(28);
    } else {
        current.push(16);
    }
    series_2.push(current);


    div.highcharts({
        chart: {
            zoomType: 'x'
        },
        title: {
            text: "Average Active Contact"
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: "Number"
            },
            plotLines: [{
                color: 'green',
                width: 2,
                value: average
            }]
        },
        legend: {
            enabled: true
        },
        tooltip: {
            xDateFormat: '%m-%Y',
            pointFormat: '<b>{point.y}</b>'
        },
        series: [{
            name: 'historical active contacts',
            data: series_1,
            // color: 'green',
            dataLabels: {
                enabled: false,
            }
        },
        {
            name: 'current active contacts',
            data: series_2,
            color: 'red',
            dataLabels: {
                enabled: true,
            }
        }]
    });
}

function generateTaskDistribution(){

    var countObject = {};
    countObject.call = 36;
    countObject.mail = 20;
    countObject.meeting = 10;
    drawPieChart($("#task-stat"),countObject,"pie", "Activities This Week");
}

function generateTopOpportunity(div){
    var topOppObj ={};
    var tmp = oppArray.sort(sortByValue);
    // console.log(tmp);
    for(var i=0; i< tmp.length; i++){
        var name= tmp[i].name;
        var href = "opportunity-browse.html?id=" + tmp[i].id;
        var nameDiv = '<a href="'+href+'">'+name+'</a>'
        var value = tmp[i].value;
        topOppObj[nameDiv] = value;
    }
    // console.log(topOppObj);
    drawTopOppChart(div,topOppObj,"bar", "Top Open Opportunities");
}

function drawTopOppChart(dom,object,type, title){
    dom.empty();
    var series = [];
    var yValues=[];
    var xValues=[];
    var countObj={};

    $.each(object, function(k, v) {
        xValues.push(k);
        yValues.push(v);

        
    });

    var seri = {};
    seri.name = title;
    seri.data =yValues;
    series.push(seri);

    dom.highcharts({
        chart: {
            type: type,
            zoomType: 'x'
        },
        title: {
            text: title
        },
        xAxis: {
            categories: xValues,
            labels: {
                useHTML: true
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        yAxis: {
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        legend: {
            enabled: false
        },
        tooltip: {
            pointFormat: 'value : <b>{point.y}</b>'
        },
        credits: {
            enabled: false
        },
        series: series
    });

}

function generateTeamProgress(){
    // var object = {};
    // object["Peter Exe"] = 30;
    // object["Alex Exe"] = 25;
    // object["Brie Exe"] = 28;

    // drawCountChart($("#team-progress"),object,"bar", "Team Progress over Target (%)");

    $('#team-progress').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Team Progress over Target (%)'
        },
        xAxis: {
            categories: ['Peter Exe', 'Alex Exe', 'Brie Exe']
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Attainment (%)'
            }
        },
        tooltip: {
            pointFormat: '<span>{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
            // shared: true
        },
        plotOptions: {
            column: {
                stacking: 'percent'
            }
        },
        series: [{
            name: 'unachieved',
            color: '#fcf8e3',
            data: [60, 65, 68]
        },{
            name: 'won',
            data: [40, 35, 32],
            // color:'#5cb85c'
            color:"red"
        }]
    });
}

function generatePipelineByStage(data,div,fsId){
    var valueByStageObject = calculateTotalValueByStage(data);
    var myIdealToday = currentForecast[fsId].forecast*(moment().date())/30;
    // var 

    // console.log(valueByStageObject);
    
    var categories = ["Qualification","Analysis","Proposal","Negotiation","Close"];
    var currentObj ={};
    currentObj.name = "Current Pipeline";
    currentObj.data = [valueByStageObject.qualification,valueByStageObject.analysis,valueByStageObject.proposal,valueByStageObject.negotiation,valueByStageObject.close];
    var idealObj ={};
    idealObj.name = "Ideal Pipeline";
    //1.1,1.2,1.3,1.05
    var iC = parseInt(myIdealToday);
    var iN = parseInt(iC*1.2);
    var iP = parseInt(iN*1.35);
    var iA = parseInt(iP*1.45);
    var iQ = parseInt(iA*1.05);
    idealObj.data=[iQ,iA,iP,iN,iC];
    idealObj.color="red";

    var series=[];
    series.push(currentObj);
    series.push(idealObj);
    generateSeriesChart(div,series,categories,"bar","Current Month Pipeline By Stage");
    // drawCountChart($("#pipeline-by-stage"),valueByStageObject,"bar", "Current Month Pipeline By Stage");
}
