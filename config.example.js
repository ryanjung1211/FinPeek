// Configuration file for FinPeek
// Copy this file to 'config.js' and replace 'YOUR_API_KEY_HERE' with your actual Finnhub API key
// Get your free API key at: https://finnhub.io/register

const CONFIG = {
    // Finnhub API Configuration
    FINNHUB_API_KEY: 'YOUR_API_KEY_HERE',
    
    // API Settings
    API_BASE_URL: 'https://finnhub.io/api/v1',
    
    // App Settings
    REFRESH_INTERVAL: 10000, // 10 seconds
    TIMEFRAME_CYCLE_INTERVAL: 5000, // 5 seconds
    
    // Chart Settings
    CHART_HEIGHT: 150,
    CHART_PADDING: 10,
    
    // Default Settings
    DEFAULT_STOCK_TIMEFRAME: '1D',
    DEFAULT_SPY_TIMEFRAME: '1D'
};

// Make config available globally
window.FINPEEK_CONFIG = CONFIG;