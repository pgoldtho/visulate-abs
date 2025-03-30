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
const { decodeAssets, lookupTable } = require('../resources/decode-lookup');
const fileUtils = require('../utils/file-utils.js');


async function geocodeZipcodes(zipcode_centroids) {
  try {
    await db.none('TRUNCATE TABLE public.zipcode_centroids');
    const results = await fileUtils.readCsv(zipcode_centroids);

    for (const row of results) {
      const std_zip5 = row.STD_ZIP5;
      const usps_zip_pref_city = row.USPS_ZIP_PREF_CITY;
      const usps_zip_pref_state = row.USPS_ZIP_PREF_STATE;
      const latitude = parseFloat(row.LATITUDE) || null;
      const longitude = parseFloat(row.LONGITUDE) || null;
      const x = parseFloat(row.x) || null;
      const y = parseFloat(row.y) || null;

      const geoLocation =
        latitude && longitude
          ? `SRID=4326;POINT(${longitude} ${latitude})`
          : null;

      await db.none(
        `
        INSERT INTO public.zipcode_centroids (
          std_zip5,
          usps_zip_pref_city,
          usps_zip_pref_state,
          latitude,
          longitude,
          x,
          y,
          geo_location
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_GeomFromText($8), 4326))
        `,
        [
          std_zip5,
          usps_zip_pref_city,
          usps_zip_pref_state,
          latitude,
          longitude,
          x,
          y,
          geoLocation,
        ]
      );
    }

    return "Zipcode centroids populated successfully!";
  } catch (error) {
    console.error('Error populating zipcode_centroids:', error);
    throw error;
  }
}
module.exports.geocodeZipcodes = geocodeZipcodes;

/**
 * existingEntities
 *
 * Return a list of CIKs from the cmbs_issuing_entities table in the database
 */

async function existingEntities() {
  const query = 'SELECT cik FROM cmbs_issuing_entities';
  const entities = await db.any(query);
  const ciks = entities.map(entity => entity.cik);
  return ciks;
}

module.exports.existingEntities = existingEntities;

/**
 * saveEntity
 *
 * Populate the cmbs_issuing_entities table
 *
 * @param {string} cik
 * @param {string} name
 */

async function saveEntity(cik, name) {
  try {
    const query = 'INSERT INTO cmbs_issuing_entities (cik, name) VALUES($1, $2)';
    const values = [parseInt(cik, 10), name];
    await db.none(query, values);
    return 'Success!';
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
    return `Error: ${error.message}`;
  }
}
module.exports.saveEntity = saveEntity;

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

async function getProspectus(cik, accessionNumber)  {
  const query =
    `SELECT
      prospectus_text,
      filing_date,
      url||'/'||primary_document as url
     FROM cmbs_prospectuses
     WHERE cik = $1 AND accession_number = $2`;
  try {
    const values = [cik, accessionNumber];
    const data = await db.any(query, values);
    return data[0];
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
}
module.exports.getProspectus = getProspectus;

async function getLatestAssets(cik) {
  const query = `
    SELECT
    a.filing_date,
    a.url||'/'||a.primary_document as url,
    a.asset_number,
    a.maturity_date,
    a.originator_name,
    a.asset_type_number,
    a.origination_date,
    a.paid_through_date,
    a.payment_type,
    a.balloon_indicator,
    a.loan_structure,
    a.modified_indicator,
    a.original_loan_amount,
    a.asset_added_indicator,
    a.primary_servicer_name,
    a.payment_frequency,
    a.interest_only_indicator,
    a.payment_status_loan,
    a.grace_days_allowed_number,
    a.original_term_loan_number,
    a.reporting_period_end_date,
    a.first_loan_payment_due_date,
    a.scheduled_interest_amount,
    a.scheduled_principal_amount,
    a.interest_accrual_method_code,
    a.interest_accrual_method,
    a.next_interest_rate_percentage,
    a.non_recoverability_indicator,
    a.prepayment_premium_indicator,
    a.servicing_advance_method_code,
    a.servicing_advance_method,
    a.asset_subject_demand_indicator,
    a.original_interest_rate_type_code,
    a.original_interest_rate_type,
    a.reporting_period_beginning_date,
    a.negative_amortization_indicator,
    a.lien_position_securitization,
    a.original_interest_only_term_number,
    a.original_interest_rate_percentage,
    a.servicer_trustee_fee_rate_percentage,
    a.report_period_modification_indicator,
    a.report_period_end_actual_balance_amount,
    a.report_period_interest_rate_percentage,
    a.unscheduled_principal_collected_amount,
    a.interest_rate_securitization_percentage,
    a.other_expenses_advanced_outstanding_amount,
    a.total_scheduled_principal_interest_due_amount,
    a.report_period_end_scheduled_loan_balance_amount,
    a.total_taxes_insurance_advances_outstanding_amount,
    a.scheduled_principal_balance_securitization_amount,
    a.report_period_beginning_schedule_loan_balance_amount,
    a.total_principal_interest_advanced_outstanding_amount
    from public.latest_exh_102_exhibits l
    join cmbs_assets_v a
    on a.cik = l.cik
    and a.accession_number = l.accession_number
    where l.cik=$1`;
    try {
      const values = [cik];
      const data = await db.any(query, values);
      return data;
    } catch (error) {
      console.error(`An error occurred: ${error.message}`);
    }
  }
  module.exports.getLatestAssets = getLatestAssets;

async function getLatestCollateral(cik) {
  const query = `
    SELECT
      c.url||'/'||c.primary_document as url,
      c.filing_date,
      c.asset_number,
      c.location,
      c.property_name,
      c.year_built,
      c.year_last_renovated,
      c.units_beds_rooms as units_or_bed_rooms,
      c.property_type,
      c.defeased_status,
      c.property_status,
      c.largest_tenant,
      c.square_feet_largest_tenant,
      c.lease_expiration_largest_tenant_date,
      c.second_largest_tenant,
      c.square_feet_second_largest_tenant,
      c.lease_expiration_second_largest_tenant_date,
      c.third_largest_tenant,
      c.square_feet_third_largest_tenant,
      c.lease_expiration_third_largest_tenant_date,
      c.most_recent_annual_lease_rollover_review_date,
      c.net_rentable_square_feet_securitization,
      c.physical_occupancy_securitization_percentage,
      c.valuation_securitization_date,
      c.valuation_securitization_amount,
      c.valuation_source_securitization,
      c.financials_securitization_date,
      c.revenue_securitization_amount,
      c.operating_expenses_securitization_amount,
      c.noi_securitization_amount,
      c.noi_net_cash_flow_securitization_method,
      c.net_cash_flow_flow_securitization_amount,
      c.dsc_noi_securitization_percentage,
      c.dsc_net_cash_flow_securitization_percentage,
      c.most_recent_physical_occupancy_percentage,
      c.net_rentable_square_feet,
      c.most_recent_valuation_date,
      c.most_recent_valuation_amount,
      c.most_recent_valuation_source,
      c.most_recent_financials_start_date,
      c.most_recent_financials_end_date,
      c.current_revenue as current_annual_revenue,
      c.operating_expenses_amount,
      c.current_operating_expenses,
      c.current_noi,
      c.current_net_cash_flow,
      c.noi_net_cash_flow_method,
      c.most_recent_debt_service_amount,
      c.most_recent_dsc_noi_percentage,
      c.most_recent_dsc_net_cash_flow_percentage
  FROM public.latest_exh_102_exhibits l
  JOIN cmbs_collateral_v c ON c.cik = l.cik AND c.accession_number = l.accession_number
  WHERE l.cik = $1
  `;
  try {
    const values = [cik];
    const data = await db.any(query, values);
    return data;
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
}
module.exports.getLatestCollateral = getLatestCollateral;

/**
 * getTermSheets
 *
 */

async function getTermSheets() {
  // Query distinct accession numbers by descending CIK to list Issuing Entities
  // (Trusts) instead of parent companies
  const query = `
  SELECT
    DISTINCT ON (accession_number)
    name ||' - '||to_char(filing_date, 'Mon YYYY') AS trust,
    cik,
    accession_number,
    filing_date,
    url
  FROM
    cmbs_term_sheets_v
  ORDER BY
    accession_number desc,
    cik desc
  `
  try {
    const data = await db.any(query);
    return data;
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
}
module.exports.getTermSheets = getTermSheets;