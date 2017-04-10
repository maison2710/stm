var commentsObject = {};
var contactsObject = {};
var leadObject = {};

$(document).ready(function() {
	$("#lead-layout").layout({
        resizeWhileDragging: true,
        initClosed: false,
        east__maxSize: .30,
        east__minSize: .21,
        useStateCookie:true, 
        onresize_end:function(){
            $(window).resize();
        }
    });


    initiateLeadPage();

    $("#rateYo").rateYo().on("rateyo.change", function (e, data) {
        var rating = data.rating;
        $("#rate-value").html(rating.toFixed(1));
    });

    $("#edit-lead").click(function(){
        $("#lead-modal-title").html("Edit Lead");
        $("#submit-lead").attr("value","edit");
        $("#modal-name").val(leadObject.name != null?leadObject.name : "");
        $("#modal-company").val(leadObject.company!= null?leadObject.company : "");
        $("#modal-address").val(leadObject.address!= null?leadObject.address : "");
        $("#modal-phone").val(leadObject.phone!= null?leadObject.phone : "");
        $("#modal-email").val(leadObject.email!= null?leadObject.email : "");
        $("#modal-size").val(leadObject.size);
        $("#modal-title").val(leadObject.title!= null?leadObject.title : "");
        $("#modal-industry").val(leadObject.industry!= null?leadObject.industry : "");
        $("#modal-source").val(leadObject.source!= null?leadObject.source : "");
        $("#modal-status").val(leadObject.status!= null?leadObject.status : "");
        $("#rateYo").rateYo("option", "rating", leadObject.rate);
        $("#rate-value").html(leadObject.rate);
        $('#leadModal').modal('show');
    });

    $(".set-status, #convert-lead").click(function(){
        var status = $(this).attr("value");
        var url = localDomain+"/stm/updateLead";

        var object = leadObject;
        object.status = status.toLowerCase();
        object.lastUpdate= moment().valueOf();

        postRequest(url, object, function(e){
            if(e.result){
                toastr["success"]("Change status successfully");
                $('#leadModal').modal('hide');
                initiateLeadPage();
            } else {
                toastr["error"]("Can not change status");
            }
        });
    })

    $("#status-qualified").click(function(){
        $('#convertLeadModal').modal('show');
    });

    //name,size,address,phone,industry,owner_id,start,is_star
    //name,title,account_id,email,phone,start,owner_id
    $("#convert-lead").click(function(){
        var account = {};
        account.name = leadObject.company;
        account.size = leadObject.size;
        account.industry = leadObject.industry;
        account.ownerId = leadObject.ownerId;
        account.start = moment().valueOf();
        account.address = "";
        account.phone = "";
        account.star = false;

        var contact = {};
        contact.name = leadObject.name;  
        contact.title = leadObject.title;
        contact.email = leadObject.email;
        contact.phone = leadObject.phone;
        contact.start = moment().valueOf();
        contact.ownerId = leadObject.ownerId;
        contact.category = $("#contact-category").val();

        var opportunity = {};
        opportunity.name = $("#opportunity-name").val();
        opportunity.start = moment().valueOf();
        opportunity.end = -1;
        opportunity.due = moment($("#due-value").val(), "DD/MM/YYYY").valueOf();
        opportunity.ownerId = leadObject.ownerId;
        opportunity.stage = "qualification";
        opportunity.status = "active";
        opportunity.value = $("#opportunity-value").val();
        opportunity.carType = $("#car-type").val();
        opportunity.purpose = $("#opportunity-purpose").val();
        opportunity.quantity = $("#opportunity-quantity").val();
        opportunity.lastUpdate = opportunity.start;
        opportunity.model=0;

        var accountUrl = localDomain+"/stm/insertAccount";
        postRequest(accountUrl, account, function(e){
            if(e.result != null){
                var accountId = e.result; 
                contact.accountId = accountId;
                opportunity.accountId = accountId;

                var opportunityUrl = localDomain+"/stm/insertOpportunity";
                postRequest(opportunityUrl, opportunity, function(e){
                    if(e.result != null){
                        var opportunityId = e.result; 
                        contact.opportunityId = opportunityId;

                        var contactUrl = localDomain+"/stm/insertContact";
                        postRequest(contactUrl, contact, function(e){
                            if(e.result != null){
                                var accountId = e.result; 
                                toastr["success"]("Convert lead successfully");
                            } else {
                                toastr["error"]("Can not convert contact");
                            }
                        });
                    } else {
                        toastr["error"]("Can not add opportunity");
                    }
                });

            } else {
                toastr["error"]("Can not add account");
            }
        });
    });

    $('#delete-lead').click( function () {
        $('#deleteLeadModal').modal('show');
    });

    $('#confirm-delete-lead').click( function () {
        var url = localDomain+"/stm/deleteLead";
        postRequest(url, leadObject, function(e){
            if(e.result){
                toastr["success"]("Delete lead successfully");
                location.href = "lead.html";
            } else {
                toastr["error"]("Can not delete lead");
            }
        });
        
    });

    $("#submit-lead").click(function(){
        var object = {};
        var url = localDomain+"/stm/updateLead";
        object.id = leadObject.id;
       
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
        object.ownerId= userInfo.id;
        object.rate=parseFloat($("#rateYo").rateYo("rating").toFixed(1));
        object.lastUpdate= moment().valueOf();

        postRequest(url, object, function(e){
            if(e.result){
                toastr["success"]("Edit lead successfully");
                $('#leadModal').modal('hide');
                initiateLeadPage();
            } else {
                toastr["error"]("Can not edit lead");
            }
        });
    });

    $( '#taskModal' ).on( 'shown.bs.modal', function ( event ) {
        $('#call-due-picker').datetimepicker({
            format: 'DD/MM/YYYY HH:mm'
        });
        $('#meeting-due-picker').datetimepicker({
            format: 'DD/MM/YYYY HH:mm'
        });
        $('#mail-due-picker').datetimepicker({
            format: 'DD/MM/YYYY HH:mm'
        });
        $('#others-due-picker').datetimepicker({
            format: 'DD/MM/YYYY HH:mm'
        });

        $(".to-list").html('<option value="" disabled selected>To</option>');
        $(".to-list").append('<option value="'+leadObject.name+'">'+leadObject.name+'</option>');
    });

    $("#save-call").click(function(){
        var object = {};
        object.subject = $("#call-action").val();
        if($("#call-to").val() != null){
            object.subject += " to " + $("#call-to").val();
        }
        object.comment = $("#call-comment").val();
        object.priority = "";
        object.due = moment($("#call-due-value").val(), "DD/MM/YYYY HH:mm").valueOf();
        object.done = 0;
        object.ownerId = leadObject.ownerId;
        object.good = 0;
        object.type = "lead";
        object.action = "call";
        object.dealId =  leadObject.id;

        var url = localDomain+"/stm/insertActivity";
        postRequest(url, object, function(e){
            if(e.hasOwnProperty("activityId")){
                var relatedUrl= localDomain+"/stm/insertActivityRelated";
                var relatedObj = {};
                // var tmp = e.val.split("!@@@@@!");
                relatedObj.parentId = e.activityId;
                relatedObj.relatedId = leadObject.id;
                relatedObj.relatedType = "lead";
                relatedObj.relatedName = leadObject.name;
                postRequest(relatedUrl, relatedObj, function(e){
                    if(e.result){
                        toastr["success"]("Save task successfully");
                        initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"lead",leadObject.id);
                    } else {
                        toastr["error"]("Can not save task");
                    }
                });
            } else {
                toastr["error"]("Error saving");
            }
        });
    });

    $("#save-meeting").click(function(){
        var object = {};
        object.subject = $("#meeting-action").val();
        if($("#meeting-to").val() != null){
            object.subject += " to " + $("#meeting-to").val();
        }
        object.comment = $("#meeting-comment").val();
        object.priority = "";
        object.due = moment($("#meeting-due-value").val(), "DD/MM/YYYY HH:mm").valueOf();
        object.done = 0;
        object.ownerId = leadObject.ownerId;
        object.good = 0;
        object.type = "lead";
        object.action = "meeting";
        object.dealId =  leadObject.id;

        var url = localDomain+"/stm/insertActivity";
        postRequest(url, object, function(e){
            if(e.hasOwnProperty("activityId")){
                var relatedUrl= localDomain+"/stm/insertActivityRelated";
                var relatedObj = {};
                // var tmp = e.val.split("!@@@@@!");
                relatedObj.parentId = e.activityId;
                relatedObj.relatedId = leadObject.id;
                relatedObj.relatedType = "lead";
                relatedObj.relatedName = leadObject.name;
                postRequest(relatedUrl, relatedObj, function(e){
                    if(e.result){
                        toastr["success"]("Save task successfully");
                        initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"lead",leadObject.id);
                    } else {
                        toastr["error"]("Can not save task");
                    }
                });
            } else {
                toastr["error"]("Error saving");
            }
        });
    });

    $("#save-mail").click(function(){
        var object = {};
        object.subject = $("#mail-action").val();
        if($("#mail-to").val() != null){
            object.subject += " to " + $("#meeting-to").val();
        }
        object.comment = $("#mail-comment").val();
        object.priority = "";
        object.due = moment($("#mail-due-value").val(), "DD/MM/YYYY HH:mm").valueOf();
        object.done = 0;
        object.ownerId = leadObject.ownerId;
        object.good = 0;
        object.type = "lead";
        object.action = "mail";
        object.dealId =  leadObject.id;

        var url = localDomain+"/stm/insertActivity";
        postRequest(url, object, function(e){
            if(e.hasOwnProperty("activityId")){
                var relatedUrl= localDomain+"/stm/insertActivityRelated";
                var relatedObj = {};
                // var tmp = e.val.split("!@@@@@!");
                relatedObj.parentId = e.activityId;
                relatedObj.relatedId = leadObject.id;
                relatedObj.relatedType = "lead";
                relatedObj.relatedName = leadObject.name;
                postRequest(relatedUrl, relatedObj, function(e){
                    if(e.result){
                        toastr["success"]("Save task successfully");
                        initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"lead",leadObject.id);
                    } else {
                        toastr["error"]("Can not save task");
                    }
                });
            } else {
                toastr["error"]("Error saving");
            }
        });
    });

    $("#save-others").click(function(){
        var object = {};
        object.subject = $("#others-action").val();
        object.comment = $("#others-comment").val();
        object.priority = "";
        object.due = moment($("#others-due-value").val(), "DD/MM/YYYY HH:mm").valueOf();
        object.done = 0;
        object.ownerId = leadObject.ownerId;
        object.good = 0;
        object.type = "lead";
        object.action = "others";
        object.dealId =  leadObject.id;

        var url = localDomain+"/stm/insertActivity";
        postRequest(url, object, function(e){
            if(e.hasOwnProperty("activityId")){
                var relatedUrl= localDomain+"/stm/insertActivityRelated";
                var relatedObj = {};
                // var tmp = e.val.split("!@@@@@!");
                relatedObj.parentId = e.activityId;
                relatedObj.relatedId = leadObject.id;
                relatedObj.relatedType = "lead";
                relatedObj.relatedName = leadObject.name;
                postRequest(relatedUrl, relatedObj, function(e){
                    if(e.result){
                        toastr["success"]("Save task successfully");
                        initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"lead",leadObject.id);
                    } else {
                        toastr["error"]("Can not save task");
                    }
                });
            } else {
                toastr["error"]("Error saving");
            }
        });
    });  

    // $("#info-car").click(function(){
    //     $("#yourCarModal").modal('show');
    // });

});

$(document).on("click", "#new-task", function() {
    $("#task-title").html("New Task");
    $(".task-subject").val("");
    $(".task-comment").val("");
    $(".task-owner").append('<option value="'+userInfo.id+'">'+userInfo.firstName +" "+userInfo.lastName+'</option>');

    $.each(usersObject, function(k, v) {
        if(k != userInfo.id){
            $("#task-owner").append('<option value="'+k+'">'+v.firstName +" "+v.lastName+'</option>');
        }
    });
    $("#taskModal").modal("show");
});

$(document).on("click", ".send-comment", function() {
    var comment = {};
    comment.content = $("#new-comment").val();
    comment.time = moment().valueOf();
    comment.ownerId = userInfo.id;
    comment.type = "lead";
    comment.dealId = leadObject.id;

    var url = localDomain+"/stm/insertComment";
    postRequest(url, comment, function(e){
        if(e.result){
            initiateComment($("#comment-list"),"lead",leadObject.id);
        } else {
            toastr["error"]("Error saving");
        }
    });
});

function initiateLeadPage(){
    $('#due-picker').datetimepicker({
        format: 'DD/MM/YYYY'
    });
    var leadId = getUrlParameter("id");
    if(leadId== null){
        location.href = "lead.html";
    }
    var url = localDomain+'/stm/getLeadById?id='+leadId; 

    $.getJSON( url, {
    }).done(function(data) {
        leadObject = data;

        initiateComment($("#comment-list"),"lead",leadObject.id);
        $("#lead-panel-title").html(leadObject.name);
        $("#lead-company").html("Company - " + leadObject.company);
        $("#lead-title").html("Title - " + leadObject.title);
        $("#lead-phone").html("Phone - " + leadObject.phone);
        $("#lead-email").html("E-mail - " + leadObject.email);
        initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"lead",leadObject.id);
        generateLeadPipeline(leadObject);
    });
}

function generateLeadPipeline(lead){
    var status = lead.status;

    $("#lead-progress-pipeline").empty();

    $("#lead-progress-pipeline").append('<div class="progress-bar progress-bar-success" style="width: 33%;margin-right: 0.5%;font-size: 18px;padding-top: 3px"><span class="glyphicon glyphicon-ok" tyle="margin-right:5%"></span>Open</div>');

    if(status == "open"){
        $("#lead-progress-pipeline").append('<div class="progress-bar progress-bar-warning" style="width: 33%;margin-right: 0.5%;font-size: 18px;padding-top: 3px"><span style="margin-right:5%"></span>Contacted</div><div class="progress-bar progress-bar-warning" style="width: 33%;font-size: 18px;padding-top: 3px"><span></span>Qualification</div>');
    } else if(status == "contacted"){
        $("#lead-progress-pipeline").append('<div class="progress-bar progress-bar-success" style="width: 33%;margin-right: 0.5%;font-size: 18px;padding-top: 3px"><span class="glyphicon glyphicon-ok" style="margin-right:5%"></span>Contacted</div><div class="progress-bar progress-bar-warning" style="width: 33%;font-size: 18px;padding-top: 3px"><span></span>Qualification</div>');
    } else if(status == "qualified"){
        $("#lead-progress-pipeline").append('<div class="progress-bar progress-bar-success" style="width: 33%;margin-right: 0.5%;font-size: 18px;padding-top: 3px"><span class="glyphicon glyphicon-ok" style="margin-right:5%"></span>Contacted</div><div class="progress-bar progress-bar-success" style="width: 33%;font-size: 18px;padding-top: 3px"><span class="glyphicon glyphicon-ok"></span>Qualified</div>');
    } else if(status == "unqualified"){
        $("#lead-progress-pipeline").append('<div class="progress-bar progress-bar-success" style="width: 33%;margin-right: 0.5%;font-size: 18px;padding-top: 3px"><span class="glyphicon glyphicon-ok" style="margin-right:5%"></span>Contacted</div><div class="progress-bar progress-bar-danger" style="width: 33%;font-size: 18px;padding-top: 3px"><span class="glyphicon glyphicon-remove"></span>Unqualified</div>');
    }
}
