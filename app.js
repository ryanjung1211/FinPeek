// FinPeek Stock Dashboard with Real API Integration
// To use real stock data, get a free API key from Alpha Vantage: https://www.alphavantage.co/support/#api-key
// Replace 'demo' in line 8 with your actual API key

class FinPeekApp {
    constructor() {
        this.currentTicker = '';
        this.refreshInterval = null;
        this.timeFrameCycleInterval = null;
        this.stockTimeFrame = '1D'; // '1D' or '1H'
        this.spyTimeFrame = '1D';
        // Get API key from Vercel environment variables or fallback to demo
        // In production (Vercel), this will be injected during build
        // For local development, you can use the config.js approach
        this.apiKey = window.ALPHA_VANTAGE_API_KEY || window.FINPEEK_CONFIG?.ALPHA_VANTAGE_API_KEY || 'demo';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSavedTicker();
        this.startKeepAwakeVideo();
    }

    bindEvents() {
        const tickerInput = document.getElementById('tickerInput');
        const searchBtn = document.getElementById('searchBtn');
        const tickerToggle = document.getElementById('tickerToggle');
        const stockTimeToggle = document.getElementById('stockTimeToggle');
        const spyTimeToggle = document.getElementById('spyTimeToggle');

        searchBtn.addEventListener('click', () => this.handleSearch());
        tickerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        tickerInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });

        tickerToggle.addEventListener('click', () => this.toggleInputSection());
        stockTimeToggle.addEventListener('click', () => this.toggleStockTimeFrame());
        spyTimeToggle.addEventListener('click', () => this.toggleSpyTimeFrame());
    }

    async handleSearch() {
        const ticker = document.getElementById('tickerInput').value.trim().toUpperCase();
        if (!ticker) return;

        this.currentTicker = ticker;
        this.saveTicker(ticker);
        
        await this.fetchStockData(ticker);
        await this.fetchMarketData();
        await this.generateStockChart(ticker);
        
        this.startAutoRefresh();
        this.startTimeFrameCycling();
        
        // Hide input section after first search
        this.hideInputSection();
    }

    async fetchStockData(ticker) {
        const stockDetails = document.getElementById('stockDetails');
        
        try {
            stockDetails.innerHTML = '<div class="loading">Fetching stock data...</div>';
            
            // Fetch real-time quote from Alpha Vantage
            const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${this.apiKey}`;
            
            const response = await fetch(quoteUrl);
            const data = await response.json();
            
            // Check if we got valid data
            if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
                const quote = data['Global Quote'];
                const currentPrice = parseFloat(quote['05. price']);
                const change = parseFloat(quote['09. change']);
                const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
                
                const stockData = {
                    symbol: ticker,
                    price: currentPrice,
                    change: change,
                    changePercent: changePercent,
                    currency: 'USD'
                };
                
                this.displayStockData(stockData);
                document.getElementById('stockChartTitle').textContent = `${ticker}`;
                
            } else {
                // Fallback to mock data if API fails or returns no data
                console.warn('API returned no data, using mock data for:', ticker);
                this.useMockStockData(ticker, stockDetails);
            }
            
        } catch (error) {
            console.error('Error fetching stock data:', error);
            // Fallback to mock data on error
            this.useMockStockData(ticker, stockDetails);
        }
    }

    useMockStockData(ticker, stockDetails) {
        const mockPrice = this.generateMockPrice(ticker);
        const mockChange = (Math.random() - 0.5) * mockPrice * 0.05; // ±2.5% change
        const stockData = {
            symbol: ticker,
            price: mockPrice,
            change: mockChange,
            changePercent: (mockChange / (mockPrice - mockChange)) * 100,
            currency: 'USD'
        };
        
        this.displayStockData(stockData);
        document.getElementById('stockChartTitle').textContent = `${ticker}`;
    }

    generateMockPrice(ticker) {
        // Generate consistent mock prices based on ticker
        const hash = ticker.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        const basePrice = Math.abs(hash) % 500 + 50; // $50-$550 range
        const variation = (Math.sin(Date.now() / 100000) * 5); // Small variation over time
        return Math.max(basePrice + variation, 10);
    }

    displayStockData(data) {
        const stockDetails = document.getElementById('stockDetails');
        const isPositive = data.change >= 0;
        const changeSymbol = isPositive ? '+' : '';
        
        stockDetails.className = `stock-details ${isPositive ? 'positive' : 'negative'}`;
        
        stockDetails.innerHTML = `
            <div class="stock-symbol">${data.symbol}</div>
            <div class="stock-price">$${data.price.toFixed(2)}</div>
            <div class="stock-change">
                ${changeSymbol}$${data.change.toFixed(2)} (${changeSymbol}${data.changePercent.toFixed(2)}%)
            </div>
        `;
    }

    async fetchMarketData() {
        try {
            // Fetch real SPY data from Alpha Vantage
            const spyQuoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${this.apiKey}`;
            
            const response = await fetch(spyQuoteUrl);
            const data = await response.json();
            
            if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
                const quote = data['Global Quote'];
                const spyPrice = parseFloat(quote['05. price']);
                const spyChange = parseFloat(quote['09. change']);
                const spyChangePercent = parseFloat(quote['10. change percent'].replace('%', ''));
                const volume = parseInt(quote['06. volume']);
                
                document.getElementById('spyPrice').textContent = `$${spyPrice.toFixed(2)}`;
                document.getElementById('spyChange').textContent = `${spyChange >= 0 ? '+' : ''}${spyChangePercent.toFixed(2)}%`;
                document.getElementById('spyChange').className = `market-stat-value ${spyChange >= 0 ? 'positive' : 'negative'}`;
                document.getElementById('spyVolume').textContent = `${(volume / 1000000).toFixed(1)}M`;
                
            } else {
                // Fallback to mock data
                console.warn('SPY data not available, using mock data');
                this.useMockMarketData();
            }
            
            this.generateMarketChart();
            
        } catch (error) {
            console.error('Error fetching market data:', error);
            // Fallback to mock data
            this.useMockMarketData();
            this.generateMarketChart();
        }
    }

    useMockMarketData() {
        const spyPrice = 420 + (Math.random() - 0.5) * 20;
        const spyChange = (Math.random() - 0.5) * 4;
        const spyChangePercent = (spyChange / spyPrice) * 100;
        
        document.getElementById('spyPrice').textContent = `$${spyPrice.toFixed(2)}`;
        document.getElementById('spyChange').textContent = `${spyChange >= 0 ? '+' : ''}${spyChangePercent.toFixed(2)}%`;
        document.getElementById('spyChange').className = `market-stat-value ${spyChange >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('spyVolume').textContent = `${(Math.random() * 50 + 10).toFixed(1)}M`;
    }

    async generateStockChart(ticker) {
        const chartContainer = document.getElementById('stockChart');
        
        try {
            // Fetch historical data from Alpha Vantage
            let historicalUrl;
            if (this.stockTimeFrame === '1H') {
                historicalUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=60min&apikey=${this.apiKey}&outputsize=compact`;
            } else {
                historicalUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${this.apiKey}&outputsize=compact`;
            }
            
            const response = await fetch(historicalUrl);
            const data = await response.json();
            
            let dataPoints = [];
            let timeSeriesKey = this.stockTimeFrame === '1H' ? 'Time Series (60min)' : 'Time Series (Daily)';
            
            if (data[timeSeriesKey]) {
                const timeSeries = data[timeSeriesKey];
                const dates = Object.keys(timeSeries).slice(0, this.stockTimeFrame === '1H' ? 24 : 30); // Last 24 hours or 30 days
                
                // Convert to price points (using closing prices)
                dataPoints = dates.reverse().map(date => parseFloat(timeSeries[date]['4. close']));
            } else {
                // Fallback to mock data if API fails
                console.warn('Historical data not available, using mock data for chart');
                dataPoints = this.generateMockChartData(ticker);
            }
            
            this.renderSimpleChart(chartContainer, dataPoints, '#007AFF');
            
        } catch (error) {
            console.error('Error fetching chart data:', error);
            // Fallback to mock data
            const dataPoints = this.generateMockChartData(ticker);
            this.renderSimpleChart(chartContainer, dataPoints, '#007AFF');
        }
    }

    generateMockChartData(ticker) {
        const basePrice = this.generateMockPrice(ticker);
        const dataPoints = [];
        const pointCount = this.stockTimeFrame === '1H' ? 24 : 30; // hours or days
        
        for (let i = 0; i < pointCount; i++) {
            const variation = (Math.sin(i / (pointCount / 4)) + Math.random() - 0.5) * basePrice * 0.02;
            dataPoints.push(basePrice + variation);
        }
        return dataPoints;
    }
    
    async generateMarketChart() {
        const chartContainer = document.getElementById('marketChart');
        
        try {
            // Fetch SPY historical data from Alpha Vantage
            let historicalUrl;
            if (this.spyTimeFrame === '1H') {
                historicalUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=SPY&interval=60min&apikey=${this.apiKey}&outputsize=compact`;
            } else {
                historicalUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&apikey=${this.apiKey}&outputsize=compact`;
            }
            
            const response = await fetch(historicalUrl);
            const data = await response.json();
            
            let dataPoints = [];
            let timeSeriesKey = this.spyTimeFrame === '1H' ? 'Time Series (60min)' : 'Time Series (Daily)';
            
            if (data[timeSeriesKey]) {
                const timeSeries = data[timeSeriesKey];
                const dates = Object.keys(timeSeries).slice(0, this.spyTimeFrame === '1H' ? 24 : 30); // Last 24 hours or 30 days
                
                // Convert to price points (using closing prices)
                dataPoints = dates.reverse().map(date => parseFloat(timeSeries[date]['4. close']));
            } else {
                // Fallback to mock data if API fails
                console.warn('SPY historical data not available, using mock data for chart');
                dataPoints = this.generateMockMarketChartData();
            }
            
            this.renderSimpleChart(chartContainer, dataPoints, '#00C851');
            
        } catch (error) {
            console.error('Error fetching SPY chart data:', error);
            // Fallback to mock data
            const dataPoints = this.generateMockMarketChartData();
            this.renderSimpleChart(chartContainer, dataPoints, '#00C851');
        }
    }

    generateMockMarketChartData() {
        const basePrice = 420;
        const dataPoints = [];
        const pointCount = this.spyTimeFrame === '1H' ? 24 : 30;
        
        for (let i = 0; i < pointCount; i++) {
            const variation = (Math.sin(i / (pointCount / 3)) + Math.random() - 0.5) * basePrice * 0.015;
            dataPoints.push(basePrice + variation);
        }
        return dataPoints;
    }
    
    renderSimpleChart(container, dataPoints, color) {
        const width = container.offsetWidth || 300;
        const height = 150;
        const padding = 10;
        
        const min = Math.min(...dataPoints);
        const max = Math.max(...dataPoints);
        const range = max - min || 1;
        
        // Use the actual min/max range to fill the entire chart height
        let pathData = '';
        dataPoints.forEach((point, index) => {
            const x = padding + (index / (dataPoints.length - 1)) * (width - 2 * padding);
            // Scale so minimum value is at bottom and maximum is at top
            const y = height - padding - ((point - min) / range) * (height - 2 * padding);
            pathData += `${index === 0 ? 'M' : 'L'} ${x} ${y} `;
        });
        
        // Baseline should be at the bottom of the chart area (minimum price level)
        const baselineY = height - padding;
        
        container.innerHTML = `
            <svg width="100%" height="${height}" style="background: #0a0a0a;">
                <path d="${pathData}" stroke="${color}" stroke-width="2" fill="none" opacity="0.8" />
                <path d="${pathData} L ${width - padding} ${baselineY} L ${padding} ${baselineY} Z" 
                      fill="url(#gradient-${color.replace('#', '')})" opacity="0.1" />
                <defs>
                    <linearGradient id="gradient-${color.replace('#', '')}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
                    </linearGradient>
                </defs>
            </svg>
        `;
    }

    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        this.refreshInterval = setInterval(async () => {
            if (this.currentTicker) {
                await this.fetchStockData(this.currentTicker);
                await this.fetchMarketData();
                await this.generateStockChart(this.currentTicker);
            }
        }, 10000); // Refresh every 10 seconds
    }

    startTimeFrameCycling() {
        if (this.timeFrameCycleInterval) {
            clearInterval(this.timeFrameCycleInterval);
        }
        
        this.timeFrameCycleInterval = setInterval(async () => {
            // Toggle both stock and SPY timeframes
            this.stockTimeFrame = this.stockTimeFrame === '1D' ? '1H' : '1D';
            this.spyTimeFrame = this.spyTimeFrame === '1D' ? '1H' : '1D';
            
            // Update the button text
            document.getElementById('stockTimeToggle').textContent = this.stockTimeFrame;
            document.getElementById('spyTimeToggle').textContent = this.spyTimeFrame;
            
            // Regenerate charts with new timeframe
            if (this.currentTicker) {
                await this.generateStockChart(this.currentTicker);
            }
            await this.generateMarketChart();
        }, 5000); // Cycle every 5 seconds
    }

    saveTicker(ticker) {
        try {
            localStorage.setItem('finpeek_default_ticker', ticker);
        } catch (error) {
            console.error('Could not save ticker to localStorage:', error);
        }
    }

    loadSavedTicker() {
        try {
            const savedTicker = localStorage.getItem('finpeek_default_ticker');
            if (savedTicker) {
                document.getElementById('tickerInput').value = savedTicker;
                this.currentTicker = savedTicker;
                this.fetchStockData(savedTicker);
                this.fetchMarketData();
                this.generateStockChart(savedTicker);
                this.startAutoRefresh();
                this.startTimeFrameCycling();
            }
        } catch (error) {
            console.error('Could not load saved ticker:', error);
        }
    }

    startKeepAwakeVideo() {
        try {
            const video = document.getElementById('keepAwake');
            // Create a minimal video data URL to prevent sleep
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, 1, 1);
            
            // Use a more reliable keep-awake method
            this.preventSleep();
        } catch (error) {
            console.error('Could not start keep-awake video:', error);
        }
    }

    preventSleep() {
        // Use Wake Lock API if available (newer browsers)
        if ('wakeLock' in navigator) {
            this.requestWakeLock();
        } else {
            // Fallback: keep the screen active with periodic no-op
            this.keepScreenActive();
        }
    }

    async requestWakeLock() {
        try {
            this.wakeLock = await navigator.wakeLock.request('screen');
            console.log('Screen wake lock activated');
            
            // Re-request wake lock when page becomes visible again
            document.addEventListener('visibilitychange', () => {
                if (this.wakeLock !== null && document.visibilityState === 'visible') {
                    this.requestWakeLock();
                }
            });
        } catch (error) {
            console.error('Could not request wake lock:', error);
            this.keepScreenActive();
        }
    }

    keepScreenActive() {
        // Fallback method: subtle page updates to prevent sleep
        setInterval(() => {
            // Minimal DOM manipulation to keep the page "active"
            const timestamp = document.querySelector('.last-updated');
            if (timestamp) {
                timestamp.style.opacity = timestamp.style.opacity === '0.69' ? '0.7' : '0.69';
            }
        }, 30000); // Every 30 seconds
    }

    toggleInputSection() {
        const inputSection = document.querySelector('.input-section');
        if (inputSection.classList.contains('hidden')) {
            this.showInputSection();
        } else {
            this.hideInputSection();
        }
    }

    hideInputSection() {
        const inputSection = document.querySelector('.input-section');
        inputSection.classList.add('hidden');
    }

    showInputSection() {
        const inputSection = document.querySelector('.input-section');
        inputSection.classList.remove('hidden');
    }
    
    async toggleStockTimeFrame() {
        // Stop automatic cycling when user manually toggles
        if (this.timeFrameCycleInterval) {
            clearInterval(this.timeFrameCycleInterval);
            this.timeFrameCycleInterval = null;
        }
        
        this.stockTimeFrame = this.stockTimeFrame === '1D' ? '1H' : '1D';
        document.getElementById('stockTimeToggle').textContent = this.stockTimeFrame;
        if (this.currentTicker) {
            await this.generateStockChart(this.currentTicker);
        }
    }
    
    async toggleSpyTimeFrame() {
        // Stop automatic cycling when user manually toggles
        if (this.timeFrameCycleInterval) {
            clearInterval(this.timeFrameCycleInterval);
            this.timeFrameCycleInterval = null;
        }
        
        this.spyTimeFrame = this.spyTimeFrame === '1D' ? '1H' : '1D';
        document.getElementById('spyTimeToggle').textContent = this.spyTimeFrame;
        await this.generateMarketChart();
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FinPeekApp();
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}