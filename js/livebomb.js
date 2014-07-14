//Live Bomb UI
$(function() {

    //Initialize slimscroll
    $(".custom-scroll").slimScroll({
        height: '280px',
        distance:'6px',
        size: '8px',
        railOpacity: 0,
    });

    //Fix popup styling for Mac users
    if (navigator.appVersion.indexOf('Mac') !== -1) {
        $('body').css('border','1.5px solid');
    }

    //Initialize settings display
    $.each(preferences, function(name, val) {
        switch (val.type) {
        case 'radio':
            $('input:radio[name="' + name + '"][value=' + storage.get(name) + ']').prop('checked', true);
            break;
        case 'range':
            var rangeinput = $('input[type="range"][name="' + name + '"]');
            rangeinput.val(storage.get(name));
            $('#rangeval-' + name).html(storage.get(name) / rangeinput.attr('step'));
            break;
        }
    });

    //GA
    ga('send', 'pageview', '/popup.html');

    //InterfaceCaching
    var buttonLive = $('#lb-live');
    var buttonSchedule = $('#lb-schedule');

    var buttonRefresh = $('#lb-refresh-button');
    var buttonRefreshSchedule = $('#lb-refresh-schedule');
    var scheduleLoadingIcon = $('#lb-schedule-loading');

    var buttonLightTheme = $('#light-theme');
    var buttonDarkTheme = $('#dark-theme');
    var pageStatus = $('#lb-page-status');
    var pageAbout =  $('#lb-page-about');
    var pageSchedule = $('#lb-page-schedule');

    var statusOnline = $('#lb-status-live');
    var statusOffline = $('#lb-status-offline');
    var cfgMessage = $('#lb-settings-message');
    var scheduleItems = $('#lb-schedule-items');

    //Set theme
    if (storage.get('theme') === 'light') {
        buttonDarkTheme.removeClass('active');
        buttonLightTheme.addClass('active');
        $('body').addClass('livebomb-light');
        $('body').removeClass('livebomb-dark');
        ga('send', 'event', 'theme', 'light');
    } else {
        ga('send', 'event', 'theme', 'dark');
    }

    //Save Preferences automatically
    $('input').change(function() {
        //Display "Saved" message.
        storage.set('preferences','user-preference');
        cfgMessage.fadeIn(700).fadeTo(350, 1).fadeOut(400);

        if (this.type == "radio" && this.checked) {
            storage.set(this.name, this.value);
            console.log('saved: ' + this.name + ' = ' + this.value);
            $('body').trigger('checkBadge');
        } else if(this.type == "checkbox") {
            storage.set(this.name, this.checked);
            $('body').trigger('checkBadge');
        } else if (this.type == "range") {
            storage.set(this.name, this.value);
        }
    });

    //Update range value display during input
    $('input[type="range"]').on('input', function() {
        $('#rangeval-' + this.name).html(this.value / this.step);
    });

    //Update schedule badge on change
    $('body').on('checkBadge',function() {
        if (storage.get('schedule-badge') === false && gbLive !== true) {
            chrome.browserAction.setBadgeText({text: ''});
        }

        if (storage.get('schedule-badge') === true && gbLive !== true && scheduleCounter > 0) {
            chrome.browserAction.setBadgeText({text:'' + scheduleCounter + ''});
        }
    });

    if (storage.get('islive') === false && storage.get('show-schedule') === true) {
        $('[href="#lb-page-schedule"]').tab('show');
    } else if (storage.get('islive') === false && storage.get('show-schedule') === false) {
    } else {
        chrome.browserAction.setBadgeText({text: 'LIVE'});
        $('#lb-status-live').css('background-image', 'url("' + storage.get('liveImage') + '")');
        statusOnline.show();
        statusOffline.hide();
        $('#button-icon').css('color', 'red');
        $('#show-name').html(storage.get('title'));
    }

    //Interface refresh for live video event
    $('body').on('statusLive',function() {
        if (statusOffline.is(':visible')) {
            statusOffline.fadeOut(200, function() {
                statusOnline.fadeIn(200);
                $('#button-icon').css('color', 'red');
                $('#show-name').html(storage.get('title'));
            });
        }

        if (pageSchedule.is(':visible')) {
            pageSchedule.fadeOut(300, function() {
                pageStatus.fadeIn(300);
                statusOffline.hide();
                statusOnline.show();
                buttonSchedule.toggleClass('active');
                buttonLive.toggleClass('active');
                $('#button-icon').css('color', 'red');
                $('#show-name').html(storage.get('title'));
            });
        }
    });

    //Refresh for offline video
    $('body').on('statusNotLive',function() {
        if (statusOnline.is(':visible')) {
            statusOnline.fadeOut(200,function() {
                statusOffline.fadeIn(200);
            });
        }
    });

    //Status refresh
    buttonRefresh.click(function() {
        ga('send', 'event', 'button', 'click', 'status-refresh');

        buttonRefresh.removeClass('fa-refresh').addClass('fa-cog fa-spin');

        checkLive().done(function() {
            buttonRefresh.removeClass('fa-cog fa-spin').addClass('fa-refresh');

            if (gbLive === true) {
                statusOnline.show();
                statusOffline.hide();

                chrome.browserAction.setBadgeText({ text: 'LIVE' });

                $('#button-icon').css('color', 'red');
                $('#show-name').html(storage.get('title'));

                if (sendMessage === true && storage.get('notification') === true) {
                    chrome.notifications.create('notify', options, function() {
                        sendMessage = false;
                    });
                }
            } else {
                sendMessage = true;
                statusOffline.show();
                statusOnline.hide();

                if (storage.get('notification') === false) {
                    chrome.browserAction.setBadgeText({text: ''});
                }
            }
        });
    });

    //Schedule refresh
    buttonRefreshSchedule.click(function() {
        ga('send', 'event', 'button', 'click', 'schedule-refresh');

        $(this).removeClass('fa-refresh').addClass('fa-times');

        scheduleItems.html('').hide();
        scheduleLoadingIcon.show();

        getSchedule().done(function() {
            scheduleLoadingIcon.hide();
            scheduleItems.show();

            buttonRefreshSchedule.removeClass('fa-times').addClass('fa-refresh');
        });
    });

    // About Close Button
    $('#offline-about-close').click(function() {
        pageAbout.removeClass('active');
        var lastPageID = $('#lb-controls li.active a').attr('href');
        $(lastPageID).addClass('active');
    });

    //Light Theme
    buttonLightTheme.click(function(){
        ga('send', 'event', 'button', 'click', 'light-theme');
        $('body').removeClass('livebomb-dark').addClass('livebomb-light');
    });

    //Dark Theme
    buttonDarkTheme.click(function() {
        ga('send', 'event', 'button', 'click', 'dark-theme');
        $('body').removeClass('livebomb-light').addClass('livebomb-dark');
    });

    //Test Sounds
    $('[data-playsound]').click(function() {
        audio.playSound($(this).attr('data-playsound'));
    });

    // Windows Hide Scrollbar Hack
    // TODO: I HAVE NO IDEA WHY THIS IS NECESSARY OR WHY IT WORKS!
    setTimeout(function() {
        $('body').height('379px');

        setTimeout(function() {
            $('body').height('');
        }, 100);
    }, 100);

    // Prevent flash of unstyled content
    $('html').show();

    buttonRefresh.click();
    buttonRefreshSchedule.click();

});
