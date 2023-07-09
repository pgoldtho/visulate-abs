const axios = require('axios');
const fastXml = require('fast-xml-parser');
const database = require('./database.js');
const fileUtils = require('../utils/file-utils.js');
const config = require('../resources/http-config.js');
const objectUtils = require('../utils/object-utils.js');
const Bottleneck = require('bottleneck');


// Create a limiter to throttle requests to EDGAR to no than 10 per second
const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 100 // 100 ms
});


/**
 * getExhibitData
 *
 * Get ex-102 data for a single ABS-EE filing from the SEC
 * convert the XML response to JSON and return the JSON
 *
 * @param {*} url
 * @returns
 */

async function getExhibitData(url) {
  try {
    const xmlResponse = await axios.get(url, { headers: config.httpHeaders });
    const xml = xmlResponse.data;
    const parser = new fastXml.XMLParser();
    const json = parser.parse(xml, { ignoreAttributes: false, attributeNamePrefix: '' });
    return json;
  } catch (error) {
    console.error(`An error occurred: ${error.message} for url: ${url}`);
  }
}

exports.getExhibitData = getExhibitData;

/**
 * insertAllExhibitData
 *
 * Insert ex-102 data for all ABS-EE filings in the eList
 *
 * @param {object} eList
 * @returns object
 */

async function insertAllExhibitData(eList) {
  const promises = eList.map(async (e) => {
    const trimmedCik = e.cik.replace(/^0+/, '');
    const cikResponse = await insertExhibitData(e.filename, trimmedCik);
    return { [trimmedCik]: cikResponse };
  });
  const response = await Promise.all(promises);
  return response;
}

exports.insertAllExhibitData = insertAllExhibitData;

/**
 * TO DO: insertExhibitData
 *
 * Retrieve free writing prospectuses from the SEC,
 * convert from HTML to text and insert into the database
 *
 * @param {object} eList
 * @returns
 */

async function insertAllFwpData(eList) {
  const response = {
    message: 'insertAllFwpData not yet implemented',
    list: eList
  }
  return response;
}

exports.insertAllFwpData = insertAllFwpData;


/**
 *
 * findEx102Filename
 *
 * Find the ex-102 exhibit filename for a given filing.
 * Most CMBS filings use exh_102.xml as the filename, but this is not always the case.
 *
 * @param {string} filingUrl
 * @returns string
 */

async function findEx102Filename(filingUrl) {
  try {
    const ex102regex = new RegExp('.*102.*\\.xml$');

    const xmlResponse = await limiter.schedule(() => axios.get(`${filingUrl}/index.xml`, { headers: config.httpHeaders }));
    const xml = xmlResponse.data;
    const parser = new fastXml.XMLParser();
    const index = parser.parse(xml, { ignoreAttributes: false, attributeNamePrefix: '' });

    const ex102 = index.directory.item.find(item => ex102regex.test(item.name));
    return ex102 ? ex102.name : null;
  } catch (error) {
    console.error(`An error occurred: ${error.message} for url: ${filingUrl}`);
  }
}


/**
 * insertExhibitData
 *
 * Open and parse a local JSON file containing a list of ABS-EE filings for a given CIK
 * Check the database to see if the filing has already been inserted
 * Make a request to the SEC to retrieve the ex-102 exhibit data for each filing that
 * has not already been inserted into the database
 *
 * @param {*} filename
 * @param {*} cik
 * @returns
 */

async function insertExhibitData(filename, cik) {
  const fileObject = fileUtils.parseJson(`${filename}`);
  const filings = objectUtils.extractFilingsByFormType(fileObject, 'ABS-EE');
  const existingExhibits = await database.existingExhibits(cik);
  const newFilings = filings.filter(filing => !existingExhibits.includes(filing.accessionNumber));

  const promises = newFilings.map(async (filing) => {
    const ex102file = await findEx102Filename(filing.url);
    if (!ex102file) { return { [filing.accessionNumber]: 'No ex102 file found' }; }

    const exhibit = await getExhibitData(`${filing.url}/${ex102file}`);
    const dbResponse = await database.saveExhibit(filing, exhibit);
    return { [filing.accessionNumber]:  dbResponse };
  });

  const response = newFilings.length > 0 ? await Promise.all(promises) : {message : `No new filings found for CIK ${cik}`};
  return response;
}

exports.insertExhibitData = insertExhibitData;
