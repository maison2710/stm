var commentsObject = {};
var contactsObject = {};
var opportunityObject = {};
var carsObject = {};
var analysisObject = {};
var chosenProposal;
var promotionObject;

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

    initiateOpportunityPage();

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

        $.each(contactsObject, function(k, v) {
            $(".to-list").append('<option value="'+contactsObject[k].name+'">'+v.name+'</option>');
        });
    });

    $(window).resize(function() {
        if($("#car-trend-graph").highcharts() != null){
            $("#car-trend-graph").highcharts().setSize($("#car-trend-graph").width(), 400, doAnimation = true);
        }
    });
    $('#opportunity-pipeline-tabs a[href="#negotiation-stage"]').on('shown.bs.tab', function (e) {
        $("#car-trend-graph").highcharts().setSize($("#car-trend-graph").width(), 400, doAnimation = true);
        // $("#current-payment").html("Expected Payment - $" + carsObject[opportunityObject.model].price*opportunityObject.quantity);
        // $("#current-profit").html("Expected Profit - $" + carsObject[opportunityObject.model].profit*opportunityObject.quantity);
        var maxDiscount = 100*carsObject[opportunityObject.model].profit/carsObject[opportunityObject.model].price; 
        $("#maximum-discount").html("Maximum Discount - " + maxDiscount.toFixed(2) + "%");
        generatePromotion();
    })

    $("#estimate-price").click(function(){
        generatePromotion();
    });

    $("#submit-opportunity-transfer").click(function(){
        if($("#modal-transfer-owner").val() != null && $("#modal-transfer-owner").val().length > 0){
            var newOwnerId = $("#modal-transfer-owner").val();
            var obj = opportunityObject;
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
            acc.id = opportunityObject.accountId;
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
        object.ownerId = opportunityObject.ownerId;
        object.good = 0;
        object.type = "opportunity";
        object.action = "call";
        object.dealId =  opportunityObject.id;

        var url = localDomain+"/stm/insertActivity";
        postRequest(url, object, function(e){
            if(e.hasOwnProperty("activityId")){
                var relatedUrl= localDomain+"/stm/insertActivityRelated";
                var relatedObj = {};
                // var tmp = e.val.split("!@@@@@!");
                relatedObj.parentId = e.activityId;
                relatedObj.relatedId = opportunityObject.id;
                relatedObj.relatedType = "opportunity";
                relatedObj.relatedName = opportunityObject.name;
                postRequest(relatedUrl, relatedObj, function(e){
                    if(e.result){
                        toastr["success"]("Save task successfully");
                        initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"opportunity",opportunityObject.id);
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
        object.ownerId = opportunityObject.ownerId;
        object.good = 0;
        object.type = "opportunity";
        object.action = "meeting";
        object.dealId =  opportunityObject.id;

        var url = localDomain+"/stm/insertActivity";
        postRequest(url, object, function(e){
            if(e.hasOwnProperty("activityId")){
                var relatedUrl= localDomain+"/stm/insertActivityRelated";
                var relatedObj = {};
                // var tmp = e.val.split("!@@@@@!");
                relatedObj.parentId = e.activityId;
                relatedObj.relatedId = opportunityObject.id;
                relatedObj.relatedType = "opportunity";
                relatedObj.relatedName = opportunityObject.name;
                postRequest(relatedUrl, relatedObj, function(e){
                    if(e.result){
                        toastr["success"]("Save task successfully");
                        initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"opportunity",opportunityObject.id);
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
        object.ownerId = opportunityObject.ownerId;
        object.good = 0;
        object.type = "opportunity";
        object.action = "mail";
        object.dealId =  opportunityObject.id;

        var url = localDomain+"/stm/insertActivity";
        postRequest(url, object, function(e){
            if(e.hasOwnProperty("activityId")){
                var relatedUrl= localDomain+"/stm/insertActivityRelated";
                var relatedObj = {};
                // var tmp = e.val.split("!@@@@@!");
                relatedObj.parentId = e.activityId;
                relatedObj.relatedId = opportunityObject.id;
                relatedObj.relatedType = "opportunity";
                relatedObj.relatedName = opportunityObject.name;
                postRequest(relatedUrl, relatedObj, function(e){
                    if(e.result){
                        toastr["success"]("Save task successfully");
                        initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"opportunity",opportunityObject.id);
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
        object.ownerId = opportunityObject.ownerId;
        object.good = 0;
        object.type = "opportunity";
        object.action = "others";
        object.dealId =  opportunityObject.id;

        var url = localDomain+"/stm/insertActivity";
        postRequest(url, object, function(e){
            if(e.hasOwnProperty("activityId")){
                var relatedUrl= localDomain+"/stm/insertActivityRelated";
                var relatedObj = {};
                // var tmp = e.val.split("!@@@@@!");
                relatedObj.parentId = e.activityId;
                relatedObj.relatedId = opportunityObject.id;
                relatedObj.relatedType = "opportunity";
                relatedObj.relatedName = opportunityObject.name;
                postRequest(relatedUrl, relatedObj, function(e){
                    if(e.result){
                        toastr["success"]("Save task successfully");
                        initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"opportunity",opportunityObject.id);
                    } else {
                        toastr["error"]("Can not save task");
                    }
                });
            } else {
                toastr["error"]("Error saving");
            }
        });
    });

    $('#yourCarModal').on('show.bs.modal', function (event) {

        var makeUrl = "http://api.edmunds.com/api/vehicle/v2/makes?fmt=json&year=1995&api_key=qth4vtbc2sy8pm6w3vm7ke7s";
        $("#competitor-brand").append('<option value="" disabled selected>Select Brand</option>');
        $("#competitor-model").append('<option value="" disabled selected>Select Model</option>');
        $("#competitor-year").append('<option value="" disabled selected>Select Year</option>');
        $("#competitor-style").append('<option value="" disabled selected>Select Style</option>');
        if(analysisObject.id != null){
            $("#competitor-name").val(analysisObject.competitorName);
            $("#competitor-price").val(analysisObject.competitorPrice);
            $("#competitor-note").val(analysisObject.competitorNote);
        }
        $.getJSON( makeUrl, {
        }).done(function(data) {
            for(var i=0; i < data.makes.length;i++){
                var tmp = data.makes[i];
                $("#competitor-brand").append('<option value="'+tmp.niceName+'">'+tmp.name+'</option>');
            }
        });
    });

    $("#competitor-brand").change(function(){
        var modelUrl = "http://api.edmunds.com/api/vehicle/v2/"+ $("#competitor-brand").val()+"?fmt=json&state=new&api_key=qth4vtbc2sy8pm6w3vm7ke7s";
        $.getJSON( modelUrl, {
        }).done(function(data) {
            $("#competitor-model").html('<option value="" disabled selected>Select Model</option>');
            $("#competitor-year").html('<option value="" disabled selected>Select Year</option>');
            $("#competitor-style").html('<option value="" disabled selected>Select Style</option>');
            for(var i=0; i < data.models.length;i++){
                var tmp = data.models[i];
                $("#competitor-model").append('<option value="'+tmp.niceName+'">'+tmp.name+'</option>');
            }
        });
    });

    $("#competitor-model").change(function(){
        var yearlUrl = "https://api.edmunds.com/api/vehicle/v2/"+$("#competitor-brand").val()+"/"+$("#competitor-model").val()+"/years?fmt=json&state=new&api_key=qth4vtbc2sy8pm6w3vm7ke7s";
        $.getJSON( yearlUrl, {
        }).done(function(data) {
            $("#competitor-year").html('<option value="" disabled selected>Select Year</option>');
            $("#competitor-style").html('<option value="" disabled selected>Select Style</option>');
            for(var i=0; i < data.years.length;i++){
                var tmp = data.years[i];
                $("#competitor-year").append('<option value="'+tmp.year+'">'+tmp.year+'</option>');
            }
        });
    });

    $("#competitor-year").change(function(){
        var stylelUrl = "https://api.edmunds.com/api/vehicle/v2/"+$("#competitor-brand").val()+"/"+$("#competitor-model").val()+"/"+$("#competitor-year").val()+"?fmt=json&api_key=qth4vtbc2sy8pm6w3vm7ke7s";
        $.getJSON( stylelUrl, {
        }).done(function(data) {
            $("#competitor-style").html('<option value="" disabled selected>Select Style</option>');
            for(var i=0; i < data.styles.length;i++){
                var tmp = data.styles[i];
                $("#competitor-style").append('<option value="'+tmp.id+'">'+tmp.name+'</option>');
            }
        });
    });

    //competitor_name,competitor_model,competitor_price,note,opportunity_id,style_id
    $("#submit-competitor").click(function(){
        var object = {};
        object.competitorName = $("#competitor-name").val() != null ? $("#competitor-name").val() : "";
        object.competitorPrice = $("#competitor-price").val() != null ? $("#competitor-price").val() : 0;
        object.note = $("#competitor-note").val() != null ? $("#competitor-note").val() : "";
        object.opportunityId = opportunityObject.id;
        object.styleId = $("#competitor-style").val();
        object.competitorModel = $("#competitor-brand option:selected").text() + " " + $("#competitor-model option:selected").text() + " " + $("#competitor-style option:selected").text() + " " + $("#competitor-year").val();


        var url;

        if(analysisObject.id != null){
            url = localDomain+"/stm/updateAnalysis";
            object.id = analysisObject.id ;
        } else {
            url = localDomain+"/stm/insertAnalysis";
        }
        postRequest(url, object, function(e){
            if(e.result){
                toastr["success"]("Save successfully");
                analysisObject = object;
                $("#competitor-car").html('<h4>'+ analysisObject.competitorName+ ' offers - '+analysisObject.competitorModel+'</h4>');

            } else {
                toastr["error"]("Error saving");
            }
        }); 
    });

    $("#generate-table").click(function(){
        $("#comparasion-area").show();
        generateCarInfoTable();
        generateSafetyTable();
        generateEquipmentTable();
    });

    // $(".dealer-car-list").change(function(){
    //     // console.log('<h3>Your offer - '+carsObject[$("#selected-car").val()].name+'</h3>')
    //     $("#selected-car").html('<h3>Your offer - '+carsObject[$(".dealer-car-list").val()].name+'</h3>');
    // });

    $("#submit-your-car").click(function(){
        var obj = opportunityObject;
        obj.model = $("#analysis-car-list").val();

        var url = localDomain+'/stm/updateOpportunity';
        postRequest(url, obj, function(e){
            if(e.result){
                $("#selected-car").html('<h4>Your offer - '+carsObject[$("#analysis-car-list").val()].name+'</h4>');
                // initiateOpportunityPage();
            } else {
                toastr["error"]("Error updating");
            }
        });
    });


    $( '#proposalModal' ).on( 'shown.bs.modal', function ( event ) {
        $("#proposal-car-list").val("");
        // $("#price-per-unit").val("")
    });

    $("#proposal-car-list").change(function(){
        $("#proposal-price").html("Total Price: $" + opportunityObject.quantity*carsObject[$("#proposal-car-list").val()].price); 
    });

    $("#save-proposal").click(function(){
        var proObj = {};
        proObj.model = $("#proposal-car-list").val();
        proObj.name = carsObject[$("#proposal-car-list").val()].name;
        proObj.price = opportunityObject.quantity*carsObject[$("#proposal-car-list").val()].price;
        proObj.status = "pending";
        proObj.opportunityId = opportunityObject.id;

        var url = localDomain+"/stm/insertProposal";
        postRequest(url, proObj, function(e){
            if(e.result){
                toastr["success"]("Add proposal successfully");
                initiateProposal();
            } else {
                toastr["error"]("Error adding");
            }
        });
    });

    $("#accept-proposal").click(function(){
        if(chosenProposal == null){
            toastr["error"]("Choose one proposal");
            return;
        }

        opportunityObject.value = chosenProposal.price;
        updateOpportunity(opportunityObject);

        var obj = chosenProposal;
        obj.status ="accepted";

        var url = localDomain+"/stm/updateProposal";
        postRequest(url, obj, function(e){
            if(e.result){
                toastr["success"]("Add proposal successfully");
                initiateProposal();
            } else {
                toastr["error"]("Error adding");
            }
        });
    });
    $("#reject-proposal").click(function(){
        if(chosenProposal == null){
            toastr["error"]("Choose one proposal");
            return;
        }

        var obj = chosenProposal;
        obj.status ="rejected";

        var url = localDomain+"/stm/updateProposal";
        postRequest(url, obj, function(e){
            if(e.result){
                toastr["success"]("Add proposal successfully");
                initiateProposal();
            } else {
                toastr["error"]("Error adding");
            }
        });
    });

    $("#save-discount").click(function(){
        if(opportunityObject.minCost != null){
            opportunityObject.value = opportunityObject.value - opportunityObject.minCost;
            updateOpportunity(opportunityObject);

            var promotionObj = {};
            promotionObj.opportunityId = opportunityObject.id;
            promotionObj.serviceType = $("#service-type option:selected").attr("type");
            promotionObj.serviceAmount = parseInt($("#service-amount").val());
            promotionObj.discountAmount = $.isNumeric($("#percent-price-discount").val()) ? parseFloat($("#percent-price-discount").val()) : 0;

            if(promotionObject != null){
                url = localDomain+'/stm/updatePromotion';
                promotionObject = promotionObj;
            } else {
                url = localDomain+'/stm/insertPromotion';
            }

            postRequest(url, promotionObj, function(e){
                if(e.result){
                    toastr["success"]("Update successfully");
                } else {
                    toastr["error"]("Error updating");
                }
            });
        }
    });

    $(".win-stage").click(function(){
        var value = $(this).attr("value");
        console.log(value);

        var object = opportunityObject;
        if(value=="analysis"){
            object.stage = "proposal";
        } else if(value=="proposal"){
            object.stage = "negotiation";
        } else if(value=="negotiation"){
            object.stage = "close";
            object.status = "won";
        }

        updateOpportunity(object);
    });

    $(".lose-stage").click(function(){
        $("#loseModal").modal('show');
        $("#lose-comment").empty();
    });

    $("#save-lose").click(function(){
        var object = opportunityObject;
        object.status = "lost";
        updateOpportunity(object);
    });

    $("#transfer-opportunity").click(function(){
        $("#transferModal").modal('show');
    });

    $("#edit-opportunity").click(function(){
        $("#opportunityModal").modal('show');
        $("#modal-name").val(opportunityObject.name);
        $("#modal-value").val(opportunityObject.value);
        $("#modal-car-type").val(opportunityObject.carType);
        $("#modal-quantity").val(opportunityObject.quantity);
        $("#modal-purpose").val(opportunityObject.purpose);
        // $("#modal-name").val(opportunityObject.name);
        $('#due-picker').datetimepicker({
            format: 'DD/MM/YYYY'
        });
        $("#due-value").val(moment.tz(opportunityObject.due, "Asia/Singapore").format('DD/MM/YYYY'));
    });

    $("submit-opportunity").click(function(){
        var object = opportunityObject;
        object.lastUpdate = moment().valueOf();
        object.name = $("#modal-name").val();
        object.value = $("#modal-value").val();
        object.carType = $("#modal-car-type").val();
        object.quantity = $("#modal-quantity").val();
        object.purpose = $("#modal-purpose").val();
        object.due = moment($("#due-value").val(), "DD/MM/YYYY").valueOf();

        updateOpportunity(object);
    });
});

function generatePromotion(){
    var maxCost = 0;
    var minCost = 0;

    if($.isNumeric($("#service-type").val())){
        maxCost += parseInt(opportunityObject.quantity*parseInt($("#service-type").val())*$("#service-amount").val());
    }

    if($.isNumeric($("#percent-price-discount").val())){
        minCost += opportunityObject.quantity*carsObject[opportunityObject.model].price*parseFloat($("#percent-price-discount").val())/100;
        minCost = parseInt(minCost.toFixed(0));
        maxCost += minCost;
        maxCost = parseInt(maxCost.toFixed(0));
    }

    if(maxCost> 0){
        var minExpectedProfit = carsObject[opportunityObject.model].profit*opportunityObject.quantity - maxCost;
        var maxExpectedProfit = carsObject[opportunityObject.model].profit*opportunityObject.quantity - minCost;

        if(minExpectedProfit == maxExpectedProfit){
            $("#current-profit").html("Expected Profit - $" + minExpectedProfit);
            
        } else {
            $("#current-profit").html("Expected Profit - $" + minExpectedProfit + " to $" + maxExpectedProfit);
        }

        if(minCost==maxCost){
            $("#current-profit").append(" (Promo Value: $" + minCost+")");
        } else {
            $("#current-profit").append(" (Promo Value: $" + minCost + " to $" + maxCost+")");
        }
    } else {
        $("#current-profit").html("Expected Profit - $" + carsObject[opportunityObject.model].profit*opportunityObject.quantity);
    }

    opportunityObject.minCost = minCost;
    var payment = carsObject[opportunityObject.model].price*opportunityObject.quantity - minCost;
    $("#current-payment").html("Expected Payment - $" +  payment);
}

function initiateProposal(){
    var url = localDomain+'/stm/getProposalByOpportunity?opportunityId='+opportunityObject.id; 

    $.getJSON( url, {
    }).done(function(data) {
        var dataTable = new Array();

        for(var i=0; i < data.length; i++){
            var tmp = data[i];
            tmp.no = i+1;
            tmp.quantity =  opportunityObject.quantity;
            tmp.priceDiv = '$'+tmp.price/1000+'k';
            tmp.guarantee = "3 years or 100,000 km";

            dataTable.push(tmp);
        }

        showProposalTable(dataTable);
    });
}

function showProposalTable(dataTable){
    if(dataTable.length==0){
        $('#proposal-table').hide();
        return;
    } else {
        $('#proposal-table').show();
    }
    var table = $('#proposal-table').DataTable({
        "iDisplayLength": 10,
        "bDestroy": true,
        "aaData": dataTable,
        "paging":   false,
        "info":     false,
        "searching": false,
        "aoColumns": [
            { "mDataProp": "no" },
            { "mDataProp": "name" },
            { "mDataProp": "guarantee" },
            { "mDataProp": "quantity" },
            { "mDataProp": "priceDiv" },
            { "mDataProp": "status" }
        ],
        "drawCallback": function( settings ) {
            $(window).resize();
        }
    });

    $('#proposal-table tbody').off().on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
            chosenProposal = null;
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            chosenProposal = table.row( this ).data();
        }
    } );
}

$(document).on("click", ".delete-contact", function() {
    var url = localDomain+"/stm/deleteContact";
    var obj = contactsObject[$(this).attr("value")];
    console.log(obj);
    postRequest(url, obj, function(e){
        if(e.result){
            toastr["success"]("Delete successfully");
            initiateContact($("#contact-list-opportunity"),opportunityObject.id);
        } else {
            toastr["error"]("Error deleting");
        }
    });
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

$(document).on("click", "#new-contact", function() {
    $("#contact-modal-title").html("New Contact");
    $("#contact-name").val("");
    $("#contact-phone").val("");
    $("#contact-email").val("");
    $("#contact-title").val("");
    $("#contact-category").val("");
    $("#contactModal").modal("show");
});

$(document).on("click", ".send-comment", function() {
    var comment = {};
    comment.content = $("#new-comment").val();
    comment.time = moment().valueOf();
    comment.ownerId = userInfo.id;
    comment.type = "opportunity";
    comment.dealId = opportunityObject.id;

    var url = localDomain+"/stm/insertComment";
    postRequest(url, comment, function(e){
        if(e.result){
            initiateComment($("#comment-list"),"opportunity",opportunityObject.id);
        } else {
            toastr["error"]("Error saving");
        }
    });
});

$(document).on("click", "#submit-contact", function() {
    var object = {};
    object.name=$("#contact-name").val()!=null? $("#contact-name").val() : "";
    object.phone=$("#contact-phone").val()!=null? $("#contact-phone").val() : "";
    object.email=$("#contact-email").val()!=null? $("#contact-email").val() : "";
    object.title=$("#contact-title").val()!=null? $("#contact-title").val() : "";
    object.category=$("#contact-category").val()!=null? $("#contact-category").val() : "";
    object.start=moment().valueOf();
    object.opportunityId=opportunityObject.id;
    object.ownerId=opportunityObject.ownerId;
    object.accountId=opportunityObject.accountId;

    var contactUrl = localDomain+"/stm/insertContact";
    postRequest(contactUrl, object, function(e){
        if(e.result != null){
            var accountId = e.result; 
            toastr["success"]("Add contact successfully");
            initiateContact($("#contact-list-opportunity"),opportunityObject.id);
        } else {
            toastr["error"]("Can not add contact");
        }
    });
});

function initiateOpportunityPage(){
    var opportunityId = getUrlParameter("id");
    // if(userInfo.id!=1){
    //     $("#transfer-opportunity").hide();
    // }
    if(opportunityId== null){
        opportunityId = 1;
    }
    var url = localDomain+'/stm/getOpportunityById?id='+opportunityId; 

    $.getJSON( url, {
    }).done(function(data) {
        opportunityObject = data;
        $("#modal-transfer-owner").html('<option value="" disabled selected>Select People</option>');
        $.each(usersObject, function(k,v){
            if(k != 0 && k!= 1 && k!=opportunityObject.ownerId){
                $("#modal-transfer-owner").append('<option value="'+k+'">Assign to '+v.firstName+'</option>');
            }
        });
        initiateComment($("#comment-list"),"opportunity",opportunityObject.id);
        initiateContact($("#contact-list-opportunity"),opportunityObject.id);
        $("#opportunity-panel-title").html(opportunityObject.name);
        $("#opportunity-company").html("Company - " + opportunityObject.account.name);
        $("#opportunity-owner").html("Owner - " + usersObject[opportunityObject.ownerId].firstName);
        $("#opportunity-due").html("Close - " + moment.tz(opportunityObject.due, "Asia/Singapore").format('MM/DD/YYYY'));
        $("#opportunity-value").html("Value - $" + opportunityObject.value);
        initiateActivity($("#next-step-list"), $("#past-activity-list"), $("#past-header"),"opportunity",opportunityObject.id);
        initiateTabList(opportunityObject);
        initiateQualification();
        initiateAnalysis();
        initiateProposal();
        initiateNegotiation();  
    });

    $("#car-info-table").hide();
    $("#car-compare-table").hide();
}

function initiateTabList(opportunity){
    var stage = opportunity.stage;
    var status = opportunity.status;
    $("#tab-1").html("Analysis");
    $("#tab-2").html("Proposal");
    $("#tab-3").html("Negotiation");
    $("#tab-4").html("Closing");

    $("#tab-1").closest('li').removeClass("stage-tab-success");
    $("#tab-1").closest('li').removeClass("stage-tab-lost");
    $("#tab-1").closest('li').addClass("stage-tab-wait");

    $("#tab-2").closest('li').removeClass("stage-tab-success");
    $("#tab-2").closest('li').removeClass("stage-tab-lost");
    $("#tab-2").closest('li').addClass("stage-tab-wait");

    $("#tab-3").closest('li').removeClass("stage-tab-success");
    $("#tab-3").closest('li').removeClass("stage-tab-lost");
    $("#tab-3").closest('li').addClass("stage-tab-wait");

    $("#tab-4").closest('li').removeClass("stage-tab-success");
    $("#tab-4").closest('li').removeClass("stage-tab-lost");
    $("#tab-4").closest('li').addClass("stage-tab-wait");

    if(status =="lost"){
        if(stage == "analysis"){
            $("#tab-1").closest('li').removeClass("stage-tab-wait");
            $("#tab-1").closest('li').addClass("stage-tab-lost");
            $("#tab-1").prepend('<span class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red; margin-right:5%"></span>');
            $('#opportunity-pipeline-tabs a[href="#analysis-stage"]').tab('show');
        } else if(stage == "proposal"){
            $("#tab-1").closest('li').removeClass("stage-tab-wait");
            $("#tab-1").closest('li').addClass("stage-tab-success");
            $("#tab-1").prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green; margin-right:5%"></span>');
            $("#tab-2").closest('li').removeClass("stage-tab-wait");
            $("#tab-2").closest('li').addClass("stage-tab-lost");
            $("#tab-2").prepend('<span class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red; margin-right:5%"></span>');
            $('#opportunity-pipeline-tabs a[href="#proposal-stage"]').tab('show');
        } else if(stage == "negotiation"){
            $("#tab-1").closest('li').removeClass("stage-tab-wait");
            $("#tab-1").closest('li').addClass("stage-tab-success");
            $("#tab-1").prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green; margin-right:5%"></span>');
            $("#tab-2").closest('li').removeClass("stage-tab-wait");
            $("#tab-2").closest('li').addClass("stage-tab-success");
            $("#tab-2").prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green; margin-right:5%"></span>');
            $("#tab-2").prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green; margin-right:5%"></span>');
            $("#tab-3").closest('li').removeClass("stage-tab-wait");
            $("#tab-3").closest('li').addClass("stage-tab-lost");
            $("#tab-3").prepend('<span class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red; margin-right:5%"></span>');
            $('#opportunity-pipeline-tabs a[href="#negotiation-stage"]').tab('show');
        } else if(stage == "close"){
            $("#tab-1").closest('li').removeClass("stage-tab-wait");
            $("#tab-1").closest('li').addClass("stage-tab-success");
            $("#tab-2").closest('li').removeClass("stage-tab-wait");
            $("#tab-2").closest('li').addClass("stage-tab-success");
            $("#tab-3").closest('li').removeClass("stage-tab-wait");
            $("#tab-3").closest('li').addClass("stage-tab-success");
            $("#tab-1").prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green; margin-right:5%"></span>');
            $("#tab-2").prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green; margin-right:5%"></span>');
            $("#tab-3").prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green; margin-right:5%"></span>');
            $("#tab-4").closest('li').removeClass("stage-tab-wait");
            $("#tab-4").closest('li').addClass("stage-tab-lost");
            $("#tab-4").prepend('<span class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red; margin-right:5%"></span>');
            $('#opportunity-pipeline-tabs a[href="#close-stage"]').tab('show');
        }

    } else {
        if(stage == "qualification" || stage == "analysis"){
            $('#opportunity-pipeline-tabs a[href="#analysis-stage"]').tab('show');
        } else if(stage == "proposal"){
            $("#tab-1").closest('li').removeClass("stage-tab-wait");
            $("#tab-1").closest('li').addClass("stage-tab-success");
            $("#tab-1").prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green; margin-right:5%"></span>');
            $('#opportunity-pipeline-tabs a[href="#proposal-stage"]').tab('show');
        } else if(stage == "negotiation"){
            $("#tab-1").closest('li').removeClass("stage-tab-wait");
            $("#tab-1").closest('li').addClass("stage-tab-success");
            $("#tab-2").closest('li').removeClass("stage-tab-wait");
            $("#tab-2").closest('li').addClass("stage-tab-success");
            $("#tab-1").prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green; margin-right:5%"></span>');
            $("#tab-2").prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green; margin-right:5%"></span>');
            $('#opportunity-pipeline-tabs a[href="#negotiation-stage"]').tab('show');
        } else if(stage == "close"){
            $("#tab-1").closest('li').removeClass("stage-tab-wait");
            $("#tab-1").closest('li').addClass("stage-tab-success");
            $("#tab-2").closest('li').removeClass("stage-tab-wait");
            $("#tab-2").closest('li').addClass("stage-tab-success");
            $("#tab-3").closest('li').removeClass("stage-tab-wait");
            $("#tab-3").closest('li').addClass("stage-tab-success");
            $("#tab-4").closest('li').removeClass("stage-tab-wait");
            $("#tab-4").closest('li').addClass("stage-tab-success");
            $("#tab-1").prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green; margin-right:5%"></span>');
            $("#tab-2").prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green; margin-right:5%"></span>');
            $("#tab-3").prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green; margin-right:5%"></span>');
            $("#tab-4").prepend('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green; margin-right:5%"></span>');
            $('#opportunity-pipeline-tabs a[href="#close-stage"]').tab('show');
        }
    }
    
}

function initiateNegotiation(){
    generateCarTrend();
    $.getJSON( localDomain+'/stm/getPromotionByOpportunityId?opportunityId='+ opportunityObject.id, {
    }).done(function(data) {
        $('#service-type option[type="'+data.serviceType+'"]').prop('selected', true);
        $('#service-amount').val(data.serviceAmount);
        $('#percent-price-discount').val(data.discountAmount);
    });

}

function generateCarTrend(){
    var categories = [1427860800000,1430452800000,1433131200000,1435723200000,1438401600000,1441080000000,1443672000000,1446350400000,1448942400000,1451620800000,1454299200000,1456848000000];
    var value = [28,32,30,31,28,27,23,25,21,19,20,17];
    var series_1=[];

    for(var i=0; i < categories.length; i++){
        var element = [];
        element.push(categories[i]);
        element.push(value[i]);
        series_1.push(element);
        
    }

    $("#car-trend-graph").highcharts({
        chart: {
            zoomType: 'x'
        },
        title: {
            text: "Sale Trend"
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
            enabled: false
        },
        tooltip: {
            xDateFormat: '%m-%Y',
            pointFormat: '<b>{point.y}</b>'
        },
        series: [{
            // name: 'historical active contacts',
            data: series_1,
            // color: 'green',
            dataLabels: {
                enabled: false,
            }
        }]
    });
}

function initiateAnalysis(){
    $("#comparasion-area").hide();
    $.getJSON( localDomain+'/stm/getAllCar', {
    }).done(function(data) {
        $(".dealer-car-list").html('<option value="" disabled selected>Select Car</option>');
        data.sort(sortByPrice);
        for(var i=0; i < data.length; i++){
            var tmp=data[i];
            carsObject[tmp.id] = tmp;
            $(".dealer-car-list").append('<option value="'+tmp.id+'">($'+tmp.price/1000+'k) '+tmp.name+'</option>')
        }

        if(opportunityObject.model > 0){
            $(".dealer-car-list").val(opportunityObject.model);
            // $('#dealer-car-list option[value="SEL1"]');

            $("#selected-car").html('<h4>Your offer - '+carsObject[opportunityObject.model].name+'</h4>');
        }
    });

    $.getJSON( localDomain+'/stm/getAnalysisByOpportunityId?opportunityId='+ opportunityObject.id, {
    }).done(function(data) {
        analysisObject =  data;
        $("#competitor-car").html('<h4>'+ analysisObject.competitorName+ ' offers - '+analysisObject.competitorModel+'</h4>');
    });

}

function generateCarInfoTable(){
    var myCarStyle = carsObject[$("#analysis-car-list").val()].styleId;
    var competitorCarStyle = null;
    var obj={};
    obj.price = {};
    obj.price.my = parseInt(carsObject[$("#analysis-car-list").val()].price);
    obj.price.name = "Price";
    if(analysisObject.styleId!= null){
        competitorCarStyle = analysisObject.styleId;
        obj.price.com = parseInt(analysisObject.competitorPrice);

        // $("#car-compare-table").html("<thead><tr><th>Specs</th><th>"+carsObject[$("#dealer-car-list").val()].name+"</th><th>"+analysisObject.competitorModel+"</th><th>Comparison</th></tr></thead>");
        $("#car-info-table").hide();
        $("#car-compare-table").show();
    } else {
        // $("#car-info-table").html("<thead><tr><th>Specs</th><th>"+carsObject[$("#dealer-car-list").val()].name+"</th></tr></thead>");
        $("#car-info-table").show();
        $("#car-compare-table").hide();
    }

    obj.compressionRatio = {"name":"Engine Compression"};
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

    if(analysisObject.styleId!= null){
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
        if(v.name.toLowerCase()=="price"){
            if(v.my < v.com){
                v.compare = 1;
                v.compareDiv = '<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:green"></span>';
            } else if(v.my == v.com){
                v.compare = 0;
                v.compareDiv = "equal";
            } else if(v.my > v.com){
                v.compare = -1;
                v.compareDiv = '<span class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red"></span>';
            }
        }else if($.isNumeric(v.my) && v.com != null){
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

    if(analysisObject.styleId!= null){
        showCarCompareTable(dataTable);
    } else {
        showCarInfoTable(dataTable);
    }


}

function generateEquipmentTable(){
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

    var table = $('#equipment-compare-table').DataTable({
        "iDisplayLength": 10,
        "paging":   false,
        "info":     false,
        "searching": false,
        "bDestroy": true,
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

function generateSafetyTable(){
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

    var table = $('#safety-compare-table').DataTable({
        "iDisplayLength": 10,
        "paging":   false,
        "info":     false,
        "searching": false,
        "bDestroy": true,
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

function showCarCompareTable(dataTable){
    // console.log(dataTable);
    $('#car-compare-table').show();
    data = dataTable;
    var table = $('#car-compare-table').DataTable({
        "iDisplayLength": 10,
        "paging":   false,
        "info":     false,
        "searching": false,
        // "columnDefs": [
            // { "width": "1%", "targets": 0 },
            // { "visible": false, "targets": 0 },
            // { "visible": false, "targets": 12 },
            // { "visible": false, "targets": 13 },
            // { "visible": false, "targets": 14 },
            // { "iDataSort": 9, "aTargets": [ 14 ] },
            // { "iDataSort": 12, "aTargets": [ 11 ] }
        // ],
        // "order": [[ 12, "desc" ]],
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

function showCarInfoTable(dataTable){
    var table = $('#car-info-table').DataTable({
        "iDisplayLength": 12,
        "columnDefs": [
            // { "width": "1%", "targets": 0 },
            // { "visible": false, "targets": 0 },
            // { "visible": false, "targets": 12 },
            // { "visible": false, "targets": 13 },
            // { "visible": false, "targets": 14 },
            // { "iDataSort": 9, "aTargets": [ 14 ] },
            // { "iDataSort": 12, "aTargets": [ 11 ] }
        ],
        // "order": [[ 12, "desc" ]],
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

function initiateQualification(){
    $("#start-deal").html("Start - " + moment.tz(opportunityObject.start, "Asia/Singapore").format('MM/DD/YYYY'));
    $("#probability").html("Probability - 65%");
}

function  initiateContact(dom,opportunityId){
    var url = localDomain+'/stm/getContactByOpportunity?opportunityId='+opportunityId;

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
           contact.opportunityId=opportunityObject.id;
           contactsObject[contact.id]=contact;

           $(dom).append('<div class="row"><div class="col-xs-2"><span class="glyphicon glyphicon-star" aria-hidden="true" style="color:'+contact.color+';font-size:25px;border: 1px solid #ddd;border-radius:4px;margin-left: 10px;"></span></div><div class="col-xs-8" style="padding-left: 6px"><h5 class="opportunity-item-list-name" style="margin: :0px">'+contact.name+'</h5><div class="side-list-item-info"><strong>'+contact.category+'</strong> - '+contact.title+'</div><div class="side-list-item-info">'+contact.phone+' - '+contact.email+'</div></div><div class="col-xs-2"><div class="dropdown"><span class="glyphicon glyphicon-cog dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" value="'+contact.id+'"></span><ul class="dropdown-menu pull-right" style="min-width: 50px"><li><a href="#" data-toggle="tooltip" data-placement="bottom" title="Delete" class="delete-contact" value="'+contact.id+'"><span class="glyphicon glyphicon-remove" aria-hidden="true" style="color:red"></span></a></li><li role="separator" class="divider"></li><li><a href="#" data-placement="bottom" title="Edit" class="edit-contact" value="'+contact.id+'"><span class="glyphicon glyphicon-edit" aria-hidden="true" style="color:black"></span></a></li></ul></div></div></div>');

        }
    });
}

function updateOpportunity(object){
    var url = localDomain+'/stm/updateOpportunity';
    postRequest(url, object, function(e){
        if(e.result){
            toastr["success"]("Update opportunity successfully");
            initiateOpportunityPage();
        } else {
            toastr["error"]("Error updating");
        }
    });
}

