var test;
var logs = {};
var logsKeys = [];
var casenumber = '';



$(document).on('mobileinit', function()
{
    $.mobile.defaultPageTransition = 'slide';
    $.mobile.loadingMessageTextVisible = true;
});


$('#main').on('pagebeforeshow', function()
{
    if (undefined == logs || 0 == Object.size(logs))
    {
        getLogs(updateLogsList);
    }
    else if (0 === $('#logs li').length)
    {
        updateLogsList();
    }
});


$('#report').on('pagebeforeshow', function()
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


//Cleanup of URL so we can have better client URL support
$('#report').on('pagehide', function()
{
    $(this).attr('data-url',$(this).attr('id'));
    delete $(this).data()['url'];
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
			var start = new Date();
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
			var stop = new Date();
			alert(stop - start);
			
			console.log('Fetched ' + Object.size(logs) + ' logs');
			$.mobile.hidePageLoadingMsg();
		},
		complete: callback
	});
}


//TODO: Get a mappable location from report
function geocode()
{
    //First, search by address + ', Georgia Institute of Technology'
    //If that fails, search by name + ', Georgia Institute of Technology'
    //If that fails, search by address up to first comma + ', Georgia Institute of Technology'
    //If that fails, search by name up to first comma + ', Georgia Institute of Technology'
    //If that fails, just provide address as-is
}


//Builds UI incrementally in case it executes slowly
function updateLogsList()
{
    //Add reports to list
    $.each(logsKeys, function()
    {
        var report = document.createElement('li');
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
        var when;
        
        //Format time in common American 12-hour style
        var time = logs[this.id]['Occurred']['Start Time'];
        var time12 = (((parseInt(time.substr(0, 2)) + 11) % 12) + 1) + time.substr(2);
        if (+time.substr(0, time.indexOf(':')) < 12)
        {
            when = '<strong>' + time12 + '</strong>AM';
        }
        else
        {
            when = '<strong>' + time12 + '</strong>PM';
        }
        
        //If not today, add date
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


function updateReport()
{
    $('#description').html('<pre>' + JSON.stringify(logs[casenumber], null, 4) + '</pre>');
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

