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

DROP MATERIALIZED VIEW IF EXISTS cmbs_collateral_mv;
create materialized view cmbs_collateral_mv as
select
    cik,
    accession_number,
    filing_date,
    report_date,
    primary_document,
    form,
    size,
    url,
    asset -> 'assetNumber' AS asset_number,
    upper(trim(asset -> 'property' ->> 'propertyAddress')::TEXT) ||', '
    || (asset -> 'property' ->> 'propertyState')::TEXT || ' '
    || left(trim(asset -> 'property' ->> 'propertyZip')::TEXT, 5) AS location,
    asset -> 'property' ->> 'propertyName' AS property_name,
    asset -> 'property' ->> 'propertyAddress' AS property_address,
    asset -> 'property' ->> 'propertyCity' AS property_city,
    asset -> 'property' ->> 'propertyState' AS property_state,
    asset -> 'property' ->> 'propertyZip' AS property_zip,
    asset -> 'property' ->> 'propertyCounty' AS property_county,
    (asset -> 'property' ->> 'yearBuiltNumber')::NUMERIC AS year_built,
    (asset -> 'property' ->> 'yearLastRenovated')::NUMERIC  AS year_last_renovated,
    (asset -> 'property' ->> 'unitsBedsRoomsNumber')::NUMERIC AS units_beds_rooms,
    asset -> 'property' ->> 'propertyTypeCode' AS property_type_code,
    asset -> 'property' ->> 'DefeasedStatusCode' AS defeased_status_code,
    asset -> 'property' ->> 'propertyStatusCode' AS property_status_code,
    asset -> 'property' ->> 'largestTenant' AS largest_tenant,
    (asset -> 'property' ->> 'squareFeetLargestTenantNumber')::NUMERIC AS square_feet_largest_tenant,
    TO_DATE(asset -> 'property' ->> 'leaseExpirationLargestTenantDate', 'MM-DD-YYYY') AS lease_expiration_largest_tenant_date,
    asset -> 'property' ->> 'secondLargestTenant' AS second_largest_tenant,
    (asset -> 'property' ->> 'squareFeetSecondLargestTenantNumber')::NUMERIC AS square_feet_second_largest_tenant,
    TO_DATE(asset -> 'property' ->> 'leaseExpirationSecondLargestTenantDate', 'MM-DD-YYYY') AS lease_expiration_second_largest_tenant_date,
    asset -> 'property' ->> 'thirdLargestTenant' AS third_largest_tenant,
    (asset -> 'property' ->> 'squareFeetThirdLargestTenantNumber')::NUMERIC AS square_feet_third_largest_tenant,
    TO_DATE(asset -> 'property' ->> 'leaseExpirationThirdLargestTenantDate', 'MM-DD-YYYY') AS lease_expiration_third_largest_tenant_date,
    TO_DATE(asset -> 'property' ->> 'mostRecentAnnualLeaseRolloverReviewDate', 'MM-DD-YYYY') AS most_recent_annual_lease_rollover_review_date,
    (asset -> 'property' ->> 'physicalOccupancySecuritizationPercentage')::NUMERIC AS physical_occupancy_securitization_percentage,
    (asset -> 'property' ->> 'mostRecentPhysicalOccupancyPercentage')::NUMERIC AS most_recent_physical_occupancy_percentage,
    (asset -> 'property' ->> 'netRentableSquareFeetNumber')::NUMERIC AS net_rentable_square_feet,
    TO_DATE(asset -> 'property' ->> 'mostRecentValuationDate', 'MM-DD-YYYY') AS most_recent_valuation_date,
    asset -> 'property' ->> 'mostRecentValuationAmount' AS most_recent_valuation_amount,
    asset -> 'property' ->> 'mostRecentValuationSourceCode' AS most_recent_valuation_source_code,
    TO_DATE(asset -> 'property' ->> 'mostRecentFinancialsStartDate', 'MM-DD-YYYY') AS most_recent_financials_start_date,
    TO_DATE(asset -> 'property' ->> 'mostRecentFinancialsEndDate', 'MM-DD-YYYY') AS most_recent_financials_end_date,
    (asset -> 'property' ->> 'mostRecentRevenueAmount')::NUMERIC AS most_recent_revenue_amount,
    (asset -> 'property' ->> 'operatingExpensesAmount')::NUMERIC AS operating_expenses_amount,
    (asset -> 'property' ->> 'mostRecentNetOperatingIncomeAmount')::NUMERIC AS most_recent_noi_amount,
    (asset -> 'property' ->> 'mostRecentNetCashFlowAmount')::NUMERIC AS most_recent_net_cash_flow_amount,
    asset -> 'property' ->> 'netOperatingIncomeNetCashFlowCode' AS noi_net_cash_flow_code,
    (asset -> 'property' ->> 'mostRecentDebtServiceAmount')::NUMERIC AS most_recent_debt_service_amount,
    (asset -> 'property' ->> 'mostRecentDebtServiceCoverageNetOperatingIncomePercentage')::NUMERIC AS most_recent_dsc_noi_percentage,
    (asset -> 'property' ->> 'mostRecentDebtServiceCoverageNetCashFlowpercentage')::NUMERIC AS most_recent_dsc_net_cash_flow_percentage,
    (asset -> 'property' ->> 'netRentableSquareFeetSecuritizationNumber')::NUMERIC AS net_rentable_square_feet_securitization,
    TO_DATE(asset -> 'property' ->> 'valuationSecuritizationDate', 'MM-DD-YYYY') AS valuation_securitization_date,
    (asset -> 'property' ->> 'valuationSecuritizationAmount')::NUMERIC AS valuation_securitization_amount,
    asset -> 'property' ->> 'valuationSourceSecuritizationCode' AS valuation_source_securitization_code,
    TO_DATE(asset -> 'property' ->> 'financialsSecuritizationDate', 'MM-DD-YYYY') AS financials_securitization_date,
    (asset -> 'property' ->> 'revenueSecuritizationAmount')::NUMERIC AS revenue_securitization_amount,
    (asset -> 'property' ->> 'operatingExpensesSecuritizationAmount')::NUMERIC AS operating_expenses_securitization_amount,
    (asset -> 'property' ->> 'netOperatingIncomeSecuritizationAmount')::NUMERIC AS noi_securitization_amount,
    asset -> 'property' ->> 'netOperatingIncomeNetCashFlowSecuritizationCode' AS noi_net_cash_flow_securitization_code,
    (asset -> 'property' ->> 'netCashFlowFlowSecuritizationAmount')::NUMERIC AS net_cash_flow_flow_securitization_amount,
    (asset -> 'property' ->> 'debtServiceCoverageNetOperatingIncomeSecuritizationPercentage')::NUMERIC AS dsc_noi_securitization_percentage,
    (asset -> 'property' ->> 'debtServiceCoverageNetCashFlowSecuritizationPercentage')::NUMERIC AS dsc_net_cash_flow_securitization_percentage
FROM
  exh_102_exhibits,
  LATERAL jsonb_array_elements(exhibit_data -> 'assetData' -> 'assets') AS asset
  where  accession_number != '0001056404-17-001912'
  and asset -> 'property' ->> 'propertyAddress' is not null


drop view if exists cmbs_collateral_v;
CREATE VIEW cmbs_collateral_v AS
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
    location,
    property_name,
    property_address,
    property_city,
    property_state,
    property_zip,
    property_county,
    year_built,
    year_last_renovated,
    units_beds_rooms,
    property_type_code,
    CASE
        WHEN property_type_code = 'CH' THEN 'Cooperative Housing'
        WHEN property_type_code = 'HC' THEN 'Health Care'
        WHEN property_type_code = 'IN' THEN 'Industrial'
        WHEN property_type_code = 'LO' THEN 'Lodging'
        WHEN property_type_code = 'MF' THEN 'Multifamily'
        WHEN property_type_code = 'MH' THEN 'Mobile Home Park'
        WHEN property_type_code = 'MU' THEN 'Mixed Use'
        WHEN property_type_code = 'OF' THEN 'Office'
        WHEN property_type_code = 'RT' THEN 'Retail'
        WHEN property_type_code = 'SE' THEN 'Securities'
        WHEN property_type_code = 'SS' THEN 'Self Storage'
        WHEN property_type_code = 'WH' THEN 'Warehouse'
        WHEN property_type_code = 'ZZ' THEN 'Missing Information'
        WHEN property_type_code = '98' THEN 'Other'
        ELSE property_type_code
    END AS property_type,
    defeased_status_code,
    CASE
        WHEN defeased_status_code = 'F' THEN 'Full defeasance'
        WHEN defeased_status_code = 'IP' THEN 'Portion of loan previously defeased'
        WHEN defeased_status_code = 'N' THEN 'No defeasance occurred'
        WHEN defeased_status_code = 'X' THEN 'Defeasance not allowed'
        ELSE defeased_status_code
    END AS defeased_status,
    property_status_code,
    CASE
        WHEN property_status_code = '1' THEN 'In Foreclosure'
        WHEN property_status_code = '2' THEN 'REO'
        WHEN property_status_code = '3' THEN 'Defeased'
        WHEN property_status_code = '4' THEN 'Partial Release'
        WHEN property_status_code = '5' THEN 'Substituted'
        WHEN property_status_code = '6' THEN 'Same as at Securitization'
        ELSE property_status_code
    END AS property_status,
    largest_tenant,
    square_feet_largest_tenant,
    lease_expiration_largest_tenant_date,
    second_largest_tenant,
    square_feet_second_largest_tenant,
    lease_expiration_second_largest_tenant_date,
    third_largest_tenant,
    square_feet_third_largest_tenant,
    lease_expiration_third_largest_tenant_date,
    most_recent_annual_lease_rollover_review_date,
    physical_occupancy_securitization_percentage,
    most_recent_physical_occupancy_percentage,
    net_rentable_square_feet,
    most_recent_valuation_date,
    most_recent_valuation_amount,
    most_recent_valuation_source_code,
    CASE
        WHEN most_recent_valuation_source_code = 'BPO' THEN 'Broker price opinion'
        WHEN most_recent_valuation_source_code = 'MAI' THEN 'Certified MAI appraisal'
        WHEN most_recent_valuation_source_code = 'MS' THEN 'Master servicer estimate'
        WHEN most_recent_valuation_source_code = 'Non-MAI' THEN 'Non-certified MAI appraisal'
        WHEN most_recent_valuation_source_code = '98' THEN 'Other'
        WHEN most_recent_valuation_source_code = 'SS' THEN 'SS estimate'
        ELSE most_recent_valuation_source_code
    END AS most_recent_valuation_source,
    most_recent_financials_start_date,
    most_recent_financials_end_date,
    round (most_recent_revenue_amount) as most_recent_revenue_amount,
    CASE
        WHEN (most_recent_financials_end_date - most_recent_financials_start_date) = 0 THEN NULL
        ELSE round(most_recent_revenue_amount * 365 / (most_recent_financials_end_date - most_recent_financials_start_date))
    END AS current_revenue,
    round(operating_expenses_amount) as operating_expenses_amount,
    CASE
        WHEN (most_recent_financials_end_date - most_recent_financials_start_date) = 0 THEN NULL
        ELSE round(operating_expenses_amount * 365 / (most_recent_financials_end_date - most_recent_financials_start_date))
    END AS current_operating_expenses,
    round(most_recent_noi_amount) as most_recent_noi_amount,
    CASE
        WHEN (most_recent_financials_end_date - most_recent_financials_start_date) = 0 THEN NULL
        ELSE round(most_recent_noi_amount * 365 / (most_recent_financials_end_date - most_recent_financials_start_date))
    END AS current_noi,
    round(most_recent_net_cash_flow_amount) as most_recent_net_cash_flow_amount,
    CASE
        WHEN (most_recent_financials_end_date - most_recent_financials_start_date) = 0 THEN NULL
        ELSE round(most_recent_net_cash_flow_amount * 365 / (most_recent_financials_end_date - most_recent_financials_start_date))
    END AS current_net_cash_flow,
    noi_net_cash_flow_code,
    CASE
        WHEN noi_net_cash_flow_code = 'CMSA' THEN 'Calculated using CMSA standards'
        WHEN noi_net_cash_flow_code = 'CREFC' THEN 'Calculated using CREFC standards'
        WHEN noi_net_cash_flow_code = 'PSA' THEN 'Calculated using a definition given in the pooling and servicing agreement'
        WHEN noi_net_cash_flow_code = 'UW' THEN 'Calculated using underwriting method'
        ELSE noi_net_cash_flow_code
    END AS noi_net_cash_flow_method,
    round(most_recent_debt_service_amount) as most_recent_debt_service_amount,
    most_recent_dsc_noi_percentage,
    most_recent_dsc_net_cash_flow_percentage,
    net_rentable_square_feet_securitization,
    valuation_securitization_date,
    valuation_securitization_amount,
    valuation_source_securitization_code,
    CASE
        WHEN valuation_source_securitization_code = 'BPO' THEN 'Broker price opinion'
        WHEN valuation_source_securitization_code = 'MAI' THEN 'Certified MAI appraisal'
        WHEN valuation_source_securitization_code = 'MS' THEN 'Master servicer estimate'
        WHEN valuation_source_securitization_code = 'Non-MAI' THEN 'Non-certified MAI appraisal'
        WHEN valuation_source_securitization_code = '98' THEN 'Other'
        WHEN valuation_source_securitization_code = 'SS' THEN 'SS estimate'
        ELSE valuation_source_securitization_code
    END AS valuation_source_securitization,
    financials_securitization_date,
    round(revenue_securitization_amount) as revenue_securitization_amount,
    round(revenue_securitization_amount / 12) as monthly_revenue_securitization,
    round(operating_expenses_securitization_amount) as operating_expenses_securitization_amount,
    round(operating_expenses_securitization_amount / 12) as monthly_operating_expenses_securitization,
    round(noi_securitization_amount) as noi_securitization_amount,
    round(noi_securitization_amount / 12) as monthly_noi_securitization,
    noi_net_cash_flow_securitization_code,
    CASE
        WHEN noi_net_cash_flow_securitization_code = 'CMSA' THEN 'Calculated using CMSA standards'
        WHEN noi_net_cash_flow_securitization_code = 'CREFC' THEN 'Calculated using CREFC standards'
        WHEN noi_net_cash_flow_securitization_code = 'PSA' THEN 'Calculated using a definition given in the pooling and servicing agreement'
        WHEN noi_net_cash_flow_securitization_code = 'UW' THEN 'Calculated using underwriting method'
        ELSE noi_net_cash_flow_securitization_code
    END AS noi_net_cash_flow_securitization_method,
    round(net_cash_flow_flow_securitization_amount) as net_cash_flow_flow_securitization_amount,
    round(net_cash_flow_flow_securitization_amount / 12) as monthly_net_cash_flow_securitization,
    dsc_noi_securitization_percentage,
    dsc_net_cash_flow_securitization_percentage
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