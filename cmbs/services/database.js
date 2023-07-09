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
const config = require('../resources/http-config');

const db = pgp(config.postgresConfig);

/**
 * existingExhibits
 *
 * Return a list accessionNumbers in the database for a given CIK
 *
 * @param {string} cik - CIK to search for
 * @returns {array} - Array of CIKs
 *
 */

async function existingExhibits(cik) {
  const exhibits = await db.any('SELECT accession_number FROM exh_102_exhibits WHERE cik = $1', cik);
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
    return data;
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
}
module.exports.getExhibit = getExhibit;
