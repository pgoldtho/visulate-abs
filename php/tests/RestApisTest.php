<?php

/*
 * Copyright (c) Visulate LLC 2018 All rights reserved
 */

use PHPUnit\Framework\TestCase;
use CMBS\RestApis;

class RestApisTest extends PHPUnit\Framework\TestCase {
    protected static $restApis;
    private static $httpClient;


    public static function setUpBeforeClass()
    {
        self::$restApis = new RestApis();
        $baseUri = 'http://localhost/';
        self::$httpClient = new GuzzleHttp\Client(['base_uri' => $baseUri]);

    }

    public static function tearDownAfterClass()
    {
        self::$restApis = null;
        self::$httpClient = null;
    }
    
    public function testGetCapRate() {
        print "\n Testing getCapRate\n";
        $capRate = self::$restApis->getCapRate(300000, 3000000);
        $this->assertEquals($capRate, 10);
        
        $capRate2 = self::$restApis->getCapRate(0, 3000000);
        $this->assertNull($capRate2);
    }
    
    public function testGetAssetDetails() {
        print "\n Testing getAssetDetails()\n";
        
        $response = self::$httpClient->request('GET', 'asset/FL/IN/1800+UNIVERSITY+PARKWAY');

        $this->assertEquals(200, $response->getStatusCode());
        
        $data = json_decode($response->getBody(), true);
        
        print_r($data);
/*
        $contentType = $response->getHeaders()["Content-Type"][0];
        $this->assertEquals("application/json", $contentType);

        $userAgent = json_decode($response->getBody())->{"user-agent"};
        $this->assertRegexp('/Guzzle/', $userAgent);
    */
    }
    
    
}
