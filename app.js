var test;
var logs;



$(document).on("mobileinit", function()
{
    $.mobile.defaultPageTransition = 'slide';
});


$('#main').on('pagebeforeshow', function()
{
    if (undefined == logs || 0 == logs.length)
    {
        getLogs(false);
    }
    $.each(logs, function()
    {
        var report = document.createElement('li');
        var link = document.createElement('a');
        link.innerHTML = this['Nature'];
        link.href = '#report&number='+this['Case Number'];
        $(report).append(link);
        $('#logs').append(report);
    });
    $('#logs').listview('refresh');
});


$('#report').on('pagebeforeshow', function()
{
    var casenumber = $.url().fparam('number');
    if (undefined == casenumber || casenumber.length < 1)
    {
        console.log('Case number not specified. Redirecting to main page.');
        $.mobile.changePage('#main');
        return;
    }
    
    console.log('Loading case number '+casenumber);
    if (undefined == logs || 0 == Object.size(logs))
    {
        getLogs(false);
    }
    $('#description').html(logs[casenumber]['Nature']);
});


//Cleanup of URL so we can have better client URL support
$('#report').on('pagehide', function()
{
    $(this).attr("data-url",$(this).attr("id"));
    delete $(this).data()['url'];
});



function getLogs(async)
{
	$.ajax(
	{
		url: "api/logs",
		type: 'GET',
		dataType: "json",
		async: async,
		success: function(data)
		{
			console.log("Fetched "+Object.size(data)+" logs");
			logs = data;
		}
	});
}


//TODO: Get a mappable location from report
function geocode()
{
    //First, search by address + ", Georgia Institute of Technology"
    //If that fails, search by name + ", Georgia Institute of Technology"
    //If that fails, search by address up to first comma + ", Georgia Institute of Technology"
    //If that fails, search by name up to first comma + ", Georgia Institute of Technology"
    //If that fails, just provide address as-is
}



//Add size/length property to object/associative array
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

