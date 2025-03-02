/*!
 * Copyright 2023 Visulate LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const pgp = require('pg-promise')();
const { as } = require('pg-promise');
const config = require('../resources/http-config');
const db = pgp(config.postgresConfig);
const { decodeAssets, lookupTable } = require('../resources/decode-lookup');

/**
 * existingExhibits
 *
 * Return a list accessionNumbers in the database for a given CIK
 *
 * @param {string} cik - CIK to search for
 * @returns {array} - Array of CIKs
 *
 */

async function existingExhibits(cik, exhibitType) {
  const query = exhibitType === 'FWP'?
    'SELECT accession_number FROM cmbs_prospectuses WHERE cik = $1':
    'SELECT accession_number FROM exh_102_exhibits WHERE cik = $1';
  const exhibits = await db.any(query, cik);
  const accessionNumbers = exhibits.map(exhibit => exhibit.accession_number);
  return accessionNumbers;
}

module.exports.existingExhibits = existingExhibits;

/**
 * saveExhibit
 *
 * @param {object} filing
 * @param {object} exhibit
 * @returns string
 *
 */

async function saveExhibit(filing, exhibit) {
  try {
    // Write object to Postgres table
    const query =
      'INSERT INTO exh_102_exhibits ' +
      '(cik, accession_number, filing_date, report_date, ' +
      ' primary_document, form, size, url, exhibit_data) ' +
      ' VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)';
    const values = [
      filing.cik,
      filing.accessionNumber,
      filing.filingDate,
      filing.reportDate,
      filing.primaryDocument,
      filing.form,
      filing.size,
      filing.url,
      JSON.stringify(exhibit)
    ];

    await db.none(query, values);

    return 'Success!';
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
    return `Error: ${error.message}`;
  }
}
module.exports.saveExhibit = saveExhibit;

/**
 * saveProspectus
 *
 * @param {object} filing
 * @param {object} prospectus
 * @returns string
 *
 */

async function saveProspectus(filing, prospectus) {
  try {
    // Write object to Postgres table
    const query =
      'INSERT INTO cmbs_prospectuses ' +
      '(cik, accession_number, filing_date, report_date, ' +
      ' primary_document, form, size, url, ' +
      ' prospectus_html, prospectus_text) ' +
      ' VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
      const values = [
        filing.cik,
        filing.accessionNumber,
        filing.filingDate,
        filing.reportDate === '' ? null : filing.reportDate,
        filing.primaryDocument,
        filing.form,
        filing.size,
        filing.url,
        prospectus.html,
        prospectus.text
      ];

    await db.none(query, values);

    return 'Success!';
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
    return `Error: ${error.message}`;
  }
}

module.exports.saveProspectus = saveProspectus;

/**
 * getExhibit
 *
 * Return exhibit data for a given CIK and accession number
 *
 * @param {string} cik - CIK to search for
 * @param {string} accessionNumber - Accession number to search for
 *
 * @returns {JSON} - Exhibit data
 *
 */

async function getExhibit(cik, accessionNumber) {
  try {
    const query = 'SELECT exhibit_data FROM exh_102_exhibits WHERE cik = $1 AND accession_number = $2';
    const values = [cik, accessionNumber];

    const data = await db.any(query, values);
    if (data.length > 0) {
      // Query should return only one row since CIK and accession number are unique
      let exhibitDataString = JSON.stringify(data[0].exhibit_data);
      // Parse the exhibit_data field as a JSON object
      const exhibitData = JSON.parse(exhibitDataString);
      // Decode values in the exhibit data
      const decodedData = decodeAssets(exhibitData, lookupTable);
      return decodedData;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
}
module.exports.getExhibit = getExhibit;

async function getProspectus(cik, accessionNumber, format)  {
  const query = format === 'html'?
    'SELECT prospectus_html FROM cmbs_prospectuses WHERE cik = $1 AND accession_number = $2':
    'SELECT prospectus_text FROM cmbs_prospectuses WHERE cik = $1 AND accession_number = $2';
  try {
    const values = [cik, accessionNumber];
    const data = await db.any(query, values);
    return data;
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
}
module.exports.getProspectus = getProspectus;