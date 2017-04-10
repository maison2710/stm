var accountArray = new Array();
var accountsObject = {};
var chosenAccount = null;
var contactsObject = {};

$(document).ready(function() {
	$("#account-layout").layout({
        resizeWhileDragging: true,
        initClosed: false,
        west__maxSize: .8,
        west__minSize: .75,
        useStateCookie:true, 
        onresize_end:function(){
            $(window).resize();
        }
    });


    initiateAccountPage();
});

$(document).on("click", "#new-contact", function() {
    $("#contact-modal-title").html("New Contact");
    $("#contact-name").val("");
    $("#contact-phone").val("");
    $("#contact-email").val("");
    $("#contact-title").val("");
    $("#contact-category").val("");
    $("#contactModal").modal("show");
});

$(document).on("click", "#submit-contact", function() {
    var object = {};
    object.name=$("#contact-name").val()!=null? $("#contact-name").val() : "";
    object.phone=$("#contact-phone").val()!=null? $("#contact-phone").val() : "";
    object.email=$("#contact-email").val()!=null? $("#contact-email").val() : "";
    object.title=$("#contact-title").val()!=null? $("#contact-title").val() : "";
    object.category=$("#contact-category").val()!=null? $("#contact-category").val() : "";
    object.start=moment().valueOf();
    object.opportunityId=-1;
    object.ownerId=chosenAccount.ownerId;
    object.accountId=chosenAccount.id;

    var contactUrl = localDomain+"/stm/insertContact";
    postRequest(contactUrl, object, function(e){
        if(e.result != null){
            var accountId = e.result; 
            toastr["success"]("Add contact successfully");
            initiateContact($("#contact-list"),chosenAccount.id);
        } else {
            toastr["error"]("Can not add contact");
        }
    });
});

$(document).on("click", ".delete-contact", function() {
    var url = localDomain+"/stm/deleteContact";
    var obj = contactsObject[$(this).attr("value")];
    console.log(obj);
    postRequest(url, obj, function(e){
        if(e.result){
            toastr["success"]("Delete successfully");
            initiateContact($("#contact-list"),chosenAccount.id);
        } else {
            toastr["error"]("Error deleting");
        }
    });
});

function initiateAccountPage(){
    var url = localDomain+"/stm/getAllAccount";
    $.getJSON( url, {
    }).done(function(data) {
        accountArray = process(data);
        generateAccountTable(accountArray);
    });
}

function generateAccountTable(data){
    console.log(data);
    console.log($('#account-table'))
    var search ="";

    if(getUrlParameter("search") != null){
        search = getUrlParameter("search");
    }

    var table = $('#account-table').DataTable({
        "iDisplayLength": 25,
        "columnDefs": [
            { "visible": false, "targets": 7 },
            { "iDataSort": 2, "aTargets": [ 7 ] }
        ],
        "order": [[ 7, "desc" ]],
        "bDestroy": true,
        "aaData": data,
        "oSearch": {"sSearch": search},
        "aoColumns": [
            { "mDataProp": "name" },
            { "mDataProp": "startDate" },
            { "mDataProp": "duration" },
            { "mDataProp": "winRate" },
            { "mDataProp": "record" },
            { "mDataProp": "size" },
            { "mDataProp": "industry" },
            { "mDataProp": "lastUpdate" },
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });
    $("#info").html(data.length + " accounts showing");
    $(window).resize();

    $('#account-table tbody').off().on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
            chosenAccount = null;
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            chosenAccount = table.row( this ).data();

            $("#company").html(chosenAccount.name);
            initiateContact($("#contact-list"),chosenAccount.id);
            initiateOpportunity($("#opportunity-list"),chosenAccount.id);
        }
    } );
}

function process(data){
    var result = new Array();

    for(var i =0; i<data.length; i++){
        data[i].duration = moment.duration(data[i].lastUpdate - moment().valueOf(), "milliseconds").humanize(true);
        data[i].winRate = "65%";
        data[i].record =1;
        data[i].startDate = moment.tz(data[i].start, "Asia/Singapore").format('MM/DD/YYYY')

        accountsObject[data[i].id]=data[i]; 
        result.push(data[i]);
    }

    return result;
}

function initiateOpportunity(dom,accountId){
    var url = localDomain+'/stm/getOpportunityByAccount?accountId='+accountId;

     $.getJSON( url, {
    }).done(function(data) {
        for(var i =0; i < data.length;i++){
            data[i].dueDate = moment.tz(data[i].due, "Asia/Singapore").format('MM/DD/YYYY');
            data[i].money = "$" + data[i].value/1000 + "K";
            data[i].href = 'opportunity-browse.html?id=' + data[i].id;
            data[i].nameDiv = '<a href="'+data[i].href+'">'+data[i].name+'</a>';
        }

        var table = $('#opportunity-table').DataTable({
        "bDestroy": true,
        "aaData": data,
        "paging":   false,
        "info":     false,
        "searching": false,
        "aoColumns": [
            { "mDataProp": "nameDiv" },
            { "mDataProp": "money" },
            { "mDataProp": "dueDate" }
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });
        
    });
}

function  initiateContact(dom,accountId){
    var url = localDomain+'/stm/getContactByAccount?accountId='+accountId;

    $.getJSON( url, {
    }).done(function(data) {
        $(dom).empty();
        $(dom).append('<div><div class="row" style="margin-bottom: 10px;"><div class="col-xs-8"><h3>Contacts ('+data.length+')</h3></div><div class="col-xs-4"  style="padding-left: 5px"><button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="bottom" title="More" id="new-contact" style="float:right;margin-right: 10%;"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button></div></div></div>');
        
        var contacts = new Array();

        for(var i=0; i <data.length;i++){
            if(data[i].category == "Decision Maker"){
                data[i].color = "red";
                contacts.push(data[i]);
            }
        }

        for(var i=0; i <data.length;i++){
            if(data[i].category == "Influencer"){
                data[i].color = "orange";
                contacts.push(data[i]);
            }
        }

        for(var i=0; i <data.length;i++){
            if(data[i].category == "Inquirer"){
                data[i].color = "blue";
                contacts.push(data[i]);
            }
        }


        for(var i=0; i<contacts.length; i++){
           var contact = contacts[i];
           // contact.accountId=accountId;
           contactsObject[contact.id]=contact;

           $(dom).append('<div class="row"><div class="col-xs-2"><span class="glyphicon glyphicon-star" aria-hidden="true" style="color:'+contact.color+';font-size:25px;border: 1px solid #ddd;border-radius:4px;margin-left: 10px;"></span></div><div class="col-xs-8" style="padding-left: 6px"><h5 class="opportunity-item-list-name" style="margin: :0px">'+contact.name+'</h5><div class="side-list-item-info"><strong>'+contact.category+'</strong> - '+contact.title+'</div><div class="side-list-item-info">'+contact.phone+' - '+contact.email+'</div></div><div class="col-xs-2"><div class="dropdown"><span class="glyphicon glyphicon-cog dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" value="'+contact.id+'"></span><ul class="dropdown-menu pull-right" style="min-width: 50px"><li><a href="#" data-toggle="tooltip" data-placement="bottom" title="Delete" class="delete-contact" value="'+contact.id+'"><span class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red"></span></a></li><li role="separator" class="divider"></li><li><a href="#" data-placement="bottom" title="Edit" class="edit-contact" value="'+contact.id+'"><span class="glyphicon glyphicon-edit" aria-hidden="true" style="color:black"></span></a></li></ul></div></div></div>');

        }
    });
}