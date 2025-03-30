/*!
 * Copyright 2023, 2025 Visulate LLC. All Rights Reserved.
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

const fs = require('fs');
const csv = require('csv-parser');

const fileUtils = {
  /**
   * Reads a CSV file and returns an array of objects.
   *
   * @param {string} csvFilePath - The path to the CSV file.
   * @returns {Promise<Array<object>>} - A Promise that resolves to an array of objects,
   * where each object represents a row in the CSV.
   * @throws {Error} - If the file does not exist or if there's an error reading/parsing the CSV.
   */
  readCsv: (csvFilePath) => {
    return new Promise((resolve, reject) => {
      const results = [];
      if (!fs.existsSync(csvFilePath)) {
        reject(new Error(`CSV file not found: ${csvFilePath}`));
        return;
      }

      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  },

  /**
   * grepFiles
   *
   * Parse each file in a directory and return an array of file names
   * that include the specified string using the following command:
   *
   * find . -type f -exec grep -l "ABS-EE" {} +
   *
   * @param {string} dir - Directory to search
   * @param {string} str - String to search for
   * @returns {array} - Array of file names
   *
   */
  grepFiles: (dir, str) => {
    const { execSync } = require('child_process');
    const cmd = `find ${dir} -type f -exec grep -l "${str}" {} +`;
    const files = execSync(cmd, { encoding: 'utf-8' });
    const fileList = files.split('\n');
    return fileList.filter((file) => file.length > 0);
  },

  /**
   * parseJson
   *
   * Parse a JSON file and return an object
   *
   * @param {string} file - JSON file to parse
   * @returns {object} - Object representation of JSON file
   */
  parseJson: (file) => {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  },

  /**
   * htmlFromObject
   *
   * @param {object} obj - Object to convert to HTML
   * @param {string} templateFile - a handlebars template file
   * @returns {string} - HTML string
   */
  htmlFromObject: (obj, templateFile) => {
    const Handlebars = require('handlebars');
    // Register the 'json' helper
    Handlebars.registerHelper('json', function (context) {
      return JSON.stringify(context);
    });

    const html = fs.readFileSync(templateFile, 'utf8');
    const template = Handlebars.compile(html);
    return template(obj);
  },
};

module.exports = fileUtils;