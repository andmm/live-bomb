//Live check query variables.
//Variables

var gb_url = "http://www.giantbomb.com/";
var gbLive;
var storage = $.localStorage;
var scheduleLoadingIcon = $('#lb-schedule-loading');
var buttonRefreshSchedule = $('#lb-refresh-schedule');
var sendMessage;
var scheduleCounter;

var parseHtml = function(data){
	return '<body>' + data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '') + '</body>';
}

//Check for live video
var checkLive = function(){
	var checkLiveDone = $.Deferred();

	$.get(gb_url, function(data){
		var parsedHtml = parseHtml(data);
		var parsedElem = $(parsedHtml).find('.header-promo.live.show');

		if (parsedElem.length == 0) {
			gbLive = false;
			console.log('No text on frontpage, no live video');
			storage.set({
				'islive':false,
				'counter':false
			});
			checkLiveDone.resolve();
		} else {
			var liveLink = $(parsedElem).find('p a');
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
			if (liveLink.length > 0) {
			   			var test = liveVideo.h4.a.content;
			   			var compare = "Live on Giant Bomb!";

			   			if (test === compare){
				gbLive = true;
				var titleName = $(liveLink).text().replace(/[<>]/,'');
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

	$.get(gb_url, function(data){

		scheduleCounter = 0;
		console.log(data);

		if (data.length > 0) {

			var parsedHtml = parseHtml(data);
			var parsedElem = $(parsedHtml).find('dl.promo-upcoming').children('dd');

			if (parsedElem.length > 0) {
				var output = "<ul>";
				$.each(parsedElem, function(index, value){
					var imgCheck = value.style;
					if (imgCheck != undefined){
					var imgUrl = $(value).css('background-image').replace('url(','').replace(')','');
					} else {
					var imgUrl = "images/premium-background.png";
					}
					var eventName = $(value).find('h4').text().replace(/[<>]/,'');
					var eventInfo = $(value).find('p').text();

					// Parse Event Type and Date/Time
					if (eventInfo.indexOf('Live Show') == 0) {
						var eventType = '<i class="fa fa-dot-circle-o fa-lg circle-schedule"></i> Live Show on ';
						var yqlDate = eventInfo.substring(13);
					} else if (eventInfo.indexOf('Video') == 0) {
						var eventType = '<i class="fa fa-play-circle fa-lg circle-schedule"></i> Video on ';
						var yqlDate = eventInfo.substring(9);
					} else if (eventInfo.indexOf('Article') == 0) {
						var eventType = '<i class="fa fa-file-o fa-lg"></i> Article on ';
						var yqlDate = eventInfo.substring(11);
					} else {
						var eventType = '<i class="fa fa-microphone fa-lg"></i> Podcast on ';
						var yqlDate = eventInfo.substring(11);
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

		$.get(gb_url,function(liveshow){

			var liveShowElem = null;
			if ( liveshow.query.count > 0 ) {
				var parsedHtml = parseHtml(liveshow);
				var liveShowElem = $(parsedHtml).find('.header-promo.live.show');
			}

			if ( liveShowElem != null && liveShowElem.length > 0 ) {
				$('#lb-status-live').css('background-image','url(/images/premium-background.png)');
				getShowImageDone.resolve();
			} else {

				var checkForVideo = $(liveShowElem).find('span p');

				if (checkForVideo.length == 0) {
					var parsedElem = $(parsedHtml).find('.kubrick-promo-video');

					if ($(parsedElem).css('background-image') != '') {
						var backgroundImage = $(parsedElem).css('background-image');
						$('#lb-status-live').css('background-image',backgroundImage);
						getShowImageDone.resolve();
					} else {
						parsedElem = $(parsedHtml).find('#wrapper section.promo-strip div ul li').eq(0);
						var backgroundImage = $(parsedElem).css('background-image');
						$('#lb-status-live').css('background-image',backgroundImage);
						getShowImageDone.resolve();
					}
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
