<?php
/*
 * Copyright (c) Visulate LLC All rights reserved
 */
require __DIR__ . '/../vendor/autoload.php';

use CMBS\CmbsAbsEE;

$filename = "../../test_data/ex_102_1.json";
$data = implode("", file($filename));
$asset = new CmbsAbsEE();
$asset->seedFilings($data);

/*
$filing = [
    'accession_number' => '0001056404-17-002609',
    'filer_cik' => '0001690110',
    'depositor_cik' => '0001515166',
    'sponsor_cik' => '0001558761',
    'absEeUrl' => 'https://www.sec.gov/Archives/edgar/data/1690110/000105640417002609/exh_102.xml',
    'filingUrl' => 'https://www.sec.gov/Archives/edgar/data/1690110/000105640417002609/0001056404-17-002609-index.htm',
    'sponsor_file_no' => '333-207567-04'];
$asset = new CmbsAbsEE();
$asset->seedAssets($filing);
*/

/*
$filing = [
    'accession_number' => '0001539497-17-001241',
    'filer_cik' => '0001710261',
    'depositor_cik' => '0001005007',
    'sponsor_cik' => '0001102113',
    'absEeUrl' => 'https://www.sec.gov/Archives/edgar/data/1005007/000153949717001241/exh_102.xml',
    'filingUrl' => 'https://www.sec.gov/Archives/edgar/data/1710261/000153949717001241/0001539497-17-001241-index.htm',
    'sponsor_file_no' => '333-206847-06'];
$asset = new CmbsAbsEE();
$asset->seedAssets($filing);
 * 
 */