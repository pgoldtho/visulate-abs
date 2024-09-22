<?php

/*
 * Copyright (c) Visulate LLC 2018 All rights reserved
 */

use PHPUnit\Framework\TestCase;
use CMBS\CmbsAbsEE;

class CmbsAbsEeTest extends TestCase {
    protected static $asset;
    
    public static function setUpBeforeClass()
    {
        self::$asset = new CmbsAbsEE();
    }

    public static function tearDownAfterClass()
    {
        self::$asset = null;
    }


    public function testExtractCiks() {
        $filename = "./tests/resources/filingData.json";
        $data = implode("", file($filename));
       
        $companies = self::$asset->extractCiks($data);
        
        $this->assertEquals($companies["0001700668"], "CITIGROUP COMMERCIAL MORTGAGE TRUST 2017-P7");
        $this->assertEquals($companies["0001710798"], "Wells Fargo Commercial Mortgage Trust 2017-C39");
        $this->assertEquals($companies["0001013611"], "JP MORGAN CHASE COMMERCIAL MORTGAGE SECURITIES CORP");
        $this->assertEquals($companies["0001728339"], "BENCHMARK 2018-B2 Mortgage Trust");
        $this->assertEquals($companies["0001722194"], "Benchmark 2018-B1 Mortgage Trust");
        $this->assertEquals($companies["0001688957"], "Wells Fargo Commercial Mortgage Trust 2016-C37");
        $this->assertEquals($companies["0001716263"], "UBS Commercial Mortgage Trust 2017-C4");
        $this->assertEquals($companies["0001005007"], "Banc of America Merrill Lynch Commercial Mortgage Inc.");       
        
    }
    
    public function testFindAllWithEmptyArray() {
        $testArray = array();
        $resultArray = self::$asset->find_all("testKey", $testArray);
        $this->assertEmpty($resultArray);
    }
    
    public function testFindAllSingleDepthArray() {
        $testArray = [
            'a' => 'apple', 
            'b' => 'banana', 
            'c' => 'cake', 
            'd' => 'donut'
            ];
        $resultArray = self::$asset->find_all("b", $testArray);
        $this->assertEquals('banana', $resultArray[0]);
        $resultArray2 = self::$asset->find_all("c", $testArray);
        $this->assertEquals('cake', $resultArray2[0]);
    }
    
    public function testFindAllNestedDepthArray() {
        $testArray = [
            'a' => 'apple', 
            'b' => 'banana', 
            'c' => 'cake', 
            'cn' => [
                'a' => 'andy', 
                'b' => 'bob',
                'c' => [
                    'd'=>'dolphin', 
                    'e'=>'egg'
                    ]
                ],
            'd' => 'donut'
            ];
        $resultArray = self::$asset->find_all("b", $testArray);
        $this->assertEquals('banana', $resultArray[0]);
        $this->assertEquals('bob', $resultArray[1]);
        
        $resultArray2 = self::$asset->find_all("c", $testArray);
        $this->assertEquals('cake', $resultArray2[0]);
        $this->assertEquals('egg', $resultArray2[1]['e']);
    }
    
    
    
}
