var noteList =  new Array();
var notesObject = {};
var noteList = new Array();
var chosenNote;

$(document).ready(function() {
	$("#lead-layout").layout({
        resizeWhileDragging: true,
        initClosed: false,
        west__maxSize: .4,
        west__minSize: .25,
        useStateCookie:true, 
        onresize_end:function(){
            $(window).resize();
        }
    });

    $("#text-editor").Editor({
    	'togglescreen':false,
    	'source':false,
    	'rm_format':false,
    	'select_all':false,
    });    

     // $("#note-related-select").select2({dropdownCssClass : 'select-drop'}); 
 //    $("#note-related-select").select2({
	//     closeOnSelect:false,
	//     dropdownCssClass : 'select-drop'
	// });

	$("#related-type").change(function(){
		var type = $( "#related-type option:selected" ).val();
		var url =  localDomain+'/stm/';
		var field;
		if(type=="opportunity"){
			url += "getOpportunityByOwner?ownerId=" + userInfo.id;
			field="name"
		} else if(type=="lead") {
			url += "getLeadByOwner?ownerId=" + userInfo.id;
			field="company";
		} else if(type=="contact") {
			url += "getContactByOwner?ownerId=" + userInfo.id;
			field="name"
		}
	    $.getJSON( url, {
	    }).done(function(data) {
	        $("#note-related-select").empty();
	        for(var i=0; i< data.length; i++){
	        	$("#note-related-select").append('<option value="'+data[i].id+'!@@@@@!'+type+'!@@@@@!'+data[i][field]+'">'+data[i][field]+ ' (' + type + ')'+'</option>');
	        }
	    });
	});
	//note_related(note_id,related_id,related_type,related_name)
	$("#note-related-select").on("select2-selecting", function (e) {
		var url= localDomain+"/stm/insertNoteRelated";
		var object = {};
		var tmp = e.val.split("!@@@@@!");
		object.parentId = chosenNote.id;
		object.relatedId = tmp[0];
		object.relatedType = tmp[1];
		object.relatedName = tmp[2];
		postRequest(url, object, function(e){
            if(e.result){
               	toastr["success"]("Tag successfully");
            } else {
               	toastr["error"]("Can not tag");
            }
        });
	});

	$("#note-related-select").on("change", function (e) {
		if (e.removed) {
			console.log(e);
			console.log(e.removed.id);
			var object = {};
			var tmp = e.removed.id.split("!@@@@@!");
			object.parentId = chosenNote.id;
			object.relatedId = tmp[0];
			object.relatedType = tmp[1];
		    var url = localDomain+"/stm/deleteNoteRelated";
		    postRequest(url, object, function(e){
		        if(e.result){
		           	toastr["success"]("Save successfully");
		        } else {
		           	toastr["error"]("Error saving");
		        }
		    });
		}
	 	
	});

    generateNoteUI(true,false);

});



$(document).on("click", ".list-group-note", function() {
   	$(".list-group-note").removeClass("list-group-item-success");
    $(this).addClass("list-group-item-success");
    chosenNote = notesObject[$(this).attr("value")];
    showNote(chosenNote);
});


