import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
      };

      if (req.body.message) {
        // Handle chat requests
        const response = await axios.post('http://localhost:8000/chat', req.body, {
          headers,
          responseType: 'stream',
        });

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        });

        response.data.on('data', (chunk) => {
          res.write(chunk);
        });

        response.data.on('end', () => {
          res.end();
        });

        response.data.on('error', (error) => {
          console.error('Stream error:', error);
          res.status(500).json({ error: 'Stream error occurred.' });
        });
      } else if (req.body.url) {
        // Handle URL submission requests
        const response = await axios.post('http://localhost:8000/submit-link', req.body, {
          headers,
        });
        res.status(200).json(response.data);
      } else {
        throw new Error('Invalid request body');
      }
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
