<?php declare (strict_types = 1);
/*
 * Copyright (c) Visulate LLC 2017 All rights reserved
 */
namespace CMBS;
use FastRoute;

require __DIR__ . '/../vendor/autoload.php';


$dispatcher = FastRoute\simpleDispatcher(function(FastRoute\RouteCollector $r) {
    $r->addRoute('GET', '/', 'get_us_summary');   
    $r->addRoute('GET', '/type/{state}/{type}', 'get_type_summary');
    $r->addRoute('GET', '/asset/{state}/{type}/{name}', 'get_asset_details');
});


$httpMethod = filter_input(INPUT_SERVER, 'REQUEST_METHOD');
$uri = filter_input(INPUT_SERVER, 'REQUEST_URI', FILTER_SANITIZE_URL);
$routeInfo = $dispatcher->dispatch($httpMethod, $uri);

 function invalidTypeVars($vars) {
    if (count($vars)!= 2) {return true;}
    if ((strlen($vars['state'])!= 2) or (strlen($vars['type'])!= 2)) {return true;}
    if (!ctype_alnum($vars['state'])){return true;}
    if (!ctype_alnum($vars['type'])){return true;}
    return false;    
}

switch ($routeInfo[0]) {
    case FastRoute\Dispatcher::NOT_FOUND:
        raiseError(404);
        break;
    case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
        $allowedMethods = $routeInfo[1];
        raiseError(405);
        break;
    case FastRoute\Dispatcher::FOUND:
        $handler = $routeInfo[1];
        $vars = $routeInfo[2];
        execRequest($handler, $vars);
        break;
}

function execRequest($handler, $vars) {
    switch($handler) {
        case 'get_us_summary':
            RestApis::getUsSummary();
            break;
        case 'get_type_summary':
            if (invalidTypeVars($vars)) { raiseError(405);}
            RestApis::getTypeSummary($vars);
            break;
        case 'get_asset_details':
            RestApis::getAssetDetails($vars);
            break;
        default :
            raiseError(404);
    }
}


function raiseError($status_code) {
    switch ($status_code) {
        case 404:
            http_response_code(404);
            echo '{ "name": "Not Found Exception", "message": "The requested resource was not found.", "code": 0, "status": 404}';
            exit();
        case 405:
            http_response_code(405);
            echo '{ "name": "Method Not Allowed", "message": "The requested method is not allowed.", "code": 0, "status": 405}';
            exit();            
        default:
            http_response_code($status_code);
    }
}