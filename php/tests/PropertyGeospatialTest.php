<?php

/*
 * Copyright (c) Visulate LLC 2017 All rights reserved
 */
//require __DIR__ . '../vendor/autoload.php';
use PHPUnit\Framework\TestCase;
use CMBS\PropertyGeospatial;

/**
 * Description of PropertyGeospatialTest
 *
 * @author pgoldtho
 */
class PropertyGeospatialTest extends TestCase{
    
    
    public function testTigerLineCoords() {
        print "\n Testing getTigerLineCoordinates()\n";

        $response = PropertyGeospatial::getTigerLineCoordinates("451 Seventh Avenue South", "Kirkland", "WA", "98033");
        print_r($response);

        $this->assertGreaterThan($response["lat"], 48);
        $this->assertGreaterThan($response["lon"], 122);
    }
    
    public function testGeocodeProperty() {
         print "\n Testing geocodeProperty()\n";
        $geo = PropertyGeospatial::geocodeProperty("451 Seventh Avenue South", "Kirkland", "WA", "98033");

        $this->assertGreaterThan($geo['lon'], -122);
        $this->assertGreaterThan($geo['lat'], 48);
        
        $geo2 = PropertyGeospatial::geocodeProperty("some invalid address", "nowhere", "XX", "12345");
        $this->assertNull($geo2);
    }
    
    public function testGeocodeAssetProperty() {
        print "\n Testing geocodeAssetProperty()\n";
        $property = [
            'propertyName' => 'Show Low Retail',
            'propertyAddress' => '5551 South White Mountain Road',
            'propertyCity' => 'Show Low',
            'propertyState' => 'AZ',
            'propertyZip' => '85901',
            'propertyTypeCode' => 'RT',
            'netRentableSquareFeetNumber' => '6405',
            'netRentableSquareFeetSecuritizationNumber' => '6405',
            'yearBuiltNumber' => '2016',
            'valuationSecuritizationAmount' => '2810000',
            'valuationSecuritizationDate' => '09-26-2016',
            'mostRecentValuationAmount' => '2810000',
            'mostRecentValuationDate' => '09-26-2016',
            'mostRecentValuationSourceCode' => 'MAI',
            'physicalOccupancySecuritizationPercentage' => '1',
            'propertyStatusCode' => '6',
            'defeasanceOptionStartDate' => '01-06-2019',
            'DefeasedStatusCode' => 'N',
            'largestTenant' => 'Firehouse Subs',
            'squareFeetLargestTenantNumber' => '2437',
            'leaseExpirationLargestTenantDate' => '09-30-2026',
            'secondLargestTenant' => 'Nationwide Vision',
            'squareFeetSecondLargestTenantNumber' => '1615',
            'leaseExpirationSecondLargestTenantDate' => '09-30-2026',
            'thirdLargestTenant' => 'Supercuts',
            'squareFeetThirdLargestTenantNumber' => '1178',
            'leaseExpirationThirdLargestTenantDate' => '08-31-2026',
            'netOperatingIncomeNetCashFlowCode' => 'CREFC',
            'mostRecentDebtServiceCoverageCode' => 'F',
            'mostRecentAnnualLeaseRolloverReviewDate' => '10-01-2016'
        ];
        $geo = PropertyGeospatial::geocodeAssetProperty($property);
        $this->assertGreaterThan($geo['lon'], -110);
        $this->assertGreaterThan($geo['lat'], 35);
        
       
    }
 
    

}
