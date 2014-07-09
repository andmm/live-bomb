//Live check query variables.
//Variables

var gb_url = "http://www.giantbomb.com/upcoming_json";
var gbLive;
var storage = $.localStorage;
var sendMessage;
var scheduleCounter;

window.scheduleLoadingIcon = $('#lb-schedule-loading');
window.buttonRefreshSchedule = $('#lb-refresh-schedule');

//Check for live video
var checkLive = function(){
    var checkLiveDone = $.Deferred();

    $.getJSON(gb_url, function(data){
        if (data.liveNow != null)
        {
            gbLive = true;
            storage.set({
                'islive': true,
                'title': data.liveNow.title,
                'liveImage': data.liveNow.image,
                'counter':false
            });

            checkLiveDone.resolve();
        }
        else
        {
            gbLive = false;
            storage.set({
                'islive':false,
                'counter':false
            });
        }
    });
    return checkLiveDone.promise();
};


//Schedule Function
var getSchedule = function(){

    var getScheduleDone = $.Deferred();

    $.getJSON(gb_url, function(data){

        scheduleCounter = 0;

        if (data.upcoming.length > 0) {
            var output = "<ul>";
            $.each(data.upcoming, function(key,val) {
                // Parse Event Type
                switch (val.type)
                {
                case "Live Show":
                    var eventType = '<i class="fa fa-dot-circle-o fa-lg circle-schedule"></i> Live Show ';
                    break;
                case "Video":
                    var eventType = '<i class="fa fa-play-circle fa-lg circle-schedule"></i> Video ';
                    break;
                case "Article":
                    var eventType = '<i class="fa fa-file-o fa-lg"></i> Article ';
                    break;
                case "Podcast":
                    var eventType = '<i class="fa fa-microphone fa-lg"></i> Podcast ';
                    break;
                default:
                    var eventType = '<i class="fa fa-question-circle fa-lg"></i> Something ';
                    break;
                }

                // Parse Date
                var dt = moment.tz(moment(new Date(val.date)).format("dddd, MMMM Do YYYY, h:mm:ss a"), "dddd, MMMM Do YYYY, h:mm:ss a", "America/Los_Angeles");
                var today = moment().get('date');

                dt.zone(moment().zone());

                if (today == dt) {
                    var scheduleDate = dt.fromNow();
                } else {
                    var scheduleDate = "- " + dt.calendar();
                }

                var eventName = val.title;
                var eventImage = "'" + val.image + "'";

                // Assemble Output
                output +=  '<li style="background-image: url('+ eventImage +')" class="animated fadeInDownBig"><h4>' + eventName +
                '</h4> <p class="lb-schedule-p">'+ eventType + scheduleDate +'</p></li>';

                scheduleCounter += 1;
            });

            output += "</ul>";
            $('#lb-schedule-items').html(output);
            getScheduleDone.resolve();

        } else {
            $('#lb-schedule-items').html('<h5 id="no-schedule" class="animated slideInDown">There are no items on the schedule. Try refreshing.</h5>');
            scheduleCounter = 0;
            getScheduleDone.resolve();
        }

    });

    return getScheduleDone.promise();
};
