var test;
var logs = {};
var logsKeys = [];
var casenumber = '';



$(document).on('mobileinit', function()
{
    $.mobile.defaultPageTransition = 'slide';
    $.mobile.loadingMessage = true;
    $.mobile.loadingMessageTextVisible = true;
    
    //Initialize map centered on Tech
    $('#map').gmap({'center': new google.maps.LatLng(33.7765, -84.4002)});
});


$('#main').on('pageshow', function()
{
    if (undefined == logs || 0 == Object.size(logs))
    {
        getLogs(updateLogsList);
    }
    else if (0 === $('#logs li').length)
    {
        updateLogsList();
    }
    
    if ($('#filter-list').is(':visible'))
    {
        
    }
});


$('#main').on('click', function() 
{
    $('#filter-list').slideUp();
});


$('#filter').on('click', function(e)
{
    //Cancel #main click slideUp action
    e.stopPropagation();
    $('#filter-list').slideToggle();
});


$('input[name=filter]').on('click', function()
{
    switch ($(this).val())
    {
        case 'all':
            $('#logs li').show();
            console.log('Showing all reports');
            break;
            
        case 'crime':
            $('#logs li[data-crime=true]').show();
            $('#logs li[data-crime=false]').hide();
            console.log("Showing crime reports only");
            break;
            
        case 'non-crime':
            $('#logs li[data-crime=false]').show();
            $('#logs li[data-crime=true]').hide();
            console.log("Showing non-crime reports only");
            break;
    }
});


$('#report').on('pageshow', function()
{
    casenumber = $.url().fparam('number');
    if (undefined == casenumber || casenumber.length < 1)
    {
        console.log('Case number not specified. Redirecting to main page.');
        $.mobile.changePage('#main');
        return;
    }
    
    console.log('Loading case number '+casenumber);
    if (undefined == logs || 0 == Object.size(logs))
    {
        getLogs(updateReport);
    }
    else
    {
        updateReport();
    }
});


$('#report').on('pagehide', function()
{
    //Cleanup of URL so we can have better client URL support
    $(this).attr('data-url',$(this).attr('id'));
    delete $(this).data()['url'];
    
    $('#map').gmap('destroy');
});



function getLogs(callback)
{
    //TODO: WHy doesn't loadingMsg show up?'
    $.mobile.showPageLoadingMsg("a", "Loading reports...");
	$.ajax(
	{
		url: 'api/logs',
		type: 'GET',
		dataType: 'json',
		success: function(data)
		{
			logs = data;
			
			//Sort by start date/time, anti-chronologically
			logsKeys = Object.keys(logs);
			logsKeys.sort(function(a, b)
			{
			    var timeA = new Date(logs[a]['Occurred']['Start Time'] + ' ' 
			            + logs[a]['Occurred']['Start Date']);
	            var timeB = new Date(logs[b]['Occurred']['Start Time'] + ' ' 
			            + logs[b]['Occurred']['Start Date']);
			    return timeA - timeB;
			});
			logsKeys.reverse();
			
			console.log('Fetched ' + Object.size(logs) + ' logs');
		},
		complete: function(data)
		{
		    $.mobile.hidePageLoadingMsg();
		    callback();
		}
	});
}


//Format time in common American 12-hour style
function get12Hour(time)
{
    var time12 = (((parseInt(time.substr(0, 2)) + 11) % 12) + 1) + time.substr(2);
    time12 = '<strong>' + time12 + '</strong>';
    return (+time.substr(0, time.indexOf(':')) < 12) ? time12 + 'AM' : time12 + 'PM';
}

    
function geocode(location)
{
    var address = location['Address'];
    var name = location['Name'];
    var geocoder = new google.maps.Geocoder();
    
    //First, search by address
    geocoder.geocode({'address': address + ', Georgia Institute of Technology'}, function(results, status) 
    {
        if (status == google.maps.GeocoderStatus.OK)
        {
            var location = results[0]['geometry']['location'];
            updateMap(location.lat(), location.lng());
        }
        else
        {
            //If that fails, search by name
            geocoder.geocode({'address': name + ', Georgia Institute of Technology'}, function(results, status) 
            {
                if (status == google.maps.GeocoderStatus.OK)
                {
                    var location = results[0]['geometry']['location'];
                    updateMap(location.lat(), location.lng());
                }
                else
                {
                    //If that fails, search by address up to first comma
                    geocoder.geocode({'address': address.substr(0, address.indexOf(',')) + ', Georgia Institute of Technology'}, function(results, status) 
                    {
                        if (status == google.maps.GeocoderStatus.OK)
                        {
                            var location = results[0]['geometry']['location'];
                            updateMap(location.lat(), location.lng());
                        }
                        else
                        {
                            //If that fails, search by name up to first comma
                            geocoder.geocode({'address': name.substr(0, name.indexOf(',')) + ', Georgia Institute of Technology'}, function(results, status) 
                            {
                                if (status == google.maps.GeocoderStatus.OK)
                                {
                                    var location = results[0]['geometry']['location'];
                                    updateMap(location.lat(), location.lng());
                                }
                                else
                                {
                                    //If all that fails, GTPD should make better-formatted addresses
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}


//Builds UI incrementally in case it executes slowly
function updateLogsList()
{
    //Add reports to list
    $.each(logsKeys, function()
    {
        var report = document.createElement('li');
        $(report).attr('data-crime', logs[this]['Criminal']);        
        var link = document.createElement('a');
        link.id = this;
        link.innerHTML = '<h2>' + logs[this]['Nature'] + '</h2>';
        link.href = '#report&number=' + logs[this]['Case Number'];
        $(report).append(link);
        $('#logs').append(report);
    });
    $('#logs').listview('refresh');
    
    //Add location to reports
    $('#logs a').each(function()
    {
        var name = logs[this.id]['Location']['Name'];
        if (undefined !== name && name.length > 0)
        {
            this.innerHTML += '\n<p>' + name + '</p>';
        }
        else
        {
            this.innerHTML += '\n<p>' + logs[this.id]['Location']['Address'] + '</p>';
        }
    });
    $('#logs').listview('refresh');
    
    //Add time to reports
    var today = new Date();
    $('#logs a').each(function()
    {
        if (null === logs[this.id]['Occurred']['Start Time'])
        {
            return true;
        }
        
        var when = get12Hour(logs[this.id]['Occurred']['Start Time'])
        
        //If not today, use date
        var date = new Date(logs[this.id]['Occurred']['Start Date']);
        if (date.getDay() != today.getDay()
                || date.getMonth() != today.getMonth()
                || date.getYear() != today.getYear())
        {
            when += '<br />' + logs[this.id]['Occurred']['Start Date'];
        }
        else
        {
            when += '<br />Today';
        }
        
        this.innerHTML += '\n<p class=\"ui-li-aside\">' + when + '</p>';
    });
    $('#logs').listview('refresh');
}


function updateMap(lat, lon)
{    
    console.log('Mapping coordinates: ' + lat + ', ' + lon);
    $('#map').gmap('destroy');
    $('#map').gmap({
        'center': new google.maps.LatLng(lat, lon), 
        'zoom': 15, 
        'callback': function() 
        {
            var self = this;
            self.addMarker({
                'position': this.get('map').getCenter(),
            });
            self.refresh();
        }
    });
}


function updateReport()
{
    var report = logs[casenumber];
    
    $('#nature').html(report['Nature']);
    $('#status').html(report['Status']);
    if(report['Disposition'].length > 0)
    {
        $('#disposition').html(' &ndash; ' + report['Disposition']);
    }
    $('#casenumber').html(report['Case Number']);
    $('#starttime').html(get12Hour(report['Occurred']['Start Time']));
    $('#startdate').html(report['Occurred']['Start Date']);
    $('#endtime').html(get12Hour(report['Occurred']['End Time']));
    $('#enddate').html(report['Occurred']['End Date']);
    $('#reported').html(report['Date Reported']);
    $('#location-name').html(report['Location']['Name']);
    $('#location-address').html(report['Location']['Address']);
    
    geocode(report['Location']);
}



//Add size/length property to object/associative array
Object.size = function(obj) 
{
    var key;
    var size = 0;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) ++size;
    }
    return size;
};

