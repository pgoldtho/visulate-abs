<?php

/*
 * Copyright (c) Visulate LLC 2017 All rights reserved
 */

namespace CMBS;
use Elasticsearch\ClientBuilder;

/**
 * Description of cmbsAssetPersistenceSettings
 *
 * @author pgoldtho
 */
class ElasticSearchClient {
    private $_client;
    
    const ES_INDEX = 'cmbs2';
    const ES_TYPE = 'filing';
    const ES_HOSTS = ['localhost:9200'];
    
    public function __construct() {
        $this->_client = ClientBuilder::create()          
                    ->setHosts(self::ES_HOSTS)     
                    ->build(); 
    }
    
    public function getClient() {
        return $this->_client;
    }
    
    public function getIndex() {
        return self::ES_INDEX;
    }
    
    public function getType() {
        return self::ES_TYPE;
        
    }
}
