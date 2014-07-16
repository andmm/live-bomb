//Live check query variables.
//Variables

var gb_url = "http://www.giantbomb.com/upcoming_json";
var gbLive = false;
var storage = $.localStorage;
var sendMessage = false;
var scheduleCounter = 0;

var preferences = {
    //Internal settings
    'preferences': {default: chrome.runtime.getManifest().version, type: null},
    'islive': {default: false, type: null},
    //User settings
    'notification': {default: true, type: 'radio'},
    'timer': {default: 300000, type: 'range'},
    'theme': {default: 'dark', type: 'radio'},
    'notification-sound': {default: true, type: 'radio'},
    'sound': {default: 'dropbomb', type: 'radio'},
    'schedule-badge': {default: true, type: 'radio'},
    'show-schedule': {default: true, type: 'radio'},
};

//Initialize audio handler object.
var audio = {};
audio.currentAudio = null;
audio.playSound = function(sound) {
    //Stop any current sound.
    if (this.currentAudio) {
        this.currentAudio.pause();
        document.body.removeChild(this.currentAudio);
        this.currentAudio = null;
    }

    //Add and init new sound.
    this.currentAudio = document.createElement('audio');
    document.body.appendChild(this.currentAudio);
    this.currentAudio.autoplay = true;
    this.currentAudio.volume = 1.0;
    this.currentAudio.src = 'sounds/' + sound + '.ogg';
};
audio.stopSound = function() {
    //Stop any current sound.
    if (this.currentAudio) {
        this.currentAudio.pause();
    }
};

//Check for live video
var checkLive = function() {
    var checkLiveDone = $.Deferred();

    $.getJSON(gb_url, function(data){
        if (data.liveNow !== null) {
            gbLive = true;

            storage.set({
                'islive': true,
                'title': data.liveNow.title,
                'liveImage': data.liveNow.image,
                'countdown': false
            });

            checkLiveDone.resolve();
        } else {
            gbLive = false;

            storage.set({
                'islive': false
            });

            checkLiveDone.resolve();
        }
    });

    return checkLiveDone.promise();
};


//Schedule Function
var getSchedule = function() {

    var getScheduleDone = $.Deferred();

    $.getJSON(gb_url, function(data) {
        scheduleCounter = 0;

        if (data.upcoming.length > 0) {
            var output = "<ul>",
                eventType,
                scheduleDate,
                liveShows = [];

            $.each(data.upcoming, function(key, val) {
                // Parse Date
                var date  = new Date(val.date),
                    formatted = moment(date).format('dddd, MMMM Do YYYY, h:mm:ss a'),
                    dt    = moment.tz(formatted, 'dddd, MMMM Do YYYY, h:mm:ss a', 'America/Los_Angeles'),
                    today = moment().get('date');

                val.dt = dt;

                // Parse Event Type
                switch (val.type) {
                case 'Live Show':
                    eventType = '<i class="fa fa-dot-circle-o fa-lg circle-schedule"></i> Live Show ';
                    liveShows.push(val);
                    break;
                case 'Video':
                    eventType = '<i class="fa fa-play-circle fa-lg circle-schedule"></i> Video '; break;
                case 'Article':
                    eventType = '<i class="fa fa-file-o fa-lg"></i> Article '; break;
                case 'Podcast':
                    eventType = '<i class="fa fa-microphone fa-lg"></i> Podcast '; break;
                default:
                    eventType = '<i class="fa fa-question-circle fa-lg"></i> Something ';
                }

                dt.zone(moment().zone());

                if (today == dt) {
                    scheduleDate = dt.fromNow();
                } else {
                    scheduleDate = '- ' + dt.calendar();
                }

                var eventName = val.title,
                    eventImage = "'" + val.image + "'";

                // Assemble Output
                output +=  '<li style="background-image: url('+ eventImage +')" class=""><h4>' + eventName +
                    '</h4> <p class="lb-schedule-p">'+ eventType + scheduleDate +'</p></li>';

                scheduleCounter += 1;
            });

            if (liveShows.length > 0) {
                // Find the earliest live show date
                var nextShow = moment.min.apply(null, $.map(liveShows, function(show) {
                    return show.dt;
                })).toDate();

                storage.set({
                    countdown: nextShow
                });
            } else {
                storage.set({
                    countdown: false
                });
            }

            output += '</ul>';
            $('#lb-schedule-items').html(output);
            getScheduleDone.resolve();
        } else {
            $('#lb-schedule-items').html('<h5 id="no-schedule" class="">There are no items on the schedule. Try refreshing.</h5>');
            scheduleCounter = 0;
            getScheduleDone.resolve();
        }
    });

    return getScheduleDone.promise();
};

var setCountdown = function(date) {
    $('#lb-status-timer').countdown({
        date: date,
        render: function(data) {
            var output = '';

            if (data.days > 0) {
                output += data.days + ' days, ';
            }

            output += pluralize(data.hours, ' hour') + ', ';
            output += pluralize(data.min, ' minute') + ', and ';
            output += pluralize(data.sec, ' second');

            $(this.el).html(output);
        }
    });
};

var pluralize = function(number, string) {
    return '' + number + string + (number !== 1 ? 's' : '');
};
