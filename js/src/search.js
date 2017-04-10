var resultNumber = 0;

$(document).ready(function() {
	initiateSearchPage();
});

function initiateSearchPage(){
    var search = getUrlParameter("search");
    
    setTimeout( function(){
        $("#quicksearch").val(search);
    }  , 200 );

    $("#search-list").empty();

    $.getJSON( localDomain+"/stm/filterAccount?name="+ search, {
    }).done(function(data) {
        resultNumber+=data.length;
        $("#search-panel-title").html("Search Result - " + resultNumber + " coming");
        for(var i=0; i< data.length;i++){
            var href = "account.html?search="+ data[i].name;
            var type = "Account"; 
            $("#search-list").append('<li class="list-group-item"><div class="row"><div class="col-xs-10"><h3><a href="'+href+'">'+data[i].name+'</a></h3></div><div class="col-xs-2"><h3 style="float:right">'+type+'</h3></div></div></li>');
            
        }
    });

    $.getJSON( localDomain+"/stm/filterOpportunity?name="+ search, {
    }).done(function(data) {
        resultNumber+=data.length;
        $("#search-panel-title").html("Search Result - " + resultNumber + " coming");
        for(var i=0; i< data.length;i++){
            var href = "opportunity-browse.html?id="+ data[i].id;
            var type = "Opportunity"; 
            $("#search-list").append('<li class="list-group-item"><div class="row"><div class="col-xs-10"><h3><a href="'+href+'">'+data[i].name+'</a></h3></div><div class="col-xs-2"><h3 style="float:right">'+type+'</h3></div></div></li>');
        }
    });

    $.getJSON( localDomain+"/stm/filerLead?company="+ search, {
    }).done(function(data) {
        resultNumber+=data.length;
        $("#search-panel-title").html("Search Result - " + resultNumber + " coming");
        for(var i=0; i< data.length;i++){
            var href = "lead-browse.html?id="+ data[i].id;
            var type = "Sale Lead"; 
            $("#search-list").append('<li class="list-group-item"><div class="row"><div class="col-xs-10"><h3><a href="'+href+'">'+data[i].name+' from '+data[i].company+'</a></h3></div><div class="col-xs-2"><h3 style="float:right">'+type+'</h3></div></div></li>');
        }
    });
}