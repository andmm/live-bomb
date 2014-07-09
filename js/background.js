
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

if (storage.isSet('show-schedule') == false){
    storage.set('show-schedule',true);
}


$.ionSound({
    sounds: [
    "bumper",
    "rapman",
    "dropbomb",
    "bman"
    ],
    path: "/sounds/",
    multiPlay: true
});

//GA
ga('send','pageview','/running');

//Routine
var liveRoutine = function(){

    checkLive().done(function(){

        var options = {
            type:"basic",
            title:"Hey duder! GB is live with:",
            message:""+storage.get('title')+"",
            iconUrl:"/images/notificationicon.png"
        }
        if (gbLive == true) {

            chrome.browserAction.setBadgeText({text:'LIVE'});
            $('body').trigger('statusLive');
            if (storage.get('notification') == true && sendMessage == true) {
                sendMessage = false;
                chrome.notifications.create('notify', options, function(){});
                if ( storage.get('notification-sound') == true ) {
                    $.ionSound.play(''+storage.get('sound')+'');
                }
            }
        } else {
            $('body').trigger('statusNotLive');
            sendMessage = true;
            if ( storage.get('schedule-bagde') == true && scheduleCounter > 0) {
                chrome.browserAction.setBadgeText({text:''+scheduleCounter+''});
            } else {
                chrome.browserAction.setBadgeText({text:''});
            }
        }
    });
};

var scheduleRoutine = function(){

    window.buttonRefreshSchedule.addClass('hidden');

    getSchedule().done(function(){
        if (window.scheduleLoadingIcon.length > 0)
        {
            window.scheduleLoadingIcon.effect('fadeOut',2000, function(){
                $(this).fadeOut(300);
            });
        }

        if ( storage.get('schedule-bagde') == true && gbLive == false && scheduleCounter > 0) {
            chrome.browserAction.setBadgeText({text:''+scheduleCounter+''});
        }

        if (window.buttonRefreshSchedule.length > 0)
        {
            window.buttonRefreshSchedule.removeClass('hidden');
        }
    });
};

liveRoutine();
scheduleRoutine();

//Click on notification
chrome.notifications.onClicked.addListener(function(notify){
    $.ionSound.stop(''+storage.get('sound')+'');
    chrome.tabs.create({
        url: 'http://www.giantbomb.com/chat'
    });
});

//Close notifications
chrome.notifications.onClosed.addListener(function(notify){
    $.ionSound.stop(''+storage.get('sound')+'');
});


setInterval(scheduleRoutine, 600000);

setInterval(liveRoutine, storage.get('timer'));
