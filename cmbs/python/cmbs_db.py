import json
import asyncpg
import os
from dotenv import load_dotenv
from typing import List, Union

load_dotenv()

postgres_config = {
  'host': os.getenv('POSTGRES_HOST') or 'localhost',
  'port': os.getenv('POSTGRES_PORT') or 5432,
  'database': os.getenv('POSTGRES_DB') or 'cmbs',
  'user': os.getenv('POSTGRES_USER'),
  'password': os.getenv('POSTGRES_PASSWORD')
}

async def get_db_connection():
    return await asyncpg.connect(**postgres_config)

async def existing_exhibits(cik: int, exhibit_type: str) -> List[str]:
    query = """
    SELECT accession_number FROM {} WHERE cik = $1
    """.format('cmbs_prospectuses' if exhibit_type == 'FWP' else 'exh_102_exhibits')
    conn = await get_db_connection()
    try:
        rows = await conn.fetch(query, cik)
        return [row['accession_number'] for row in rows]
    finally:
        await conn.close()

async def save_exhibit(filing: dict, exhibit: dict) -> str:
    query = """
    INSERT INTO exh_102_exhibits
    (cik, accession_number, filing_date, report_date, primary_document, form, size, url, exhibit_data)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    """
    conn = await get_db_connection()
    try:
        await conn.execute(query, filing['cik'], filing['accessionNumber'], filing['filingDate'],
                           filing['reportDate'], filing['primaryDocument'], filing['form'],
                           filing['size'], filing['url'], json.dumps(exhibit))
        return 'Success!'
    except Exception as error:
        return f'Error: {error}'
    finally:
        await conn.close()

async def save_prospectus(filing: dict, prospectus: dict) -> str:
    query = """
    INSERT INTO cmbs_prospectuses
    (cik, accession_number, filing_date, report_date, primary_document, form, size, url, prospectus_html, prospectus_text)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    """
    conn = await get_db_connection()
    try:
        await conn.execute(query, filing['cik'], filing['accessionNumber'], filing['filingDate'],
                           filing.get('reportDate'), filing['primaryDocument'], filing['form'],
                           filing['size'], filing['url'], prospectus['html'], prospectus['text'])
        return 'Success!'
    except Exception as error:
        return f'Error: {error}'
    finally:
        await conn.close()

async def get_exhibit(cik: int, accession_number: str) -> Union[dict, None]:
    query = """
    SELECT exhibit_data FROM exh_102_exhibits WHERE cik = $1 AND accession_number = $2
    """
    conn = await get_db_connection()
    try:
        row = await conn.fetchrow(query, cik, accession_number)
        return row['exhibit_data'] if row else None
    finally:
        await conn.close()

async def get_prospectus(cik: int, accession_number: str, format: str) -> Union[str, None]:
    field = 'prospectus_html' if format == 'html' else 'prospectus_text'
    query = f"""
    SELECT {field} FROM cmbs_prospectuses WHERE cik = $1 AND accession_number = $2
    """
    conn = await get_db_connection()
    try:
        row = await conn.fetchrow(query, cik, accession_number)
        return row[field] if row else None
    finally:
        await conn.close()
