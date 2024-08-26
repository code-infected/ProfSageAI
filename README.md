# ProfSageAI

## Overview

This project is an AI-powered professor recommendation system built using FastAPI and integrates with Qdrant and Groq AI. The system provides a range of functionalities including chat interactions, professor data submission, and trend analysis. It supports background processing of professor data, sentiment analysis, and offers recommendations based on user criteria.

## Features

- **Chat Interaction**: Users can interact with the system via a chat interface to get information about professors.
- **Professor Data Submission**: Submit URLs to process and store professor data using background tasks.
- **Recommendations**: Get recommendations based on user-defined criteria.
- **Trends Analysis**: Analyze trends in professor ratings and sentiment.

## Technologies

- **FastAPI**: For building the API.
- **Qdrant**: Vector database for storing and querying professor information.
- **Groq AI**: For generating AI responses.
- **NLTK**: For sentiment analysis.
- **BeautifulSoup**: For parsing HTML content.
- **dotenv**: For managing environment variables.

## Installation

To set up the project locally, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/your-repo.git
   ```

2. **Navigate to the Project Directory**:

   ```bash
   cd your-repo
   ```

3. **Install Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Create a `.env` File**:

   Create a `.env` file in the root of the project directory and add your environment variables:

   ```env
   QDRANT_URL="https://your-qdrant-url"
   QDRANT_API_KEY="your-qdrant-api-key"
   GROQ_API_KEY="your-groq-api-key"
   FIREBASE_API_KEY="your-firebase-api-key"
   FIREBASE_AUTH_DOMAIN="your-firebase-auth-domain"
   FIREBASE_PROJECT_ID="your-firebase-project-id"
   FIREBASE_STORAGE_BUCKET="your-firebase-storage-bucket"
   FIREBASE_MESSAGING_SENDER_ID="your-firebase-messaging-sender-id"
   FIREBASE_APP_ID="your-firebase-app-id"
   FIREBASE_MEASUREMENT_ID="your-firebase-measurement-id"
   ```

5. **Run the Application**:

   ```bash
   uvicorn main:app --reload
   ```

   Open your browser and navigate to `http://localhost:8000` to view the API documentation.

## API Endpoints

### `/chat`

- **Method**: POST
- **Description**: Interact with the chat interface. Provide a message to get a response.
- **Request Body**:
  ```json
  {
    "message": "Your message here"
  }
  ```
- **Response**: Markdown-formatted response generated by the AI.

### `/submit-link`

- **Method**: POST
- **Description**: Submit a URL to process and store professor data in the background.
- **Request Body**:
  ```json
  {
    "url": "https://url-to-professor-page"
  }
  ```
- **Response**: Confirmation that link processing has started.

### `/recommendations`

- **Method**: GET
- **Description**: Get recommendations based on provided criteria.
- **Query Parameters**:
  - `criteria`: The criteria for getting recommendations.
- **Response**:
  ```json
  {
    "recommendations": [
      {
        "name": "Professor Name",
        "rating": "Rating",
        "reviews": ["Review 1", "Review 2"]
      }
    ]
  }
  ```

### `/trends`

- **Method**: GET
- **Description**: Get trends for a specific professor based on rating and sentiment.
- **Query Parameters**:
  - `professor_name`: The name of the professor.
- **Response**:
  ```json
  {
    "name": "Professor Name",
    "rating_trend": "Improving/Stable/Declining",
    "sentiment_trend": "Positive/Neutral/Negative"
  }
  ```

## Background Tasks

- **`process_link`**: Background task to process professor data from a submitted link.

## Development

For development, ensure you have the following packages installed:

- FastAPI
- Uvicorn
- Qdrant Client
- Groq
- NLTK
- BeautifulSoup
- Requests
- Pydantic

## Contributing

If you would like to contribute to this project, please follow these steps:

1. **Fork the Repository**.
2. **Create a New Branch**:
   
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make Your Changes**.
4. **Commit Your Changes**:

   ```bash
   git commit -am "Add your feature or fix"
   ```

5. **Push to Your Branch**:

   ```bash
   git push origin feature/your-feature
   ```

6. **Create a New Pull Request**.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **FastAPI**: For the web framework.
- **Qdrant**: For vector database management.
- **Groq**: For AI-based responses.
- **NLTK**: For sentiment analysis.
- **BeautifulSoup**: For HTML parsing
