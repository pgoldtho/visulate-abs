<?php

/*
 * Copyright (c) Visulate LLC 2018 All rights reserved
 */

use PHPUnit\Framework\TestCase;
use CMBS\RestApis;

class RestApisTest extends TestCase {
    protected static $restApis;
    
    public static function setUpBeforeClass()
    {
        self::$restApis = new RestApis();
    }

    public static function tearDownAfterClass()
    {
        self::$restApis = null;
    }
    
    public function testGetCapRate() {
        print "\n Testing getCapRate\n";
        $capRate = self::$restApis->getCapRate(300000, 3000000);
        $this->assertEquals($capRate, 10);
        
        $capRate2 = self::$restApis->getCapRate(0, 3000000);
        $this->assertNull($capRate2);
    }
    
    
    
}
