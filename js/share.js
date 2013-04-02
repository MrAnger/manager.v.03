(function($, wa_lng){
	$(document).ready(function(e){
		//localization
		translate();
		$(document).bind("DOMNodeInserted", translate);
	});

	function translate(){
		$("[translate='0']").each(function(key, el){
			try{
				var lngPath = $(el).attr("name").split("-");
				var lng = $.extend(true, {}, wa_lng);
				$.each(lngPath, function(key, path){lng = lng[path];});

				if($(el).attr("traslatetype")){
					switch($(el).attr("traslatetype")){
						case "attribute":
							$(el).attr($(el).attr("translateattribute"), lng[$(el).attr("lang")]);
							break;
					};
				}else{
					$(el).html(lng[$(el).attr("lang")]);
				};

				$(el).attr("translate", "1");
			}catch(error){
				if(console && console.log){
					console.log("Error localization:");
					console.log(el);
				};
			};
		});
	};
})(jQuery, lng);
