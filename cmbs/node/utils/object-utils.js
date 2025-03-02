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

const fileUtils  = require('./file-utils.js');


/**
 * extractFilingsByFormType
 *
 * Extracts filings of a given form type e.g. 'ABS-EE' or 'FWP'
 * from an SEC entity object.
 *
 * @param {object} entity
 * @param {string} formType
 * @returns object
 */
function extractFilingsByFormType(entity, formType) {
  // Find all indexes of formType in filings.recent.form
  // ABS-EE filings return a primary document of 'exh_102.xml'
  // which is more useful than the html document identified by the SEC
  const formSubmissions = [];
  const baseUrl = `https://www.sec.gov/Archives/edgar/data/${entity.cik}`;
  for (let i = 0; i < entity.filings.recent.form.length; i++) {
    if (entity.filings.recent.form[i] === formType) {
      formSubmissions.push({
        cik : entity.cik,
        name : entity.name,
        accessionNumber : entity.filings.recent.accessionNumber[i],
        filingDate : entity.filings.recent.filingDate[i],
        reportDate : entity.filings.recent.reportDate[i],
        primaryDocument : formType==='ABS-EE' ? 'exh_102.xml' : entity.filings.recent.primaryDocument[i],
        form : entity.filings.recent.form[i],
        size : formType==='ABS-EE' ? '' : entity.filings.recent.size[i],
        url : `${baseUrl}/${entity.filings.recent.accessionNumber[i].replace(/-/g, '')}`
      });
    }
  }
  return formSubmissions;
}
module.exports.extractFilingsByFormType = extractFilingsByFormType;

/**
 * filterAutoIssuers
 *
 * SEC does not provide a form type for ABS-EE filings in machine readable format
 * so we need to filter out Auto loan securitizations by checking for words like
 * 'Auto', 'BMW', 'Lease', etc.
 * "AFS SENSUB CORP." is and ABS backed by auto leases
 *
 * @param { object } entities
 * @param { string } form
 * @returns object
 */

function filterAutoIssuers(entities, form) {
  const filteredEntities = [];

  entities.forEach(file => {
    const e = fileUtils.parseJson(file);

    if (e.name && (!(e.name.match(/auto/i) || e.name.match(/car/i) ||
                     e.name.match(/bmw/i) || e.name.match(/mercedes/i) || e.name.match(/honda/i) ||e.name.match(/hyundai/i) ||
                     e.name.match(/lease/i) ||e.name.match(/leasing/i) || e.name.match(/funding/i) ||
                     e.name.match(/motorcycle/i) || e.name.match(/harley-davidson/i)||
                     e.name.match(/afs sensub corp/i)
                     ))) {

      filteredEntities.push({
        filename: file,
        cik: e.cik,
        name: e.name,
        url: `https://www.sec.gov/Archives/edgar/data/${e.cik}`,
        filings: extractFilingsByFormType(e, form)
      });
    }
  });
  return filteredEntities;
}

module.exports.filterAutoIssuers = filterAutoIssuers;