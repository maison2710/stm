var usersObject = {};
var sidebar;
var userInfo;
var start,end;
var activitiesObject = {};
var typingTimer;
var localDomain="http://172.26.147.67:8080";
var chosenActivity;
var carsObject = {};
var competitor = false;

toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "100",
    "timeOut": "2000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

$(document).ready(function() {
	authenticate();
	initiatePage();
	
    $.ajax({
        url: localDomain+"/stm/getAllUser?",
        async: false,
        success: function(data){
            for(var i =0; i < data.length; i++){
                usersObject[data[i]["id"]]=data[i];
            }
        }
    })

    // $.getJSON( localDomain+"/stm/getAllUser?", {
    //     async: false
    // }).done(function(data) {
    //     for(var i =0; i < data.length; i++){
    //         userObject[data[i]["id"]]=data[i];
    //     }
    // });

    sidebar.on('collapse-end', function(){
        $(window).resize();
    });

    sidebar.on('expand-end', function(){
        $(window).resize();
    });

    $('[data-toggle="tooltip"]').tooltip();
  
    $('body').on('click', function (e) {
        $('[data-toggle="popover"]').each(function () {
            //the 'is' for buttons that trigger popups
            //the 'has' for icons within a button that triggers a popup
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });

    $('#save-note').click(function(){
        saveNoteContent();
    });

    $('#delete-note').click(function(){
        $('#deleteNoteModal').modal('show');
        $('#delete-note-title').html('Are you sure to delete "'+chosenNote.subject+'"?')
    });

    $('#confirm-delete-note').click(function(){
        var url = localDomain+"/stm/deleteNote";
        postRequest(url, chosenNote, function(e){
            if(e.result){
                toastr["success"]("Delete successfully");
                generateNoteUI(false,false);
            } else {
                toastr["error"]("Error saving");
            }
        });
    });

    $("#up-note").click(function(){
        var prev = $('.list-group-note[value="'+chosenNote.id+'"]').prev();
        if(prev!=null){
            showNote(notesObject[$(prev).attr("value")]);
        }
    })

    $("#down-note").click(function(){
        var next = $('.list-group-note[value="'+chosenNote.id+'"]').next();
        if(next!=null){
            showNote(notesObject[$(next).attr("value")]);
        }
    });

    //owner_id,subject,content,last_update, is_star
    $('#add-note').click(function(){
        var newNote = {};
        newNote.ownerId =  userInfo.id;
        newNote.subject = "New note";
        newNote.content = "";
        newNote.lastUpdate = moment().valueOf();
        newNote.star = false;
        
        var url = localDomain+"/stm/insertNote";
        postRequest(url, newNote, function(e){
            if(e.hasOwnProperty("noteId")){
                var noteId = e.noteId;
                if(location.pathname == "/stm/opportunity-browse.html"){
                    var object = {};
                    object.parentId = noteId;
                    object.relatedId = opportunityObject.id;
                    object.relatedType = "opportunity";
                    object.relatedName = opportunityObject.name;
                    postRequest(localDomain+"/stm/insertNoteRelated", object, function(e){
                        if(e.result){
                            toastr["success"]("Tag successfully");
                            generateNoteUI(false,false);
                        } else {
                            toastr["error"]("Can not tag");
                        }
                    });
                } else if(location.pathname == "/stm/lead-browse.html"){
                    var object = {};
                    object.parentId = noteId;
                    object.relatedId = leadObject.id;
                    object.relatedType = "lead";
                    object.relatedName = leadObject.name;
                    postRequest(localDomain+"/stm/insertNoteRelated", object, function(e){
                        if(e.result){
                            toastr["success"]("Tag successfully");
                            generateNoteUI(false,false);
                        } else {
                            toastr["error"]("Can not tag");
                        }
                    });
                } else {
                    generateNoteUI(false,false);
                }
                
            } else {
                toastr["error"]("Error saving");
            }
        });
    });

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

    $("#unfilter-star-note").hide();

});

$(document).on("keypress", "#quicksearch", function(e) {
    if(e.which == 10 || e.which == 13){
        if($("#quicksearch").val().length > 0){
            location.href = "search.html?search=" + $("#quicksearch").val();
        }
        
    }
});

function logout(){
    $.cookie("email", null);
    $.cookie("password", null);
    $.cookie("userInfo", null);
	location.href = "login.html";
}

function authenticate(){
	var email = $.cookie("email");
	var password = $.cookie("password");

	if(email==null || password==null){
		location.href = "login.html";
	} else {
		return true;
	}
}

function openPage(dom){
	location.href = $(dom).attr("value") + "?ep=" + !sidebar.isCollapsed();
}

function initiatePage(){
	$("#sidebar").load("sidebar.html");
	$("#header").load("header.html");
    // $("#new-car-modal").load("new-car.html");
    userInfo = JSON.parse($.cookie("userInfo"));
	
	sidebar = AJS.sidebar('.aui-sidebar');
	sidebar.collapse();
	var expand = getUrlParameter("ep");
	if(expand != null && expand=="true"){
		sidebar.expand();
	}

	setTimeout( function(){
        var item = window.location.pathname.replace("/stm/","");
		var parent = $('.aui-nav-item[value="'+item+'"]').parent();
        parent.addClass('aui-nav-selected');

        // var userInfo = JSON.parse(sessionStorage.userInfo);
		$("#content .userName").html(userInfo.firstName + " "+ userInfo.lastName);
		$("#content .userTitle").html(userInfo.title);
        $("#content #sidebar-avatar").attr("src",userInfo.avatar);
        initiateCarInfo();
        $(window).resize();
    }  , 200 );
}

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function postRequest(url, object, callback){
    var request = $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(object),
        contentType: 'application/json', 
        dataType: "JSON",
    });

    request.done(function( msg ) {
        if(callback && typeof(callback)==="function"){
            callback(msg);
        }
    }).fail(function() {
        if(callback && typeof(callback)==="function"){
            callback(msg);
        }
    });
}

function drawPieChart(dom,object,type, title){
	dom.empty();

	var data = new Array();

	$.each(object, function(k, v) {
		var tmp = {};
		tmp.name = k;
		tmp.y=v;
		data.push(tmp);
		
	});

	dom.highcharts({
        chart: {
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: title
        },
        // tooltip: {
        //     // pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        // },
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
        credits: {
            enabled: false
        },
        series: [{
            name: title,
            colorByPoint: true,
            data: data
        }]
    });
}

function drawCountChart(dom,object,type, title){
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

function generateSeriesChart(div, series, categories, type, title){
    div.empty();
    div.highcharts({
        chart: {
            type: type
        },
        title: {
            text: title
        },
        xAxis: {
            categories: categories
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Value'
            },
            labels: {
                overflow: 'justify'
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        credits: {
            enabled: false
        },
        series: series
    });

}

$(document).on("keyup", "#main-car-quantity", function() {
    var quantity=parseInt($("#main-car-quantity").val());
    $("#main-total-price").html("Total $" + quantity*carsObject[$(".main-dealer-car-list").val()].price);
});

$(document).on("change", ".main-dealer-car-list", function() {
    var quantity=parseInt($("#main-car-quantity").val());
    $("#main-total-price").html("Total $" + quantity*carsObject[$(".main-dealer-car-list").val()].price);
});


$(document).on("click", "#main-get-info", function() {
    if($(".main-dealer-car-list").val() != null && $(".main-dealer-car-list").val().length > 0){
        generateMainCarInfoTable();
        generateMainSafetyTable();
        generateMainEquipmentTable();
        $("#main-comparasion-area").show();
    } else {
        toastr["error"]("Choose a car first");
    }
    
});

$(document).on("show.bs.modal", "#mainCarModal", function() {
    var makeUrl = "http://api.edmunds.com/api/vehicle/v2/makes?fmt=json&year=1995&api_key=qth4vtbc2sy8pm6w3vm7ke7s";
    $("#main-competitor-brand").append('<option value="" disabled selected>Select Brand</option>');
    $("#main-competitor-model").append('<option value="" disabled selected>Select Model</option>');
    $("#main-competitor-year").append('<option value="" disabled selected>Select Year</option>');
    $("#main-competitor-style").append('<option value="" disabled selected>Select Style</option>');
    $.getJSON( makeUrl, {
    }).done(function(data) {
        for(var i=0; i < data.makes.length;i++){
            var tmp = data.makes[i];
            $("#main-competitor-brand").append('<option value="'+tmp.niceName+'">'+tmp.name+'</option>');
        }
    });
});

$(document).on("change", "#main-competitor-brand", function() {
    var modelUrl = "http://api.edmunds.com/api/vehicle/v2/"+ $("#main-competitor-brand").val()+"?fmt=json&state=new&api_key=qth4vtbc2sy8pm6w3vm7ke7s";
    $.getJSON( modelUrl, {
    }).done(function(data) {
        $("#main-competitor-model").html('<option value="" disabled selected>Select Model</option>');
        $("#main-competitor-year").html('<option value="" disabled selected>Select Year</option>');
        $("#main-competitor-style").html('<option value="" disabled selected>Select Style</option>');
        for(var i=0; i < data.models.length;i++){
            var tmp = data.models[i];
            $("#main-competitor-model").append('<option value="'+tmp.niceName+'">'+tmp.name+'</option>');
        }
    });
});

$(document).on("change", "#main-competitor-model", function() {
    var yearlUrl = "https://api.edmunds.com/api/vehicle/v2/"+$("#main-competitor-brand").val()+"/"+$("#main-competitor-model").val()+"/years?fmt=json&state=new&api_key=qth4vtbc2sy8pm6w3vm7ke7s";
    $.getJSON( yearlUrl, {
    }).done(function(data) {
        $("#main-competitor-year").html('<option value="" disabled selected>Select Year</option>');
        $("#main-competitor-style").html('<option value="" disabled selected>Select Style</option>');
        for(var i=0; i < data.years.length;i++){
            var tmp = data.years[i];
            $("#main-competitor-year").append('<option value="'+tmp.year+'">'+tmp.year+'</option>');
        }
    });
});

$(document).on("change", "#main-competitor-year", function() {
    var stylelUrl = "https://api.edmunds.com/api/vehicle/v2/"+$("#main-competitor-brand").val()+"/"+$("#main-competitor-model").val()+"/"+$("#main-competitor-year").val()+"?fmt=json&api_key=qth4vtbc2sy8pm6w3vm7ke7s";
    $.getJSON( stylelUrl, {
    }).done(function(data) {
        $("#main-competitor-style").html('<option value="" disabled selected>Select Style</option>');
        for(var i=0; i < data.styles.length;i++){
            var tmp = data.styles[i];
            $("#main-competitor-style").append('<option value="'+tmp.id+'">'+tmp.name+'</option>');
        }
    });
});

$(document).on("click", "#main-add-competitor", function() {
    $("#main-competitor-area").show();
    competitor = true;
    $("#main-remove-competitor").show();
    $("#main-add-competitor").hide();
});

$(document).on("click", "#main-remove-competitor", function() {
    $("#main-competitor-area").hide();
    competitor = false;
    $("#main-add-competitor").show();
    $("#main-remove-competitor").hide();
});

$(document).on("show.bs.modal", "#newCarModal", function(event) {
    var makeUrl = "http://api.edmunds.com/api/vehicle/v2/makes?fmt=json&year=1995&api_key=qth4vtbc2sy8pm6w3vm7ke7s";
    $("#new-car-brand").append('<option value="" disabled selected>Select Brand</option>');
    $("#new-car-model").append('<option value="" disabled selected>Select Model</option>');
    $("#new-car-year").append('<option value="" disabled selected>Select Year</option>');
    $("#new-car-style").append('<option value="" disabled selected>Select Style</option>');
    $.getJSON( makeUrl, {
    }).done(function(data) {
        for(var i=0; i < data.makes.length;i++){
            var tmp = data.makes[i];
            $("#new-car-brand").append('<option value="'+tmp.niceName+'">'+tmp.name+'</option>');
        }
    });
});

$(document).on("change", "#new-car-brand", function() {
    var modelUrl = "http://api.edmunds.com/api/vehicle/v2/"+ $("#new-car-brand").val()+"?fmt=json&state=new&api_key=qth4vtbc2sy8pm6w3vm7ke7s";
    $.getJSON( modelUrl, {
    }).done(function(data) {
        $("#new-car-model").html('<option value="" disabled selected>Select Model</option>');
        $("#new-car-year").html('<option value="" disabled selected>Select Year</option>');
        $("#new-car-style").html('<option value="" disabled selected>Select Style</option>');
        for(var i=0; i < data.models.length;i++){
            var tmp = data.models[i];
            $("#new-car-model").append('<option value="'+tmp.niceName+'">'+tmp.name+'</option>');
        }
    });
});

$(document).on("change", "#new-car-model", function() {
    var yearlUrl = "https://api.edmunds.com/api/vehicle/v2/"+$("#new-car-brand").val()+"/"+$("#new-car-model").val()+"/years?fmt=json&state=new&api_key=qth4vtbc2sy8pm6w3vm7ke7s";
    $.getJSON( yearlUrl, {
    }).done(function(data) {
        $("#new-car-year").html('<option value="" disabled selected>Select Year</option>');
        $("#new-car-style").html('<option value="" disabled selected>Select Style</option>');
        for(var i=0; i < data.years.length;i++){
            var tmp = data.years[i];
            $("#new-car-year").append('<option value="'+tmp.year+'">'+tmp.year+'</option>');
        }
    });
});

$(document).on("change", "#new-car-year", function() {
    var stylelUrl = "https://api.edmunds.com/api/vehicle/v2/"+$("#new-car-brand").val()+"/"+$("#new-car-model").val()+"/"+$("#new-car-year").val()+"?fmt=json&api_key=qth4vtbc2sy8pm6w3vm7ke7s";
    $.getJSON( stylelUrl, {
    }).done(function(data) {
        $("#new-car-style").html('<option value="" disabled selected>Select Style</option>');
        for(var i=0; i < data.styles.length;i++){
            var tmp = data.styles[i];
            $("#new-car-style").append('<option value="'+tmp.id+'">'+tmp.name+'</option>');
        }
    });
});

//competitor_name,competitor_model,competitor_price,note,opportunity_id,style_id
$(document).on("click", "#submit-new-car", function() {
    var object = {};
    object.profit = $("#new-car-profit").val() != null ? $("#new-car-profit").val() : "";
    object.price = $("#new-car-price").val() != null ? $("#new-car-price").val() : 0;
    object.styleId = $("#new-car-style").val();
    object.name = $("#new-car-brand option:selected").text() + " " + $("#new-car-model option:selected").text() + " " + $("#new-car-style option:selected").text() + " " + $("#competitor-year").val();


    var url = localDomain+"/stm/insertCar";
    postRequest(url, object, function(e){
        if(e.result){
            toastr["success"]("Save successfully");
        } else {
            toastr["error"]("Error saving");
        }
    }); 
});

$(document).on("click", ".timer-tigger", function() {
    //initialize time range picker 
    $('#date-range').dateRangePicker({
        startOfWeek: 'monday',
        separator : ' - ',
        format: 'DD/MM/YYYY HH:mm',
        autoClose: false,
        time: {
            enabled: true
        },
        showShortcuts: true,
        shortcuts : 
        {
            'prev-days': [1,3,5,7],
            'prev': ['week','month','year'],
            'next-days':null,
            'next':null
        }
    }).bind('datepicker-apply',function(event,obj){
        var procdate=[];
        var tempDates=obj.value.split(' - ');
        if(tempDates.length < 2){
            // toastr["error"]("Please choose both start and end time!!! ");
            toastr.error('Please choose both start and end time!!! ', '', {timeOut: 5000});
        }
        $.each(tempDates, function(key, value){
            var time = moment.tz(moment(value, "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm"),"Asia/Singapore");
            procdate.push(time);    
        })
        start=procdate[0];
        end=procdate[1];
             
    }).bind('datepicker-close',function(obj){
        //
    });

    $('#date-range').data('dateRangePicker').setDateRange(moment.tz(start, "Asia/Singapore").format('DD/MM/YYYY HH:mm'),moment.tz(end, "Asia/Singapore").format('DD/MM/YYYY HH:mm'));


});

$(document).on("keyup", ".Editor-editor", function() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(saveNoteContent, 2000);
});

$(document).on("keydown", ".Editor-editor", function() {
    clearTimeout(typingTimer);
});
        
    

$(document).on("click", "#filter-star-note", function() {
    generateNoteUI(false,true);
    $("#filter-star-note").hide();
    $("#unfilter-star-note").show();
});

$(document).on("click", "#unfilter-star-note", function() {
    generateNoteUI(false,false);
    $("#filter-star-note").show();
    $("#unfilter-star-note").hide();
});

$(document).on("click", ".win-task", function() {
    var object = activitiesObject[$(this).attr("value")];
    object.good = true;
    object.done = true;

    var url = localDomain+'/stm/updateActivity'
    postRequest(url, object, function(e){
        if(e.result){
            toastr["success"]("Save task successfully");
            if(location.pathname == "/stm/home.html"){
                generateToDoList($("#dashboard-select").val());
            } else {
                if(location.pathname == "/stm/lead-browse.html"){
                    initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"lead",leadObject.id);
                } else {
                    initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"opportunity",opportunityObject.id);
                }
            }
        } else {
            toastr["error"]("Can not save task");
        }
    });
});

$(document).on("click", ".lose-task", function() {
    var object = activitiesObject[$(this).attr("value")];
    object.good = false;
    object.done = true;

    var url = localDomain+'/stm/updateActivity'
    postRequest(url, object, function(e){
        if(e.result){
            toastr["success"]("Save task successfully");
            if(location.pathname == "/stm/home.html"){
                generateToDoList($("#dashboard-select").val());
            } else {
                if(location.pathname == "/stm/lead-browse.html"){
                    initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"lead",leadObject.id);
                } else {
                    initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"opportunity",opportunityObject.id);
                }
            }
        } else {
            toastr["error"]("Can not save task");
        }
    });
});

$(document).on("click", ".delete-task", function() {
    console.log(this);
    var object = activitiesObject[$(this).attr("value")];
    object.good = false;
    object.done = true;

    var url = localDomain+'/stm/deleteActivity'
    postRequest(url, object, function(e){
        if(e.result){
            toastr["success"]("Delete task successfully");
            if(location.pathname == "/stm/home.html"){
                generateToDoList($("#dashboard-select").val());
            } else {
                if(location.pathname == "/stm/lead-browse.html"){
                    initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"lead",leadObject.id);
                } else {
                    initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"opportunity",opportunityObject.id);
                }
                
            }
        } else {
            toastr["error"]("Can not save task");
        }
    });
});

$(document).on("click", ".edit-task", function() {
    $('#update-due-picker').datetimepicker({
        format: 'DD/MM/YYYY HH:mm'
    });

    chosenActivity = activitiesObject[$(this).attr("value")];

    $("#update-task-subject").val(chosenActivity.subject);
    $("#update-task-comment").val(chosenActivity.comment);
    $("#update-due-value").val(moment.tz(chosenActivity.due, "Asia/Singapore").format('DD/MM/YYYY HH:mm'));

    $("#task-transfer-to").html('<option value="" disabled selected>Assign to</option>')
    $.each(usersObject, function(k,v){
        if(k != 0 && k!= 1){
            $("#task-transfer-to").append('<option value="'+k+'">Assign to '+v.firstName+'</option>');
        }
    });

    $("#task-transfer-to").val(usersObject[chosenActivity.ownerId].id);

    $("#updateTaskModal").modal('show');
    
});

$(document).on("click", "#update-task", function() {
    var object = chosenActivity;
    object.subject = $("#update-task-subject").val();
    object.comment = $("#update-task-comment").val();
    object.due = moment($("#update-due-value").val(), "DD/MM/YYYY HH:mm").valueOf();
    object.ownerId = $("#task-transfer-to").val();
    var url = localDomain+'/stm/updateActivity';
    postRequest(url, object, function(e){
        if(e.result){
            toastr["success"]("Update task successfully");
            if(location.pathname == "/stm/home.html"){
                generateToDoList($("#dashboard-select").val());
            } else {
                if(location.pathname == "/stm/lead-browse.html"){
                    initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"lead",leadObject.id);
                } else {
                    initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"opportunity",opportunityObject.id);
                }
                
            }
        } else {
            toastr["error"]("Can not update task");
        }
    });
});

function generateNoteUI(checkUrl, isStar){
    var noteUrl;

    if(location.pathname == "/stm/opportunity-browse.html"){
        noteUrl = localDomain+"/stm/getNoteByRelated?relatedType=opportunity&relatedId=" + getUrlParameter("id");
    } else if(location.pathname == "/stm/lead-browse.html"){
        noteUrl = localDomain+"/stm/getNoteByRelated?relatedType=lead&relatedId=" + getUrlParameter("id");
    } else {
        noteUrl = localDomain+"/stm/getNoteByOwner?ownerId=" + userInfo.id;
    }

    $.getJSON( noteUrl, {
    }).done(function(data) {
        generateNoteList(data, isStar);
        if(checkUrl && getUrlParameter("noteId")!= null && jQuery.isNumeric(getUrlParameter("noteId"))){
            showNote(notesObject[getUrlParameter("noteId")]);
            chosenNote = notesObject[getUrlParameter("noteId")];
        } else {
            showNote(noteList[noteList.length - 1]);
            chosenNote = noteList[noteList.length - 1];
        }
        $("#note-info").html("Total " + data.length + " notes");
    });
}

function showNote(noteObj){
    if(noteObj==null){
        noteObj= {};
        noteObj.subject = "New note";
        noteObj.content = "";
        noteObj.id = -1;
    }
    $("#note-subject").html(noteObj.subject);
    $(".Editor-editor").html(noteObj.content);
    $(".list-group-note").removeClass("list-group-item-success");
    $('.list-group-note[value="'+noteObj.id+'"]').addClass("list-group-item-success");
    chosenNote=noteObj;

    url = localDomain+'/stm/getRelatedByNoteId?noteId=' + noteObj.id;
    $.getJSON( url, {
    }).done(function(data) {
        $("#note-related-select").empty();
        for(var i=0; i< data.length; i++){
            $("#note-related-select").append('<option value="'+data[i].relatedId+'!@@@@@!'+data[i].relatedType+'!@@@@@!'+data[i].relatedName+'" selected="selected">'+data[i].relatedName+ ' (' + data[i].relatedType + ')'+'</option>');
        }

        $("#note-related-select").select2({
            closeOnSelect:false,
            dropdownCssClass : 'select-drop'
        });
    });
}

function generateNoteList(data,isStar){
    $("#note-list").empty();
    data.sort(sortByLastUpdate);
    noteList = data;
    for(var i =0; i < data.length; i++){
        if(isStar && !data[i].star){
            continue;
        }
        var noteObj = data[i];
        notesObject[noteObj.id]=noteObj;
        var div = generateNoteListItem(noteObj);
        $("#note-list").prepend(div);
    }
}

function generateNoteListItem(noteObj){
    var star;
    if(noteObj.star){
        star = "glyphicon-star";
    } else {
        star = "glyphicon-star-empty";
    }
    var content = '<div href="#" class="list-group-item list-group-note" value="'+noteObj.id+'"><div class="row"><div class="col-xs-10"><div class="note-item">'+ noteObj.subject +'</div><footer>Last modified <cite>'+moment.tz(noteObj.lastUpdate, "Asia/Singapore").format("DD/MM/YYYY H:mm:ss")+'</cite></footer></div><div class="col-xs-2"><button type="button" class="btn btn-link"><span class="star glyphicon '+star+'" value="'+noteObj.id+'"aria-hidden="true" style="color:orange;font-size: 180%;"></span></button></div></div></div>';
    return content;
}

function sortByLastUpdate(a,b){
    var aTime = a.lastUpdate;
    var bTime = b.lastUpdate;
    return ((aTime < bTime) ? -1 : ((aTime > bTime) ? 1 : 0));
}

function sortByTime(a,b){
    var aTime = a.time;
    var bTime = b.time;
    return ((aTime < bTime) ? -1 : ((aTime > bTime) ? 1 : 0));
}

function sortByDue(a,b){
    var aTime = a.due;
    var bTime = b.due;
    return ((aTime > bTime) ? -1 : ((aTime < bTime) ? 1 : 0));
}

function sortByDue1(a,b){
    var aTime = a.due;
    var bTime = b.due;
    return ((aTime < bTime) ? -1 : ((aTime > bTime) ? 1 : 0));
}

function sortByValue(a,b){
    var aTime = a.value;
    var bTime = b.value;
    return ((aTime > bTime) ? -1 : ((aTime < bTime) ? 1 : 0));
}

function sortByPrice(a,b){
    var aTime = a.price;
    var bTime = b.price;
    return ((aTime > bTime) ? -1 : ((aTime < bTime) ? 1 : 0));
}

//user is "finished typing," save to server
function saveNoteContent () {
    var url = localDomain+"/stm/updateNote";
    chosenNote.content = $(".Editor-editor").html();
    postRequest(url, chosenNote, function(e){
        if(e.result){
            toastr["success"]("Save successfully");
        } else {
            toastr["error"]("Error saving");
        }
    });
}

$(document).on("click", ".star", function() {
    var id = $(this).attr("value");
    var newStar;
    var object = notesObject[id];
    console.log(object);
    console.log(this);
    if(object.star == false){
        newStar = true;
    } else {
        newStar = false;
    }

    object.star = newStar;
    var url = localDomain+"/stm/updateNote";
    postRequest(url, object, function(e){
        if(e.result){
            toastr["success"]("Save successfully");
            notesObject[id] = object;
            if(newStar){
                $('.star[value="'+id+'"]').removeClass("glyphicon-star-empty").addClass("glyphicon-star");
            } else {
                $('.star[value="'+id+'"]').removeClass("glyphicon-star").addClass("glyphicon-star-empty");
            }
            
        } else {
            toastr["error"]("Error saving");
        }
    });
    
});

function initiateComment(dom,type,dealId){
    var url = localDomain+'/stm/getCommentByDeal?type='+type+'&dealId='+dealId;
    dom.empty();
    $(dom).prepend('<a href="#" class="list-group-item list-comment-item"><div class="row"><div class="col-xs-10"><h4><img src="'+userInfo.avatar+'" style="height: 30px;"> New Comment</h4></div><div class="col-xs-2"><button type="button" class="btn btn-primary btn-sm send-comment" data-toggle="tooltip" data-placement="bottom" title="Send" style="float:right;margin-right: 3%;"><span class="glyphicon glyphicon-send" aria-hidden="true"></span></div></div><textarea class="form-control" rows="3" id="new-comment" placeholder="New Comment"></textarea></a>');
    $.getJSON( url, {
    }).done(function(data) {
        
        var comments = data.sort(sortByTime);
        for(var i=comments.length-1; i>= 0; i--){
            var comment = comments[i];
            commentsObject[comment.id] = comment;
            var time = moment.tz(comment.time, "Asia/Singapore").format('MM/DD/YYYY H:mm:ss');
            $(dom).prepend('<a href="#" class="list-group-item list-comment-item"><div class="row"><div class="col-xs-10"><h4><img src="' +usersObject[comment.ownerId].avatar+'" style="height: 30px;"> '+ usersObject[comment.ownerId].firstName+ ' ' + usersObject[comment.ownerId].lastName +' <cite>'+time+'</cite></h4></div><div class="col-xs-2"><button type="button" class="btn btn-default btn-sm delete-comment" data-toggle="tooltip" data-placement="bottom" title="Delete" style="float:right;margin-right: 3%;"><span class="glyphicon glyphicon-trash" aria-hidden="true" id="'+comment.id+'"></span></div></div><p>'+comment.content+'</p></a>');
        }
    });
}

function initiateActivity(nextDom, pastDom,pastHeader,type,dealId){
    var url = localDomain+'/stm/getActivityByDeal?type='+type+'&dealId='+dealId;
    nextDom.empty();
    pastDom.empty();

    $.getJSON( url, {
    }).done(function(data) {
        
        // var next = data.sort(sortByDue);
        var next = new Array();
        var past = new Array();
        
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
            if(data[i].done){
                if(data[i].good){
                    data[i].color = "green";
                    data[i].resultIcon = 'glyphicon-thumbs-up';
                } else {
                    data[i].color = "red";
                    data[i].resultIcon = 'glyphicon-thumbs-down';
                }
                past.push(data[i]);
            } else {
                next.push(data[i]);
            }

            activitiesObject[data[i].id] = data[i];
        }

        next = next.sort(sortByDue);
        past = past.sort(sortByDue);

        for(var i =0; i < next.length; i++){
            var task = next[i];
            var type = task.type;
            var taskId = task.id;
            var time = moment.tz(task.due, "Asia/Singapore").format('MM/DD/YY H:mm');
            $(nextDom).append('<div class="row"><div class="col-xs-2"><a class="step-item-icon activity-next"> <span class="glyphicon '+task.icon+'" aria-hidden="true" style="color:white;font-size: 18px;"></span></a><div class="step-item-line"><div style="background-color:orange"></div></div></div><div class="col-xs-8" style="padding-left: 6px"><h5 class="opportunity-item-list-name"><span class="glyphicon glyphicon-flag" aria-hidden="true" style="color:orange;margin-right: 5px"></span>'+task.subject+'</h5><div class="side-list-item-info"><span style="font-style: italic"><strong>'+time+'</strong> - </span>'+task.comment+'</div></div><div class="col-xs-2"><div class="dropdown"><span class="glyphicon glyphicon-cog dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"></span><ul class="dropdown-menu pull-right" style="min-width: 50px"><li><a href="#" data-toggle="tooltip" data-placement="bottom" title="Success" class="win-task" value="'+taskId+'"><span class="glyphicon glyphicon-thumbs-up" aria-hidden="true" style="color:green"></span></a></li><li role="separator" class="divider"></li><li><a href="#" data-toggle="tooltip" data-placement="bottom" title="Lost" class="lose-task" value="'+taskId+'"><span class="glyphicon glyphicon-thumbs-down" aria-hidden="true" style="color:red"></span></a></li><li role="separator" class="divider"></li><li><a href="#" data-toggle="tooltip" data-placement="bottom" title="Delete" class="delete-task" value="'+taskId+'"><span class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red"></span></a></li><li role="separator" class="divider"></li><li><a href="#" data-toggle="tooltip" data-placement="bottom" title="Edit" class="edit-task" value="'+taskId+'"><span class="glyphicon glyphicon-edit" aria-hidden="true" style="color:black"></span></a></li></ul></div></div></div>');
        }

        if(past.length > 0 ){
            $(pastHeader).empty();
            $(pastHeader).append('<div class="row" style="margin-bottom: 10px;"><div class="col-xs-8"><h3>Past Activities</h3></div></div>');
        }
        for(var i =0; i < past.length; i++){
            var task = past[i];

            var time = moment.tz(task.due, "Asia/Singapore").format('MM/DD/YY H:mm');
            $(pastDom).append('<div class="row"><div class="col-xs-2"><a class="step-item-icon" style="background-color:'+task.color+'"> <span class="glyphicon '+task.icon+'" aria-hidden="true" style="color:white;font-size: 18px;"></span></a><div class="step-item-line"><div style="background-color:'+task.color+'"></div></div></div><div class="col-xs-10"  style="padding-left: 6px"><h5 class="opportunity-item-list-name"><span class="glyphicon '+task.resultIcon+'" aria-hidden="true" style="color:'+task.color+';margin-right: 5px"></span>'+task.subject+'</h5><div class="side-list-item-info"><span style="font-style: italic"><strong>'+time+'</strong> - </span>'+task.comment+'</div></div></div>');
        }
    });
}

function calculateTotalValueByStage(data){
    var result={};
    result.qualification = 0;
    result.analysis = 0;
    result.proposal = 0;
    result.negotiation = 0;
    result.close = 0;

    for(var i =0; i < data.length; i++){
        var obj = data[i];
        var stage = obj.stage;
        var value = obj.value;
        if(stage == "qualification"){
            result.qualification += value;
        } else if(stage == "analysis"){
            result.qualification += value;
            result.analysis += value
        } else if(stage == "proposal"){
            result.qualification += value;
            result.analysis += value;
            result.proposal += value;
        } else if(stage == "negotiation"){
            result.qualification += value;
            result.analysis += value;
            result.proposal += value;
            result.negotiation += value;
        } else if(stage == "close"){
            result.qualification += value;
            result.analysis += value;
            result.proposal += value;
            result.negotiation += value;
            result.close += value;
        }
    }       

    return result;
}

function generateMainCarInfoTable(){
    var myCarStyle = carsObject[$(".main-dealer-car-list").val()].styleId;
    var competitorCarStyle = null;
    var obj={};
    // obj.price = {};
    // obj.price.my = parseInt(carsObject[$(".main-dealer-car-list").val()].price);
    // obj.price.name = "Price";

    if(competitor==true){
        competitorCarStyle = $("#main-competitor-style").val();
        $("#main-car-info-table").hide();
        $("#main-car-compare-table").show();
    } else {
        $("#main-car-info-table").show();
        $("#main-car-compare-table").hide();
    }

    obj.cylinder = {"name":"Engine Cylinder"};
    obj.size = {"name":"Engine Size"};
    obj.displacement = {"name":"Engine Displacement"};
    obj.horsepower = {"name":"Engine Power"};
    obj.torque = {"name":"Engine Torque"};
    obj.totalValves = {"name":"Engine Total Valves"};
    obj.type = {"name":"Engine Type"};    
    
    $.ajax({
        url: 'https://api.edmunds.com/api/vehicle/v2/styles/'+myCarStyle+'/engines?fmt=json&api_key=qth4vtbc2sy8pm6w3vm7ke7s',
        async: false,
        success: function(data){
            var engine = data.engines[0];

            $.each(obj,function(k,v){
                if(k!="price"){
                    obj[k].my = engine[k];
                }
            });
        }
    })

    if(competitor==true){
        $.ajax({
            url: 'https://api.edmunds.com/api/vehicle/v2/styles/'+competitorCarStyle+'/engines?fmt=json&api_key=qth4vtbc2sy8pm6w3vm7ke7s',
            async: false,
            success: function(data){
                var engine = data.engines[0];

                $.each(obj,function(k,v){
                    if(k!="price"){
                        obj[k].com = engine[k];
                    }
                });
            }
        })
    }
    
    console.log(obj);

    var dataTable =new Array();

    $.each(obj,function(k,v){
        if($.isNumeric(v.my) && v.com != null){
            if(v.my > v.com){
                v.compare = 1;
                v.compareDiv = '<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green"></span>';
            } else if(v.my == v.com){
                v.compare = 0;
                v.compareDiv = "equal";
            } else if(v.my < v.com){
                v.compare = -1;
                v.compareDiv = '<span class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red"></span>';
            }
        } else {
            v.compareDiv = "equal";
        }

        dataTable.push(v);
    });

    if(competitor==true){
        showMainCarCompareTable(dataTable);
    } else {
        showMainCarInfoTable(dataTable);
    }


}

function generateMainEquipmentTable(){
    var name =["Electric windows","Cruise control","Paddle shift controls","Adjustable seats","Mobile Connectivity","Fog Lights","Electric Mirrors","Power Steering","Sunroof","Map"];
    var my = [1,1,1,0,1,1,1,1,0,1];
    var com = [1,1,1,0,1,1,1,0,1,0];
    var data = new Array();
    for(var i=0; i< name.length; i++){
        var tmp ={};
        tmp.name = name[i];
        if(my[i]==1){
            tmp.my = '<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green"></span>'; 
        } else {
            tmp.my = '<span class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red"></span>'; 
        }

        if(com[i]==1){
            tmp.com = '<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green"></span>'; 
        } else {
            tmp.com = '<span class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red"></span>'; 
        }
        
        data.push(tmp);
    }

    var table = $('#main-equipment-info-table').DataTable({
        "iDisplayLength": 10,
        "paging":   false,
        "info":     false,
        "searching": false,
        "bDestroy": true,
        "aaData": data,
        "columnDefs": [
            { "visible": competitor, "targets": 2 },
        ],
        "aoColumns": [
            { "mDataProp": "name" },
            { "mDataProp": "my" },
            { "mDataProp": "com" }
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });
}

function generateMainSafetyTable(){
    var name =["Seat Belts","Air Bags","Head Injury Protection","Head Restraints","Antilock Brake System","Traction Control","All-Wheel Drive","Electronic Stability Control","Anti-lock braking system (ABS)","Safety cage"]
    var my = [1,1,1,1,1,0,1,0,1,1];
    var com = [1,1,1,0,1,0,1,0,0,1];
    var data = new Array();
    for(var i=0; i< name.length; i++){
        var tmp ={};
        tmp.name = name[i];
        if(my[i]==1){
            tmp.my = '<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green"></span>'; 
        } else {
            tmp.my = '<span class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red"></span>'; 
        }

        if(com[i]==1){
            tmp.com = '<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green"></span>'; 
        } else {
            tmp.com = '<span class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red"></span>'; 
        }
        data.push(tmp);
    }

    var table = $('#main-safety-info-table').DataTable({
        "iDisplayLength": 10,
        "paging":   false,
        "info":     false,
        "searching": false,
        "bDestroy": true,
        "columnDefs": [
            { "visible": competitor, "targets": 2 },
        ],
        "aaData": data,
        "aoColumns": [
            { "mDataProp": "name" },
            { "mDataProp": "my" },
            { "mDataProp": "com" }
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });
}

function showMainCarCompareTable(dataTable){
    $('#main-car-compare-table').show();
    data = dataTable;
    var table = $('#main-car-compare-table').DataTable({
        "iDisplayLength": 10,
        "paging":   false,
        "info":     false,
        "searching": false,
        "bDestroy": true,
        "aaData": data,
        "aoColumns": [
            { "mDataProp": "name" },
            { "mDataProp": "my" },
            { "mDataProp": "com" },
            { "mDataProp": "compareDiv" },
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });
}

function showMainCarInfoTable(dataTable){
    var table = $('#main-car-info-table').DataTable({
        "iDisplayLength": 12,
        "bDestroy": true,
        "paging":   false,
        "info":     false,
        "searching": false,
        "aaData": dataTable,
        "aoColumns": [
            { "mDataProp": "name" },
            { "mDataProp": "my" }
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });
}


function initiateCarInfo(){
    $("#main-comparasion-area").hide();
    $("#main-competitor-area").hide();
    $("#main-remove-competitor").hide();
    $.getJSON( localDomain+'/stm/getAllCar', {
    }).done(function(data) {
        $(".main-dealer-car-list").html('<option value="" disabled selected>Select Car</option>');
        data.sort(sortByPrice);
        for(var i=0; i < data.length; i++){
            var tmp=data[i];
            carsObject[tmp.id] = tmp;
            $(".main-dealer-car-list").append('<option value="'+tmp.id+'">($'+tmp.price/1000+'k) '+tmp.name+'</option>')
        }
    });
}