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

const resourceDirectory = process.env.RESOURCE_DIRECTORY||process.env.PWD + '/resources'
const absDirectory = process.env.ABS_DIRECTORY||process.env.PWD + '/abs'

/**
 * Return environment variable or default value
 */
module.exports = {
    port: process.env.HTTP_PORT || 3000 ,
    corsOriginWhitelist: process.env.CORS_ORIGIN_WHITELIST ||'',
    resourceDirectory: resourceDirectory,
    absDirectory: absDirectory,
    httpHeaders: {'User-Agent': 'Visulate peter@visulate.com'}, // SEC requires a custom user agent
    postgresConfig: {
      host: process.env.POSTGRES_HOST ||'localhost',
      port: process.env.POSTGRES_PORT ||5432,
      database: process.env.POSTGRES_DB ||'cmbs',
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD
    }
  };