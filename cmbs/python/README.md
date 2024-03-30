# Vector Embedding Module

Uses a pre-trained model to break a large text document into smaller segments.

Accepts a text document as input and splits it into paragraphs. Then it evaluates each paragraph by comparing its cosign similarity it to the previous paragraph. Assembles an array of document segments based on a comparison threshold. Returns the array as output.

## Setup

```
# Create a virtual environment named 'venv'
python3 -m venv venv

# Activate the virtual environment
# On Windows
.\venv\Scripts\activate

# On MacOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

## Run in a development environment

Start the listener process:

```
uvicorn app:app --reload
```

Use the host flag to allow connections from remote locations


```
uvicorn app:app --host 0.0.0.0 --reload --ssl-keyfile=</path/to/keyfile> --ssl-certfile=</path/to/certfile>
```

The --reload flag makes the server restart after code changes, which is useful during development. The application will be available at http://localhost:8000.

Run the code

```
curl -X 'POST' \
  'http://localhost:8000/embeddings/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"content": "large text document contents\n with new lines"}'
```
