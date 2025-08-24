class FinPeekApp {
    constructor() {
        this.currentTicker = '';
        this.refreshInterval = null;
        this.stockTimeFrame = '1D'; // '1D' or '1H'
        this.spyTimeFrame = '1D';
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
        this.generateStockChart(ticker);
        
        this.startAutoRefresh();
        
        // Hide input section after first search
        this.hideInputSection();
    }

    async fetchStockData(ticker) {
        const stockDisplay = document.getElementById('stockDisplay');
        
        try {
            stockDisplay.innerHTML = '<div class="loading">Fetching stock data...</div>';
            
            // Generate realistic mock data for demonstration
            // In production, replace this with a CORS-enabled API
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
            
        } catch (error) {
            console.error('Error fetching stock data:', error);
            stockDisplay.innerHTML = `<div class="error">Error fetching data for ${ticker}. Please check the ticker symbol.</div>`;
        }
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
            // Generate mock SPY data
            const spyPrice = 420 + (Math.random() - 0.5) * 20;
            const spyChange = (Math.random() - 0.5) * 4;
            const spyChangePercent = (spyChange / spyPrice) * 100;
            
            document.getElementById('spyPrice').textContent = `$${spyPrice.toFixed(2)}`;
            document.getElementById('spyChange').textContent = `${spyChange >= 0 ? '+' : ''}${spyChangePercent.toFixed(2)}%`;
            document.getElementById('spyChange').className = `market-stat-value ${spyChange >= 0 ? 'positive' : 'negative'}`;
            document.getElementById('spyVolume').textContent = `${(Math.random() * 50 + 10).toFixed(1)}M`;
            
            this.generateMarketChart();
            
        } catch (error) {
            console.error('Error fetching market data:', error);
        }
    }

    generateStockChart(ticker) {
        const chartContainer = document.getElementById('stockChart');
        
        // Generate mock price data based on timeframe
        const basePrice = this.generateMockPrice(ticker);
        const dataPoints = [];
        const pointCount = this.stockTimeFrame === '1H' ? 60 : 24; // minutes or hours
        
        for (let i = 0; i < pointCount; i++) {
            const variation = (Math.sin(i / (pointCount / 4)) + Math.random() - 0.5) * basePrice * 0.02;
            dataPoints.push(basePrice + variation);
        }
        
        this.renderSimpleChart(chartContainer, dataPoints, '#007AFF');
    }
    
    generateMarketChart() {
        const chartContainer = document.getElementById('marketChart');
        
        // Generate SPY mock data based on timeframe
        const basePrice = 420;
        const dataPoints = [];
        const pointCount = this.spyTimeFrame === '1H' ? 60 : 24;
        
        for (let i = 0; i < pointCount; i++) {
            const variation = (Math.sin(i / (pointCount / 3)) + Math.random() - 0.5) * basePrice * 0.015;
            dataPoints.push(basePrice + variation);
        }
        
        this.renderSimpleChart(chartContainer, dataPoints, '#00C851');
    }
    
    renderSimpleChart(container, dataPoints, color) {
        const width = container.offsetWidth || 300;
        const height = 150;
        const padding = 10;
        
        const min = Math.min(...dataPoints);
        const max = Math.max(...dataPoints);
        const range = max - min || 1;
        
        let pathData = '';
        dataPoints.forEach((point, index) => {
            const x = padding + (index / (dataPoints.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((point - min) / range) * (height - 2 * padding);
            pathData += `${index === 0 ? 'M' : 'L'} ${x} ${y} `;
        });
        
        container.innerHTML = `
            <svg width="100%" height="${height}" style="background: #0a0a0a;">
                <path d="${pathData}" stroke="${color}" stroke-width="2" fill="none" opacity="0.8" />
                <path d="${pathData} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z" 
                      fill="url(#gradient)" opacity="0.1" />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
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
        
        this.refreshInterval = setInterval(() => {
            if (this.currentTicker) {
                this.fetchStockData(this.currentTicker);
                this.fetchMarketData();
                this.generateStockChart(this.currentTicker);
            }
        }, 10000); // Refresh every 10 seconds
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
    
    toggleStockTimeFrame() {
        this.stockTimeFrame = this.stockTimeFrame === '1D' ? '1H' : '1D';
        document.getElementById('stockTimeToggle').textContent = this.stockTimeFrame;
        if (this.currentTicker) {
            this.generateStockChart(this.currentTicker);
        }
    }
    
    toggleSpyTimeFrame() {
        this.spyTimeFrame = this.spyTimeFrame === '1D' ? '1H' : '1D';
        document.getElementById('spyTimeToggle').textContent = this.spyTimeFrame;
        this.generateMarketChart();
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