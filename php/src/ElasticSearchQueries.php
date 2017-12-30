<?php

/*
 * Copyright (c) Visulate LLC 2017 All rights reserved
 */

namespace CMBS;
use CMBS\ElasticSearchClient;

/**
 * Description of ElasticSearchQueries
 *
 * @author pgoldtho
 */
class ElasticSearchQueries {
    private static function execQuery($queryStr){
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
        return $response;  
    }

    public static function getUsSummary(){
       $queryStr = '{
  "size": 0,
  "aggs": {
    "group_by_state": {
      "terms": {
        "field": "property.propertyState",
        "size": 52,
        "order": {"_key": "asc"}
      },
      "aggs": {
        "average_secvalue": {
          "avg": {
            "field": "property.valuationSecuritizationAmount"
          }
        },
        "average_secnoi": {
          "avg": {
            "field": "property.netOperatingIncomeSecuritizationAmount"
          }
        },
        "average_secdate": {
          "avg": {
            "field": "property.valuationSecuritizationDate"       
          }
        },
        "average_curvalue": {
          "avg": {
            "field": "property.mostRecentValuationAmount"
          }
        },
        "average_curnoi": {
          "avg": {
            "field": "property.mostRecentNetOperatingIncomeAmount"
          }
        },
        "group_by_type": {
          "terms": {
            "field": "property.propertyTypeCode",
            "size": 15,
            "order": {"_key": "desc"}
          },
          "aggs": {
            "average_secvalue": {
              "avg": {
                "field": "property.valuationSecuritizationAmount"
              }
            },
            "average_secnoi": {
              "avg": {
                "field": "property.netOperatingIncomeSecuritizationAmount"
              }
            }
          }
        }
      }
    }
  }
}';
     return self::execQuery($queryStr);
   }
   
   public static function getTypeSummary($state, $type){
       $queryStr = '{
  "query": {
    "bool": {
        "filter": [
    {"term": {"property.propertyState": "'.$state.'"}},
    {"term": {"property.propertyTypeCode": "'.$type.'"}}    
    ]
    }
  }, 
  "size": 0, 
  "aggs": {
    "property_name": {
      "terms": {
        "field": "property.propertyName", 
        "size": 10000
      },
      "aggs": {
        "average_secvalue": {
          "avg": {
            "field": "property.valuationSecuritizationAmount"
          }
        },
        "average_secnoi": {
          "avg": {
            "field": "property.netOperatingIncomeSecuritizationAmount"
          }
        },
        "average_secdate": {
          "avg": {
            "field": "property.valuationSecuritizationDate"       
          }
        },
        "centroid" : {
            "geo_centroid" : {
                "field" : "property.location" 
            }
        }
      }
    }
  }
}';
       
       return self::execQuery($queryStr);
   }
}
