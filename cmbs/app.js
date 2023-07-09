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

require('dotenv').config()
const express    = require('express');
const fileUtils  = require('./utils/file-utils.js');
const objectUtils = require('./utils/object-utils.js');
const config = require('./resources/http-config.js');
const database = require('./services/database.js');
const http = require('./services/http.js');

const app = express();
const port = config.port;

/**
 * POST /cmbs/:form
 *
 * Update the database with filing data of type ABS-EE or FWP
 * ABS-EE submissions populate the exh_102_exhibits table
 * with data from the exhibit 102 files
 *
 * FWP submissions (will) populate the fwp table with Free Writing Prospectus submissions
 *
 */

app.post('/cmbs/:form', async (req, res) => {

  const form = req.params.form;
  // validate form is a valid form type
  if (!['ABS-EE', 'FWP'].includes(form)) {
    res.status(400).send(`Invalid form type: ${form}`);
  }
  const files = fileUtils.grepFiles(config.absDirectory, form);
  const eList = objectUtils.filterAutoIssuers(files, form);

  const response = form === 'FWP' ? await http.insertAllFwpData(eList) : await http.insertAllExhibitData(eList);
  res.json(response);

});

/**
 * GET /cmbs/:form
 *
 * Get an array of objects containing submission data for all entities that have
 * submitted filings of type ABS-EE. Passing a form type of FWP will return an array
 * of FWP submissions for those entities.
 *
 */

app.get('/cmbs/:form', (req, res) => {
  const form = req.params.form;
  // validate form is a valid form type
  if (!['ABS-EE', 'FWP'].includes(form)) {
    res.status(400).send(`Invalid form type: ${form}`);
  }
  const files = fileUtils.grepFiles(config.absDirectory, form);
  const eList = objectUtils.filterAutoIssuers(files, form);
  if (req.headers.accept.includes('application/json')) {
    res.json(eList);
  } else {
    res.send(fileUtils.htmlFromObject(eList, `${config.resourceDirectory}/cmbs-html.hbs`));
  }
});


/**
 * GET /filing/:cik/:accession_number
 *
 * Return the json representation stored in the database
 * of the exhibit 102 file for the specified CIK and accession number
 *
 */

app.get('/filing/:cik/:accession_number', async (req, res) => {
  const cik = req.params.cik;
  const accessionNumber = req.params.accession_number;
  const response = await database.getExhibit(cik, accessionNumber);
  res.json(response);
});


/**
 *
 * GET /cik/:cik
 *
 * Get the json representation for the index.xml for the
 * first ABS-EE filing for the specified CIK. (used for debugging)
 */

app.get('/cik/:cik', async (req, res) => {
  const cik = req.params.cik;
  const fileObject = fileUtils.parseJson(`${config.absDirectory}/CIK000${cik}.json`);
  const filings = objectUtils.extractFilingsByFormType(fileObject, 'ABS-EE');
  const response = await http.getExhibitData(`${filings[0].url}/index.xml`);

  res.json(response);
});

app.listen(port, () => {console.log(`Example app listening at http://localhost:${port}`)});