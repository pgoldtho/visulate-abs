<?php

/**
 * Copyright (c) Visulate LLC All rights reserved
 * Description of Exh102Class
 *
 * @author pgoldtho
 */
class Exh102Class {

    public function __construct($assetData) {
        //$this->parseAssets($assetData);
        $this->parseFilings($assetData);
        //$this->showSimpleXml($assetData);
    }

    // https://stackoverflow.com/questions/2187629/can-i-get-all-keys-of-an-multi-level-associative-arrays-in-php
    public static function find_all($needle, array $haystack, array &$result = null) {
        // This is to initialize the result array and is only needed for
        // the first call of this function
        if (is_null($result)) {
            $result = array();
        }
        foreach ($haystack as $key => $value) {
            // Check whether the key is the value we are looking for. If the value
            // is not an array, add it to the result array.
            if ($key === $needle && !is_array($value)) {
                $result[] = $value;
            }
            if (is_array($value)) {
                // If the current value is an array, we perform the same
                // operation with this 'subarray'.
                self::find_all($needle, $value, $result);
            }
        }
        // This is only needed in the first function call to retrieve the results
        return $result;
    }

    function parseAssets($data) {
        $absXmlElement = new SimpleXMLElement((string) $data);
        foreach ($absXmlElement as $asset) {
            $properties = self::find_all('property', (array) $asset);
            if (count($properties) > 1) {
              print "Property count = ". count($properties);
              print_r($asset);
            }
        }
        return count($absXmlElement);
    }

    function parseFilings($data) {
        $filingRecords = json_decode($data, true);
        $totalCount = 0;
        foreach ($filingRecords["results"] as $results) {
            $urls = self::find_all('url', $results);
            $assetData = file_get_contents($urls[0]);
            $assetCount = $this->parseAssets($assetData);
            print "$urls[0] => $assetCount \n";
            $totalCount += $assetCount;
           
        }
        print "$totalCount Total Assets";
    }
    
    function showSimpleXml($data) {
        $absXmlElement = new SimpleXMLElement((string) $data);
        print_r($absXmlElement);
    }



}

//  $filename = "/Users/pgoldtho/git/visulate-abs/test_data/exh_102_example.xml";
//  $filename = "/Users/pgoldtho/git/visulate-abs/test_data/Sample_ABS_CMBS.xml";
$filename = "/Users/pgoldtho/git/visulate-abs/test_data/ex_102_2.json";
$data = implode("", file($filename));
$asset = new Exh102Class($data);
// print_r($asset);
