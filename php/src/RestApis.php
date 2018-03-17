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
            $usage = array();
            $usage["type_code"] = $type["key"];
            $usage["usage_type"] =
                    CmbsAssetDisplay::decodeValue("PROPRTY_TYP_CODE_TYPE", $type["key"]);
            $usage["doc_count"] = $type["doc_count"];
            $usage["average_secnoi"] = round($type["average_secnoi"]["value"]);
            $usage["average_secvalue"] = round($type["average_secvalue"]["value"]);
            $usage["sec_caprate"] =
                    self::getCapRate($type["average_secnoi"]["value"], $type["average_secvalue"]["value"]);
            $usageType[] = $usage;
        }
        return $usageType;
    }

        public static function getUsSummary(){
        $response =  ElasticSearchQueries::getUsSummary();
        $summary = array();
        $summary["total"] = $response["hits"]["total"];

        foreach ($response["aggregations"]["group_by_state"]["buckets"] as $state) {
            $stateSummary = array();
            $stateSummary["state"] = $state["key"];
            $stateSummary["name"] = CmbsAssetDisplay::decodeValue("US_STATE", $state["key"]);
            $stateSummary["doc_count"] = $state["doc_count"];
            $stateSummary["average_secnoi"] = round($state["average_secnoi"]["value"]);
            $stateSummary["average_secvalue"] = round($state["average_secvalue"]["value"]);
            $stateSummary["average_secdate"] = $state["average_secdate"]["value_as_string"];
            $stateSummary["sec_caprate"] =
                    self::getCapRate($state["average_secnoi"]["value"], $state["average_secvalue"]["value"]);

            $stateSummary["average_curvalue"] = round($state["average_curvalue"]["value"]);
            $stateSummary["average_curnoi"] = round($state["average_curnoi"]["value"]);
            $stateSummary["cur_caprate"] =
                    self::getCapRate($state["average_curnoi"]["value"], $state["average_curvalue"]["value"]);

            $stateSummary["usage"] =
                    self::getPropertyTypeSummary($state["group_by_type"]["buckets"]);

            $summary["state"][] = $stateSummary;
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
            $propSummary = array();
            $propSummary["name"] = $prop["key"];
            $propSummary["location"] = $prop["centroid"]["location"];
            $propSummary["average_secnoi"] = round($prop["average_secnoi"]["value"]);
            $propSummary["average_secvalue"] = round($prop["average_secvalue"]["value"]);
            $propSummary["average_secdate"] = $prop["average_secdate"]["value_as_string"];
            $propSummary["sec_caprate"] =
                    self::getCapRate($prop["average_secnoi"]["value"], $prop["average_secvalue"]["value"]);
            $propSummary["city_name"] = $prop["city"]["buckets"][0]["key"];

            $summary["property"][] = $propSummary;
        }
         echo json_encode($summary);
    }

    public function getAssetDetails($vars) {
        $state = strtoupper($vars['state']);
        $type = strtoupper($vars['type']);
        $name = urldecode($vars['name']);

        $assetDetails = array();

        $response = ElasticSearchQueries::getAssetDetails($state, $type, $name);
       // print_r($response);

        foreach ($response["hits"]["hits"] as $asset) {
           $assetDetails[] = CmbsAssetDisplay::decodeAsset($asset["_source"]);
           // $assetDetails[] = $asset["_source"];
        }
        echo json_encode($assetDetails);
    }
}
