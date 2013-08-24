var test;

function getCrimeLogs()
{
	$.ajax(
	{
		url: "api/crimelogs",
		type: 'GET',
		success: function(data)
		{
			console.log(data);
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
			console.log(data);
			test = data;
		}
	});
}

