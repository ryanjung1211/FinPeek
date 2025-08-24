# FinPeek 📊

A sleek, real-time stock market dashboard with automatic timeframe cycling and live market data.

## 🚀 Features

- **Real-time stock quotes** from Finnhub API (30 calls/second!)
- **Interactive charts** with 1H and 1D timeframes  
- **Automatic cycling** between timeframes every 5 seconds
- **SPY market overview** with live data
- **PWA support** for mobile devices
- **Responsive design** for all screen sizes
- **Secure API key management** for Vercel deployment

## 🛠️ Vercel Deployment Setup

### 1. Fork/Clone Repository
```bash
git clone <your-repo-url>
cd FinPeek
```

### 2. Add Environment Variable in Vercel
1. Get a free API key from [Finnhub](https://finnhub.io/register)
2. In your Vercel dashboard, go to your project settings
3. Navigate to **Environment Variables**
4. Add a new variable:
   - **Name**: `FINNHUB_API_KEY`
   - **Value**: Your actual API key from Finnhub
   - **Environment**: Production (and Preview if desired)

### 3. Deploy
Push to your GitHub repository and Vercel will automatically deploy with your secure API key.

## 🏠 Local Development

For local development, create a `config.js` file:
```bash
cp config.example.js config.js
# Edit config.js and add your API key
```

Then serve the files over HTTP:
```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

## 🔒 Security

- **Production**: API key stored as Vercel environment variable (never in code)
- **Development**: API key in local `config.js` (git-ignored)
- **Fallback**: Demo data when no API key available
- **Public repo safe**: No secrets committed to version control

## 📱 Usage

1. Enter a stock ticker (e.g., AAPL, MSFT, TSLA)  
2. View real-time prices and charts
3. Charts automatically cycle between 1H and 1D views
4. Click time buttons to manually control timeframes
5. Use the 📊 button to show/hide search input

## 🌐 API Information

- **Provider**: Finnhub
- **Free Tier**: 30 requests/second (much better than Alpha Vantage!)
- **Real-time Data**: ✅ Stock quotes work perfectly on free tier
- **Historical Data**: ⚠️ Limited on free tier - app uses intelligent mock data based on real current prices
- **Charts**: Uses realistic price patterns generated from actual current stock prices
- **Fallback**: Mock data when API unavailable

## 🔧 Files

- `index.html` - Main interface and styles
- `app.js` - Core application logic and API integration
- `api/env.js` - Vercel function to inject environment variables
- `vercel.json` - Vercel configuration
- `manifest.json` - PWA configuration
- `sw.js` - Service worker for offline functionality

---

**Perfect for monitoring stocks on any device! 📈**