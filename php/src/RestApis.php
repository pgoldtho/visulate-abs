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

    private static function getPropertyTypeSummary($typeArray, $state){
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
            $usage["href"] = self::url('base'). "type/".$state."/".$type["key"];
            $usageType[] = $usage;
        }
        return $usageType;
    }
    
    public static function url($type) {
        $server = filter_input_array(INPUT_SERVER);
        if (isset($server['HTTPS'])) {
            $protocol = ($server['HTTPS'] && $server['HTTPS'] != "off") ? "https" : "http";
        } else {
            $protocol = 'http';
        }
        if ($type == 'base') {
            return $protocol . "://" . $server['HTTP_HOST']."/";
        }
        return $protocol . "://" . $server['HTTP_HOST'] . $server['REQUEST_URI'];
    }

    public static function getUsSummary(){
        $response =  ElasticSearchQueries::getUsSummary();
        $summary = array();
        $summary["total"] = $response["hits"]["total"];
        $summary["self"] = self::url('full');

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
                    self::getPropertyTypeSummary($state["group_by_type"]["buckets"], $state["key"]);

            $summary["state"][] = $stateSummary;
        }
        header("Content-Type:application/json");
        echo json_encode($summary);
    }
    
    public static function getIssuingEntities(){
        $esResponse = ElasticSearchQueries::getIssuingEntities();
        $response = array();
        foreach ($esResponse["aggregations"]["depositor"]["buckets"] as $depositor){
            $depositorSummary = array();
            $depositorSummary["name"] = $depositor["key"];
            $depositorSummary["cik"] = $depositor["depositor_cik"]["buckets"][0]["key"];
            foreach ($depositor["issuer"]["buckets"] as $issuer){
                $issuerCik = $issuer["issuer_cik"]["buckets"][0]["key"];
                $issuerSummary = array();
                $issuerSummary["name"] = $issuer["key"];
                $issuerSummary["cik"] = $issuerCik;
                $issuerSummary["property_count"] = $issuer["property_count"]["value"];
                $issuerSummary["average_secvalue"] = round($issuer["average_secvalue"]["value"]);
                $issuerSummary["average_secnoi"] = round($issuer["average_secnoi"]["value"]);
                $issuerSummary["sec_caprate"] =
                    self::getCapRate($issuer["average_secnoi"]["value"], $issuer["average_secvalue"]["value"]);                
                $issuerSummary["href"] = self::url('full').'/'.$issuerCik;                
                $depositorSummary["issuer"][] = $issuerSummary;
            }            
            $response["depositor"][] = $depositorSummary;
        }
        
        $response['links']['self'] = self::url('full');
        header("Content-Type:application/json");
        echo json_encode($response);
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
        $summary["max_val"] = round($response["aggregations"]["property_name"]["buckets"][0]["average_secvalue"]["value"]);
        $summary["min_val"] = $summary["max_val"];
        
        $summary["max_noi"] = round($response["aggregations"]["property_name"]["buckets"][0]["average_secnoi"]["value"]);
        $summary["min_noi"] = $summary["max_noi"];
        
        $summary["max_cap"] = self::getCapRate($summary["max_noi"], $summary["max_val"]);
        $summary["min_cap"] = $summary["max_cap"];
        
        
        
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
            $propSummary["href"] = self::url('base').'asset/'.$state.'/'.$type.'/'. urlencode($prop["key"]);
            
            if ( $propSummary["average_secvalue"] > $summary["max_val"]) {$summary["max_val"] = $propSummary["average_secvalue"];}
            if ( $propSummary["average_secvalue"] < $summary["min_val"] && $propSummary["average_secvalue"]>0) 
              {$summary["min_val"] = $propSummary["average_secvalue"];}
            
            if ( $propSummary["average_secnoi"] > $summary["max_noi"]) {$summary["max_noi"] = $propSummary["average_secnoi"];}
            if ( $propSummary["average_secnoi"] < $summary["min_noi"] && $propSummary["average_secnoi"]>0) 
              {$summary["min_noi"] = $propSummary["average_secnoi"];}
            
            if ( $propSummary["sec_caprate"] > $summary["max_cap"]) {$summary["max_cap"] = $propSummary["sec_caprate"];}
            if ( $propSummary["sec_caprate"] < $summary["min_cap"] && $propSummary["sec_caprate"]) 
              {$summary["min_cap"] = $propSummary["sec_caprate"];}
            
              if ($propSummary["sec_caprate"]) {
                  $total_cap += $propSummary["sec_caprate"];
                  $cap_count += 1;
              }
            
            

            $summary["property"][] = $propSummary;
        }
        $summary['mean_cap'] = round($total_cap/$cap_count,2);
        $summary['text_description'] = CmbsAssetDisplay::propertyTypeSummary($summary);
        
        $summary['links']['self'] = self::url('full');
        $summary['links']['parent'] = self::url('base');
        header("Content-Type:application/json");
        echo json_encode($summary);
    }

    public function getAssetDetails($vars) {
        $state = strtoupper($vars['state']);
        $type = strtoupper($vars['type']);
        $name = urldecode($vars['name']);

        $assetDetails = array();

        $response = ElasticSearchQueries::getAssetDetails($state, $type, $name);
        
        foreach ($response["hits"]["hits"] as $asset) {
           $assetDetails[] = CmbsAssetDisplay::decodeAsset($asset["_source"]);
        }
        $assetDetails['summary'] = CmbsAssetDisplay::assetSummary($assetDetails);      
        $assetDetails['issuingEntity'] = 
                CmbsAssetDisplay::assetEntitySummary($response["aggregations"]["issuing_entity"]["buckets"]);
        
       
        $assetDetails['links']['self'] = self::url('full');
        $assetDetails['links']['parent'] = self::url('base').'type/'.$state.'/'.$type;
        header("Content-Type:application/json");
        echo json_encode($assetDetails);
    }
    
    private static function propertySummary($esResponse) {
        $summary = array();
        foreach ($esResponse["aggregations"]["property_name"]["buckets"] as $prop){
            $state = $prop["state"]["buckets"][0]["key"];
            $type = $prop["type"]["buckets"][0]["key"];
            $propSummary = array();
            $propSummary["name"] = $prop["key"];
            $propSummary["location"] = $prop["centroid"]["location"];
            $propSummary["average_secnoi"] = round($prop["average_secnoi"]["value"]);
            $propSummary["average_secvalue"] = round($prop["average_secvalue"]["value"]);
            $propSummary["average_secdate"] = $prop["average_secdate"]["value_as_string"];
            $propSummary["sec_caprate"] =
                    self::getCapRate($prop["average_secnoi"]["value"], $prop["average_secvalue"]["value"]);
            $propSummary["city_name"] = $prop["city"]["buckets"][0]["key"];
            $propSummary["state"] = CmbsAssetDisplay::decodeValue("US_STATE", $state);
            $propSummary["type"] = CmbsAssetDisplay::decodeValue("PROPRTY_TYP_CODE_TYPE", $type);
            $propSummary["state_code"] = $state;
            $propSummary["type_code"] = $type;
            $propSummary["links"]["property"] = self::url('base').'asset/'.$state.'/'.$type.'/'. urlencode($prop["key"]);
            $propSummary["links"]["usage"] = self::url('base').'type/'.$state.'/'.$type;
            if ( $propSummary["city_name"]) {
                $summary[] = $propSummary;}
        }
        return $summary;
    }
    
    private static function assetSummary($esResponse) {
        $summary = array();
        foreach ($esResponse["aggregations"]["assets"]["buckets"] as $assetBucket){
            $asset = $assetBucket["latest"]["hits"]["hits"][0]["_source"]["asset"];
            $property = $assetBucket["latest"]["hits"]["hits"][0]["_source"]["property"];
           
            
            $summary["total_property_value"] += $property["valuationSecuritizationAmount"];
            $summary["total_noi"] += $property["netOperatingIncomeSecuritizationAmount"];
            $summary["property_count"] += 1;
            if ($asset["reportingPeriodEndDate"]){            
                $summary["period_end_date"] = $asset["reportingPeriodEndDate"];
            }

            if (strcmp($property["physicalOccupancySecuritizationPercentage"], 
                       $property["mostRecentPhysicalOccupancyPercentage"]) != 0) {
                           error_log( $property["propertyName"]. ' ' . $property["physicalOccupancySecuritizationPercentage"] 
                               . ' ->' .   $property["mostRecentPhysicalOccupancyPercentage"] . "\n",3 ,'/var/log/php.log') ;
                }
            
            if (strcmp($asset["assetNumber"], (int)$asset["assetNumber"]) == 0){
               $summary["asset"][$asset["assetNumber"]] = CmbsAssetDisplay::displayFormat($asset);
               $summary["loan_count"] += 1;
               $summary["total_loan_amount"] += $asset["originalLoanAmount"];
               $summary["total_principal_balance"] += $asset["scheduledPrincipalBalanceSecuritizationAmount"];
               
               if ($asset["periodicPrincipalAndInterestPaymentSecuritizationAmount"] && $asset["paymentFrequencyCode"]) {
                   if ($asset["paymentFrequencyCode"] == "365") {
                       $summary["annual_scheduled_p_and_i"] +=
                       $asset["periodicPrincipalAndInterestPaymentSecuritizationAmount"] * 365;
                   } else {
                       $summary["annual_scheduled_p_and_i"] +=
                       $asset["periodicPrincipalAndInterestPaymentSecuritizationAmount"] / $asset["paymentFrequencyCode"] * 12;
                   }                   
               }
               else {
                   $summary["dscr"] = "insufficent data";
               }
               
               
               
               $summary["period_scheduled_balance"] += $asset["reportPeriodEndScheduledLoanBalanceAmount"];
               $summary["period_actual_balance"] += $asset["reportPeriodEndActualBalanceAmount"];
               
               $summary["p_and_i_outstanding"] += $asset["totalPrincipalInterestAdvancedOutstandingAmount"];
               $summary["tax_outstanding"] += $asset["totalTaxesInsuranceAdvancesOutstandingAmount"];
               $summary["other_expenses_outstanding"] += $asset["otherExpensesAdvancedOutstandingAmount"];
               
               
            }
            
            $summary["period_balance_difference"] = round($summary["period_scheduled_balance"] 
                -  $summary["period_actual_balance"]);
            if ($summary["dscr"] != "insufficent data") {
                $summary["dscr"] = round($summary["total_noi"]/ $summary["annual_scheduled_p_and_i"], 2 );
            }
        }
         
       return $summary;
    }


    public static function getIssuer($cik) {
        $response = array();
        $esResponse =  ElasticSearchQueries::getIssuer($cik);
        $response["issuing_entity"] = $esResponse["aggregations"]["issuing_entity"]["buckets"][0]["key"];
        $response["asset_summary"] = self::assetSummary($esResponse);
        $response["property"] = self::propertySummary($esResponse);
        $response["links"]["self"] = self::url('full');
        $response["links"]["parent"] = self::url('base')."issuer";
        $response["links"]["sec"] = "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=".$cik;
        
        $response["text_description"] = CmbsAssetDisplay::issuingEntitySummary($response);
        
        header("Content-Type:application/json");
        echo json_encode($response);
    }
}
