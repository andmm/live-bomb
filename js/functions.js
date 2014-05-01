//Live check query variables.
//Variables

var gbSchedule_url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.giantbomb.com%22%20and%20compat%3D%22html5%22%20and%20xpath%3D'%2F%2Fdl%5Bcontains(%40class%2C%22promo-upcoming%22)%5D'&format=json&callback=";
var gb_url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.giantbomb.com%22%20and%20compat%3D%22html5%22%20and%20xpath%3D'%2F%2Fspan%5Bcontains(%40class%2C%22header-promo%20live%20show%22)%5D'&format=json&callback=";
var gbPromo_url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.giantbomb.com%22%20and%20compat%3D%22html5%22%20and%20xpath%3D'%2F%2Fdiv%5Bcontains(%40class%2C%22kubrick-promo-video%22)%5D'&format=json&callback=";
var chat_url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.giantbomb.com%2Fchat%22%20and%20xpath%3D'%2Fhtml%2Fhead%2Ftitle'&format=json&callback=";
var premiumImage_url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.giantbomb.com%22%20and%20compat%3D%22html5%22%20and%20xpath%3D'%2F%2F*%5B%40id%3D%22wrapper%22%5D'&format=json&callback=";
var gbLive;
var storage = $.localStorage;
var scheduleLoadingIcon = $('#lb-schedule-loading');
var buttonRefreshSchedule = $('#lb-refresh-schedule');
var sendMessage;
var scheduleCounter;

//Check for live video
var checkLive = function(){
	var checkLiveDone = $.Deferred();
		//Querying the GiantBomb frontpage 
		$.getJSON (gb_url, function(data){	
			var checkForResults = data.query.results; 
		if (checkForResults == null) {
			gbLive = false; 	
			console.log('No text on frontpage, no live video');
			storage.set({
				'islive':false,
				'counter':false
			});
			checkLiveDone.resolve();
		} else {
		var checkForTimer = data.query.results.span.p.content;	
			if (checkForTimer == undefined) {
				gbLive = true;
				var titleName = data.query.results.span.p.a.content.replace(/[<>]/,'');
				storage.set({
					'islive': true,
					'title': titleName,
					'counter':false
				});
				getShowImage();
				console.log('Video is live and link is ok');
				checkLiveDone.resolve();
			   	} else {
			   		//Scraping the frontpage for live video promo-header
			   	$.getJSON(premiumImage_url,function(liveshow){
			   			var liveVideo = liveshow.query.results.div.div[3].div.div.div.div[0];
			   		if ( liveVideo != undefined ) {
			   			var test = liveVideo.h4.a.content;
			   			var compare = "Live on Giant Bomb!";

			   			if (test === compare){
			   				gbLive = true;
							var titleName = liveVideo.h2.replace(/[<>]/,'');
							storage.set({
							'islive': true,
							'title': titleName,
							'counter':false
							});
							getShowImage();
							console.log('Video is live but link is disabled');
							checkLiveDone.resolve();
			   				} else {
			   				gbLive = false; 
							storage.set({
								'islive': false,
								'counter':true,
								'upcoming': checkForTimer
							});
							console.log('Text is there but video is no longer live or something broke on this end');
							checkLiveDone.resolve();
			  		 		}
			  		} else {
			  			gbLive = false; 
						storage.set({
							'islive': false,
							'counter':true,
							'upcoming': checkForTimer
						});
						console.log('Counter is up but no live video');
						checkLiveDone.resolve();
			  				}
			  		 	});		
					} 
				} 
			}); 
	return checkLiveDone.promise();
};


//Schedule Function
var getSchedule = function(){

	var getScheduleDone = $.Deferred();

	$.getJSON (gbSchedule_url, function(data){	
		
		scheduleCounter = 0;
		console.log(data);

		if (data.query.count > 0) {

			if (data.query.results.dl.dd.length > 1) {
				var output = "<ul>";
				$.each(data.query.results.dl.dd, function(index, value){
					var imgCheck = value.style;
					if (imgCheck != undefined){
					var imgUrl = value.style.substring(21).replace(')','');	
					} else {
					var imgUrl = "images/premium-background.png";
					}
					var eventName = value.div.h4.content.replace(/[<>]/,'');
					var eventTypeFull = value.div.p.content.length;
					
					switch(eventTypeFull)
					{
					//Live Show
						case 34:
						var eventType = '<i class="fa fa-dot-circle-o fa-lg circle-schedule"></i> Live Show on ';
						var yqlDate = value.div.p.content.substring(13);
						break;
						
					//Video
						case 30: 
						var eventType = '<i class="fa fa-play-circle fa-lg circle-schedule"></i> Video on ';
						var yqlDate = value.div.p.content.substring(9);
						break;
					//Article/Podcast
						default: 
						var t = value.div.p.content.substring(0,7);
						if ( t == "Article") {
							var eventType = '<i class="fa fa-file-o fa-lg"></i> Article on ';
						} else { 
							var eventType = '<i class="fa fa-microphone fa-lg"></i> Podcast on ';
						}	
						var yqlDate = value.div.p.content.substring(11);	
					}
						var m = ['0','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
						var dateString = ''+yqlDate.substring(8,12)+''+'/0'+m.indexOf(''+yqlDate.substring(0,3)+'')+'/'+''+yqlDate.substring(4,6)+''+' '+
						''+yqlDate.substring(13,18)+' '+''+yqlDate.substring(19)+''+' EDT';
						var dt = new Date(''+dateString+'');
						var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
						var eventDate = months[dt.getMonth()]+' '+dt.getDate()+', '+dt.getFullYear()+' '+dt.toLocaleTimeString().replace(/:\d{2}\s/,' ');
						output +=  '<li style="background-image: url('+ imgUrl +')" class="animated fadeInDownBig"><h4>' + eventName + 
						'</h4> <p class="lb-schedule-p">'+eventType+ eventDate+'</p></li>';
					scheduleCounter += 1;	
			});	
			output += "</ul>";
			$('#lb-schedule-items').html(output);
			getScheduleDone.resolve();
			
			//One item on the schedule
			} else if (data.query.results.dl.dd.length == 1 || data.query.count == 1 ) {
				var imgCheck = data.query.results.dl.dd.style;
				if (imgCheck != undefined){
				var imgUrl = data.query.results.dl.dd.style.substring(21).replace(')','');
				} else {
					imgUrl = "/images/premium-background.png";
				} 
				var eventName =  data.query.results.dl.dd.div.h4.content.replace(/[<>]/,'');
				var eventTypeFull = data.query.results.dl.dd.div.p.content.length;
				switch(eventTypeFull)
				{
				//Live show
					case 34:   
						var eventType = '<i class="fa fa-dot-circle-o fa-lg circle-schedule"></i> Live Show on ';	
						var yqlDate = data.query.results.dl.dd.div.p.content.substring(13);
						console.log(yqlDate);
						break;
				//Video
					case 30: 
						var eventType = '<i class="fa fa-play-circle fa-lg"></i> Video on ';
						var yqlDate = data.query.results.dl.dd.div.p.content.substring(9);		
						break;
				//Article/Podcast
					default:
						var t = data.query.results.dl.dd.div.p.content.substring(0,7);
						if (t == "Article") {
							var eventType = '<i class="fa fa-file-o fa-lg"></i> Article on ';
						} else {
							var eventType = '<i class="fa fa-microphone fa-lg"></i> Podcast on ';
						}
					var yqlDate = data.query.results.dl.dd.div.p.content.substring(11);	
				}
				var m = ['0','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
				var dateString = ''+yqlDate.substring(8,12)+''+'/0'+m.indexOf(''+yqlDate.substring(0,3)+'')+'/'+''+yqlDate.substring(4,6)+''+' '+
				''+yqlDate.substring(13,18)+' '+''+yqlDate.substring(19)+''+' EDT';
				var dt = new Date(''+dateString+'');
				var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
				var eventDate = months[dt.getMonth()]+' '+dt.getDate()+', '+dt.getFullYear()+' '+dt.toLocaleTimeString().replace(/:\d{2}\s/,' ');
				var output =  '<ul><li style="background-image: url('+ imgUrl +')" class="animated fadeInDownBig"><h4>' + eventName + 
				'</h4> <p class="lb-schedule-p">'+eventType+ eventDate+'</p></li></ul>';
				scheduleCounter = 1;
				$('#lb-schedule-items').html(output);
				getScheduleDone.resolve();
			} else {
				$('#lb-schedule-items').html('<h5 id="no-schedule">There are no items on the schedule. Try refreshing</h5>');
				scheduleCounter = 0;
				getScheduleDone.resolve();
				
			}
		} else {
			$('#lb-schedule-items').html('<h5 id="no-schedule" class="animated slideInDown">There are no items on the schedule or something went wrong. Try refreshing</h5>');
			scheduleCounter = 0;
			getScheduleDone.resolve();
	} 

	});

	return getScheduleDone.promise();
};	



var getShowImage = function(){

var getShowImageDone = $.Deferred();
		
	if (storage.isSet('image') == false) {

	 $.getJSON(gb_url,function(liveshow){
	 	if ( liveshow.query.count < 1 ) {
	 		$('#lb-status-live').css('background-image','url(/images/premium-background.png)');
			getShowImageDone.resolve();
		} else {
	 	var checkForVideo = liveshow.query.results.span.p.content;
	
	 	if (checkForVideo == undefined) { 
	 		$.getJSON(gbPromo_url, function(data){
			if ( data.query.count > 0 && data.query.results.div.style != undefined) {
				var promoUrlFull = data.query.results.div.style;
				var promoUrl = promoUrlFull.substring(22).replace(')','');
				$('#lb-status-live').css('background-image','url('+promoUrl+')');
			 	getShowImageDone.resolve();			
			} else if (data.query.results.div.style == undefined) {
				$.getJSON(premiumImage_url,function(data){
					var promoImages = data.query.results.div.section.div.ul.li;
					var premiumImage = promoImages[0].style;
					var premiumImageUrl = premiumImage.substring(22).replace(')','');
					$('#lb-status-live').css('background-image','url('+premiumImageUrl+')');
					getShowImageDone.resolve();	
					});	
				}
			});
	 	} else {

			$('#lb-status-live').css('background-image','url(/images/premium-background.png)');
			getShowImageDone.resolve();
				}
			}
		});		
	
	} else {
		$('#lb-status-live').css('background-image','url('+storage.get('image')+')');
		getShowImageDone.resolve();
	}
				
	return getShowImageDone.promise();
};	


//var getShowImageNew = function(){
//
//var getShowImageDone = $.Deferred();
//		
//	if (storage.isSet('image') == false) {
//
//		$.getJSON(gbPromo_url, function(data){
//			if ( data.query.count > 0 && data.query.results.div.style != undefined) {
//				var promoUrlFull = data.query.results.div.style;
//				var promoUrl = promoUrlFull.substring(22).replace(')','');
//				$('#lb-status-live').css('background-image','url('+promoUrl+')');
//				storage.set('image',''+promoUrl+'');
//			 	getShowImageDone.resolve();			
//			} else if (data.query.results.div.style == undefined) {
//				$.getJSON(premiumImage_url,function(data){
//					var promoImages = data.query.results.div.section.div.ul.li;
//					var premiumImage = promoImages[0].style;
//					var premiumImageUrl = premiumImage.substring(22).replace(')','');
//					$('#lb-status-live').css('background-image','url('+premiumImageUrl+')');
//					//storage.set('image',''+premiumImageUrl+'');
//					getShowImageDone.resolve();	
//				});	
//			} else {
//			$('#lb-status-live').css('background-image','url(/images/premium-background.png)');
//			getShowImageDone.resolve();
//			}
//		});
//	} else {
//		$('#lb-status-live').css('background-image','url('+storage.get('image')+')');
//		getShowImageDone.resolve();
//	}
//		
//		
//	return getShowImageDone.promise();
//};	
