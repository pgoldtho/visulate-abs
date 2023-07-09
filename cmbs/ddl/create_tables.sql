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
