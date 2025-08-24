// Vercel serverless function to inject environment variables
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/javascript');
  
  // Inject environment variables into JavaScript
  const envScript = `
// Environment variables injected by Vercel
window.FINNHUB_API_KEY = '${process.env.FINNHUB_API_KEY || 'demo'}';
console.log('Finnhub API Key loaded:', window.FINNHUB_API_KEY ? 'Present' : 'Missing');
`;
  
  res.status(200).send(envScript);
}