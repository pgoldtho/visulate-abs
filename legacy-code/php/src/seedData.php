<?php
/*
 * Copyright (c) Visulate LLC All rights reserved
 */
require __DIR__ . '/../vendor/autoload.php';

use CMBS\CmbsAbsEE;


//$filename = "../../test_data/ex_102_1.json";
$filename = "https://finsight.com/api/filings/files/?new=true&page=1&per_page=200&search=Mortgage&type=EX-102";
$data = implode("", file($filename));
$asset = new CmbsAbsEE();
$asset->seedFilings($data);
