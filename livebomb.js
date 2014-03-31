//Live Bomb UI 
$(function(){

	//Default Settings
	if (storage.isSet('preferences') == false) {
		storage.set({
			'preferences':'default',
			'notification': $('input:radio[name=notification]:checked').val(),
			'timer': 300000, 
			'theme': 'dark',
			'notification-sound': $('input:radio[name=sound]:checked').val(),
			'sound':$('input:radio[name=sound-select]:checked').val(),
			'schedule-bagde': $('input:radio[name=bagde]:checked').val(),
			'show-schedule': true
		});
	}


	//Update settings value
	if (storage.get('preferences') == 'user-preference') {

		if (storage.get('notification') == false ) {
			$('input:radio[name=notification]').iCheck('check');
		} 

		if (storage.get('notification-sound') == false ) {
			$('input:radio[name=sound]').iCheck('check');
		}

		if (storage.get('schedule-bagde') == true ) {
			$('input:radio[id=schedule-bagde]').iCheck('check');
		} 

		if (storage.get('show-schedule') == false){
			$('input:radio[id=show-schedule-no]').iCheck('check');
		}

		$('input:radio[value='+storage.get('sound')+']').iCheck('check');
	};

	if (storage.isSet('installation') == false){
		storage.set('installation','true');
		ga('send','event','extension','installed');
	}

	if (storage.isSet('islive') == false){
		storage.set('islive',false);
	}

	//GA
	ga('send','pageview','/popup.html');

	//InterfaceCaching
	var buttonSettings = $('#lb-settings');
	var buttonLive = $('#lb-live');
	var buttonSchedule = $('#lb-schedule');
	var buttonRefresh = $('#lb-refresh-button');
	var buttonRefreshSchedule = $('#lb-refresh-schedule');
	var buttonLightTheme = $('#light-theme');
	var buttonDarkTheme = $('#dark-theme');
	var buttonAboutOffline = $('#offline-about-icon');
	var buttonAboutOfflineClose = $('#offline-about-close');
	var buttonAboutSettingsClose = $('#settings-about-close');
	var buttonAboutSettings = $('#settings-about');
	var pageStatus = $('#lb-page-status');
	var pageSettings = $('#lb-page-settings');
	var pageAbout =  $('#lb-page-about'); 
	var pageSchedule = $('#lb-page-schedule');
	var timer = $('#lb-slider-time');
	var timerValue = $('#lb-slider-value');
	var statusOnline = $('#lb-status-live');
	var statusOffline = $('#lb-status-offline');
	var cfgMessage = $('#lb-settings-message');
	var scheduleItems = $('#lb-schedule-items');

	//Set theme
	if ( storage.get('theme') == 'light') {
		buttonDarkTheme.removeClass('active');
		buttonLightTheme.addClass('active').css('cursor','default');
		$('#theme').attr('href','livebomb-light.css');
		$('.control').removeClass('btn-inverse');
		ga('send','event','theme','light');
	} else {
		buttonDarkTheme.css('cursor','default');
		ga('send','event','theme','dark');
	}

	//Get Preferences
	//Notification  

	timer.slider({
		step: 60000,
		min: 60000,
		max: 1800000,  
		slide: function(event,ui){
			timerValue.text("Every "+ui.value/60000+" min");
		},
		create: function(event,ui){
			timerValue.text("Every "+storage.get('timer')/60000+" min");
			timer.slider('option','value',storage.get('timer'));
		},
		stop: function(event,ui){
			console.log('user dropped the handle');
			storage.set('timer',ui.value);
			console.log(storage.get('timer'));
		}
	});	

		if (storage.get('theme') == 'dark') {
	$(".custom-scroll").slimScroll({
		height: '280px',
		color: '#fff',
		distance:'6px',
		size: '8px',
		});
		} else {
	$(".custom-scroll").slimScroll({
		height: '280px',
		color: 'black',
		distance:'6px',
		size: '8px',
		railOpacity: 0,
		});
	}

	
	$('.icheck').iCheck({
   		checkboxClass: 'icheckbox_square',
    	radioClass: 'iradio_square-grey',
  		increaseArea: '20%'
  });


	//
	//Save preferences
	//
	$('#lb-form-settings').submit(function(e){
		e.preventDefault();
		storage.set({
			'preferences':'user-preference',
			'notification': $('input:radio[name=notification]:checked').val(),
			'notification-sound': $('input:radio[name=sound]:checked').val(),
			'sound':$('input:radio[name=sound-select]:checked').val(),
			'schedule-bagde': $('input:radio[name=bagde]:checked').val(),
			'show-schedule':$('input:radio[name=show-schedule]:checked').val()
		});
		cfgMessage.fadeIn(700).fadeTo(1000, 1).fadeOut(500);

		if (storage.get('schedule-bagde') == false && gbLive != true) {
			chrome.browserAction.setBadgeText({text:''});
		}

		if (storage.get('schedule-bagde') == true && gbLive != true && scheduleCounter > 0) {
			chrome.browserAction.setBadgeText({text:''+scheduleCounter+''});
		}
	});

	//Set default view
	buttonLive.toggleClass('active');
	pageSettings.hide();
	pageAbout.hide();
	pageSchedule.hide();
	cfgMessage.hide();

	if (storage.get('islive') == false && storage.get('show-schedule') == true) {
		statusOnline.hide();
		pageStatus.hide();
		pageSchedule.show();
		buttonLive.removeClass('active');
		buttonSchedule.addClass('active');
	
	}
	
	else if  (storage.get('islive') == false && storage.get('show-schedule') == false) {
		statusOnline.hide();
		statusOffline.show();

	} else {
		
		chrome.browserAction.setBadgeText({text:"LIVE"});
		getShowImage();
		statusOnline.show();
		statusOffline.hide();
		$('.fa-dot-circle-o').css("color", 'red').addClass("animated swing");
		$("#show-name").html(storage.get('title'));

	}

	//Interface refresh for live video event
	$('body').on('statusLive',function(){
		if (statusOffline.is(':visible')) {
			statusOffline.fadeOut(200,function(){
				statusOnline.fadeIn(200);
				$('.fa-dot-circle-o').css("color", 'red').addClass("animated swing");
				$("#show-name").html(storage.get('title'));
			});	
		}	
	});

	//Refresh for offline video
	$('body').on('statusNotLive',function(){
		if(statusOnline.is(':visible')) {
			statusOnline.fadeOut(200,function(){
				statusOffline.fadeIn(200);	
				if (storage.get('theme') == 'dark'){
				$('.fa-dot-circle-o').css("color", '#fff').removeClass("animated swing");
				} else {
				$('.fa-dot-circle-o').css("color", '#2b2b2b').removeClass("animated swing");
				}
			});
		}
	});

	
	//ClickEvents
	//Click on Settings
	buttonSettings.click(function() {
		ga('send','event','button','click','settings');	
		if (pageAbout.is(':visible')) {
		pageAbout.hide();
		}

	    pageStatus.effect('slide', {direction:'right', mode:'hide'}, 200);
	    pageSchedule.effect('slide', {direction:'right', mode:'hide'}, 200);
		pageSettings.effect('slide', {direction: 'left', mode:'show'},200);		

	});

	//Click on Live
	buttonLive.click(function()		{
		ga('send','event','button','click','live');

		if (pageSettings.is(':visible')) {
			
			pageStatus.effect('slide', {direction: 'right', mode: 'show'},200);
			pageSettings.effect('slide', {direction: 'left', mode:'hide'},200);
			statusOnline.removeClass('animated');

		} 


		if (pageSchedule.is(':visible')) {
			
			pageStatus.effect('slide', {direction: 'left', mode: 'show'},200);
			pageSchedule.effect('slide', {direction: 'right', mode:'hide'},200);
			statusOnline.removeClass('animated');
   		}

		if (pageAbout.is(':visible')){
			pageAbout.fadeOut(300,function(){
			pageStatus.fadeIn(300);
		});
		}
	}); 


	//Schedule click
	buttonSchedule.click(function() {
		ga('send','event','button','click','schedule');
		if (pageAbout.is(':visible')) {
		pageAbout.hide();
		}
		
		pageSchedule.effect('slide',{direction: 'right', mode:'show'}, 200);
		pageSettings.effect('slide', {direction: 'left', mode:'hide'}, 200);
		pageStatus.effect('slide', {direction: 'left', mode:'hide'}, 200);

	});	

	//Status refresh
	buttonRefresh.click(function(){
		ga('send','event','button','click','status-refresh');
		if (storage.get('theme') == 'dark') {
		buttonRefresh.removeClass('fa-refresh').addClass('fa-cog fa-spin').css('color','#a0a0a0');
	} else {
		buttonRefresh.removeClass('fa-refresh').addClass('fa-cog fa-spin').css('color','#2b2b2b');
	}
		checkLive().done(function(){
			if (storage.get('theme') == 'dark') {
			buttonRefresh.removeClass('fa-cog fa-spin').addClass('fa-refresh').css('color','#fff');	
		} else {
			buttonRefresh.removeClass('fa-cog fa-spin').addClass('fa-refresh').css('color','#2b2b2b');		
		}
			if ( gbLive == true ) {
			
			statusOnline.addClass('animated bounceInUp').show();
			statusOffline.hide();
			chrome.browserAction.setBadgeText({text:'LIVE'});
			$('.fa-dot-circle-o').css("color", 'red').addClass("animated swing");
			$("#show-name").html(storage.get('title'));

					if (sendMessage == true && storage.get('notification') == true) {
							chrome.notifications.create('notify', options, function(){
						sendMessage = false;
					});
				}
			} else {
			sendMessage = true;
			statusOffline.show();
			statusOnline.hide();
				if (storage.get('notification') == false) {
				chrome.browserAction.setBadgeText({text:''});
				};
			};
		});
	});	

	//Schedule refresh
	buttonRefreshSchedule.click(function(){
		ga('send','event','button','click','schedule-refresh');
		if (storage.get('theme') == 'dark'){
		$(this).removeClass('fa-refresh').addClass('fa-times').css({'color':'#a0a0a0','cursor':'default'});
		} else {
		$(this).removeClass('fa-refresh').addClass('fa-times').css({'color':'#646464','cursor':'default'});	
		} 
		scheduleItems.fadeOut(200,function(){
			$(this).html('');
			scheduleLoadingIcon.fadeIn(300);
		});
		getSchedule().done(function(){
			scheduleLoadingIcon.effect('fadeOut',2000, function(){
			$(this).fadeOut(300);
			scheduleItems.fadeIn(100);
		});
			if (storage.get('theme') == 'dark') {
			buttonRefreshSchedule.removeClass('fa-times').addClass('fa-refresh').css({'color':'#fff','cursor':'pointer'});
			} else {
			buttonRefreshSchedule.removeClass('fa-times').addClass('fa-refresh').css({'color':'#2b2b2b','cursor':'pointer'});	
			} 
		})
	});	

	//About Offline
	buttonAboutOffline.click(function(){
		ga('send','event','button','click','about-offline');
		buttonAboutOfflineClose.show();
		buttonAboutSettingsClose.hide();
		pageStatus.fadeOut(300);
		pageAbout.fadeIn(300);
		if (storage.get('theme') == 'light') {
			$('.slimScrollBar').css('background-color','#fff');	
		}
	});

	buttonAboutOfflineClose.click(function(){
		pageAbout.fadeOut(300);
		pageStatus.fadeIn(300);
		if (storage.get('theme') == 'light') {
			$('.slimScrollBar').css('background-color','#2b2b2b');
		}
	});

	//About Settings 

	buttonAboutSettings.click(function(){
		ga('send','event','button','click','about-settings');
		pageSettings.fadeOut(300,function(){
			pageAbout.fadeIn(300);	
		});
		buttonAboutOfflineClose.hide();
		buttonAboutSettingsClose.show();
		if (storage.get('theme') == 'light') {
			$('.slimScrollBar').css('background-color','#fff');	
			buttonAboutSettingsClose.css('color','#fff')
		}
		
	});

	buttonAboutSettingsClose.click(function(){
		pageAbout.fadeOut(300, function(){
			pageSettings.fadeIn(300);	
		});
		if (storage.get('theme') == 'light') {
			$('.slimScrollBar').css('background-color','#2b2b2b');
		}
	});


	//Light Theme
	buttonLightTheme.click(function(){
		ga('send','event','button','click','light-theme');
		storage.set('theme','light');
		$('#theme').attr('href','livebomb-light.css');
		buttonRefresh.css('color','#2b2b2b');
		buttonRefreshSchedule.css('color','#2b2b2b');
		$(".slimScrollBar").css('background-color','#2b2b2b');
		buttonLightTheme.css('cursor','default');
		buttonDarkTheme.css('cursor','pointer');
	});

	//Dark Theme
	buttonDarkTheme.click(function(){
		ga('send','event','button','click','dark-theme');
		storage.set('theme','dark');
		$('#theme').attr('href','livebomb-dark.css');
		$('.control').addClass('btn-inverse');
		buttonRefresh.css('color','#fff');
		buttonRefreshSchedule.css('color','#fff');
		$(".slimScrollBar").css('background-color','white');
		buttonDarkTheme.css('cursor','default');
		buttonLightTheme.css('cursor','pointer');
	});


	//Click on live video event
	$('#live-link').click(function(){
		ga('send','event','button','click','live-video');
	});
	
	$('#donation-link').click(function(){
		ga('send','event','button','click','donation');
	});

	$('#lb-author').click(function(){
		ga('send','event','button','click','my-page');
	});


	//Test Sounds
	$('#lb-play-rapman').click(function(){
		$.ionSound.play('rapman');
	});
	
	$('#lb-play-bumper').click(function(){
		$.ionSound.play('bumper');
	});

	$('#lb-play-dropbomb').click(function(){
		$.ionSound.play('dropbomb');
	});

});	