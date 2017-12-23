# Visulate Commercial Mortgage Backed Security (CMBS) Information

The Securities and Exchange Commission (SEC) requires issuers of asset-backed securities (bonds backed by a collection of mortgages or other financial assets) to submit summary data in XML format for the underlying assets.  The regulation ([Reg AB II](https://www.sec.gov/oit/announcement/regabii-asset-level-requirements-compliance.html)) that requires this went into force in November 2016.

Issuers submit data using an SEC Form ABS-EE ([example](https://www.sec.gov/Archives/edgar/data/1710261/000153949717001241/0001539497-17-001241-index.htm)) with 2 exhibits: EX-102 (Asset Data File) and EX-103 (Asset Related Document).  The EX-102 is an XML document ([example](https://www.sec.gov/Archives/edgar/data/1005007/000153949717001241/exh_102.xml)) that describes the assets.  Form ABS-EE can be used to submit information on securities backed by auto loans, auto leases, credit card debt, commercial or residential mortgages.  The XML schema for the EX-102 differs depending on the asset type.

This project extracts data from EX-102 exhibits for Commercial Mortgage Backed Securities (CMBS) and stores it in an ElasticSearch index.  It creates one document for each property and geocodes its street address.

Use the elasticSearchMapping.json file to create mappings for the index:
`curl -X PUT http://localhost:9200/cmbs -d @elasticSearchMapping.json  -H 'Content-Type: application/json' `

Edit php/src/PropertyGeospatial.php to add a [Google Geocoding API key](https://developers.google.com/maps/documentation/geocoding/get-api-key):

`class PropertyGeospatial {
    const CENSUS_GEOCODER = "https://geocoding.geo.census.gov/geocoder/locations/address";
    const GOOGLE_GEOCODER = "https://maps.googleapis.com/maps/api/geocode/json";
    const GOOGLE_API_KEY = "";  //Add API Key before use`

Then run seedData.php to add some sample data:

`cd php/src
php seedData.php`

The sample data is in the test_data directory.  It was source by calling a <https://finsight.com/> API.  A Postman collection in the test_data directory has the GET request for this.
