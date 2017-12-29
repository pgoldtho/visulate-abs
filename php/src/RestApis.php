<?php

/*
 * Copyright (c) Visulate LLC 2017 All rights reserved
 */

namespace CMBS;
use CMBS\ElasticSearchQueries;
use CMBS\CmbsAssetDisplay;

/**
 * Description of RestApis
 *
 * @author pgoldtho
 */
class RestApis {
    public static function getCapRate($noi, $value){
        if($noi > 0 && $value > 0) {
            return round($noi*100/$value, 2);
        }
        return null;
    }
    
    private static function getPropertyTypeSummary($typeArray){
        $usageType = array();
        foreach ($typeArray as $type){
            $usageType[$type["key"]] = array();
            $usageType[$type["key"]]["usage_type"] = 
                    CmbsAssetDisplay::decodeValue("PROPRTY_TYP_CODE_TYPE", $type["key"]);
            $usageType[$type["key"]]["doc_count"] = $type["doc_count"];
            $usageType[$type["key"]]["average_secnoi"] = round($type["average_secnoi"]["value"]);
            $usageType[$type["key"]]["average_secvalue"] = round($type["average_secvalue"]["value"]);
            $usageType[$type["key"]]["sec_caprate"] = 
                    self::getCapRate($type["average_secnoi"]["value"], $type["average_secvalue"]["value"]);
        }
        return $usageType;
    }

        public static function getUsSummary(){
        $response =  ElasticSearchQueries::getUsSummary();
        $summary = array();
        $summary["total"] = $response["hits"]["total"];
        
        foreach ($response["aggregations"]["group_by_state"]["buckets"] as $state) {
            $summary[$state["key"]] = array();
            $summary[$state["key"]]["state"] = CmbsAssetDisplay::decodeValue("US_STATE", $state["key"]);
            $summary[$state["key"]]["doc_count"] = $state["doc_count"];
            $summary[$state["key"]]["average_secnoi"] = round($state["average_secnoi"]["value"]);
            $summary[$state["key"]]["average_secvalue"] = round($state["average_secvalue"]["value"]);
            $summary[$state["key"]]["average_secdate"] = $state["average_secdate"]["value_as_string"];
            $summary[$state["key"]]["sec_caprate"] = 
                    self::getCapRate($state["average_secnoi"]["value"], $state["average_secvalue"]["value"]);
            
            $summary[$state["key"]]["average_curvalue"] = round($state["average_curvalue"]["value"]);
            $summary[$state["key"]]["average_curnoi"] = round($state["average_curnoi"]["value"]);
            $summary[$state["key"]]["cur_caprate"] = 
                    self::getCapRate($state["average_curnoi"]["value"], $state["average_curvalue"]["value"]);
            
            $summary[$state["key"]]["usage"] = 
                    self::getPropertyTypeSummary($state["group_by_type"]["buckets"]);
            
        }
        
        echo json_encode($summary);

    }
    
    public function getTypeSummary($vars) {
        $state = strtoupper($vars['state']);
        $type = strtoupper($vars['type']);
        
        $summary = array();
        $summary['state'] = CmbsAssetDisplay::decodeValue("US_STATE", $state);
        $summary['type'] = CmbsAssetDisplay::decodeValue("PROPRTY_TYP_CODE_TYPE", $type);
        if ((strlen($summary['state'])==0)||(strlen($summary['type'])==0)) {
            echo '{ "name": "Invalid input", "message": "Invalid State or Property type code supplied."}';
            exit();
        }
        $summary['state_code'] = $state;
        $summary['type_code'] = $type;
        
        $response = ElasticSearchQueries::getTypeSummary($state, $type);
        foreach ($response["aggregations"]["property_name"]["buckets"] as $prop){
            $summary[$prop["key"]] = array();
            $summary[$prop["key"]]["location"] = $prop["centroid"]["location"];
            $summary[$prop["key"]]["average_secnoi"] = round($prop["average_secnoi"]["value"]);
            $summary[$prop["key"]]["average_secvalue"] = round($prop["average_secvalue"]["value"]);
            $summary[$prop["key"]]["average_secdate"] = $prop["average_secdate"]["value_as_string"];
            $summary[$prop["key"]]["sec_caprate"] = 
                    self::getCapRate($prop["average_secnoi"]["value"], $prop["average_secvalue"]["value"]);
        }
         echo json_encode($summary);

    }
}
