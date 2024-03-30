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

/**
 * grepFiles
 *
 * Parse each file in a directory and return an array of file names
 * that include the specified string using the following command:
 *
 *  find . -type f -exec grep -l "ABS-EE" {} +
 *
 * @param {string} dir - Directory to search
 * @param {string} str - String to search for
 * @returns {array} - Array of file names
 *
 */
function grepFiles(dir, str) {
    const { execSync } = require('child_process');
    const cmd = `find ${dir} -type f -exec grep -l "${str}" {} +`;
    const files = execSync(cmd, { encoding: 'utf-8' });
    const fileList = files.split('\n');
    return fileList.filter(file => file.length > 0);
}

module.exports.grepFiles = grepFiles;

/**
 * parseJson
 *
 * Parse a JSON file and return an object
 *
 * @param {string} file - JSON file to parse
 * @returns {object} - Object representation of JSON file
 */

function parseJson(file) {
  const fs = require('fs');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

module.exports.parseJson = parseJson;

/**
 * htmlFromJson
 *
 * @param {object} obj - Object to convert to HTML
 * @param {string} templateFile - a handlebars template file
 * @returns {string} - HTML string
 */

function htmlFromObject(obj, templateFile) {
  const fs = require('fs');
  const Handlebars = require('handlebars');
  const html = fs.readFileSync(templateFile, 'utf8');
  const template = Handlebars.compile(html);
  return template(obj);
}

module.exports.htmlFromObject = htmlFromObject;