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
)

create table cmbs_properties as
select
    cik,
    accession_number,
    filing_date,
    report_date,
    primary_document,
    form,
    size,
    url,
    asset -> 'property' ->> 'propertyZip' AS property_zip,
    asset -> 'property' ->> 'propertyCity' AS property_city,
    asset -> 'property' ->> 'propertyName' AS property_name,
    asset -> 'property' ->> 'largestTenant' AS largest_tenant,
    asset -> 'property' ->> 'propertyState' AS property_state,
    asset -> 'property' ->> 'propertyCounty' AS property_county,
    asset -> 'property' ->> 'propertyAddress' AS property_address,
    asset -> 'property' ->> 'yearBuiltNumber' AS year_built,
    asset -> 'property' ->> 'propertyTypeCode' AS property_type_code,
    asset -> 'property' ->> 'yearLastRenovated' AS year_last_renovated,
    asset -> 'property' ->> 'propertyStatusCode' AS property_status_code,
    asset -> 'property' ->> 'thirdLargestTenant' AS third_largest_tenant,
    asset -> 'property' ->> 'secondLargestTenant' AS second_largest_tenant,
    asset -> 'property' ->> 'mostRecentRevenueAmount' AS most_recent_revenue_amount,
    asset -> 'property' ->> 'operatingExpensesAmount' AS operating_expenses_amount,
    asset -> 'property' ->> 'mostRecentFinancialsEndDate' AS most_recent_financials_end_date,
    asset -> 'property' ->> 'mostRecentNetCashFlowAmount' AS most_recent_net_cash_flow_amount,
    asset -> 'property' ->> 'netRentableSquareFeetNumber' AS net_rentable_square_feet,
    asset -> 'property' ->> 'revenueSecuritizationAmount' AS revenue_securitization_amount,
    asset -> 'property' ->> 'valuationSecuritizationDate' AS valuation_securitization_date,
    asset -> 'property' ->> 'financialsSecuritizationDate' AS financials_securitization_date,
    asset -> 'property' ->> 'mostRecentFinancialsStartDate' AS most_recent_financials_start_date,
    asset -> 'property' ->> 'squareFeetLargestTenantNumber' AS square_feet_largest_tenant,
    asset -> 'property' ->> 'valuationSecuritizationAmount' AS valuation_securitization_amount,
    asset -> 'property' ->> 'leaseExpirationLargestTenantDate' AS lease_expiration_largest_tenant_date,
    asset -> 'property' ->> 'netOperatingIncomeNetCashFlowCode' AS net_operating_income_net_cash_flow_code,
    asset -> 'property' ->> 'valuationSourceSecuritizationCode' AS valuation_source_securitization_code,
    asset -> 'property' ->> 'mostRecentNetOperatingIncomeAmount' AS most_recent_net_operating_income_amount,
    asset -> 'property' ->> 'squareFeetThirdLargestTenantNumber' AS square_feet_third_largest_tenant,
    asset -> 'property' ->> 'netCashFlowFlowSecuritizationAmount' AS net_cash_flow_flow_securitization_amount,
    asset -> 'property' ->> 'squareFeetSecondLargestTenantNumber' AS square_feet_second_largest_tenant,
    asset -> 'property' ->> 'leaseExpirationThirdLargestTenantDate' AS lease_expiration_third_largest_tenant_date,
    asset -> 'property' ->> 'mostRecentPhysicalOccupancyPercentage' AS most_recent_physical_occupancy_percentage,
    asset -> 'property' ->> 'operatingExpensesSecuritizationAmount' AS operating_expenses_securitization_amount,
    asset -> 'property' ->> 'leaseExpirationSecondLargestTenantDate' AS lease_expiration_second_largest_tenant_date,
    asset -> 'property' ->> 'netOperatingIncomeSecuritizationAmount' AS net_operating_income_securitization_amount,
    asset -> 'property' ->> 'mostRecentAnnualLeaseRolloverReviewDate' AS most_recent_annual_lease_rollover_review_date,
    asset -> 'property' ->> 'netRentableSquareFeetSecuritizationNumber' AS net_rentable_square_feet_securitization,
    asset -> 'property' ->> 'physicalOccupancySecuritizationPercentage' AS physical_occupancy_securitization_percentage,
    asset -> 'property' ->> 'netOperatingIncomeNetCashFlowSecuritizationCode' AS net_operating_income_net_cash_flow_securitization_code,
FROM
  exh_102_exhibits,
  LATERAL jsonb_array_elements(exhibit_data -> 'assetData' -> 'assets') AS asset
  where  accession_number != '0001056404-17-001912'
  and asset -> 'property' ->> 'propertyAddress' is not null