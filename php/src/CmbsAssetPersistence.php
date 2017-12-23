<?php

/*
 * Copyright (c) Visulate LLC 2017 All rights reserved
 */

namespace CMBS;
use CMBS\ElasticSearchClient;
use CMBS\PropertyGeospatial;

/**
 * Description of CmbsAsset
 *
 * @author pgoldtho
 */
class CmbsAssetPersistence {
    
    private $esClient;

    private $index;
    private $type;    
    private $id;
    private $asset;

    const UNGEOCODED_PROPERTIES = '{
  "query": {
    "bool": {
      "filter" : [              
        {"exists": {"field": "property.propertyAddress"}},
        {"exists": {"field": "property.propertyCity"}},
        {"exists": {"field": "property.propertyState"}},
        {"exists": {"field": "property.propertyZip"}}
        ],
        "must_not": [
          {"exists": {"field": "property.location"}}
          ]
    }
  }, 
  "_source" : ["property.propertyAddress", "property.propertyCity", "property.propertyState", "property.propertyZip"]
}';

    public function __construct() {
        $this->esClient = new ElasticSearchClient();
        $this->index = $this->esClient->getIndex();
        $this->type = $this->esClient->getType();
        
    }
    
    public function createAsset($id, $asset) {
        $this->id = $id;
        $this->asset = $asset;
    }
   
    public function indexAsset() {
        $client = $this->esClient->getClient();
        $params = [
            'index' => $this->index,
            'type' => $this->type,
            'id' => $this->id,
            'body' => $this->asset
        ];
        return $client->index($params);        
    }

    public function getAssetById($id) {
        $client = $this->esClient->getClient();
        $this->id = $id;
        $params = [
            'index' => $this->index,
            'type' => $this->type,
            'id' => $this->id
        ];
        $this->asset = $client->get($params);
    }

    public function geocodeProperties() {
        $client = $this->esClient->getClient();
        $params = [
            'scroll' => '15s',
            'size' => '25',
            'index' => $this->index,
            'type' => $this->type,
            'body' => self::UNGEOCODED_PROPERTIES
        ];

        $response = $client->search($params);
        while (isset($response['hits']['hits']) && count($response['hits']['hits']) > 0) {

            foreach ($response['hits']['hits'] as $r) {
                $location = PropertyGeospatial::geocodeProperty(
                        $r['_source']['property']['propertyAddress'], 
                        $r['_source']['property']['propertyCity'], 
                        $r['_source']['property']['propertyState'], 
                        $r['_source']['property']['propertyZip']);

                if (is_numeric($location['lat']) && is_numeric($location['lon'])) {
                    $updateParams = [
                        'index' => $this->index,
                        'type' => $this->type,
                        'id' => $r['_id'],
                        'body' => [
                            'doc' => [
                                'property.location' => $location
                            ]
                        ]
                    ];
                    $updateResponse = $client->update($updateParams);
                }
            }


            $scroll_id = $response['_scroll_id'];

            // Execute a Scroll request and repeat
            $response = $client->scroll([
                "scroll_id" => $scroll_id, //...using our previously obtained _scroll_id
                "scroll" => "30s"           // and the same timeout window
                    ]
            );
        }
    }

}
