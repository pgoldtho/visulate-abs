# Python - FastAPI app
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np

app = FastAPI()
model = SentenceTransformer('all-MiniLM-L6-v2')

class Text(BaseModel):
    content: str

class Document(BaseModel):
    content: str
    topics: list[str]

@app.post("/embeddings/")
def get_embeddings(text: Text):
    embeddings = model.encode(text.content)
    return {"embeddings": embeddings.tolist()}

@app.post("/segments/")
def get_segments(document: Text):
    # Split document into paragraphs, remove empty paragraphs
    paragraphs = [para for para in str(document.content).split('\n') if para.strip()]


    embeddings = model.encode(paragraphs)
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
    paragraph_embeddings = model.encode(paragraphs)

    # Dictionary to hold segments for each topic
    topic_segments = {}

    for topic in request.topics:
        topic_embedding = model.encode([topic])[0]  # Encode each topic into an embedding

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