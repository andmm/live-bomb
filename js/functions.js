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
			if (liveLink.length > 0) {
				gbLive = true;
				var titleName = liveLink.text().replace(/[<>]/,'');
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
				var liveVideo = $(parsedHtml).find('.kubrick-chat-player');
				if (liveVideo.length > 0) {
					var test = $(parsedHtml).find('.kubrick-info a h4').text();
					var compare = "Live on Giant Bomb!";

					if (test === compare){
						gbLive = true;
						var titleName = $(parsedHtml).find('.kubrick-info a h2').text().replace(/[<>]/,'');
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
							'counter':true
						});
						console.log('Text is there but video is no longer live or something broke on this end');
						checkLiveDone.resolve();
					}
				} else {
					gbLive = false;
					storage.set({
						'islive': false,
						'counter': true
					});
					console.log('Counter is up but no live video');
					checkLiveDone.resolve();
				}
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

		if (data.length > 0) {

			var parsedHtml = parseHtml(data);
			var parsedElem = $(parsedHtml).find('dl.promo-upcoming').children('dd');

			if (parsedElem.length > 0) {
				var output = "<ul>";
				var today = moment().get('date');
			
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
						var eventType = '<i class="fa fa-dot-circle-o fa-lg circle-schedule"></i> Live Show ';
						var eventDate = eventInfo.substring(13);
					} else if (eventInfo.indexOf('Video') == 0) {
						var eventType = '<i class="fa fa-play-circle fa-lg circle-schedule"></i> Video ';
						var eventDate = eventInfo.substring(9);
					} else if (eventInfo.indexOf('Article') == 0) {
						var eventType = '<i class="fa fa-file-o fa-lg"></i> Article ';
						var eventDate = eventInfo.substring(11);
					} else {
						var eventType = '<i class="fa fa-microphone fa-lg"></i> Podcast ';
						var eventDate = eventInfo.substring(11);
					}

					var dt = new Date(eventDate);
		
					if ( today == dt.getDate()) {
						var scheduleDate = moment(dt).fromNow();
					} else {
						var scheduleDate = "- " + moment(dt).calendar();
					}

					output +=  '<li style="background-image: url('+ imgUrl +')" class="animated fadeInDownBig"><h4>' + eventName +
					'</h4> <p class="lb-schedule-p">'+ eventType + scheduleDate +'</p></li>';

					scheduleCounter += 1;
				});

				output += "</ul>";
				$('#lb-schedule-items').html(output);
				getScheduleDone.resolve();

			} else {
				$('#lb-schedule-items').html('<h5 id="no-schedule" class="animated slideInDown">There are no items on the schedule. Try refreshing</h5>');
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

		$.get(gb_url,function(liveshow){

			var liveShowElem = null;
			if ( liveshow != null ) {
				var parsedHtml = parseHtml(liveshow);
				var liveShowElem = $(parsedHtml).find('.header-promo.live.show');
			}

			if ( liveShowElem != null && liveShowElem.length < 1 ) {
				$('#lb-status-live').css('background-image','url(/images/premium-background.png)');
				getShowImageDone.resolve();
			} else {

				var checkForVideo = $(liveShowElem).find('p a');

				if (checkForVideo.length > 0) {
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

	return getShowImageDone.promise();
};
