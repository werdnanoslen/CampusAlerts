<?php


function getLogs() 
{
    //Get crime table and feed it into an array by row
    $url = "http://www.police.gatech.edu/crimeinfo/crimelogs/crimelog.php";
	$dom = new DOMDocument;
    $dom->loadHTMLFile($url);
    $table = $dom->getElementsByTagName('tr');
    $rowsCrime = array();
    for ($i = 0; $i < $table->length; ++$i) 
    {
        $rowsCrime[$i] = $table->item($i);
    }
    //Chop out the useless rows (before and including the black header)
    for ($i = 5; $i >= 0; --$i)
    {
        unset($rowsCrime[$i]);
    }
    $rowsCrime = array_values($rowsCrime);
    
    //Organize into array of reports
    $reports = array();
    for ($i = 0; $i < count($rowsCrime); $i+=2) 
    {
        $td = $rowsCrime[$i]->getElementsByTagName('td');
        $occurred = trimHarder($td->item(2)->nodeValue);
        $location = substr($rowsCrime[$i+1]->nodeValue, 10, strpos($rowsCrime[$i+1]->nodeValue, ": Nature:")-10);
        $reports[trimHarder($td->item(0)->nodeValue)] = array
        (
            "Case Number"=>trimHarder($td->item(0)->nodeValue),
            "Criminal"=>true,
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
                //Google geocode prefers '&' for intersections, instead of '@'
                "Name"=>str_replace("@", "&", substr($location, 0, strpos($location, " - "))),
                "Address"=>str_replace("@", "&", substr($location, strpos($location, " - ") ? strpos($location, " - ")+3 : 0)),
            ),
            "Nature"=>trimHarder(substr($rowsCrime[$i+1]->nodeValue, strpos($rowsCrime[$i+1]->nodeValue, ": Nature: ")+10)),
        );
    }
    
    //Get non-crime table and feed it into an array by row
    $url = "http://www.police.gatech.edu/crimeinfo/crimelogs/noncrimelog.php";
	$dom = new DOMDocument;
    $dom->loadHTMLFile($url);
    $table = $dom->getElementsByTagName('tr');
    $rowsNonCrime = array();
    for ($i = 0; $i < $table->length; ++$i) 
    {
        $rowsNonCrime[$i] = $table->item($i);
    }
    //Chop out the useless rows (before and including the black header)
    for ($i = 5; $i >= 0; --$i)
    {
        unset($rowsNonCrime[$i]);
    }
    $rowsNonCrime = array_values($rowsNonCrime);
    
    //Add non-crime reports
    for ($i = 0; $i < count($rowsNonCrime); $i+=2) 
    {
        $td = $rowsNonCrime[$i]->getElementsByTagName('td');
        $occurred = trimHarder($td->item(2)->nodeValue);
        $td2 = trimHarder($rowsNonCrime[$i+1]->nodeValue);
        $location = substr($td2, 9, strpos($td2, " Nature:")-9);
        $reports[trimHarder($td->item(0)->nodeValue)] = array
        (
            "Case Number"=>trimHarder($td->item(0)->nodeValue),
            "Criminal"=>false,
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
                //Google geocode prefers '&' for intersections, instead of '@'
                "Name"=>str_replace("@", "&", substr($location, 0, strpos($location, " - "))),
                "Address"=>str_replace("@", "&", substr($location, strpos($location, " - ") ? strpos($location, " - ")+3 : 0)),
            ),
            "Nature"=>trim(str_replace(chr(194).chr(160), '', substr($td2, strpos($td2, "Nature:")+9))),
        );
    }
    
    //Sort descending by case number, which is also chronologically assigned
    krsort($reports);
    
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

