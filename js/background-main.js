
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

liveRoutine();
scheduleRoutine();

// Click on notification
chrome.notifications.onClicked.addListener(function(chatUrl) {
    audio.stopSound();
    chrome.tabs.create({
        url: chatUrl
    });
});

// Close notifications
chrome.notifications.onClosed.addListener(function(notify) {
    audio.stopSound();
});

//Listen for messages from popup
chrome.runtime.onMessage.addListener(function(req,sender,sendResponse) {
    if (req.action === "schedule") {
        scheduleRoutine().done(function() {
            sendResponse(siteData);
        });
    } else if (req.action === "live") {
        liveRoutine().done(function() {
            sendResponse(siteData);
        });
    }

    //Return true to indicate that sendResponse will be called asynchronously
    return true;
});

setInterval(scheduleRoutine, 600000);
setInterval(liveRoutine, storage.get('timer'));
