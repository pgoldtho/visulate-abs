# Visulate Commercial Mortgage Backed Security (CMBS) Information

This project contains code to extract financial information for commercial real estate used as collateral in Commercial Mortgage Backed Security (CMBS) offerings.

The Securities and Exchange Commission (SEC) requires issuers of asset-backed securities (bonds backed by a collection of mortgages or other financial assets) to submit summary data in XML format for the underlying assets.  The regulation ([Reg AB II](https://www.sec.gov/oit/announcement/regabii-asset-level-requirements-compliance.html)) that requires this went into force in November 2016.

Issuers submit data using an SEC Form ABS-EE ([example](https://www.sec.gov/Archives/edgar/data/1710261/000153949717001241/0001539497-17-001241-index.htm)) with 2 exhibits: EX-102 (Asset Data File) and EX-103 (Asset Related Document).  The EX-102 is an XML document ([example](https://www.sec.gov/Archives/edgar/data/1005007/000153949717001241/exh_102.xml)) that describes the assets.  Form ABS-EE can be used to submit information on securities backed by auto loans, auto leases, credit card debt, commercial or residential mortgages.  The XML schema for the EX-102 differs depending on the asset type.

The source code is contained in the `cmbs` directory. A separate `legacy-code` directory contains code for an old version of the application that is no longer maintained.

## Downloading CMBS data

The `cmbs/scripts` directory contains code to identify and download ABS-EE (Electronic Exhibits) and FWP (Free Writing Prospectus) files for CMBS offerings. A nodejs/express application in the `cmbs/node` is used to process files in the directory populated by the scripts:

1. Use `scripts/get-abs-submissions.sh` to download all SEC submission files and populate a directory with only submissions that include ABS-EE files.
2. Set an `ABS_DIRECTORY` environment variable to point to the newly populated directory and then start a nodejs process from the `cmbs/node` directory.

It exposes REST endpoints control processing:

- **GET** /cmbs/:form-type (http://localhost:3000/cmbs/FWP)

     Reads the files in the ABS_DIRECTORY and returns an HTML or JSON document with hypertext links to files of the selected type as shown in the example below. The default behavior is to return HTML. Pass an `Accept: application/json` header to retrieve response as a JSON doc

    <ul>
    <li><a href="https://www.sec.gov/Archives/edgar/data/1890702" target="cmbs-window">3650R 2021-PF1 Commercial Mortgage Trust</a></li>
    <ul>
        <li><a href="https://www.sec.gov/Archives/edgar/data/1890702/000153949721001762/n2784_x10-xbfinalpricing.htm" target="cmbs-window">2021-11-10: n2784_x10-xbfinalpricing.htm (22613) </a></li>
        <li><a href="https://www.sec.gov/Archives/edgar/data/1890702/000153949721001760/n2784_x9-xafinalpricing.htm" target="cmbs-window">2021-11-10: n2784_x9-xafinalpricing.htm (22407) </a></li>
        <li><a href="https://www.sec.gov/Archives/edgar/data/1890702/000153949721001730/n2784_x8-finalpricing.htm" target="cmbs-window">2021-11-05: n2784_x8-finalpricing.htm (24375) </a></li>
        <li><a href="https://www.sec.gov/Archives/edgar/data/1890702/000153949721001668/n2784-x2_anxa1.htm" target="cmbs-window">2021-11-01: n2784-x2_anxa1.htm (3110462) </a></li>
        <li><a href="https://www.sec.gov/Archives/edgar/data/1890702/000153949721001666/n27484-x3_ts.htm" target="cmbs-window">2021-11-01: n27484-x3_ts.htm (8541042) </a></li>
        <li><a href="https://www.sec.gov/Archives/edgar/data/1890702/000153949721001664/n2784_newissue-x6.htm" target="cmbs-window">2021-11-01: n2784_newissue-x6.htm (27943) </a></li>
    </ul>
    </ul>

- **POST** /cmbs/:form-type

    Updates Postgres database tables with filing data of type ABS-EE or FWP. *ABS-EE* submissions populate the exh_102_exhibits table with data from the exhibit 102 files. *FWP* submissions populate the cmbs_prospectuses table with Free Writing Prospectus submissions. The DDL to create these tables is in the `cmbs/node/ddl` directory. Database connection details are defined in the `cmbs/node/services/http.js` file.

    *note:* ABS_DIRECTORY, POSTGRES_USER and POSTGRES_PASSWORD can be set using environment variables in a `.env` file

- **GET**  /filing/:cik/:accession_number

    Returns the json representation stored in the database of the exhibit 102 file for the specified CIK and accession number
