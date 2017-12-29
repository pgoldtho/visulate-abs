<?php

/*
 * Copyright (c) Visulate LLC 2017 All rights reserved
 */

namespace CMBS;

/**
 * Set display values for embedded codes in the CMBS record.
 *
 * @author pgoldtho
 */
class CmbsAssetDisplay {

    public $displayAsset;

    public static function decodeValue($codeType, $codeValue) {
        $codeIndex = ["ARM_INDX_CODE_TYPE" => [
                "A" => "11 FHLB COFI  (1 Month)",
                "B" => "11 FHLB COFI  (6 Month)",
                "C" => "1 Year CMT Weekly Average Treasury",
                "D" => "3 Year CMT Weekly Average Treasury",
                "E" => "5 Year CMT Weekly Average Treasury",
                "F" => "Wall Street Journal Prime Rate",
                "G" => "1 Month LIBOR",
                "H" => "3 Month LIBOR",
                "I" => "6 Month LIBOR",
                "J" => "National Mortgage Index Rate",
                "98" => "Other"
            ],
            "ASSET_SUBJ_DEMAND_STAT_CODE_TYPE" => [
                "0" => "Asset Pending Repurchase or Replacement (within cure period)",
                "1" => "Asset was Repurchased or Replaced",
                "2" => "Demand in Dispute",
                "3" => "Demand Withdrawn",
                "4" => "Demand Rejected"],
            "DEBT_SRVC_CVRG_CODE_TYPE" => [
                "A" => "Average - Not all properties received financials, servicer allocates debt service only to properties where financials are received.",
                "C" => "Consolidated - All properties reported on one \"rolled up\" financial from the borrower",
                "F" => "Full - All Statements Collected for all properties",
                "N" => "None Collected - no financial statements were received",
                "P" => "Partial - Not all properties received financials, servicer to leave empty",
                "W" => "Worst Case - Not all properties received financial statements, servicer allocates 100% of Debt Service to all properties where financials are received"],
            "DFSNC_STAT_CODE_TYPE" => [
                "F" => "Full Defeasance",
                "IP" => "Portion of Loan Previously Defeased",
                "N" => "No Defeasance Occurred",
                "X" => "Defeasance Not Allowable"],
            "INTR_ACCRL_METH_CODE_TYPE" => [
                "1" => "30/360",
                "2" => "Actual/365",
                "3" => "Actual/360",
                "4" => "Actual/Actual",
                "5" => "Actual/366",
                "6" => "Simple",
                "7" => "78's",
                "98" => "Other"],
            "LIEN_PSTN_CODE_TYPE" => [
                "1" => "Primary",
                "2" => "Secondary",
                "3" => "Tertiary;etc",
                "98" => "Other",
                "99" => "Unknown"],
            "LIQDTN_PRPYMNT_CODE_TYPE" => [
                "1" => "Partial liquidation(Curtailment)",
                "2" => "Payoff Prior to Maturity",
                "3" => "Disposition/Liquidation",
                "4" => "Repurchase/Substitution",
                "5" => "Full Payoff at Maturity",
                "6" => "DPO",
                "7" => "Liquidated-only for use for loans liquidated prior to 7/1/2006",
                "8" => "Payoff w/ Penalty",
                "9" => "Payoff w/ Yield Maintenance",
                "10" => "Curtailment w/ Penalty",
                "11" => "Curtailment w/ Yield Maintenance"],
            "LOAN_STCTR_CODE_TYPE" => [
                "A1" => "A Note; A/B Participation Structure",
                "A2" => "A Note; A/B/C Participation Structure",
                "B1" => "B Note; A/B Participation Structure",
                "B2" => "B Note; A/B/C Participation Structure",
                "C2" => "C Note; A/B/C Participation Structure",
                "MZ" => "Mezzanine Financing",
                "PP" => "Participated mortgage loan with pari passu debt outside trust",
                "WL" => "Whole loan structure"],
            "MOD_CODE_TYPE" => [
                "1" => "Maturity Date Extension",
                "2" => "Amortization Change",
                "3" => "Principal Write-off",
                "5" => "Temporary Rate Reduction",
                "6" => "Capitalization on Interest",
                "7" => "Capitalization on Taxes",
                "8" => "Combination",
                "98" => "Other"],
            "MST_RCNT_DEBT_SRVC_AMNT_CODE_TYPE" => [
                "A" => "Average - Not all properties received financials, servicer allocates debt service only to properties where financial statements are received.",
                "C" => "Consolidated - All properties reported on one \"rolled up\" financial statement from the borrower",
                "F" => "Full - All financial statements collected for all properties",
                "N" => "None collected - No financials were received",
                "P" => "Partial - Not all properties received financial statements, servicer to leave empty",
                "W" => "Worst Case - Not all properties received financial statements, servicer allocates 100% of debt service to all properties where financial statements are received."],
            "MST_RCNT_VAL_SRC_CODE_TYPE" => [
                "98" => "Other",
                "BPO" => "Broker Price Option",
                "MAI" => "Certified MAI Appraisal",
                "MS" => "Master Servicer Estimate",
                "Non-MAI" => "Non-certified MAI appraisal",
                "SS" => "SS Estimate"],
            "NET_OPRTNG_INCM_NET_CASH_FLW_CODE_TYPE" => [
                "CREFC" => "Calculated using CREFC Standard",
                "PSA" => "Calculated using a definition given in the pooling and servicing agreement",
                "UW" => "Calculated using the underwriting method"],
            "NET_OPRTNG_INCM_NET_CASH_FLW_SCRTZTN_CODE_TYPE" => [
                "CREFC" => "Calculated using CREFC standard",
                "PSA" => "Calculated using a definition given in the pooling and servicing agreement",
                "UW" => "Calculated using the underwriting method"],
            "ORIG_INTR_RT_TYP_CODE_TYPE" => [
                "1" => "Fixed",
                "2" => "ARM",
                "3" => "Step",
                "4" => "Other"],
            "PROPRTY_STAT_CODE_TYPE" => [
                "1" => "In Foreclosure",
                "2" => "REO",
                "3" => "Defeased",
                "4" => "Partial Release",
                "5" => "Substituted",
                "6" => "Same as at Securitization"],
            "PROPRTY_TYP_CODE_TYPE" => [
                "CH" => "Cooperative housing",
                "HC" => "HealthCare",
                "IN" => "Industrial",
                "LO" => "Lodging",
                "MF" => "Multifamily",
                "MH" => "Mobile Home Park",
                "MU" => "Mixed Use",
                "OF" => "Office",
                "RT" => "Retail",
                "SE" => "Securities",
                "SS" => "Self Storage",
                "WH" => "Warehouse",
                "ZZ" => "Missing Information",
                "98" => "Other"],
            "PY_RST_FREQ_CODE_TYPE" => [
                "1" => "Monthly",
                "3" => "Quarterly",
                "6" => "Semi-Annually",
                "12" => "Annually",
                "365" => "Daily"],
            "PYMNT_FREQ_CODE_TYPE" => [
                "1" => "monthly",
                "3" => "quarterly",
                "6" => "semi-annually",
                "12" => "annually",
                "365" => "daily"],
            "PYMNT_STAT_LOAN_CODE_TYPE" => [
                "0" => "Current",
                "1" => "30-59 days delinquent",
                "2" => "60-89 days delinquent",
                "3" => "90+ days delinquent",
                "4" => "Performing matured balloon",
                "5" => "Non performing matured balloon.",
                "A" => "Payment not received but still in grace period or not yet due.",
                "B" => "Late payment but less than 30 days delinquent"],
            "PYMNT_TYP_CODE_TYPE" => [
                "1" => "fully Amortizing",
                "2" => "amortizing Balloon",
                "3" => "Interest Only/Balloon",
                "4" => "Interest Only/Amortizing",
                "5" => "Interest Only/Amortizing/Balloon",
                "6" => "Principal Only",
                "7" => "hyper  Amortization",
                "98" => "Other"],
            "REPRCH_RPLCMNT_REASN_CODE_TYPE" => [
                "1" => "Fraud",
                "2" => "Early Payment Default",
                "3" => "Other recourse obligation",
                "4" => "Reps/Warrants breach",
                "5" => "Servicer breach",
                "98" => "Other",
                "99" => "Unknown"],
            "RT_RST_FREQ_CODE_TYPE" => [
                "1" => "Monthly",
                "3" => "Quarterly",
                "6" => "Semi-Annually",
                "12" => "Annually",
                "365" => "Daily"],
            "SRVC_ADV_METH_CODE_TYPE" => [
                "1" => "Scheduled Interest, Scheduled Principal",
                "2" => "Actual Interest, Actual Principal",
                "3" => "Scheduled Interest, Actual Principal",
                "98" => "Other",
                "99" => "Unknown"],
            "VAL_SRC_SCRTZTN_CODE_TYPE" => [
                "BPO" => "Broker price opinion",
                "MAI" => "Certified MAI appraisal",
                "MS" => "Master servicer estimate",
                "Non-MAI" => "Non-certified MAI appraisal",
                "98" => "Other",
                "SS" => "SS estimate"],
            "WRKOUT_STRAT_CODE_TYPE" => [
                "1" => "Modification",
                "2" => "Foreclosure",
                "3" => "Bankruptcy",
                "4" => "Extension",
                "5" => "Note sale",
                "6" => "DPO",
                "7" => "REO",
                "8" => "Resolved",
                "9" => "Pending return to master servicer",
                "10" => "Deed-in-lieu of Foreclosure",
                "11" => "Full Payoff",
                "12" => "Reps and Warranties",
                "13" => "TBD",
                "98" => "Other"],
            "US_STATE" => [
                'AL' => 'Alabama',
                'AK' => 'Alaska',
                'AZ' => 'Arizona',
                'AR' => 'Arkansas',
                'CA' => 'California',
                'CO' => 'Colorado',
                'CT' => 'Connecticut',
                'DE' => 'Delaware',
                'DC' => 'District Of Columbia',
                'FL' => 'Florida',
                'GA' => 'Georgia',
                'HI' => 'Hawaii',
                'ID' => 'Idaho',
                'IL' => 'Illinois',
                'IN' => 'Indiana',
                'IA' => 'Iowa',
                'KS' => 'Kansas',
                'KY' => 'Kentucky',
                'LA' => 'Louisiana',
                'ME' => 'Maine',
                'MD' => 'Maryland',
                'MA' => 'Massachusetts',
                'MI' => 'Michigan',
                'MN' => 'Minnesota',
                'MS' => 'Mississippi',
                'MO' => 'Missouri',
                'MT' => 'Montana',
                'NE' => 'Nebraska',
                'NV' => 'Nevada',
                'NH' => 'New Hampshire',
                'NJ' => 'New Jersey',
                'NM' => 'New Mexico',
                'NY' => 'New York',
                'NC' => 'North Carolina',
                'ND' => 'North Dakota',
                'OH' => 'Ohio',
                'OK' => 'Oklahoma',
                'OR' => 'Oregon',
                'PA' => 'Pennsylvania',
                'PR' => 'Puerto Rico',
                'RI' => 'Rhode Island',
                'SC' => 'South Carolina',
                'SD' => 'South Dakota',
                'TN' => 'Tennessee',
                'TX' => 'Texas',
                'UT' => 'Utah',
                'VT' => 'Vermont',
                'VA' => 'Virginia',
                'WA' => 'Washington',
                'WV' => 'West Virginia',
                'WI' => 'Wisconsin',
                'WY' => 'Wyoming',
                'NA' => 'Not Available'
            ]
        ];

        return $codeIndex[$codeType][$codeValue];
    }

    private function decodeAssetValues($key1, $key2, $codeType) {
        if (isset($this->displayAsset[$key1][$key2])) {
            $this->displayAsset[$key1][$key2] = CmbsAssetDisplay::decodeValue($codeType, $this->displayAsset[$key1][$key2]);
        }
    }

    private function decodeAsset() {
        $this->decodeAssetValues("asset", "interestAccrualMethodCode", "INTR_ACCRL_METH_CODE_TYPE");
        $this->decodeAssetValues("asset", "originalInterestRateTypeCode", "ORIG_INTR_RT_TYP_CODE_TYPE");
        $this->decodeAssetValues("asset", "lienPositionSecuritizationCode", "LIEN_PSTN_CODE_TYPE");
        $this->decodeAssetValues("asset", "loanStructureCode", "LOAN_STCTR_CODE_TYPE");
        $this->decodeAssetValues("asset", "paymentTypeCode", "PYMNT_TYP_CODE_TYPE");
        $this->decodeAssetValues("asset", "paymentFrequencyCode", "PYMNT_FREQ_CODE_TYPE");
        $this->decodeAssetValues("asset", "armIndexCode", "ARM_INDX_CODE_TYPE");
        $this->decodeAssetValues("asset", "rateResetFrequencyCode", "RT_RST_FREQ_CODE_TYPE");
        $this->decodeAssetValues("asset", "paymentResetFrequencyCode", "PY_RST_FREQ_CODE_TYPE");
        $this->decodeAssetValues("asset", "servicingAdvanceMethodCode", "SRVC_ADV_METH_CODE_TYPE");
        $this->decodeAssetValues("asset", "paymentStatusLoanCode", "PYMNT_STAT_LOAN_CODE_TYPE");
        $this->decodeAssetValues("asset", "assetSubjectDemandStatusCode", "ASSET_SUBJ_DEMAND_STAT_CODE_TYPE");
        $this->decodeAssetValues("asset", "repurchaseReplacementReasonCode", "REPRCH_RPLCMNT_REASN_CODE_TYPE");
        $this->decodeAssetValues("asset", "liquidationPrepaymentCode", "LIQDTN_PRPYMNT_CODE_TYPE");
        $this->decodeAssetValues("asset", "workoutStrategyCode", "WRKOUT_STRAT_CODE_TYPE");
        $this->decodeAssetValues("asset", "modificationCode", "MOD_CODE_TYPE");

        $this->decodeAssetValues("property", "propertyTypeCode", "PROPRTY_TYP_CODE_TYPE");
        $this->decodeAssetValues("property", "valuationSourceSecuritizationCode", "VAL_SRC_SCRTZTN_CODE_TYPE");
        $this->decodeAssetValues("property", "mostRecentValuationSourceCode", "MST_RCNT_VAL_SRC_CODE_TYPE");
        $this->decodeAssetValues("property", "propertyStatusCode", "PROPRTY_STAT_CODE_TYPE");
        $this->decodeAssetValues("property", "DefeasedStatusCode", "DFSNC_STAT_CODE_TYPE");
        $this->decodeAssetValues("property", "netOperatingIncomeNetCashFlowSecuritizationCode", "NET_OPRTNG_INCM_NET_CASH_FLW_SCRTZTN_CODE_TYPE");
        $this->decodeAssetValues("property", "netOperatingIncomeNetCashFlowCode", "NET_OPRTNG_INCM_NET_CASH_FLW_CODE_TYPE");
        $this->decodeAssetValues("property", "debtServiceCoverageSecuritizationCode", "DEBT_SRVC_CVRG_CODE_TYPE");
        $this->decodeAssetValues("property", "mostRecentDebtServiceCoverageCode", "MST_RCNT_DEBT_SRVC_AMNT_CODE_TYPE");
    }

    public function __construct($asset) {
        $this->setAsset($asset);
    }

    public function setAsset($asset) {
        $this->displayAsset = $asset;
        $this->decodeAsset();
    }

}
