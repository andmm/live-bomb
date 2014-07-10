//Live Bomb UI
$(function(){

    //Default Settings
    if (storage.isSet('preferences') == false) {
        storage.set({
            'preferences':'default',
            'notification': true,
            'timer': 300000,
            'theme': 'dark',
            'notification-sound': true,
            'sound':'dropbomb',
            'schedule-bagde': true,
            'show-schedule': true
        });
        scheduleCounter = 0;
    };

    //Fix popup styling for Mac users
    if (navigator.appVersion.indexOf("Mac")!=-1) {
        $('body').css('border','1.5px solid');
    }

    //Update settings value
    if (storage.get('preferences') == 'user-preference') {

        if (storage.get('notification') == false ) {
            $('input:radio[name=notification]').iCheck('check');
        }

        if (storage.get('notification-sound') == false ) {
            $('input:radio[name=sound]').iCheck('check');
        }

        if (storage.get('schedule-bagde')) {
            $('input:radio[id=schedule-bagde]').iCheck('check');
        }

        if (storage.get('show-schedule') == false){
            $('input:radio[id=show-schedule-no]').iCheck('check');
        }

        $('input:radio[value='+storage.get('sound')+']').iCheck('check');
    };

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
        buttonLightTheme.addClass('active');
        $('body').addClass('livebomb-light');
        $('body').removeClass('livebomb-dark');
        ga('send','event','theme','light');
    } else {
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
            cfgMessage.fadeIn(700).fadeTo(350, 1).fadeOut(400);
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

    //Save Preferences automatically
    $('input').on('ifChecked', function(event){

        storage.set('preferences','user-preference');
        cfgMessage.fadeIn(700).fadeTo(350, 1).fadeOut(400);

        var a = $(this);
        var b = a.context.name;
        var c = a.context.value;
        var d = ["notification","sound","sound-select",'bagde','show-schedule'];
        var e = d.indexOf(b);

        switch(e){
        case 0:
        storage.set('notification',c);
        break;
    case 1:
        storage.set('notification-sound',c);
        break;
    case 2:
    storage.set('sound',c);
    break;
case 3:
storage.set('schedule-bagde',c);
$('body').trigger('checkBadge');
break;
default:
storage.set('show-schedule',c);
}
});

//Update schedule badge on change
$('body').on('checkBadge',function(){
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
    $('#lb-status-live').css('background-image', 'url("' + storage.get('liveImage') + '")');
    statusOnline.show();
    statusOffline.hide();
    $('#button-icon').css("color", 'red').addClass("animated swing");
    $("#show-name").html(storage.get('title'));
}

//Interface refresh for live video event
$('body').on('statusLive',function(){
    if (statusOffline.is(':visible')) {
        statusOffline.fadeOut(200,function(){
            statusOnline.fadeIn(200);
            $('#button-icon').css("color", 'red').addClass("animated swing");
            $("#show-name").html(storage.get('title'));
        });
    }

    if (pageSchedule.is(':visible')) {
        pageSchedule.fadeOut(300,function(){
            pageStatus.fadeIn(300);
            statusOffline.hide();
            statusOnline.show();
            buttonSchedule.toggleClass('active');
            buttonLive.toggleClass('active');
            $('#button-icon').css("color", 'red').addClass("animated swing");
            $("#show-name").html(storage.get('title'));
        });
    }
});

//Refresh for offline video
$('body').on('statusNotLive',function(){
    if(statusOnline.is(':visible')) {
        statusOnline.fadeOut(200,function(){
            statusOffline.fadeIn(200);
            $('.fa-dot-circle-o').removeClass("animated swing");
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

    buttonRefresh.removeClass('fa-refresh').addClass('fa-cog fa-spin');

    checkLive().done(function(){
        buttonRefresh.removeClass('fa-cog fa-spin').addClass('fa-refresh');

        if ( gbLive == true ) {

            statusOnline.addClass('animated bounceInUp').show();
            statusOffline.hide();
            chrome.browserAction.setBadgeText({text:'LIVE'});
            $('#button-icon').css("color", 'red').addClass("animated swing");
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

    $(this).removeClass('fa-refresh').addClass('fa-times');

    scheduleItems.fadeOut(200,function(){
        $(this).html('');
        window.scheduleLoadingIcon.fadeIn(300);
    });
    getSchedule().done(function(){
        window.scheduleLoadingIcon.effect('fadeOut',2000, function(){
            $(this).fadeOut(300);
            scheduleItems.fadeIn(100);
        });

        buttonRefreshSchedule.removeClass('fa-times').addClass('fa-refresh');
    })
});

//About Offline
buttonAboutOffline.click(function(){
    ga('send','event','button','click','about-offline');
    buttonAboutOfflineClose.show();
    buttonAboutSettingsClose.hide();
    pageStatus.fadeOut(300);
    pageAbout.fadeIn(300);
});

buttonAboutOfflineClose.click(function(){
    pageAbout.fadeOut(300);
    pageStatus.fadeIn(300);
});

//About Settings

buttonAboutSettings.click(function(){
    ga('send','event','button','click','about-settings');
    pageSettings.fadeOut(300,function(){
        pageAbout.fadeIn(300);
    });
    buttonAboutOfflineClose.hide();
    buttonAboutSettingsClose.show();
});

buttonAboutSettingsClose.click(function(){
    pageAbout.fadeOut(300, function(){
        pageSettings.fadeIn(300);
    });
});


//Light Theme
buttonLightTheme.click(function(){
    ga('send','event','button','click','light-theme');

    storage.set('theme','light');

    $('body').removeClass('livebomb-dark');
    $('body').addClass('livebomb-light');
});

//Dark Theme
buttonDarkTheme.click(function(){
    ga('send','event','button','click','dark-theme');
    storage.set('theme','dark');

    $('body').removeClass('livebomb-light');
    $('body').addClass('livebomb-dark');
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

$('#lb-play-bman').click(function(){
    $.ionSound.play('bman');
});

});
