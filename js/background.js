
//Initialize settings if none present or if out of date (in case new setting introduced)
if (storage.isSet('preferences') === false || storage.get('preferences') != preferences.preferences.default) {
    storage.set('preferences', preferences.preferences.default);
    $.each(preferences, function(name, val) {
        if (storage.isSet(name) === false) {
            storage.set(name, val.default);
        }
    });
}

if (storage.isSet('show-schedule') === false){
    storage.set('show-schedule', true);
}

//GA
ga('send', 'pageview', '/running');

//Routine
var liveRoutine = function() {

    checkLive().done(function() {
        var options = {
            type: 'basic',
            title: 'Hey duder! GB is live with:',
            message: '' + storage.get('title') + '',
            iconUrl: '/images/notificationicon.png'
        };

        if (gbLive === true) {
            chrome.browserAction.setBadgeText({ text: 'LIVE' });
            $('body').trigger('statusLive');

            if (storage.get('notification') === true && sendMessage === true) {
                sendMessage = false;
                chrome.notifications.create('notify', options, function(){});

                if (storage.get('notification-sound') === true) {
                    audio.playSound(storage.get('sound'));
                }
            }
        } else {
            $('body').trigger('statusNotLive');

            sendMessage = true;
            if (storage.get('schedule-badge') === true && scheduleCounter > 0) {
                chrome.browserAction.setBadgeText({text: '' + scheduleCounter + ''});
            } else {
                chrome.browserAction.setBadgeText({text: ''});
            }
        }
    });
};

var scheduleRoutine = function() {
    getSchedule().done(function() {
        if (storage.get('schedule-badge') === true && gbLive === false && scheduleCounter > 0) {
            chrome.browserAction.setBadgeText({text: '' + scheduleCounter + ''});
        }
    });
};

liveRoutine();
scheduleRoutine();

// Click on notification
chrome.notifications.onClicked.addListener(function(notify) {
    audio.stopSound();
    chrome.tabs.create({
        url: 'http://www.giantbomb.com/chat'
    });
});

// Close notifications
chrome.notifications.onClosed.addListener(function(notify) {
    audio.stopSound();
});

setInterval(scheduleRoutine, 600000);
setInterval(liveRoutine, storage.get('timer'));
