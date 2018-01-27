<?php
namespace CMBS;

use CMBS\CmbsAssetPersistence;
use CMBS\PropertyGeospatial;
/**
 * Copyright (c) Visulate LLC All rights reserved
 * @author pgoldtho
 */
class CmbsAbsEE {
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
    
    public static function waitForUserInput($message) {
        echo "$message. Type 'y' to continue: ";
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        if (trim($line) != 'y') {
            echo "ABORTING!\n";
            exit;
        }
        fclose($handle);
        echo "\n";
        echo "Continuing...\n";
    }

    public static function removeInvalidCharacters(&$data) {     
        $data = str_replace('&#13;', "", (string) $data);      
    }
    
    private static function getCoordinates($esClient, $property){
        // Check to see if an existing elasticSearch document has the coordinates
        $existingCoords = $esClient->getExistingCoordinates
                   ($property['propertyAddress'], 
                    $property['propertyCity'], 
                    $property['propertyState'], 
                    $property['propertyZip']);
        if ($existingCoords) {
            print "Found existing coords for ".$property['propertyAddress']."\n";
            return $existingCoords;}
        
        // Geocode the address
        $location = PropertyGeospatial::geocodeAssetProperty($property);
        return $location;        
    }

    public function seedAssets($filing) {
        print_r("Processing ". $filing["absEeUrl"]. "\n");
        $data = file_get_contents($filing["absEeUrl"]);
        self::removeInvalidCharacters($data);
        
        $absXmlElement = new \SimpleXMLElement( $data);

        $esClient = new CmbsAssetPersistence();

        foreach ($absXmlElement as $asset) {
            $assetArray = (array) $asset;
            $property = (array) $assetArray["property"];
            unset($assetArray["property"]);

            // Most exh 102 documents use multiple asset elements for assets
            // securred by more than one property.  A parent asset records the
            // loan information and is followed by 2 or more child assets.  The
            // child assets do not include loan information
            if (array_key_exists("originalLoanAmount", $assetArray)) {
                $parentAsset = $assetArray;
            }
            $filing["asset"] = $parentAsset;

            // Some assets have multiple properties
            if (is_object($property[0])) {                
                foreach ($property as $i => $prop) {
                    $propArray = (array) $prop;                     
                    $location = self::getCoordinates($esClient, $propArray);
                    if ($location) {
                        $propArray["location"] = $location;
                    }
                    
                    $id = $filing["accession_number"] . "-" . $assetArray["assetNumber"] . "-" . $i;
                    $filing["property"] = $propArray;
                    $esClient->createAsset($id, $filing);
                    $esClient->indexAsset();
                  
                }
            } else {
                $location = self::getCoordinates($esClient, $property);
                if ($location) {
                    $property["location"] = $location;
                }
                $filing["property"] = $property;
                $id = $filing["accession_number"] . "-" . $assetArray["assetNumber"];
                $esClient->createAsset($id, $filing);
                $esClient->indexAsset();
            }
        }
        return count($absXmlElement);
    }

    public function seedFilings($data) {
        $filingRecords = json_decode($data, true);
        $totalCount = 0;
        foreach ($filingRecords["results"] as $results) {
            $urls = self::find_all('url', $results);
            $file_numbers = self::find_all('FILE-NUMBER', $results);
            $accession_number = $results["filing"]["accession_number"];
            $filer_cik = $results["filing"]["filer_cik"];
            $depositor_cik = $results["filing"]["depositor_cik"];
            $sponsor_cik = $results["filing"]["sponsor_cik"];

            $filing = array(
                "accession_number" => $accession_number,
                "filer_cik" => $filer_cik,
                "depositor_cik" => $depositor_cik,
                "sponsor_cik" => $sponsor_cik,
                "absEeUrl" => $urls[0],
                "filingUrl" => $urls[1],
                "sponsor_file_no" => $file_numbers[0],
                "filer_file_no" => $file_numbers[1]);
            $assetCount = $this->seedAssets($filing);
            $totalCount += $assetCount;
        }
        print "$totalCount Total Assets";
    }

}
