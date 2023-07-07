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

const app = express();
const port = config.port;



app.get('/cmbs/:form', (req, res) => {
  const form = req.params.form;
  // validate form is a valid form type
  if (!['ABS-EE', 'FWP'].includes(form)) {
    res.status(400).send(`Invalid form type: ${form}`);
  }
  const files = fileUtils.grepFiles(config.absDirectory, form);
  const eList = [];
  files.forEach(file => {
    const e = fileUtils.parseJson(file);
    // Filter out Auto loan securitizations by checking for words like 'Auto', 'BMW', 'Lease', etc.
    if (e.name && (!(e.name.match(/auto/i) || e.name.match(/carvana/i) ||
                     e.name.match(/bmw/i) || e.name.match(/mercedes/i) || e.name.match(/honda/i) ||e.name.match(/hyundai/i) ||
                     e.name.match(/lease/i) ||e.name.match(/leasing/i) || e.name.match(/funding/i) ||
                     e.name.match(/motorcycle/i) || e.name.match(/harley-davidson/i)
                     ))) {

      eList.push({
        cik: e.cik,
        name: e.name,
        url: `https://www.sec.gov/Archives/edgar/data/${e.cik}`,
        filings: objectUtils.extractFilingsByFormType(e, form)
      });
    }
  });
  if (req.headers.accept.includes('application/json')) {
    res.json(eList);
  } else {
    res.send(fileUtils.htmlFromObject(eList, `${config.resourceDirectory}/cmbs-html.hbs`));
  }
});


app.listen(port, () => {console.log(`Example app listening at http://localhost:${port}`)});