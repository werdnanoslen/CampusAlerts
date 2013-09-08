var test;

function getCrimeLogs()
{
	$.ajax(
	{
		url: "api/crimelogs",
		type: 'GET',
		dataType: "json",
		success: function(data)
		{
			console.log("Fetched "+data.length+" crime logs");
			test = data;
		}
	});
}


function getNonCrimeLogs()
{
	$.ajax(
	{
		url: "api/noncrimelogs",
		type: 'GET',
		success: function(data)
		{
			console.log("Fetched "+data.length+" non-crime logs");
			test = data;
		}
	});
}


//TODO: Get a mappable location from report
function geocode()
{
    //First, search by address + ", Georgia Institute of Technology""
    //If that fails, search by name + ", Georgia Institute of Technology"
    //If that fails, search by address up to first comma + ", Georgia Institute of Technology"
    //If that fails, search by name up to first comma + ", Georgia Institute of Technology"
    //If that fails, just provide address as-is
}

