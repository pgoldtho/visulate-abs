CREATE TABLE exh_102_exhibits (
    cik INTEGER,
    accession_number VARCHAR(255),
    filing_date DATE,
    report_date DATE,
    primary_document VARCHAR(255),
    form VARCHAR(255),
    size VARCHAR(255),
    url VARCHAR(1024),
    exhibit_data JSONB,
    PRIMARY KEY (cik, accession_number)
);

drop view if exists latest_exh_102_exhibits;
CREATE VIEW latest_exh_102_exhibits AS
SELECT
    e.cik, e.accession_number, e.filing_date, e.report_date, e.primary_document, e.form, e.size, e.url
FROM
    public.exh_102_exhibits e
WHERE
    (e.cik, e.filing_date) IN (
        SELECT
            cik,
            MAX(filing_date)
        FROM
            public.exh_102_exhibits
        GROUP BY
            cik
    );

CREATE TABLE cmbs_prospectuses (
    cik INTEGER,
    accession_number VARCHAR(255),
    filing_date DATE,
    report_date DATE,
    primary_document VARCHAR(255),
    form VARCHAR(255),
    size VARCHAR(255),
    url VARCHAR(1024),
    prospectus_html TEXT,
    prospectus_text TEXT,
    PRIMARY KEY (cik, accession_number)
);

alter table cmbs_prospectuses add column prospectus_se tsvector
 generated always as (to_tsvector('english', prospectus_text)) stored;

create index cmbs_prospectuses_idx on cmbs_prospectuses using gin (prospectus_se);

create table cmbs_issuing_entities (
    cik INTEGER,
    name VARCHAR(255) not null,
    PRIMARY KEY (cik)
);

CREATE OR REPLACE VIEW public.cmbs_term_sheets_v
 AS
 SELECT i.name,
    p.cik,
    p.accession_number,
    p.primary_document,
    p.filing_date,
    p.size,
    (p.url::text || '/'::text) || p.primary_document::text AS url
   FROM cmbs_prospectuses p
     LEFT JOIN cmbs_issuing_entities i ON i.cik = p.cik
  WHERE p.primary_document::text ~~ '%ts%'::text AND p.primary_document::text !~~ '%pre%'::text AND p.primary_document::text !~~ '%teaser%'::text AND p.primary_document::text !~~ '%ants%'::text AND p.primary_document::text !~~ '%pmk%'::text AND p.primary_document::text !~~ '%prmk%'::text AND p.primary_document::text !~~ '%ctsa%'::text AND p.size::integer > 1000000;


CREATE TABLE cmbs_property_locations (
    street_address TEXT,
    geo_location GEOMETRY(POINT, 4326)
);

create table cmbs_offerings (
   cik INTEGER,
   name VARCHAR(255),
   phone VARCHAR(32),
   business_address1 VARCHAR(255),
   business_address2 VARCHAR(255),
   business_city VARCHAR(255),
   business_state VARCHAR(32),
   business_zip VARCHAR(16),
   PRIMARY KEY (cik)
);

DROP MATERIALIZED VIEW IF EXISTS cmbs_collateral_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS public.cmbs_collateral_mv
TABLESPACE pg_default
AS
 SELECT exh_102_exhibits.cik,
    exh_102_exhibits.accession_number,
    exh_102_exhibits.filing_date,
    exh_102_exhibits.report_date,
    exh_102_exhibits.primary_document,
    exh_102_exhibits.form,
    exh_102_exhibits.size,
    exh_102_exhibits.url,
    asset.value -> 'assetNumber'::text AS asset_number,
    (((upper(TRIM(BOTH FROM (asset.value -> 'property'::text) ->> 'propertyAddress'::text)) || ', '::text) || ((asset.value -> 'property'::text) ->> 'propertyState'::text)) || ' '::text) || "left"(TRIM(BOTH FROM (asset.value -> 'property'::text) ->> 'propertyZip'::text), 5) AS location,
    (asset.value -> 'property'::text) ->> 'propertyName'::text AS property_name,
    (asset.value -> 'property'::text) ->> 'propertyAddress'::text AS property_address,
    (asset.value -> 'property'::text) ->> 'propertyCity'::text AS property_city,
    (asset.value -> 'property'::text) ->> 'propertyState'::text AS property_state,
    (asset.value -> 'property'::text) ->> 'propertyZip'::text AS property_zip,
    (asset.value -> 'property'::text) ->> 'propertyCounty'::text AS property_county,
    ((asset.value -> 'property'::text) ->> 'yearBuiltNumber'::text)::numeric AS year_built,
    ((asset.value -> 'property'::text) ->> 'yearLastRenovated'::text)::numeric AS year_last_renovated,
    ((asset.value -> 'property'::text) ->> 'unitsBedsRoomsNumber'::text)::numeric AS units_beds_rooms,
    (asset.value -> 'property'::text) ->> 'propertyTypeCode'::text AS property_type_code,
    (asset.value -> 'property'::text) ->> 'DefeasedStatusCode'::text AS defeased_status_code,
    (asset.value -> 'property'::text) ->> 'propertyStatusCode'::text AS property_status_code,
    (asset.value -> 'property'::text) ->> 'largestTenant'::text AS largest_tenant,
    ((asset.value -> 'property'::text) ->> 'squareFeetLargestTenantNumber'::text)::numeric AS square_feet_largest_tenant,
    to_date((asset.value -> 'property'::text) ->> 'leaseExpirationLargestTenantDate'::text, 'MM-DD-YYYY'::text) AS lease_expiration_largest_tenant_date,
    (asset.value -> 'property'::text) ->> 'secondLargestTenant'::text AS second_largest_tenant,
    ((asset.value -> 'property'::text) ->> 'squareFeetSecondLargestTenantNumber'::text)::numeric AS square_feet_second_largest_tenant,
    to_date((asset.value -> 'property'::text) ->> 'leaseExpirationSecondLargestTenantDate'::text, 'MM-DD-YYYY'::text) AS lease_expiration_second_largest_tenant_date,
    (asset.value -> 'property'::text) ->> 'thirdLargestTenant'::text AS third_largest_tenant,
    ((asset.value -> 'property'::text) ->> 'squareFeetThirdLargestTenantNumber'::text)::numeric AS square_feet_third_largest_tenant,
    to_date((asset.value -> 'property'::text) ->> 'leaseExpirationThirdLargestTenantDate'::text, 'MM-DD-YYYY'::text) AS lease_expiration_third_largest_tenant_date,
    (asset.value -> 'property'::text) ->> 'mostRecentAnnualLeaseRolloverReviewDate'::text AS most_recent_annual_lease_rollover_review_date,
    ((asset.value -> 'property'::text) ->> 'physicalOccupancySecuritizationPercentage'::text)::numeric AS physical_occupancy_securitization_percentage,
    ((asset.value -> 'property'::text) ->> 'mostRecentPhysicalOccupancyPercentage'::text)::numeric AS most_recent_physical_occupancy_percentage,
    to_date((asset.value -> 'property'::text) ->> 'mostRecentValuationDate'::text, 'MM-DD-YYYY'::text) AS most_recent_valuation_date,
    (asset.value -> 'property'::text) ->> 'mostRecentValuationAmount'::text AS most_recent_valuation_amount,
    (asset.value -> 'property'::text) ->> 'mostRecentValuationSourceCode'::text AS most_recent_valuation_source_code,
    to_date((asset.value -> 'property'::text) ->> 'mostRecentFinancialsStartDate'::text, 'MM-DD-YYYY'::text) AS most_recent_financials_start_date,
    to_date((asset.value -> 'property'::text) ->> 'mostRecentFinancialsEndDate'::text, 'MM-DD-YYYY'::text) AS most_recent_financials_end_date,
    ((asset.value -> 'property'::text) ->> 'mostRecentRevenueAmount'::text)::numeric AS most_recent_revenue_amount,
    ((asset.value -> 'property'::text) ->> 'operatingExpensesAmount'::text)::numeric AS operating_expenses_amount,
    ((asset.value -> 'property'::text) ->> 'mostRecentNetOperatingIncomeAmount'::text)::numeric AS most_recent_noi_amount,
    ((asset.value -> 'property'::text) ->> 'mostRecentNetCashFlowAmount'::text)::numeric AS most_recent_net_cash_flow_amount,
    (asset.value -> 'property'::text) ->> 'netOperatingIncomeNetCashFlowCode'::text AS noi_net_cash_flow_code,
    ((asset.value -> 'property'::text) ->> 'mostRecentDebtServiceAmount'::text)::numeric AS most_recent_debt_service_amount,
    ((asset.value -> 'property'::text) ->> 'mostRecentDebtServiceCoverageNetOperatingIncomePercentage'::text)::numeric AS most_recent_dsc_noi_percentage,
    ((asset.value -> 'property'::text) ->> 'mostRecentDebtServiceCoverageNetCashFlowpercentage'::text)::numeric AS most_recent_dsc_net_cash_flow_percentage,
    ((asset.value -> 'property'::text) ->> 'netRentableSquareFeetSecuritizationNumber'::text)::numeric AS net_rentable_square_feet_securitization,
    ((asset.value -> 'property'::text) ->> 'netRentableSquareFeetNumber'::text)::numeric AS net_rentable_square_feet,
    to_date((asset.value -> 'property'::text) ->> 'valuationSecuritizationDate'::text, 'MM-DD-YYYY'::text) AS valuation_securitization_date,
    ((asset.value -> 'property'::text) ->> 'valuationSecuritizationAmount'::text)::numeric AS valuation_securitization_amount,
    (asset.value -> 'property'::text) ->> 'valuationSourceSecuritizationCode'::text AS valuation_source_securitization_code,
    to_date((asset.value -> 'property'::text) ->> 'financialsSecuritizationDate'::text, 'MM-DD-YYYY'::text) AS financials_securitization_date,
    ((asset.value -> 'property'::text) ->> 'revenueSecuritizationAmount'::text)::numeric AS revenue_securitization_amount,
    ((asset.value -> 'property'::text) ->> 'operatingExpensesSecuritizationAmount'::text)::numeric AS operating_expenses_securitization_amount,
    ((asset.value -> 'property'::text) ->> 'netOperatingIncomeSecuritizationAmount'::text)::numeric AS noi_securitization_amount,
    (asset.value -> 'property'::text) ->> 'netOperatingIncomeNetCashFlowSecuritizationCode'::text AS noi_net_cash_flow_securitization_code,
    ((asset.value -> 'property'::text) ->> 'netCashFlowFlowSecuritizationAmount'::text)::numeric AS net_cash_flow_flow_securitization_amount,
    ((asset.value -> 'property'::text) ->> 'debtServiceCoverageNetOperatingIncomeSecuritizationPercentage'::text)::numeric AS dsc_noi_securitization_percentage,
    ((asset.value -> 'property'::text) ->> 'debtServiceCoverageNetCashFlowSecuritizationPercentage'::text)::numeric AS dsc_net_cash_flow_securitization_percentage
   FROM exh_102_exhibits,
    LATERAL jsonb_array_elements((exh_102_exhibits.exhibit_data -> 'assetData'::text) -> 'assets'::text) asset(value)
  WHERE exh_102_exhibits.accession_number::text <> '0001056404-17-001912'::text AND ((asset.value -> 'property'::text) ->> 'propertyAddress'::text) IS NOT NULL
WITH DATA;



drop view if exists cmbs_collateral_v;
CREATE OR REPLACE VIEW public.cmbs_collateral_v
 AS
 SELECT cmbs_collateral_mv.cik,
    cmbs_collateral_mv.accession_number,
    cmbs_collateral_mv.filing_date,
    cmbs_collateral_mv.report_date,
    cmbs_collateral_mv.primary_document,
    cmbs_collateral_mv.form,
    cmbs_collateral_mv.size,
    cmbs_collateral_mv.url,
    cmbs_collateral_mv.asset_number,
    cmbs_collateral_mv.location,
    cmbs_collateral_mv.property_name,
    cmbs_collateral_mv.property_address,
    cmbs_collateral_mv.property_city,
    cmbs_collateral_mv.property_state,
    cmbs_collateral_mv.property_zip,
    cmbs_collateral_mv.property_county,
    cmbs_collateral_mv.year_built,
    cmbs_collateral_mv.year_last_renovated,
    cmbs_collateral_mv.units_beds_rooms,
    cmbs_collateral_mv.property_type_code,
        CASE
            WHEN cmbs_collateral_mv.property_type_code = 'CH'::text THEN 'Cooperative Housing'::text
            WHEN cmbs_collateral_mv.property_type_code = 'HC'::text THEN 'Health Care'::text
            WHEN cmbs_collateral_mv.property_type_code = 'IN'::text THEN 'Industrial'::text
            WHEN cmbs_collateral_mv.property_type_code = 'LO'::text THEN 'Lodging'::text
            WHEN cmbs_collateral_mv.property_type_code = 'MF'::text THEN 'Multifamily'::text
            WHEN cmbs_collateral_mv.property_type_code = 'MH'::text THEN 'Mobile Home Park'::text
            WHEN cmbs_collateral_mv.property_type_code = 'MU'::text THEN 'Mixed Use'::text
            WHEN cmbs_collateral_mv.property_type_code = 'OF'::text THEN 'Office'::text
            WHEN cmbs_collateral_mv.property_type_code = 'RT'::text THEN 'Retail'::text
            WHEN cmbs_collateral_mv.property_type_code = 'SE'::text THEN 'Securities'::text
            WHEN cmbs_collateral_mv.property_type_code = 'SS'::text THEN 'Self Storage'::text
            WHEN cmbs_collateral_mv.property_type_code = 'WH'::text THEN 'Warehouse'::text
            WHEN cmbs_collateral_mv.property_type_code = 'ZZ'::text THEN 'Missing Information'::text
            WHEN cmbs_collateral_mv.property_type_code = '98'::text THEN 'Other'::text
            ELSE cmbs_collateral_mv.property_type_code
        END AS property_type,
    cmbs_collateral_mv.defeased_status_code,
        CASE
            WHEN cmbs_collateral_mv.defeased_status_code = 'F'::text THEN 'Full defeasance'::text
            WHEN cmbs_collateral_mv.defeased_status_code = 'IP'::text THEN 'Portion of loan previously defeased'::text
            WHEN cmbs_collateral_mv.defeased_status_code = 'N'::text THEN 'No defeasance occurred'::text
            WHEN cmbs_collateral_mv.defeased_status_code = 'X'::text THEN 'Defeasance not allowed'::text
            ELSE cmbs_collateral_mv.defeased_status_code
        END AS defeased_status,
    cmbs_collateral_mv.property_status_code,
        CASE
            WHEN cmbs_collateral_mv.property_status_code = '1'::text THEN 'In Foreclosure'::text
            WHEN cmbs_collateral_mv.property_status_code = '2'::text THEN 'REO'::text
            WHEN cmbs_collateral_mv.property_status_code = '3'::text THEN 'Defeased'::text
            WHEN cmbs_collateral_mv.property_status_code = '4'::text THEN 'Partial Release'::text
            WHEN cmbs_collateral_mv.property_status_code = '5'::text THEN 'Substituted'::text
            WHEN cmbs_collateral_mv.property_status_code = '6'::text THEN 'Same as at Securitization'::text
            ELSE cmbs_collateral_mv.property_status_code
        END AS property_status,
    cmbs_collateral_mv.largest_tenant,
    cmbs_collateral_mv.square_feet_largest_tenant,
    cmbs_collateral_mv.lease_expiration_largest_tenant_date,
    cmbs_collateral_mv.second_largest_tenant,
    cmbs_collateral_mv.square_feet_second_largest_tenant,
    cmbs_collateral_mv.lease_expiration_second_largest_tenant_date,
    cmbs_collateral_mv.third_largest_tenant,
    cmbs_collateral_mv.square_feet_third_largest_tenant,
    cmbs_collateral_mv.lease_expiration_third_largest_tenant_date,
    cmbs_collateral_mv.most_recent_annual_lease_rollover_review_date,
    cmbs_collateral_mv.physical_occupancy_securitization_percentage,
    cmbs_collateral_mv.most_recent_physical_occupancy_percentage,
    cmbs_collateral_mv.net_rentable_square_feet,
    cmbs_collateral_mv.most_recent_valuation_date,
    cmbs_collateral_mv.most_recent_valuation_amount,
    cmbs_collateral_mv.most_recent_valuation_source_code,
        CASE
            WHEN cmbs_collateral_mv.most_recent_valuation_source_code = 'BPO'::text THEN 'Broker price opinion'::text
            WHEN cmbs_collateral_mv.most_recent_valuation_source_code = 'MAI'::text THEN 'Certified MAI appraisal'::text
            WHEN cmbs_collateral_mv.most_recent_valuation_source_code = 'MS'::text THEN 'Master servicer estimate'::text
            WHEN cmbs_collateral_mv.most_recent_valuation_source_code = 'Non-MAI'::text THEN 'Non-certified MAI appraisal'::text
            WHEN cmbs_collateral_mv.most_recent_valuation_source_code = '98'::text THEN 'Other'::text
            WHEN cmbs_collateral_mv.most_recent_valuation_source_code = 'SS'::text THEN 'SS estimate'::text
            ELSE cmbs_collateral_mv.most_recent_valuation_source_code
        END AS most_recent_valuation_source,
    cmbs_collateral_mv.most_recent_financials_start_date,
    cmbs_collateral_mv.most_recent_financials_end_date,
    round(cmbs_collateral_mv.most_recent_revenue_amount) AS most_recent_revenue_amount,
        CASE
            WHEN (cmbs_collateral_mv.most_recent_financials_end_date - cmbs_collateral_mv.most_recent_financials_start_date) = 0 THEN NULL::numeric
            ELSE round(cmbs_collateral_mv.most_recent_revenue_amount * 365::numeric / (cmbs_collateral_mv.most_recent_financials_end_date - cmbs_collateral_mv.most_recent_financials_start_date)::numeric)
        END AS current_revenue,
    round(cmbs_collateral_mv.operating_expenses_amount) AS operating_expenses_amount,
        CASE
            WHEN (cmbs_collateral_mv.most_recent_financials_end_date - cmbs_collateral_mv.most_recent_financials_start_date) = 0 THEN NULL::numeric
            ELSE round(cmbs_collateral_mv.operating_expenses_amount * 365::numeric / (cmbs_collateral_mv.most_recent_financials_end_date - cmbs_collateral_mv.most_recent_financials_start_date)::numeric)
        END AS current_operating_expenses,
    round(cmbs_collateral_mv.most_recent_noi_amount) AS most_recent_noi_amount,
        CASE
            WHEN (cmbs_collateral_mv.most_recent_financials_end_date - cmbs_collateral_mv.most_recent_financials_start_date) = 0 THEN NULL::numeric
            ELSE round(cmbs_collateral_mv.most_recent_noi_amount * 365::numeric / (cmbs_collateral_mv.most_recent_financials_end_date - cmbs_collateral_mv.most_recent_financials_start_date)::numeric)
        END AS current_noi,
    round(cmbs_collateral_mv.most_recent_net_cash_flow_amount) AS most_recent_net_cash_flow_amount,
        CASE
            WHEN (cmbs_collateral_mv.most_recent_financials_end_date - cmbs_collateral_mv.most_recent_financials_start_date) = 0 THEN NULL::numeric
            ELSE round(cmbs_collateral_mv.most_recent_net_cash_flow_amount * 365::numeric / (cmbs_collateral_mv.most_recent_financials_end_date - cmbs_collateral_mv.most_recent_financials_start_date)::numeric)
        END AS current_net_cash_flow,
    cmbs_collateral_mv.noi_net_cash_flow_code,
        CASE
            WHEN cmbs_collateral_mv.noi_net_cash_flow_code = 'CMSA'::text THEN 'Calculated using CMSA standards'::text
            WHEN cmbs_collateral_mv.noi_net_cash_flow_code = 'CREFC'::text THEN 'Calculated using CREFC standards'::text
            WHEN cmbs_collateral_mv.noi_net_cash_flow_code = 'PSA'::text THEN 'Calculated using a definition given in the pooling and servicing agreement'::text
            WHEN cmbs_collateral_mv.noi_net_cash_flow_code = 'UW'::text THEN 'Calculated using underwriting method'::text
            ELSE cmbs_collateral_mv.noi_net_cash_flow_code
        END AS noi_net_cash_flow_method,
    round(cmbs_collateral_mv.most_recent_debt_service_amount) AS most_recent_debt_service_amount,
    cmbs_collateral_mv.most_recent_dsc_noi_percentage,
    cmbs_collateral_mv.most_recent_dsc_net_cash_flow_percentage,
    cmbs_collateral_mv.net_rentable_square_feet_securitization,
    cmbs_collateral_mv.valuation_securitization_date,
    cmbs_collateral_mv.valuation_securitization_amount,
    cmbs_collateral_mv.valuation_source_securitization_code,
        CASE
            WHEN cmbs_collateral_mv.valuation_source_securitization_code = 'BPO'::text THEN 'Broker price opinion'::text
            WHEN cmbs_collateral_mv.valuation_source_securitization_code = 'MAI'::text THEN 'Certified MAI appraisal'::text
            WHEN cmbs_collateral_mv.valuation_source_securitization_code = 'MS'::text THEN 'Master servicer estimate'::text
            WHEN cmbs_collateral_mv.valuation_source_securitization_code = 'Non-MAI'::text THEN 'Non-certified MAI appraisal'::text
            WHEN cmbs_collateral_mv.valuation_source_securitization_code = '98'::text THEN 'Other'::text
            WHEN cmbs_collateral_mv.valuation_source_securitization_code = 'SS'::text THEN 'SS estimate'::text
            ELSE cmbs_collateral_mv.valuation_source_securitization_code
        END AS valuation_source_securitization,
    cmbs_collateral_mv.financials_securitization_date,
    round(cmbs_collateral_mv.revenue_securitization_amount) AS revenue_securitization_amount,
    round(cmbs_collateral_mv.revenue_securitization_amount / 12::numeric) AS monthly_revenue_securitization,
    round(cmbs_collateral_mv.operating_expenses_securitization_amount) AS operating_expenses_securitization_amount,
    round(cmbs_collateral_mv.operating_expenses_securitization_amount / 12::numeric) AS monthly_operating_expenses_securitization,
    round(cmbs_collateral_mv.noi_securitization_amount) AS noi_securitization_amount,
    round(cmbs_collateral_mv.noi_securitization_amount / 12::numeric) AS monthly_noi_securitization,
    cmbs_collateral_mv.noi_net_cash_flow_securitization_code,
        CASE
            WHEN cmbs_collateral_mv.noi_net_cash_flow_securitization_code = 'CMSA'::text THEN 'Calculated using CMSA standards'::text
            WHEN cmbs_collateral_mv.noi_net_cash_flow_securitization_code = 'CREFC'::text THEN 'Calculated using CREFC standards'::text
            WHEN cmbs_collateral_mv.noi_net_cash_flow_securitization_code = 'PSA'::text THEN 'Calculated using a definition given in the pooling and servicing agreement'::text
            WHEN cmbs_collateral_mv.noi_net_cash_flow_securitization_code = 'UW'::text THEN 'Calculated using underwriting method'::text
            ELSE cmbs_collateral_mv.noi_net_cash_flow_securitization_code
        END AS noi_net_cash_flow_securitization_method,
    round(cmbs_collateral_mv.net_cash_flow_flow_securitization_amount) AS net_cash_flow_flow_securitization_amount,
    round(cmbs_collateral_mv.net_cash_flow_flow_securitization_amount / 12::numeric) AS monthly_net_cash_flow_securitization,
    cmbs_collateral_mv.dsc_noi_securitization_percentage,
    cmbs_collateral_mv.dsc_net_cash_flow_securitization_percentage
   FROM cmbs_collateral_mv;

create view cmbs_latest_collateral_v as
select c.*
from cmbs_collateral_v c
join latest_exh_102_exhibits e
on c.cik = e.cik
and c.accession_number = e.accession_number;



DROP MATERIALIZED VIEW IF EXISTS cmbs_assets_mv;
CREATE MATERIALIZED VIEW cmbs_assets_mv AS
SELECT
    cik,
    accession_number,
    filing_date,
    report_date,
    primary_document,
    form,
    size,
    url,
    asset ->> 'assetNumber' AS asset_number,
    CASE
        WHEN length(asset ->> 'maturityDate') = 7 THEN TO_DATE(asset ->> 'maturityDate', 'MM/YYYY')
        ELSE TO_DATE(asset ->> 'maturityDate', 'MM-DD-YYYY')
    END AS maturity_date,
    asset ->> 'originatorName' AS originator_name,
    asset ->> 'assetTypeNumber' AS asset_type_number,
    CASE
        WHEN length(asset ->> 'originationDate') = 7 THEN TO_DATE(asset ->> 'originationDate', 'MM/YYYY')
        ELSE TO_DATE(asset ->> 'originationDate', 'MM-DD-YYYY')
    END AS origination_date,
    CASE
        WHEN length(asset ->> 'paidThroughDate') = 7 THEN TO_DATE(asset ->> 'paidThroughDate', 'MM/YYYY')
        ELSE TO_DATE(asset ->> 'paidThroughDate', 'MM-DD-YYYY')
    END AS paid_through_date,
    asset ->> 'paymentTypeCode' AS payment_type_code,
    asset ->> 'balloonIndicator' AS balloon_indicator,
    asset ->> 'loanStructureCode' AS loan_structure_code,
    asset ->> 'modifiedIndicator' AS modified_indicator,
    (asset ->> 'originalLoanAmount')::NUMERIC AS original_loan_amount,
    asset ->> 'assetAddedIndicator' AS asset_added_indicator,
    asset ->> 'primaryServicerName' AS primary_servicer_name,
    asset ->> 'paymentFrequencyCode' AS payment_frequency_code,
    asset ->> 'interestOnlyIndicator' AS interest_only_indicator,
    asset ->> 'paymentStatusLoanCode' AS payment_status_loan_code,
    (asset ->> 'graceDaysAllowedNumber')::NUMERIC AS grace_days_allowed_number,
    (asset ->> 'originalTermLoanNumber')::NUMERIC AS original_term_loan_number,
    CASE
        WHEN length(asset ->> 'reportingPeriodEndDate') = 7 THEN TO_DATE(asset ->> 'reportingPeriodEndDate', 'MM/YYYY')
        ELSE TO_DATE(asset ->> 'reportingPeriodEndDate', 'MM-DD-YYYY')
    END AS reporting_period_end_date,
    CASE
        WHEN length(asset ->> 'firstLoanPaymentDueDate') = 7 THEN TO_DATE(asset ->> 'firstLoanPaymentDueDate', 'MM/YYYY')
        ELSE TO_DATE(asset ->> 'firstLoanPaymentDueDate', 'MM-DD-YYYY')
    END AS first_loan_payment_due_date,
    (asset ->> 'scheduledInterestAmount')::NUMERIC AS scheduled_interest_amount,
    (asset ->> 'scheduledPrincipalAmount')::NUMERIC AS scheduled_principal_amount,
    asset ->> 'interestAccrualMethodCode' AS interest_accrual_method_code,
    (asset ->> 'nextInterestRatePercentage')::NUMERIC AS next_interest_rate_percentage,
    asset ->> 'nonRecoverabilityIndicator' AS non_recoverability_indicator,
    asset ->> 'prepaymentPremiumIndicator' AS prepayment_premium_indicator,
    asset ->> 'servicingAdvanceMethodCode' AS servicing_advance_method_code,
    asset ->> 'assetSubjectDemandIndicator' AS asset_subject_demand_indicator,
    asset ->> 'originalInterestRateTypeCode' AS original_interest_rate_type_code,
    CASE
        WHEN length(asset ->> 'reportingPeriodBeginningDate') = 7 THEN TO_DATE(asset ->> 'reportingPeriodBeginningDate', 'MM/YYYY')
        ELSE TO_DATE(asset ->> 'reportingPeriodBeginningDate', 'MM-DD-YYYY')
    END AS reporting_period_beginning_date,
    asset ->> 'negativeAmortizationIndicator' AS negative_amortization_indicator,
    asset ->> 'lienPositionSecuritizationCode' AS lien_position_securitization_code,
    (asset ->> 'originalInterestOnlyTermNumber')::NUMERIC AS original_interest_only_term_number,
    (asset ->> 'originalInterestRatePercentage')::NUMERIC AS original_interest_rate_percentage,
    (asset ->> 'servicerTrusteeFeeRatePercentage')::NUMERIC AS servicer_trustee_fee_rate_percentage,
    asset ->> 'reportPeriodModificationIndicator' AS report_period_modification_indicator,
    (asset ->> 'reportPeriodEndActualBalanceAmount')::NUMERIC AS report_period_end_actual_balance_amount,
    (asset ->> 'reportPeriodInterestRatePercentage')::NUMERIC AS report_period_interest_rate_percentage,
    (asset ->> 'unscheduledPrincipalCollectedAmount')::NUMERIC AS unscheduled_principal_collected_amount,
    (asset ->> 'interestRateSecuritizationPercentage')::NUMERIC AS interest_rate_securitization_percentage,
    (asset ->> 'otherExpensesAdvancedOutstandingAmount')::NUMERIC AS other_expenses_advanced_outstanding_amount,
    (asset ->> 'totalScheduledPrincipalInterestDueAmount')::NUMERIC AS total_scheduled_principal_interest_due_amount,
    (asset ->> 'reportPeriodEndScheduledLoanBalanceAmount')::NUMERIC AS report_period_end_scheduled_loan_balance_amount,
    (asset ->> 'totalTaxesInsuranceAdvancesOutstandingAmount')::NUMERIC AS total_taxes_insurance_advances_outstanding_amount,
    (asset ->> 'scheduledPrincipalBalanceSecuritizationAmount')::NUMERIC AS scheduled_principal_balance_securitization_amount,
    (asset ->> 'reportPeriodBeginningScheduleLoanBalanceAmount')::NUMERIC AS report_period_beginning_schedule_loan_balance_amount,
    (asset ->> 'totalPrincipalInterestAdvancedOutstandingAmount')::NUMERIC AS total_principal_interest_advanced_outstanding_amount
FROM
  exh_102_exhibits,
  LATERAL jsonb_array_elements(exhibit_data -> 'assetData' -> 'assets') AS asset
WHERE accession_number != '0001056404-17-001912';

drop view if exists cmbs_assets_v;
CREATE VIEW cmbs_assets_v AS
SELECT
    cik,
    accession_number,
    filing_date,
    report_date,
    primary_document,
    form,
    size,
    url,
    asset_number,
    maturity_date,
    originator_name,
    asset_type_number,
    origination_date,
    paid_through_date,
    payment_type_code,
    CASE
        WHEN payment_type_code = '1' THEN 'Fully Amortizing'
        WHEN payment_type_code = '2' THEN 'Amortizing Balloon'
        WHEN payment_type_code = '3' THEN 'Interest Only/Balloon'
        WHEN payment_type_code = '4' THEN 'Interest Only/Amortizing'
        WHEN payment_type_code = '5' THEN 'Interest Only/Amortizing/Balloon'
        WHEN payment_type_code = '6' THEN 'Principal Only'
        WHEN payment_type_code = '7' THEN 'Hyper - Amortization'
        WHEN payment_type_code = '98' THEN 'Other'
        ELSE payment_type_code
    END AS payment_type,
    balloon_indicator,
    loan_structure_code,
    CASE
        WHEN loan_structure_code = 'A1' THEN 'A Note; A/B Participation Structure'
        WHEN loan_structure_code = 'A2' THEN 'A Note; A/B/C Participation Structure'
        WHEN loan_structure_code = 'B1' THEN 'B Note; A/B Participation Structure'
        WHEN loan_structure_code = 'B2' THEN 'B Note; A/B/C Participation Structure'
        WHEN loan_structure_code = 'C2' THEN 'C Note; A/B/C Participation Structure'
        WHEN loan_structure_code = 'MZ' THEN 'Mezzanine Financing'
        WHEN loan_structure_code = 'PP' THEN 'Participated mortgage loan with pari passu debt outside trust'
        WHEN loan_structure_code = 'WL' THEN 'Whole loan structure'
        ELSE loan_structure_code
    END AS loan_structure,
    modified_indicator,
    original_loan_amount,
    asset_added_indicator,
    primary_servicer_name,
    payment_frequency_code,
    CASE
        WHEN payment_frequency_code = '1' THEN 'Monthly'
        WHEN payment_frequency_code = '2' THEN 'Quarterly'
        WHEN payment_frequency_code = '3' THEN 'Semi-Annually'
        WHEN payment_frequency_code = '12' THEN 'Annually'
        WHEN payment_frequency_code = '365' THEN 'Daily'
        ELSE payment_frequency_code
    END AS payment_frequency,
    interest_only_indicator,
    payment_status_loan_code,
    CASE
        WHEN payment_status_loan_code = '0' THEN 'Current'
        WHEN payment_status_loan_code = '1' THEN '30-59 days delinquent'
        WHEN payment_status_loan_code = '2' THEN '60-89 days delinquent'
        WHEN payment_status_loan_code = '3' THEN '90+ days delinquent'
        WHEN payment_status_loan_code = '4' THEN 'Performing matured balloon'
        WHEN payment_status_loan_code = '5' THEN 'Non-performing matured balloon'
        WHEN payment_status_loan_code = 'A' THEN 'Payment not received but still within grace period or not yet due'
        WHEN payment_status_loan_code = 'B' THEN 'Late payment, less than 30 days'
        ELSE payment_status_loan_code
    END AS payment_status_loan,
    grace_days_allowed_number,
    original_term_loan_number,
    reporting_period_end_date,
    first_loan_payment_due_date,
    scheduled_interest_amount,
    scheduled_principal_amount,
    interest_accrual_method_code,
    CASE
        WHEN interest_accrual_method_code = '1' THEN '30/360'
        WHEN interest_accrual_method_code = '2' THEN 'Actual/365'
        WHEN interest_accrual_method_code = '3' THEN 'Actual/360'
        WHEN interest_accrual_method_code = '4' THEN 'Actual/Actual'
        WHEN interest_accrual_method_code = '5' THEN 'Actual/366'
        WHEN interest_accrual_method_code = '6' THEN 'Simple'
        WHEN interest_accrual_method_code = '7' THEN '78s'
        WHEN interest_accrual_method_code = '98' THEN 'Other'
        ELSE interest_accrual_method_code
    END AS interest_accrual_method,
    next_interest_rate_percentage,
    non_recoverability_indicator,
    prepayment_premium_indicator,
    servicing_advance_method_code,
    CASE
        WHEN servicing_advance_method_code = '1' THEN 'Scheduled interest, Scheduled principal'
        WHEN servicing_advance_method_code = '2' THEN 'Actual interest, Actual principal'
        WHEN servicing_advance_method_code = '3' THEN 'Scheduled interest, Actual principal'
        WHEN servicing_advance_method_code = '98' THEN 'Other'
        WHEN servicing_advance_method_code = '99' THEN 'Unknown'
        ELSE servicing_advance_method_code
    END AS servicing_advance_method,
    asset_subject_demand_indicator,
    original_interest_rate_type_code,
    CASE
        WHEN original_interest_rate_type_code = '1' THEN 'Fixed'
        WHEN original_interest_rate_type_code = '2' THEN 'ARM'
        WHEN original_interest_rate_type_code = '3' THEN 'Step'
        WHEN original_interest_rate_type_code = '4' THEN 'Other'
        ELSE original_interest_rate_type_code
    END AS original_interest_rate_type,
    reporting_period_beginning_date,
    negative_amortization_indicator,
    lien_position_securitization_code,
    CASE
        WHEN lien_position_securitization_code = '1' THEN 'Primary'
        WHEN lien_position_securitization_code = '2' THEN 'Secondary'
        WHEN lien_position_securitization_code = '3' THEN 'Tertiary'
        WHEN lien_position_securitization_code = '98' THEN 'Other'
        WHEN lien_position_securitization_code = '99' THEN 'Unknown'
        ELSE lien_position_securitization_code
    END AS lien_position_securitization,
    original_interest_only_term_number,
    original_interest_rate_percentage,
    servicer_trustee_fee_rate_percentage,
    report_period_modification_indicator,
    report_period_end_actual_balance_amount,
    report_period_interest_rate_percentage,
    unscheduled_principal_collected_amount,
    interest_rate_securitization_percentage,
    other_expenses_advanced_outstanding_amount,
    total_scheduled_principal_interest_due_amount,
    report_period_end_scheduled_loan_balance_amount,
    total_taxes_insurance_advances_outstanding_amount,
    scheduled_principal_balance_securitization_amount,
    report_period_beginning_schedule_loan_balance_amount,
    total_principal_interest_advanced_outstanding_amount
FROM cmbs_assets_mv;