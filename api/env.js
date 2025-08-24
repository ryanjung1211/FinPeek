// Vercel serverless function to inject environment variables
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/javascript');
  
  // Inject environment variables into JavaScript
  const envScript = `
// Environment variables injected by Vercel
window.ALPHA_VANTAGE_API_KEY = '${process.env.ALPHA_VANTAGE_API_KEY || 'demo'}';
console.log('API Key loaded:', window.ALPHA_VANTAGE_API_KEY ? 'Present' : 'Missing');
`;
  
  res.status(200).send(envScript);
}