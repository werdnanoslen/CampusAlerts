<?php


function getCrimeLogs() 
{
    //Get table and feed it into an array by row
    $url = "http://www.police.gatech.edu/crimeinfo/crimelogs/crimelog.php";
	$dom = new DOMDocument;
    $dom->loadHTMLFile($url);
    $table = $dom->getElementsByTagName('tr');
    $rows = array();
    for ($i = 0; $i < $table->length; ++$i) 
    {
        $rows[$i] = $table->item($i);
    }
    
    //Chop out the useless rows (before and including the black header)
    for ($i = 5; $i >= 0; --$i)
    {
        unset($rows[$i]);
    }
    $rows = array_values($rows);
    
    //Organize into array of reports
    $reports = array();
    for ($i = 0; $i < count($rows); $i+=2) 
    {
        $td = $rows[$i]->getElementsByTagName('td');
        $occurred = trimHarder($td->item(2)->nodeValue);
        $location = substr($rows[$i+1]->nodeValue, 10, strpos($rows[$i+1]->nodeValue, ": Nature:")-10);
        $reports[$i/2] = array
        (
            "Case Number"=>trimHarder($td->item(0)->nodeValue),
            "Date Reported"=>trimHarder($td->item(1)->nodeValue),
            "Occurred"=>array
            (
                "Start Date"=>substr($occurred, 0, strpos($occurred, " @ ")),
                "Start Time"=>substr($occurred, strpos($occurred, " @ ")+3, 5),
                "End Date"=>substr($occurred, strpos($occurred, " - ")+3, strrpos($occurred, " @ ") - (strpos($occurred, " - ")+3)),
                "End Time"=>substr($occurred, strrpos($occurred, " @ ")+3),
            ),
            "Disposition"=>trimHarder($td->item(3)->nodeValue),
            "Status"=>trimHarder($td->item(4)->nodeValue),
            "Location"=>array
            (
                "Name"=>substr($location, 0, strpos($location, " - ")),
                "Address"=>preg_replace("/@/", "&", substr($location, strpos($location, " - ") ? strpos($location, " - ")+3 : 0)),
            ),
            "Nature"=>trimHarder(substr($rows[$i+1]->nodeValue, strpos($rows[$i+1]->nodeValue, ": Nature: ")+10)),
        );
    }
    return $reports;
}


function getNonCrimeLogs()
{
    //Get table and feed it into an array by row
    $url = "http://www.police.gatech.edu/crimeinfo/crimelogs/noncrimelog.php";
	$dom = new DOMDocument;
    $dom->loadHTMLFile($url);
    $table = $dom->getElementsByTagName('tr');
    $rows = array();
    for ($i = 0; $i < $table->length; ++$i) 
    {
        $rows[$i] = $table->item($i);
    }
    
    //Chop out the useless rows (before and including the black header)
    for ($i = 5; $i >= 0; --$i)
    {
        unset($rows[$i]);
    }
    $rows = array_values($rows);
    
    //Organize into array of reports
    $reports = array();
    for ($i = 0; $i < count($rows); $i+=2) 
    {
        $td = $rows[$i]->getElementsByTagName('td');
        $occurred = trimHarder($td->item(2)->nodeValue);
        $reports[$i/2] = array
        (
            "Case Number"=>trimHarder($td->item(0)->nodeValue),
            "Date Reported"=>trimHarder($td->item(1)->nodeValue),
            "Occurred"=>array
            (
                "Start Date"=>substr($occurred, 0, strpos($occurred, " @ ")),
                "Start Time"=>substr($occurred, strpos($occurred, " @ ")+3, 5),
                "End Date"=>substr($occurred, strpos($occurred, " - ")+3, strrpos($occurred, " @ ") - (strpos($occurred, " - ")+3)),
                "End Time"=>substr($occurred, strrpos($occurred, " @ ")+3),
            ),
            "Disposition"=>trimHarder($td->item(3)->nodeValue),
            "Status"=>trimHarder($td->item(4)->nodeValue),
            "Location"=>substr($rows[$i+1]->nodeValue, 10, strpos($rows[$i+1]->nodeValue, ": Nature:")-10),
            "Nature"=>substr($rows[$i+1]->nodeValue, strpos($rows[$i+1]->nodeValue, ": Nature: ")+10),
        );
    }
    return $reports;
}


//Make print_r() output look pretty for browsers
function html_print_r($input)
{
    echo "<pre>";
    print_r($input);
    echo "</pre>";
}


//Trim whitespace from beginning and end, and replace multiple spaces with single space
function trimHarder($string)
{
    return trim(preg_replace("/\s+/", " ", $string));
}

?>

