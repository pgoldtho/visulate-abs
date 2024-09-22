# Python - FastAPI app
from fastapi import FastAPI, HTTPException, Header, Request, Form
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
# from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware import Middleware
from starlette.requests import Request
# from fastapi_sessions.frontends.implementations import SessionCookie, CookieParameters
# from fastapi_sessions.backends.implementations import RedisBackend
from starsessions import SessionAutoloadMiddleware, SessionMiddleware
from starsessions.stores.redis import RedisStore

import aioredis


from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from transformers import BartTokenizer, BartForConditionalGeneration
import numpy as np
from typing import Dict, List
import cmbs_db as db_module
import os
from dotenv import load_dotenv
import google.generativeai as genai
import markdown
import re

load_dotenv()
app = FastAPI()

# Configure Redis session store
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
redis = aioredis.from_url(REDIS_URL, encoding="utf8", decode_responses=True)
app.add_middleware(SessionAutoloadMiddleware)
app.add_middleware(SessionMiddleware, store=RedisStore(REDIS_URL), lifetime=0, rolling=True)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_main():
    with open("static/index.html", "r") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)

transformerModel = SentenceTransformer('all-MiniLM-L6-v2')
summarizer = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')
tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')

class Text(BaseModel):
    content: str

class Document(BaseModel):
    content: str
    topics: list[str]

# class Topic(BaseModel):
#     topic: Dict[str, List[str]]

class Topic(BaseModel):
    topic: str
    paragraphs: List[str]

class FilingInfo(BaseModel):
    cik: int
    accessionNumber: str
    filingDate: str
    reportDate: str = None
    primaryDocument: str
    form: str
    size: int
    url: str

class ExhibitData(BaseModel):
    html: str
    text: str

async def llm_submit(request: Request, prompt: str):
    model = genai.GenerativeModel('gemini-1.5-pro-latest')
    # session = await request.session.load()
    # session['chat_history'] = session.get('chat_history', [])
    session = request.session
    if 'chat_history' not in session:
        session['chat_history'] = []

    # Add the user's message to the history
    user_message_content = {'role': 'user', 'parts': [prompt]}
    session['chat_history'].append(user_message_content)

    # Check the context window size
    tokens = model.count_tokens(session['chat_history'])
    print(f"Token count: {tokens}")


    # Generate the model's response
    response = model.generate_content(session['chat_history'])
    session['chat_history'].append({'role': 'model', 'parts': [response.text]})

    return response.text

@app.post("/embeddings/")
def get_embeddings(text: Text):
    embeddings = transformerModel.encode(text.content)
    return {"embeddings": embeddings.tolist()}

@app.post("/segments/")
def get_segments(document: Text):
    # Split document into paragraphs, remove empty paragraphs
    paragraphs = [para for para in str(document.content).split('\n') if para.strip()]


    embeddings = transformerModel.encode(paragraphs)
    similarity_scores = [np.dot(embeddings[i], embeddings[i+1]) / (np.linalg.norm(embeddings[i]) * np.linalg.norm(embeddings[i+1])) for i in range(len(embeddings)-1)]

    # Determine points to segment document; you might need to adjust the threshold
    threshold = 0.01  # Example threshold, adjust based on your analysis
    segment_points = [i+1 for i, score in enumerate(similarity_scores) if score < threshold]

    # Use segment_points to split the document into chunks
    segments = [paragraphs[i:j] for i, j in zip([0] + segment_points, segment_points + [None])]

    #return {"paragraphCount": len(paragraphs), "segments": segments}

    return {

        "paragraphCount": len(paragraphs),
        "segmentCount": len(segments),
        "segments": segments}

@app.post("/topics/")
def get_segments_by_topic(request: Document):
    paragraphs = [para for para in request.content.split('\n') if para.strip()]
    paragraph_embeddings = transformerModel.encode(paragraphs)

    # Dictionary to hold segments for each topic
    topic_segments = {}

    for topic in request.topics:
        topic_embedding = transformerModel.encode([topic])[0]  # Encode each topic into an embedding

        # Calculate cosine similarity between the topic and each paragraph
        cosine_similarities = [np.dot(topic_embedding, paragraph_embedding) / (np.linalg.norm(topic_embedding) * np.linalg.norm(paragraph_embedding)) for paragraph_embedding in paragraph_embeddings]

        # Filter paragraphs by a similarity threshold or get the highest similarity paragraphs
        threshold = 0.3  # Adjust based on your analysis
        relevant_paragraph_indices = [i for i, score in enumerate(cosine_similarities) if score > threshold]

        # Append relevant paragraphs to the topic segments
        relevant_paragraphs = [paragraphs[i] for i in relevant_paragraph_indices]
        topic_segments[topic] = relevant_paragraphs

    return {
        "topics": request.topics,
        "topic_segments": topic_segments
    }


# generate a summary for an extracted topic
@app.post("/summarize/")
def generate_summary(request: Topic):
    # Create a summary of each paragraph in the topic concatenate the summaries
    # into a single document for each topic
    summaries = []
    for paragraph in request.paragraphs:
        input_ids = tokenizer.encode("summarize " + request.topic + " references in " + paragraph, return_tensors='pt', max_length=1024, truncation=True)
        summary_ids = summarizer.generate(input_ids, num_beams=4, max_length=100, early_stopping=True)
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        summaries.append(summary)

    return {
        "topic": request.topic,
        "summary": ' '.join(summaries)
    }


@app.post("/saveExhibit/")
async def save_exhibit(filing: FilingInfo, exhibit: ExhibitData):
    result = await db_module.save_exhibit(filing.dict(), exhibit.dict())
    return JSONResponse(content={"message": result})

@app.get("/existingExhibits/{cik}/{exhibit_type}")
async def get_existing_exhibits(cik: int, exhibit_type: str):
    try:
        exhibits = await db_module.existing_exhibits(cik, exhibit_type)
        return exhibits
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/getExhibit/{cik}/{accession_number}")
async def fetch_exhibit(cik: int, accession_number: str):
    exhibit_data = await db_module.get_exhibit(cik, accession_number)
    if exhibit_data:
        return exhibit_data
    raise HTTPException(status_code=404, detail="Exhibit not found")


@app.get("/prospectus/{cik}/{accession_number}")
async def fetch_prospectus(cik: int, accession_number: str, accept: str = Header(default="application/json")):
    # Correct variable passed based on header
    response_format = "html" if "text/html" in accept else "text"
    prospectus = await db_module.get_prospectus(cik, accession_number, response_format)

    if prospectus:
        if "application/json" in accept:
            # Returning as JSONResponse if client accepts JSON
            return JSONResponse(content={"data": prospectus})
        elif "text/html" in accept:
            # Returning as HTMLResponse if client accepts HTML
            return HTMLResponse(content=prospectus)
        else:
            # Handling unsupported media types
            raise HTTPException(status_code=406, detail="Unsupported media type")
    raise HTTPException(status_code=404, detail="Prospectus not found")

@app.post("/chat/")
async def chat(request: Request, message: str = Form(...)):
    if not isinstance(message, str):
        raise HTTPException(status_code=400, detail="The 'message' field must be a string.")

    if len(message) > 2500:
        raise HTTPException(status_code=400, detail="The 'message' field is too long.")

    # if not re.match(r"^[a-zA-Z0-9 ]+$", message):
    #     raise HTTPException(status_code=400, detail="The 'message' field contains invalid characters.")

    prompt = message
    response = await llm_submit(request, prompt)
    html_response = markdown.markdown(response)

    return HTMLResponse(content=html_response)

@app.post("/summarize_prospectus/")
async def summarize_document(request: Request, document: str = Form(...)):
    session = request.session
    session['chat_history'] = []
    try:
        cik_str, accession_number = document.split(':')
        cik = int(cik_str)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid document format. Use CIK:AccessionNumber")

    prospectus = await db_module.get_prospectus(cik, accession_number, 'text')
    prompt = "Identify the properties used as collateral in the following CMBS term sheet and provide a summary of each one: " + prospectus
    response = await llm_submit(request, prompt)
    html_response = markdown.markdown(response)

    return HTMLResponse(content=html_response)