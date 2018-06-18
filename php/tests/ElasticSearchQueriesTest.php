<?php

/*
 * Copyright (c) Visulate LLC 2018 All rights reserved
 */

use PHPUnit\Framework\TestCase;
use CMBS\ElasticSearchQueries;

class ElasticSearchQueriesTest extends TestCase {
    protected static $query;
    
    public static function setUpBeforeClass()
    {
        self::$query = new ElasticSearchQueries();
    }

    public static function tearDownAfterClass()
    {
        self::$query = null;
    }
    
   public function testGetUsSummary() {
       print "\n Testing getUsSummary()\n";
       $stateList = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CI', 'CO', 'CT', 'DC', 'DE', 'E9', 
           'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 
           'MI', 'MN', 'MO', 'MS', 'MT', 'MX', 'NA', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 
           'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'PN', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 
           'UT', 'VA'];  // (E9 = 'Cayman Islands', NA = 'Not Available')
       
       $propTypes = ["CH", "HC", "IN", "LO", "MF", "MH", "MU", "OF", "RT", "SE", "SS", "WH", "ZZ", "98"];
       
       $response= self::$query->getUsSummary();
       $this->assertEquals(count($response["aggregations"]["group_by_state"]["buckets"]), 52);
       $errorCount = 0;
       foreach ($response["aggregations"]["group_by_state"]["buckets"] as $state) {
            $this->assertContains($state["key"], $stateList);
           
            foreach ($state["group_by_type"]["buckets"] as $usage) {
                try {
                    $this->assertContains($usage["key"], $propTypes);
                } catch (Exception $e) {
                    print "'" . $state["key"] . "/" . $usage["key"] . "': " . $e;
                    $errorCount += 1;
                }
            }
            
        }
        $this->assertEquals(0, $errorCount);
    }
    
    public function testGetTypeSummaryNotCaseSensitive() {
        print "\n Testing getTypeSummary()\n";
        $response= self::$query->getTypeSummary('FL', 'OF');
        $propNames = array();
        $errorCount = 0;
        foreach ($response["aggregations"]["property_name"]["buckets"] as $property){
            if (array_key_exists(strtoupper($property["key"]), $propNames)){
                print "\nDuplicate property name ". $property["key"] . " already indexed in ";
                print_r($propNames);
                $this->assertFalse("Duplicate properties");
            }
           $propNames[strtoupper($property["key"])] = $property["key"];
        }
        $this->assertEquals(0, $errorCount);
    }
    
    public function testGetAssetDetails() {
        print "\n Testing getAssetDetails()\n";
        $response= self::$query->getAssetDetails('CA', 'RT', 'Lucky - Hayward');
        //print_r($response["hits"]["hits"]["0"]["_source"]["property"]);
        $this->assertEquals($response["hits"]["hits"]["0"]["_source"]["property"]["propertyAddress"],
                "22555 MISSION BOULEVARD");
        
        foreach ($response["aggregations"]["issuing_entity"]["buckets"] as $issuingEntity) {
             print $issuingEntity["key"] . "\n";
             
             print "https://www.sec.gov/cgi-bin/browse-edgar?CIK="; 
             print $issuingEntity["hits"]["hits"]["hits"]["0"]["_source"]["issuing_entity_cik"];
             print "&action=getcompany" . "\n";
             
             print $issuingEntity["hits"]["hits"]["hits"]["0"]["_source"]["depositor_name"] . "\n";
             
             
             print_r($issuingEntity["hits"]["hits"]["hits"]["0"]["_source"]["asset"]);
        }
        
       
    }
    
}
