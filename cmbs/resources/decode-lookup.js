function decodeLookup(lookupType, lookupCode, lookupTable) {
  if (!lookupTable.hasOwnProperty(lookupType)) {
    throw new Error("Invalid lookup type");
  }

  const lookupData = lookupTable[lookupType];

  if (!lookupData.hasOwnProperty(lookupCode)) {
    throw new Error("Invalid lookup code");
  }

  return lookupData[lookupCode];
}

// Example usage:
const lookupTable = {
  interestAccrualMethodCode: {
    1:  "30/360",
    2:  "Actual/365",
    3:  "Actual/360",
    4:  "Actual/Actual",
    5:  "Actual/366",
    6:  "Simple",
    7:  "78s",
    98: "Other"
  },
  originalInterestRateTypeCode: {
    1: "Fixed",
    2: "ARM",
    3: "Step",
    4: "Other"
  },
  lienPositionSecuritizationCode: {
    1: "Primary",
    2: "Secondary",
    3: "Tertiary",
    98: "Other",
    99: "Unknown"
  },
  loanStructureCode: {
    A1: "A Note; A/B Participation Structure",
    A2: "A Note; A/B/C Participation Structure",
    B1: "B Note; A/B Participation Structure",
    B2: "B Note; A/B/C Participation Structure",
    C2: "C Note; A/B/C Participation Structure",
    MZ: "Mezzanine Financing",
    PP: "Participated mortgage loan with pari passu debt outside trust",
    WL: "Whole loan structure",
  },
  paymentTypeCode: {
    1: "Fully Amortizing",
    2: "Amortizing Balloon",
    3: "Interest Only/Balloon",
    4: "Interest Only/Amortizing",
    5: "Interest Only/Amortizing/Balloon",
    6: "Principal Only",
    7: "Hyper - Amortization",
    98: "Other",
  },
  paymentFrequencyCode: {
    1: "Monthly",
    2: "Quarterly",
    3: "Semi-Annually",
    12: "Annually",
    365: "Daily"
  },
  armIndexCode: {
    A: "11 FHLB COFI (1 Month)",
    B: "11 FHLB COFI (6 Month)",
    C: "1 Year CMT Weekly Average Treasury",
    D: "3 Year CMT Weekly Average Treasury",
    E: "5 Year CMT Weekly Average Treasury",
    F: "Wall Street Journal Prime Rate",
    G: "1 Month LIBOR",
    H: "3 Month LIBOR",
    I: "6 Month LIBOR",
    J: "National Mortgage Index Rate",
    98: "Other"
  },
  propertyTypeCode: {
    CH: "Cooperative Housing",
    HC: "Health Care",
    IN: "Industrial",
    LO: "Lodging",
    MF: "Multifamily",
    MH: "Mobile Home Park",
    MU: "Mixed Use",
    OF: "Office",
    RT: "Retail",
    SE: "Securities",
    SS: "Self Storage",
    WH: "Warehouse",
    ZZ: "Missing Information",
    98: "Other"
  },
  valuationSourceCode: {
    BPO: "Broker price opinion",
    MAI: "Certified MAI appraisal",
    MS: "Master servicer estimate",
    'Non-MAI': "Non-certified MAI appraisal",
    98: "Other",
    SS: "SS estimate",
  },
  propertyStatusCode: {
    1: "In Foreclosure",
    2: "REO",
    3: "Defeased",
    4: "Partial Release",
    5: "Substituted",
    6: "Same as at Securitization",
  },

  DefeasedStatusCode: {
    F: "Full defeasance",
    IP: "Portion of loan previously defeased",
    N: "No defeasance occurred",
    X: "Defeasance not allowed",
  },
  netOperatingIncomeNetCashFlowCode: {
    CMSA: "Calculated using CMSA standards",
    PSA: "Calculated using a definition given in the pooling and servicing agreement",
    UW: "Calculated using underwriting method"
  },
  mostRecentDebtServiceCoverageCode: {
    A: "Average - Not all properties received financials, servicer allocates debt service only to properties where financials are received.",
    C: "Consolidated - All properties reported on one \"rolled up\" financial from the borrower",
    F: "Full - All Statements Collected for all properties",
    N: "None - No financial statements were received",
    P: "Partial - Not all properties received financials, servicer to leave empty",
    W: "Worst Case - Not all properties received financial statements, servicer allocates 100% of Debt Service to all properties where financials are received"
  },
  servicingAdvanceMethodCode: {
    1: "Scheduled interest, Scheduled principal",
    2: "Actual interest, Actual principal",
    3: "Scheduled interest, Actual principal",
    98: "Other",
    99: "Unknown"
  },
  paymentStatusLoanCode: {
    0: "Current",
    1: "30-59 days delinquent",
    2: "60-89 days delinquent",
    3: "90+ days delinquent",
    4: "Performing matured balloon",
    5: "Non-performing matured balloon",
    A: "Payment not received but still within grace period or not yet due",
    B: "Late payment, less than 30 days"
  },
  assetSubjectDemandStatusCode: {
    0: "Asset Pending Repurchase or Replacement (within cure period)",
    1: "Asset was Repurchased or Replaced",
    2: "Demand in dispute",
    3: "Demand withdrawn",
    4: "Demand rejected"
  },
  repurchaseReplacementReasonCode: {
    1: "Fraud",
    2: "Early Payment Default",
    3: "Other recourse obligation",
    4: "Reps/Warrents breach",
    5: "Servicer breach",
    98: "Other",
    99: "Unknown"
  },
  liquidationPrepaymentCode: {
    1: "Partial Liquidation(Curtailment)",
    2: "Payoff Prior to Maturity",
    3: "Disposition/Liquidation",
    4: "Repurchase/Substitution",
    5: "Full Payoff at Maturity",
    6: "DPO",
    7: "Liquidated-only for use for loans liquidated prior to 7/1/2006",
    8: "Payoff w/ Penalty",
    9: "Payoff w/ Yield Maintenance",
    10: "Curtailment w/ Penalty",
    11: "Curtailment w/ yield Maintenance"
  },
  workoutStrategyCode: {
    1: "Modification",
    2: "Foreclosure",
    3: "Bankruptcy",
    4: "Extension",
    5: "Note Sale",
    6: "DPO",
    7: "REO",
    8: "Resolved",
    9: "Pending return to master servicer",
    10: "Deed in Lieu of Foreclosure",
    11: "Full Payoff",
    12: "Reps and Warranties",
    13: "TBD",
    98: "Other",
  },
  modificationCode: {
    1: "Maturity date extension",
    2: "Amortization schedule change",
    3: "Principal write-off",
    5: "Temporary interest rate reduction",
    6: "Capitalization on interest",
    7: "Capitalization on taxes",
    8: "Combination",
    98: "Other",
  },






  country: {
    US: "United States",
    CA: "Canada",
    UK: "United Kingdom",
    AU: "Australia",
  },
  language: {
    EN: "English",
    ES: "Spanish",
    FR: "French",
    DE: "German",
  },
  state: {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
  },
};

const type = "state";
const code = "CA";
console.log(decodeLookup(type, code, lookupTable)); // Output: "California"
