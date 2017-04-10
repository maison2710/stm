var gridster;
var oppMatrix = {};
var oppArray = new Array();
var oppObject = {};
var options = {
    disableResize : true
};
var table;
var chosenOpp;
var overdue = new Array();

$(document).ready(function() {
	$("#lead-layout").layout({
        resizeWhileDragging: true,
        initClosed: false,
        east__maxSize: .30,
        east__minSize: .15,
        useStateCookie:true, 
        onresize_end:function(){
            $(window).resize();
        }
    });

    $("#submit-opportunity-transfer").click(function(){
        if($("#modal-transfer-owner").val() != null && $("#modal-transfer-owner").val().length > 0){
            var newOwnerId = $("#modal-transfer-owner").val();
            var obj = chosenOpp;
            obj.ownerId = newOwnerId;

            var url = localDomain+'/stm/updateOpportunity';
            postRequest(url, obj, function(e){
                if(e.result){
                    toastr["success"]("Transfer opportunity successfully");
                    initiateOpportunityPage();
                } else {
                    toastr["error"]("Error transfering opportunity");
                }
            });

            var acc = {};
            acc.id = chosenOpp.accountId;
            acc.ownerId = newOwnerId;
            postRequest(localDomain+'/stm/updateAccountOwner', acc, function(e){
                if(e.result){
                    toastr["success"]("Transfer account successfully");
                } else {
                    toastr["error"]("Error transfering account");
                }
            });
        } else {
            toastr["error"]("Choose a people first");
        }
    });

    $("#modal-transfer-owner").html('<option value="" disabled selected>Select People</option>');
    $.each(usersObject, function(k,v){
        if(k != 0 && k!= 1){
            $("#modal-transfer-owner").append('<option value="'+k+'">Assign to '+v.firstName+'</option>');
        }
    });

    initiateOpportunityPage();
    
    
    $("#list-view").click(function(){
        showListView();
    });

    $("#grid-view").click(function(){
        showGridView();
    });

    $('#sort-opportunity[data-toggle=popover]').popover({
        animation:true, 
        content:'<button type="button" class="btn btn-link" id="sort-by-due">By Due</button><button type="button" class="btn btn-link" id="sort-by-value">By Value</button>',
        html:true,
        placement:'bottom'
    });

    $(window).resize(function() {
        $("#pipeline-by-stage").highcharts().setSize($("#pipeline-by-stage").width(), $("#pipeline-by-stage").height(), doAnimation = true);
    });

    $("#add-opportunity").click(function(){
        $("#opportunityModal").modal('show');
    });

    $.getJSON( localDomain+"/stm/getAllAccount", {
    }).done(function(data) {
        $("#modal-account-list").html('<option value="" disabled selected>Select Account</option>');
        for(var i=0; i < data.length; i++){
            $("#modal-account-list").append('<option value="'+data[i].id+'">'+data[i].name+'</option>');
        }
    });

    $('#due-picker').datetimepicker({
        format: 'DD/MM/YYYY'
    });

    $.each(usersObject, function(k,v){
        if(k != 0 && k!= 1){
            $("#modal-opportunity-owner").append('<option value="'+k+'">Assign to '+v.firstName+'</option>');
        }
        $("#modal-lead-owner").val(userInfo.id);
    });

    $("#submit-opportunity").click(function(){
        var object = {};
        object.start = moment().valueOf();
        object.lastUpdate = moment().valueOf();
        object.ownerId = $("#modal-opportunity-owner").val();
        object.name = $("#modal-name").val();
        object.value = $("#modal-value").val();
        object.carType = $("#modal-car-type").val();
        object.value = $("#modal-value").val();
        object.end = -1;
        object.quantity = $("#modal-quantity").val();
        object.accountId = $("#modal-account-list").val();
        object.stage = "qualification";
        object.status = "active";
        object.purpose = $("#modal-purpose").val();
        object.due = moment($("#due-value").val(), "DD/MM/YYYY").valueOf();
        object.model=0;

        var opportunityUrl = localDomain+"/stm/insertOpportunity";
        postRequest(opportunityUrl, object, function(e){
            if(e.result != null){
                toastr["success"]("Add opportunity successfully");
                generateOpportunityBoard($("opportunity-select").val());
            } else {
                toastr["error"]("Can not add opportunity");
            }
        });
    });

    $("#opportunity-select").change(function(){
        var userId = $("#opportunity-select").val();
        generateOpportunityBoard(userId);
    });
});



$(document).on('click',  '#sort-by-due', function() {
    oppMatrix = generateOppMatrix(oppArray,"due");
    generateBoard(oppMatrix);
});

$(document).on('click', '#sort-by-value', function() {
    oppMatrix = generateOppMatrix(oppArray,"value");
    generateBoard(oppMatrix);
});

$(document).on('dragstop', $('#board .grid-stack'), function(event, ui) {
    var grid = this;
    var element = event.target;

    setTimeout( function(){
        var opportunityId = $(element).attr("value");
        var newStageId =  $(element).attr("data-gs-x");

        console.log(newStageId);
        console.log(element);

        var newStage;
        if(newStageId == 0){
            newStage = "qualification";
        } else if (newStageId == 1){
            newStage = "analysis";
        } else if (newStageId == 2){
            newStage = "proposal";
        } else if (newStageId == 3){
            newStage = "negotiation";
        } else if (newStageId == 4){
            newStage = "close";
        }
        if(newStage == oppObject[opportunityId].stage){
            return;
        }

        var updateUrl = localDomain+"/stm/updateOpportunity";
        var newOpp = oppObject[opportunityId];
        newOpp.stage = newStage;
        newOpp.lastUpdate = moment().valueOf();
        if(newStage == "close"){
            newOpp.status = "won";
            newOpp.end = moment().valueOf();
        } else {
            newOpp.status = "active";
            newOpp.end = -1;
        }
        console.log(newOpp);
        postRequest(updateUrl, newOpp, function(e){
            if(e.result){
                toastr["success"]("Update opportunity successfully");
                var url;
                if($("#opportunity-select").val()=="0"){
                    url = localDomain+"/stm/getAllOpportunity";
                } else {
                    url = localDomain+"/stm/getOpportunityByOwner?ownerId=" + $("#opportunity-select").val();
                }
                $.getJSON( url, {
                }).done(function(data) {
                    oppArray = process(data,overdue);
                    generatePipelineByStage(oppArray,$("#pipeline-by-stage"),$("#opportunity-select").val());
                    oppMatrix = generateOppMatrix(oppArray);
                    updateOppBoardInfo(oppMatrix);
                    populateOppTable(oppArray);
                });
            } else {
                toastr["error"]("Can not update opportunity");
            }
        });
    }  , 100 );
});

function initiateOpportunityPage(){
    if(userInfo.id == 1){
        generateOpportunityBoard(0);
        $("#opportunity-select").html('<option value="0">All Opportunity</option>');
        $.each(usersObject, function(k,v){
            if(k != 0 && k!= 1){
                $("#opportunity-select").append('<option value="'+k+'">Opportunity for '+v.firstName + ' ' + v.lastName+'</option>');
            }
        });
    } else {
        generateOpportunityBoard(userInfo.id);
        $("#opportunity-select").html('<option value="'+userInfo.id+'">Opportunity for '+userInfo.firstName + ' ' + userInfo.lastName+'</option>');
    }
}

function showListView(){
    $("#list-view").hide();
    $("#grid-view").show();
    $("#pipeline-view").hide();
    $("#table-view").show();
    $("#sort-opportunity").hide();
    if(userInfo.id==1){
        $("#transfer-opportunity").show();
    }

    $(window).resize();
}

function showGridView(){
    $("#list-view").show();
    $("#grid-view").hide();
    $("#pipeline-view").show();
    $("#table-view").hide();
    $("#sort-opportunity").show();
    $("#transfer-opportunity").hide();

    $(window).resize();
}

function generateOpportunityBoard(userId){
    showGridView();
    var month = moment.tz(moment().valueOf(), "Asia/Singapore").format('MM-YYYY');
    var start = moment(month, "MM-YYYY").valueOf();
    var end = start + 3*24*3600*1000;
    var url = localDomain+"/stm/getForecastByTime?start=" + start + "&end=" + end;
    $.getJSON( url, {
    }).done(function(data) {
        currentForecast = getCurrentForecast(data);

        var url1;
        if(userId==0){
            url1 = localDomain+"/stm/getAllOpportunity";
            $("#opportunity-panel-title").html("All Opportunities")
        } else {
            url1 = localDomain+"/stm/getOpportunityByOwner?ownerId=" + userId;
            $("#opportunity-panel-title").html(usersObject[userId].firstName + "'s Opportunities")
        }
        $.getJSON( url1, {
        }).done(function(data) {
            if(data.length == 1){
                $("#info").html(data.length + " active opportunity in total");
            } else if( data.length > 1){
                $("#info").html(data.length + " active opportunities in total");
            } else if(data.length == 0){
                $("#info").html("No active opportunity");
            }

            $.getJSON( localDomain+'/stm/getOverdueActivity?due=' + moment().valueOf(), {
            }).done(function(response) {
                overdue = response;
                oppArray = process(data,overdue);
                generatePipelineByStage(oppArray,$("#pipeline-by-stage"),userId);
                oppMatrix = generateOppMatrix(oppArray,"value");
                generateBoard(oppMatrix);
                updateOppBoardInfo(oppMatrix);
                populateOppTable(oppArray);
            });
            
        });
    });

    
}

function populateOppTable( data ){
    var tmp = false;
    if(userInfo.id ==1){
        tmp = true;
    }

    console.log(tmp);    
    table = $('#opportunity-table').DataTable({
        "iDisplayLength": 12,
        "columnDefs": [
            { "width": "1%", "targets": 0 },
            { "visible": false, "targets": 0 },
            { "visible": false, "targets": 9 },
            { "visible": false, "targets": 10 },
            { "visible": false, "targets": 11 },
            { "visible": tmp, "targets": 5 },
            { "iDataSort": 7, "aTargets": [ 9 ] },
            { "iDataSort": 6, "aTargets": [ 10 ] },
             { "iDataSort": 3, "aTargets": [ 11 ] },
        ],
        "order": [[ 10, "desc" ]],
        "bDestroy": true,
        "aaData": data,
        "aoColumns": [
            { "mDataProp": "id" },
            { "mDataProp": "nameDiv" },
            { "mDataProp": "accountName" },
            { "mDataProp": "money" },
            { "mDataProp": "stage" },
            { "mDataProp": "ownerName" },
            { "mDataProp": "dueDate" },
            { "mDataProp": "duration" },
            { "mDataProp": "status" },
            { "mDataProp": "lastUpdate" },
            { "mDataProp": "due" },
            { "mDataProp": "value" }
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });
    // $("#info").html(data.length + " leads showing");
    $(window).resize();

    $('#opportunity-table tbody').off().on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
            chosenOpp = null;
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            chosenOpp = table.row( this ).data();
        }
    } );
 
    $('#transfer-opportunity').off().click( function () {
        var url = localDomain+"/stm/deleteOpportunity";
        if(chosenOpp==null){
            toastr["error"]("Please select a row first!");
        } else {
            $("#transferModal").modal('show');
        }
    });
}

function updateOppBoardInfo(opps){
    $.each(opps, function(k, v) {
        if(k == 0){
            $("#progress-q").html("Qualification (" + v.length + ")");
            var total = 0;
            for(var i=0; i<v.length;i++){
                total += v[i].value;
            }
            $("#value-q").html("$" + total);
        } else if(k == 1) {
            $("#progress-a").html("Analysis (" + v.length + ")");
            var total = 0;
            for(var i=0; i<v.length;i++){
                total += v[i].value;
            }
            $("#value-a").html("$" + total);
        } else if(k == 2) {
            $("#progress-p").html("Proposal (" + v.length + ")");
            var total = 0;
            for(var i=0; i<v.length;i++){
                total += v[i].value;
            }
            $("#value-p").html("$" + total);
        } else if(k == 3) {
            $("#progress-n").html("Negotiation (" + v.length + ")");
            var total = 0;
            for(var i=0; i<v.length;i++){
                total += v[i].value;
            }
            $("#value-n").html("$" + total);
        } else if(k == 4) {
            $("#progress-c").html("Closed/Won (" + v.length + ")");
            var total = 0;
            for(var i=0; i<v.length;i++){
                total += v[i].value;
            }
            $("#value-c").html("$" + total);
        }
    });
}

function generateBoard(opps){
    $("#board").html('<div class="grid-stack"></div>');
    $.each(opps, function(k, v) {
        for(var i=0; i < v.length; i++){
            var opp = v[i];
            var due = opp.dueDate;
            var name = opp.name;
            var value = opp.value;
            var accountName = opp.accountName;
            var id = opp.id;
            var href = 'opportunity-browse.html?ep=false&id=' + id;
            var content = '<div class="grid-stack-item" value="'+id+'" data-gs-x="'+k+'" data-gs-y="'+2*i+'" data-gs-width="1" data-gs-height="2"><div class="grid-stack-item-content"><a href="'+href+'" style="font-size: 150%">'+name+'</a><div style="font-size: 180%">$'+value+'</div><div><samp>'+accountName+'<samp></div><div class="row"><div class="col-xs-10"><div><samp>Due on '+due+'<samp></div></div>';

            if(opp.overdue){
                content += '<div class="col-xs-2"><span class="glyphicon glyphicon-warning-sign" aria-hidden="true" style="color:orange" data-toggle="tooltip" data-placement="bottom" title="Overdue Task"></span></div>';
            }

            content += '</div></div></div>';
            $(".grid-stack").prepend(content);
        }
        
    });

    setTimeout( function(){
        $('#board .grid-stack').gridstack(options);
        $(window).resize();
    }  , 100 );
}

function process(data,overdue){
    var results = new Array();

    for(var i=0; i < data.length; i++){
        var tmp = data[i];
        for(var j=0;j< overdue.length;j++){
            if(overdue[j].type=="opportunity" && overdue[j].dealId == tmp.id){
                tmp.overdue=true;
            }
        }

        tmp.duration = moment.duration(data[i].lastUpdate - moment().valueOf(), "milliseconds").humanize(true);
        var user = usersObject[tmp["ownerId"]];
        tmp.ownerName = user.firstName +" "+user.lastName;
        tmp.nameDiv = '<a type="button" class="btn btn-link" href="opportunity-browse.html?ep=false&id='+tmp.id+'">'+tmp.name+'</a>';
        tmp.dueDate = moment.tz(tmp.due, "Asia/Singapore").format('MM/DD/YYYY');
        tmp.money = "$" + tmp.value/1000 + "K";
        oppObject[tmp.id] = tmp;
        results.push(tmp);


    }

    return results;
}

function generateOppMatrix(oppArray,sortBy){
    var result = {};
    for(i=0; i<5; i++){
        result[i] = new Array();
    }

    for(var i=0; i<oppArray.length;i++){
        var opp = oppArray[i];
        var stage = opp.stage;
        var col;

        if(stage == "qualification"){
            col = 0;
        } else if (stage == "analysis"){
            col = 1;
        } else if (stage == "proposal"){
            col = 2;
        } else if (stage == "negotiation"){
            col = 3;
        } else if (stage == "close"){
            col = 4;
        }

        result[col].push(opp);
        if(sortBy=="due"){
            result[col] = result[col].sort(sortByDue1);
        } else {
            result[col] = result[col].sort(sortByValue);
        }
        
    }



    return result;
}

function generateOpportunityCell(object){
    var due = moment.tz(object.due, "Asia/Singapore").format('MM/DD/YYYY');
    var name = object.name;
    var value = object.value;
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