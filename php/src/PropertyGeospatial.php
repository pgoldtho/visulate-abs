<?php

/*
 * Copyright (c) Visulate LLC 2017 All rights reserved
 */

namespace CMBS;
use CMBS\ElasticSearchClient;


/**
 * Description of PropertyGeospatial
 *
 * @author pgoldtho
 */
class PropertyGeospatial {
    const CENSUS_GEOCODER = "https://geocoding.geo.census.gov/geocoder/locations/address";
    const GOOGLE_GEOCODER = "https://maps.googleapis.com/maps/api/geocode/json";
    const GOOGLE_API_KEY = "";  //Add API Key before use


    public static function getTigerLineCoordinates($street, $city, $state, $zipcode) {
        $parameters = "?street=".urlencode($street).
               "&city=".urlencode($city).
               "&state=".urlencode($state).
               "&zip=".urlencode($zipcode).
               "&benchmark=Public_AR_Current&format=json";
       
        $ch = curl_init(self::CENSUS_GEOCODER.$parameters);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $response = curl_exec($ch);       
        curl_close($ch);
        
        print_r($parameters."\n");
        
        $geo = json_decode($response, true);
        $lat = $geo["result"]["addressMatches"][0]["coordinates"]["y"];
        $lon = $geo["result"]["addressMatches"][0]["coordinates"]["x"];
        
        if ($lat && $lon) {
           return ['lat' => $lat, 'lon' => $lon];
        } // else   
        return null;
    }

    public static function getGoogleMapsCoordinates($street, $city, $state, $zipcode) {
        $parameters = "?address=".
                urlencode($street).",+".
                urlencode($city).",+".
                urlencode($state)."+".urlencode($zipcode).
                "&key=".self::GOOGLE_API_KEY;
       
        $ch = curl_init(self::GOOGLE_GEOCODER.$parameters);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $response = curl_exec($ch);       
        curl_close($ch);
        
        print_r($parameters."\n");
        
        $geo = json_decode($response, true);
        $lat = $geo["results"][0]["geometry"]["location"]["lat"];
        $lon = $geo["results"][0]["geometry"]["location"]["lng"];
        
        if ($lat && $lon) {
           return ['lat' => $lat, 'lon' => $lon];
        } // else   
        return null;

    }


    private static function getExistingCoordinates($street, $city, $state, $zipcode) {
        $queryStr = '{
  "query": {
    "bool": {
      "must": { 
            "match_phrase": {"property.propertyAddress": "' . $street . '"}
            }, 
      "filter" : [
          {"term": {"property.propertyCity": "' . $city . '"}},
          {"term": {"property.propertyState": "' . $state . '"}},
          {"term": {"property.propertyZip": "' . $zipcode . '"}},
          {"exists": {"field": "property.location"}}
          ]
    }
  }, 
  "_source" : ["property.location"]
}';
        $esClient = new ElasticSearchClient();
        $client = $esClient->getClient();
        $index = $esClient->getIndex();
        $type = $esClient->getType();

        $params = [
            'index' => $index,
            'type' => $type,
            'body' => $queryStr
        ];

        $response = $client->search($params);
        return $response['hits']['hits'][0]['_source']['property']['location'];
    }

    public static function geocodeProperty($street, $city, $state, $zipcode) {
        if (!($street && $city && $state && $zipcode)) {
            return;
        }
        
        // Check to see if an existing elasticSearch document has the coordinates
        $existingCoords = self::getExistingCoordinates($street, $city, $state, $zipcode);
        if ($existingCoords) {
            print "Found existing coords for $street \n";
            return $existingCoords;}
                
        // Call the (free) US Census geocoder
        $tlCoords = self::getTigerLineCoordinates($street, $city, $state, $zipcode);
        if ($tlCoords) {return $tlCoords;}
        
        // Call the Google Maps geocoder
        $gCoords = self::getGoogleMapsCoordinates($street, $city, $state, $zipcode);
        if ($gCoords) {return $gCoords;}
        
        // no coords found
        return null;
        
        
    }
    
    public static function geocodeAssetProperty($property) {
        if ($property['propertyAddress'] &&
            $property['propertyCity'] &&
            $property['propertyState'] &&
            $property['propertyZip']) {
              return self::geocodeProperty(
                    $property['propertyAddress'], 
                    $property['propertyCity'], 
                    $property['propertyState'], 
                    $property['propertyZip']);
        }
        return;
    }
}
