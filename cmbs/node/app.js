/*!
 * Copyright 2023, 2024 Visulate LLC. All Rights Reserved.
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
// const RedisStore = require('connect-redis').default;
// const redis = require('redis');
const session   = require('express-session');
const fileUtils  = require('./utils/file-utils.js');
const objectUtils = require('./utils/object-utils.js');
const config = require('./resources/http-config.js');
const database = require('./services/database.js');
const http = require('./services/http.js');
const genai = require('./services/genai.js');

const app = express();
const port = config.port;

// TODO implement Redis session store
// Redis session store commented out for now
// // Initialize client.
// let redisClient = redis.createClient({ legacyMode: true });
// redisClient.connect().catch(console.error);

// // Initialize store.
// let redisStore = new RedisStore({
//     client: redisClient,
//     prefix: 'visulate-abs:',
//   });



app.use(session({
  // store: redisStore,
  secret: 'daklawetiou23589089035jklDLK;LKSDAFKsdfui',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(express.json());
// Serve static files from the resources/static directory
app.use('/static', express.static('resources/static'));

/**
 * POST /cmbs/:form
 *
 * Update the database with filing data of type ABS-EE or FWP
 * ABS-EE submissions populate the exh_102_exhibits table
 * with data from the exhibit 102 files
 *
 * FWP submissions (will) populate the cmbs_prospectuses table
 * with Free Writing Prospectus submissions
 *
 */

app.post('/cmbs/:form', async (req, res) => {
  const form = req.params.form;

  if (!['ABS-EE', 'FWP', 'ZIPCODES'].includes(form)) {
    return res.status(400).send(`Invalid form type: ${form}`);
  }

  try {
    if (form === 'ZIPCODES') {
      await database.geocodeZipcodes(`${config.resourceDirectory}/zip-centroids.csv`);
      return res.status(200).send('Zipcode data loaded successfully.'); // Successful response
    }

    const files = fileUtils.grepFiles(config.absDirectory, form);
    const eList = objectUtils.filterAutoIssuers(files, form);
    const response = await http.insertAllExhibitData(eList, form);
    return res.json(response);
  } catch (error) {
    console.error('Error in /cmbs/:form route:', error);
    return res.status(500).send(`Error processing request: ${error.message}`); // Send error response
  }
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
 * GET /
 *
 * Get an array of term sheets
 *
 */
app.get('/', async (req, res) => {
  const termSheets = await database.getTermSheets();
  const templateData = {
    MAPS_API_KEY: process.env.MAPS_API_KEY,
    trusts: termSheets
  };
  res.send(fileUtils.htmlFromObject(templateData, `${config.resourceDirectory}/cmbs-offerings.hbs`));
  // res.send(fileUtils.htmlFromObject(termSheets, `${config.resourceDirectory}/cmbs-offerings.hbs`));
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

app.get('/properties/:cik', async (req, res) => {
  const cik = req.params.cik;
  const properties = await database.getLatestCollateral(cik);
  res.json(properties);
});


/**
 * GET /fwp/:cik/:accession_number
 *  Return an HTML summary of the Free Writing Prospectus
 *
 */

app.get('/ai/term-sheet/:cik/:accession_number', async (req, res) => {
  const cik = req.params.cik;
  const accessionNumber = req.params.accession_number;
  const prospectus = await database.getProspectus(cik, accessionNumber);
  const summary = await genai.termSheetSummary(prospectus, process.env.GEMINI_API_KEY, req);
  res.send(summary);
});

app.get('/ai/assets/:cik', async (req, res) => {
  const cik = req.params.cik;
  const assets = await database.getLatestAssets(cik);
  const summary = await genai.assetsAnalysis(assets, process.env.GEMINI_API_KEY, req);
  res.send(summary);
});


app.get('/ai/collateral/:cik', async (req, res) => {
  const cik = req.params.cik;
  const collateral = await database.getLatestCollateral(cik);
  const summary = await genai.collateralAnalysis(collateral, process.env.GEMINI_API_KEY, req);
  res.send(summary);
});

app.post('/ai/chat', async (req, res) => {
  const question = req.body.question; // Assuming you send the question in the request body
  const sessionId = req.session.id; // get the sessionId from the session
  if (!question || !sessionId) {
      return res.status(400).send('Question and sessionId are required');
  }

  try {
      const response = await genai.chat(question, process.env.GEMINI_API_KEY, req); //pass the req object.
      res.send(response);
  } catch (error) {
      console.error("Error in chat route:", error);
      res.status(500).send(error.message);
  }
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
  const filename = `${config.absDirectory}/CIK000${cik}.json`;
  const fileObject = fileUtils.parseJson(`${filename}`);
  res.json(fileObject);
});

app.listen(port, () => {console.log(`Example app listening at http://localhost:${port}`)});