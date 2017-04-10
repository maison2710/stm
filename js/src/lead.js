var leadArray = new Array();
var filteredData = new Array();
var leadObject = {};
var chosenRow = null;
var table;
var duplicate = false;

$(document).ready(function() {
	$("#lead-layout").layout({
        resizeWhileDragging: true,
        initClosed: false,
        east__maxSize: .35,
        east__minSize: .2,
        useStateCookie:true, 
        onresize_end:function(){
            $(window).resize();
        }
    });

 	generateLeadUI();

    $( "#chart-lead-type").change(function(){
        var type = $( "#chart-lead-type option:selected" ).val();
        var field = $( "#field-lead option:selected" ).val();
        var countObject = countByField(filteredData, field);
        if(type=="pie"){
        	drawPieChart($("#leads-statistics-graph"),countObject,"pie", "Leads Number");
        } else {
        	drawCountChart($("#leads-statistics-graph"),countObject,type, "Leads Number");
        }
    });

    $.each(usersObject, function(k,v){
        if(k != 0 && k!= 1){
            $("#modal-lead-owner").append('<option value="'+k+'">Assign to '+v.firstName+'</option>');
            $("#modal-transfer-from").append('<option value="'+k+'">Transfer from '+v.firstName+'</option>');
            $("#modal-transfer-to").append('<option value="'+k+'">Transfer from '+v.firstName+'</option>');
        }
    });

    $("#transfer-all-leads").click(function(){
        $("#transferModal").modal('show');
    });

    $("#submit-transfer-all-lead").click(function(){
        var url = localDomain+"/stm/transferAllLead";
        var object = {};
        object.from = $("#modal-transfer-from").val();
        object.to = $("#modal-transfer-to").val();
        postRequest(url, object, function(e){
            if(e.result){
                toastr["success"]("Transfer leads successfully");
                generateLeadUI();
            } else {
                toastr["error"]("Can not transfer lead");
            }
        });
    });

    $( "#field-lead").change(function(){
    	var type = $( "#chart-lead-type option:selected" ).val();
    	var field = $( "#field-lead option:selected" ).val();
    	generateStatistics(filteredData,field, type);
    });

    $("#rateYo").rateYo().on("rateyo.change", function (e, data) {
        var rating = data.rating;
        $("#rate-value").html(rating.toFixed(1));
    });

    $("#add-lead").click(function(){
    	$("#lead-modal-title").html("Add New Lead");
    	$("#submit-lead").attr("value","add");
    	$("#modal-name").val("");
    	$("#modal-company").val("");
        $("#modal-address").val("");
    	$("#modal-phone").val("");
    	$("#modal-email").val("");
    	$("#modal-size").val("");
    	$("#modal-title").val("");
    	$("#modal-industry").val("");
    	$("#modal-source").val("");
    	$("#modal-status").val("");
    	$("#rateYo").rateYo("option", "rating", 0);
    	$("#rate-value").html("");
        $("#modal-lead-owner").val(userInfo.id);
    	$('#leadModal').modal('show');
    });

    $("#edit-lead").click(function(){
    	if(chosenRow==null){
    		toastr["error"]("Please select a row first!");
    	} else {
    		$("#lead-modal-title").html("Edit Lead");
    		$("#submit-lead").attr("value","edit");
    		$("#modal-name").val(chosenRow.name != null?chosenRow.name : "");
	    	$("#modal-company").val(chosenRow.company!= null?chosenRow.company : "");
            $("#modal-address").val(chosenRow.address!= null?chosenRow.address : "");
	    	$("#modal-phone").val(chosenRow.phone!= null?chosenRow.phone : "");
	    	$("#modal-email").val(chosenRow.email!= null?chosenRow.email : "");
	    	$("#modal-size").val(chosenRow.size);
	    	$("#modal-title").val(chosenRow.title!= null?chosenRow.title : "");
	    	$("#modal-industry").val(chosenRow.industry!= null?chosenRow.industry : "");
	    	$("#modal-source").val(chosenRow.source!= null?chosenRow.source : "");
	    	$("#modal-status").val(chosenRow.status!= null?chosenRow.status : "");
            $("#modal-lead-owner").val(chosenRow.ownerId);
	    	$("#rateYo").rateYo("option", "rating", chosenRow.rate);
	    	$("#rate-value").html(chosenRow.rate);
	    	$('#leadModal').modal('show');

    	}
    });

    $( '#leadModal' ).on( 'show.bs.modal', function ( event ) {
        $("#duplicate-detection-area").hide();
    });

	// name,status,company,phone,email,industry,source,size,address,owner_id,rate,last_update
    $("#submit-lead").click(function(){
    	var action = $(this).val();
    	var object = {};
    	var url;
    	if(action == "edit"){
    		object.id =  chosenRow.id;
    		url = localDomain+"/stm/updateLead";
    	} else {
    		url = localDomain+"/stm/insertLead";
    	}
    	object.name=$("#modal-name").val();
    	object.status=$("#modal-status").val();
    	object.company=$("#modal-company").val();
        object.address=$("#modal-address").val();
    	object.phone=$("#modal-phone").val();
    	object.email=$("#modal-email").val();
    	object.industry=$("#modal-industry").val();
    	object.source=$("#modal-source").val();
    	object.size=parseInt($("#modal-size").val())!=0?parseInt($("#modal-size").val()):0;
    	object.title=$("#modal-title").val();
    	object.address="";
    	object.ownerId= $("#modal-lead-owner").val();
    	object.rate=parseFloat($("#rateYo").rateYo("rating")!=null? $("#rateYo").rateYo("rating").toFixed(1) : 0 );
    	object.lastUpdate= moment().valueOf();

    	postRequest(url, object, function(e){
            if(e.result){
               	toastr["success"]( action + " lead successfully");
               	generateLeadUI();
               	$('#leadModal').modal('hide');
            } else {
               	toastr["error"]("Can not " + action + " lead");
            }
        });
    });


    $('#filter-lead[data-toggle=popover]').popover({
    	animation:true, 
    	content:'<form><div class="form-group"><div class="input-group" style="margin-bottom: 10px;"><span class="input-group-addon"><input type="checkbox" id="time-checkbox"></span><input type="text" class="form-control date" id="date-range" placeholder="Select time range"></div><select id="filter-lead-field" class = "form-control"><option value="" disabled selected>Field</option><option value="source">Source</option><option value="status">Status</option><option value="industry">Industry</option><option value="rate">Rate</option><option value="size">Size</option></select></div><div class="form-group"><select id="filter-lead-sign" class = "form-control"><option value="sign-operator" disabled selected>Sign</option><option value="<="><=</option><option value="==">=</option><option value=">=">>=</option></select></div><div class="form-group"><input class="form-control" id="filter-thres" placeholder="Value"></div><div class="form-group"><select id="filter-select"  class = "form-control"></select></div></form><button type="button" class="btn btn-primary" id="filter-btn">Filter Lead</button>',
    	html:true,
    	placement:'bottom'
    });

    $("#find-duplicate").click(function(){
        if(duplicate==false){
            duplicate=true;

            $("#find-duplicate").removeClass("btn-default");
            $("#find-duplicate").addClass("btn-primary");
            $("#find-duplicate").attr("title","Leads");

            var duplicateObject = {};

            for(var i=0; i<leadArray.length;i++){
                var lead = leadArray[i];
                var company = lead.company;
                company = $.trim(company.replace(/[^a-zA-Z 0-9]+/g, '').toLowerCase());

                if(duplicateObject.hasOwnProperty(company)){
                    duplicateObject[company].push(lead);
                } else {
                    var tmp = new Array();
                    tmp.push(lead);
                    duplicateObject[company] = tmp;
                }
            }

            var dataTable = new Array();

            $.each(duplicateObject, function(k, v) {
                if(v.length > 1){
                    for(var i=0; i < v.length;i++){
                        dataTable.push(v[i]);
                    }
                }
            });
            console.log(duplicateObject);

            populateLeadTable(dataTable);
        } else {
            duplicate=false;

            $("#find-duplicate").removeClass("btn-primary");
            $("#find-duplicate").addClass("btn-default");
            $("#find-duplicate").attr("title","Duplicates");

            populateLeadTable(filteredData);
        }

        
    });

    // $(window).resize(function() {
    //     console.log("test");
    //     height = $("#leads-statistics-graph").height();
    //     width = $(".ui-layout-east").width();;
    //     $("#leads-statistics-graph").highcharts().setSize(width, height, doAnimation = true);
    // });

});

$(document).on("keydown", ".Editor-editor", function() {
    clearTimeout(typingTimer);
});

$(document).on("keyup", "#modal-company", function() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(checkDuplicateLead, 500);
});

function checkDuplicateLead(){
    if($("#modal-company").val().length > 0){
        $.getJSON( localDomain+"/stm/filerLead?company="+ $("#modal-company").val(), {
        }).done(function(data) {
            if(data.length > 0){
                $("#duplicate-detection-area").show();
                populateDuplicateLeadFoundTable(data);
                $("#submit-lead").html("Submit anyway");
            } else {
                $("#duplicate-detection-area").hide();
                $("#submit-lead").html("Submit");
            }
        });
    }
}


function populateDuplicateLeadFoundTable( data ){
    for(var i=0; i<data.length;i++){
        data[i].ownerName = usersObject[data[i].ownerId].firstName;
    }
    $('#duplicate-found-table').DataTable({
        "bDestroy": true,
        "aaData": data,
        "paging":   false,
        "info":     false,
        "searching": false,
        "order": [[ 1, "desc" ]],
        "aoColumns": [
            { "mDataProp": "company" },
            { "mDataProp": "name" },
            { "mDataProp": "industry" },
            { "mDataProp": "email" },
            { "mDataProp": "size" },
            { "mDataProp": "source" },
            { "mDataProp": "ownerName" },
            { "mDataProp": "status" },
            { "mDataProp": "title" }
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });
}


$(document).on("click", "#filter-btn", function() {
    var left = $("#filter-lead-field").val();
	var sign = $("#filter-lead-sign").val();
	var right;

    if(left!=null && left.length > 0){
        if(left!="rate" && left!="size"){
            right = $("#filter-select").val();
        } else {
            right = $("#filter-thres").val();
        }
        
        filteredData = filterLead(leadArray,left,sign,right);
    } else {
        filteredData = leadArray;
    }

    if($('#time-checkbox:checkbox:checked').length > 0){
        filteredData = filterByTime(filteredData);
    }
    
    
    populateLeadTable(filteredData);
    generateStatistics(filteredData,"source", "pie");
    

});

function filterByTime(filteredData){
    var result = new Array();

    for(var i=0; i < filteredData.length; i++){
        var data = filteredData[i];

        if(data.lastUpdate < start.valueOf()){
            continue;
        }

        if(end !=null && end.valueOf() > 0 && data.lastUpdate > end.valueOf()){
            continue;
        }

        result.push(data);
    }

    return result;
}

$(document).on("change", "#filter-lead-field", function() {
    var left = $("#filter-lead-field").val();
	if(left!="rate" && left!="size"){
		$("#filter-lead-sign").val("==");
		$("#filter-lead-sign option:selected").siblings().attr('disabled','disabled');
        $("#filter-thres").hide();
        $("#filter-select").show();

        var tmp = countByField(leadArray, left);

        $("#filter-select").empty();
        $.each(tmp, function(k, v) {
            $("#filter-select").append('<option value="'+k+'">'+k+'</option>');
        });
	} else {
		$("#filter-lead-sign option:selected").siblings().removeAttr('disabled');
        $('#filter-lead-sign option[value="sign-operator"]').attr('disabled','disabled');
        $("#filter-thres").show();
        $("#filter-select").hide();
	}
});

function filterLead(data,left,sign,right){
	var result = new Array();
	for(var i=0; i < data.length; i++){
        var tmpLeft = data[i][left];
        if(!$.isNumeric(tmpLeft)){
            tmpLeft = data[i][left].toLowerCase();
        }
        if(!$.isNumeric(tmpRight)){
            var tmpRight = right.toLowerCase();
        }

		if(eval('"'+tmpLeft +'"'+ sign+'"' + tmpRight +'"')){
			result.push(data[i]);
		}
	}

	return result;
}


function generateLeadUI(){
	chosenRow = null;
    var leadUrl =  localDomain+'/stm/';
 	if(userInfo.role=="admin"){
 		$(".panel-title").html("All Open Leads");
 		leadUrl+= 'getAllLead';
 	} else {
 		leadUrl+= 'getLeadByOwner?ownerId=' + userInfo.id;
        $("#transfer-all-leads").hide();
 	}    
    $.getJSON( leadUrl, {
    }).done(function(data) {
        leadArray = process(data);
        filteredData = leadArray;
        populateLeadTable(leadArray);
    	generateStatistics(leadArray,"source", "pie");
    });
}

function generateStatistics(leadArray, field, type){
	var countObject = countByField(leadArray, field);
    if(type=="pie"){
    	drawPieChart($("#leads-statistics-graph"),countObject,type,"Leads Number");
    } else {
    	drawCountChart($("#leads-statistics-graph"),countObject,type,"Leads Number");
    }
    populateLeadCountTable(countObject);
}

function process(data){
	var results = new Array();

	for(var i=0; i < data.length; i++){
		var tmp = data[i];
        tmp.duration = moment.duration(data[i].lastUpdate - moment().valueOf(), "milliseconds").humanize(true);
		var rateDiv ="";
		for(var j=0; j < tmp.rate; j ++){
			rateDiv += '<span class="glyphicon glyphicon-star" aria-hidden="true" style="color:orange"></span>';
		}
		var user = usersObject[tmp["ownerId"]];
		tmp.ownerName = user.firstName +" "+user.lastName;
		tmp.rateDiv = rateDiv;
		tmp.nameDiv = '<a type="button" class="btn btn-link" href="lead-browse.html?ep=false&id='+tmp.id+'">'+tmp.name+'</a>';

        leadObject[tmp.id]=tmp; 
		results.push(tmp);
	}

	return results;
}

function populateLeadTable( data ){
    var tmp = false;
    if(userInfo.id ==1){
        tmp = true;
    } 

    table = $('#lead-table').DataTable({
    	"iDisplayLength": 12,
        "columnDefs": [
            { "visible": false, "targets": 0 },
            { "visible": false, "targets": 12 },
            { "visible": false, "targets": 13 },
            { "visible": false, "targets": 14 },
            { "visible": false, "targets": 15 },
            { "visible": tmp, "targets": 8 },
            { "iDataSort": 9, "aTargets": [ 14 ] },
            { "iDataSort": 12, "aTargets": [ 11 ] }
        ],
        "order": [[ 15, "desc" ]],
        "bDestroy": true,
        "aaData": data,
        "aoColumns": [
        	{ "mDataProp": "id" },
            { "mDataProp": "nameDiv" },
            { "mDataProp": "company" },
            { "mDataProp": "industry" },
            { "mDataProp": "phone" },
            { "mDataProp": "email" },
            { "mDataProp": "size" },
            { "mDataProp": "source" },
            { "mDataProp": "ownerName" },
            { "mDataProp": "duration" },
            { "mDataProp": "status" },
            { "mDataProp": "rateDiv" },
            { "mDataProp": "rate" },
            { "mDataProp": "title" },
            { "mDataProp": "lastUpdate" },
            { "mDataProp": "rank" },
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });
    $("#info").html(data.length + " leads showing");
    $(window).resize();

    $('#lead-table tbody').off().on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
            chosenRow = null;
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            chosenRow = table.row( this ).data();
        }
    } );
 
    $('#delete-lead').off().click( function () {
        if(chosenRow==null){
    		toastr["error"]("Please select a row first!");
    	} else {
    		$("#deleteLeadModal").modal('show');
    	}
        
    });

    $("#confirm-delete-lead").off().click(function(){
        var url = localDomain+"/stm/deleteLead";
        postRequest(url, chosenRow, function(e){
            if(e.result){
                table.row('.selected').remove().draw( false );
                toastr["success"]("Delete lead successfully");
                chosenRow = null;
            } else {
                toastr["error"]("Can not delete lead");
            }
        });
    });
}

function populateLeadCountTable( object ){
	var data = new Array();

	$.each(object, function(k, v) {
		var tmp = {};
		tmp.source = k;
		tmp.count=v;
		data.push(tmp);
	});

    var table = $('#lead-count-table').dataTable({
        "bDestroy": true,
        "aaData": data,
        "paging":   false,
        "info":     false,
        "searching": false,
        "order": [[ 1, "desc" ]],
        "aoColumns": [
            { "mDataProp": "source" },
            { "mDataProp": "count" }
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });
}

function countByField(data, field){
	var countObj={};

	for(var i =0; i < data.length; i++){
		var fieldValue = data[i][field];
		if(countObj.hasOwnProperty(fieldValue)){
			countObj[fieldValue]++;
		} else {
			countObj[fieldValue]=1;
		}
	}

	return countObj;
}
    