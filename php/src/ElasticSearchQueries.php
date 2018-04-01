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
   
   
   public static function  getIssuingEntities(){
       $queryStr = '{
  "size": 0,
  "aggs": {
    "depositor": {
      "terms": {
        "field": "depositor_name",
        "size": 100,
        "order": {"_key": "asc"}
      },
      "aggs": {
        "depositor_cik" : {
          "terms": {
            "field": "depositor_cik"
          }
        },
        "issuer": {
          "terms": {
            "field": "issuing_entity_name",
            "size": 100,
            "order": {"_key": "asc"}
          },
          "aggs": {
            "issuer_cik" : {
              "terms": {
                "field": "issuing_entity_cik"
              }
            },
            "property_count" : {
              "cardinality" : {
                "field" : "property.propertyName"
              }
            },
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
        },
        "city" : {
          	"terms": {
          		"field": "property.propertyCity",
          		"order": {
          			"_count": "desc"
          		}
          	}
        }
      }
    }
  }
}';
       return self::execQuery($queryStr);
   }
   
   public static function getIssuer($cik){
       $queryStr = '{
  "query": {
    "bool": {
        "filter": {
          "term": {"issuing_entity_cik": "'.$cik.'"}
        }
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
        },
        "city": {
          "terms": {
            "field": "property.propertyCity",
            "order": {
              "_count": "desc"
            },             
            "size": 10
          }
        },
        "type": {
          "terms": {
            "field": "property.propertyTypeCode",
            "size": 15,
            "order": {"_key": "desc"}
          }
        },
        "state": {
          "terms": {
            "field": "property.propertyState",
            "size": 15,
            "order": {"_key": "desc"}
          }
        }        
      }
    }
  }
}';
       return self::execQuery($queryStr);
   }   
   
   
   
   public static function getAssetDetails($state, $type, $name){
       $queryStr = '{
  "sort": [
    {"asset.reportingPeriodBeginningDate" : {"order": "desc"}}
  ],
  "query": {
    "bool": {
        "filter": [
    {"term": {"property.propertyState": "'.$state.'"}},
    {"term": {"property.propertyTypeCode": "'.$type.'"}},
    {"term": {"property.propertyName": "'.$name.'"}}
    ]
    }
  }
}';
       return self::execQuery($queryStr);
   }
}
