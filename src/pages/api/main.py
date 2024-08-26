import uuid
import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from qdrant_client import QdrantClient
from qdrant_client.http import models
from groq import Groq
from nltk.sentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv
import os
import json
import io
import requests
from bs4 import BeautifulSoup
import nltk

# Load environment variables
load_dotenv()

app = FastAPI()

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Qdrant client
qdrant_client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Initialize NLTK Sentiment Analyzer
nltk.download('vader_lexicon', quiet=True)
sia = SentimentIntensityAnalyzer()

# Ensure Qdrant collection exists or create it
try:
    qdrant_client.get_collection("professors")
except Exception as e:
    logger.info(f"Collection not found. Creating new collection. Error: {e}")
    qdrant_client.create_collection(
        collection_name="professors",
        vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE)  # Placeholder size
    )

# Pydantic Models
class Message(BaseModel):
    message: str

class Link(BaseModel):
    url: str

def get_embedding(text: str):
    """Generate embedding for the text. Replace with actual embedding logic if needed."""
    return [0.0] * 768

async def generate_response(message: str):
    """Generate a response using embeddings and Groq AI."""
    try:
        # Generate the query embedding for the input message
        query_embedding = get_embedding(message)
        logger.info(f"Generated query embedding for message: {message}")

        # Perform a search in Qdrant using the query embedding
        search_result = qdrant_client.search(
            collection_name="professors",
            query_vector=query_embedding,  # Correctly passing the query vector
            limit=5  # Fetch top 5 relevant results
        )

        # Handle the case where no relevant results are found
        if not search_result:
            raise ValueError("No matching professor found in Qdrant.")

        # Compile information from the top relevant results
        professor_infos = [result.payload for result in search_result]
        compiled_info = "\n\n".join([json.dumps(info) for info in professor_infos])

        # Prepare a prompt for the AI using the retrieved information
        prompt = (f"Based on the following professor information(If asked my user), provide a helpful response make the conversation casual and keep the user feel comfortable. Make sure you are friendly and you can have casual conversation with the user "
                  f"to the user's query in Markdown format: '{message}'\n\nProfessor Info: {compiled_info}")

        # Send the prompt to Groq for AI response generation
        completion = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant for Rate My Professor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=True,
            stop=None,
        )

        # Aggregate the response text from the AI
        response_text = "".join(chunk.choices[0].delta.content or "" for chunk in completion)
        logger.info(f"Generated response text: {response_text}")
        return response_text

    except ValueError as e:
        logger.error(f"Validation error in generate_response: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error in generate_response: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/chat")
async def chat(message: Message):
    """Endpoint for chat interaction."""
    try:
        response_text = await generate_response(message.message)
        return StreamingResponse(io.StringIO(response_text), media_type="markdown/plain")
    except Exception as e:
        logger.error(f"Error in /chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_link(link: str):
    """Background task to process and store link data."""
    try:
        response = requests.get(link, timeout=10)
        response.raise_for_status()

        # Parse the HTML with BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract professor's name
        first_name_element = soup.find('div', class_='NameTitle__Name-dowf0z-0 cfjPUG')
        last_name_element = soup.find('div', class_='NameTitle__LastNameWrapper-dowf0z-2 glXOHH')
        first_name = first_name_element.text.strip() if first_name_element else ''
        last_name = last_name_element.text.strip() if last_name_element else ''
        name = f"{first_name} {last_name}"

        # Extract rating
        rating_element = soup.find('div', class_='RatingValue__Numerator-qw8sqy-2')
        rating = rating_element.text.strip() if rating_element else 'N/A'

        # Extract reviews
        reviews_divs = soup.find_all('div', class_='Comments__StyledComments-dzzyvm-0')
        reviews = [review.text.strip() for review in reviews_divs]

        # Construct professor information
        professor_info = {
            "name": name,
            "rating": rating,
            "reviews": reviews
        }

        # Calculate average sentiment using NLTK
        sentiments = [sia.polarity_scores(review)['compound'] for review in reviews]
        professor_info['avg_sentiment'] = sum(sentiments) / len(sentiments) if sentiments else 0

        # Generate a UUID for the professor entry
        professor_id = str(uuid.uuid4())

        # Generate embedding for professor's name
        name_embedding = get_embedding(name)

        # Add to Qdrant using UUID as the ID
        qdrant_client.upsert(
            collection_name="professors",
            points=[models.PointStruct(
                id=professor_id,
                vector=name_embedding,
                payload=professor_info
            )]
        )

        logger.info(f"Successfully added professor {name} with ID {professor_id} to Qdrant.")
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error in process_link: {e}")
    except Exception as e:
        logger.error(f"Error in process_link: {e}")

@app.post("/submit-link")
async def submit_link(link: Link, background_tasks: BackgroundTasks):
    """Endpoint to submit a link and process professor data."""
    background_tasks.add_task(process_link, link.url)
    return {"message": "Link processing started. Data will be stored shortly."}

@app.get("/recommendations")
async def get_recommendations(criteria: str):
    """Endpoint to get recommendations based on criteria."""
    try:
        criteria_embedding = get_embedding(criteria)
        logger.info(f"Generated criteria embedding for criteria: {criteria}")

        search_results = qdrant_client.search(
            collection_name="professors",
            query_vector=criteria_embedding,
            limit=10
        )

        recommendations = [result.payload for result in search_results]
        if not recommendations:
            raise HTTPException(status_code=404, detail="No recommendations found")
        return {"recommendations": recommendations}
    except Exception as e:
        logger.error(f"Error in /recommendations endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/trends")
async def get_trends(professor_name: str):
    """Endpoint to get trends for a specific professor."""
    try:
        search_result = qdrant_client.search(
            collection_name="professors",
            query_filter=models.Filter(
                must=[{"key": "name", "match": {"value": professor_name}}]
            ),
            limit=10
        )

        if not search_result:
            raise HTTPException(status_code=404, detail="Professor not found")
        
        professor_info = search_result[0].payload
        rating_trend = "Improving" if professor_info['rating'] > 4.0 else "Stable" if professor_info['rating'] > 3.0 else "Declining"
        sentiment_trend = "Positive" if professor_info['avg_sentiment'] > 0.5 else "Neutral" if professor_info['avg_sentiment'] > 0 else "Negative"
        
        return {
            "name": professor_info['name'],
            "rating_trend": rating_trend,
            "sentiment_trend": sentiment_trend
        }
    except Exception as e:
        logger.error(f"Error in /trends endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
