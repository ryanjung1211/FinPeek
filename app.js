class FinPeekApp {
    constructor() {
        this.currentTicker = '';
        this.refreshInterval = null;
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
    }

    async handleSearch() {
        const ticker = document.getElementById('tickerInput').value.trim().toUpperCase();
        if (!ticker) return;

        this.currentTicker = ticker;
        this.saveTicker(ticker);
        
        await this.fetchStockData(ticker);
        await this.fetchNews(ticker);
        
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
        const stockDisplay = document.getElementById('stockDisplay');
        const isPositive = data.change >= 0;
        const changeSymbol = isPositive ? '+' : '';
        
        stockDisplay.className = `stock-display ${isPositive ? 'positive' : 'negative'}`;
        
        stockDisplay.innerHTML = `
            <div class="stock-symbol">${data.symbol}</div>
            <div class="stock-price">$${data.price.toFixed(2)}</div>
            <div class="stock-change">
                ${changeSymbol}$${data.change.toFixed(2)} (${changeSymbol}${data.changePercent.toFixed(2)}%)
            </div>
            <div class="last-updated">Last updated: ${new Date().toLocaleTimeString()}</div>
        `;
    }

    async fetchNews(ticker) {
        const newsContainer = document.getElementById('newsContainer');
        
        try {
            newsContainer.innerHTML = '<div class="loading">Fetching news...</div>';
            
            // Simulate API delay for realistic experience
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Use mock news for now (replace with CORS-enabled news API in production)
            this.displayMockNews(ticker);
            
        } catch (error) {
            console.error('Error fetching news:', error);
            this.displayMockNews(ticker);
        }
    }

    displayMockNews(ticker) {
        const newsContainer = document.getElementById('newsContainer');
        
        // Generate dynamic mock news based on ticker and time
        const newsTemplates = [
            `${ticker} Reports Strong Quarterly Earnings, Beats Analyst Expectations`,
            `${ticker} Stock Rallies Following Positive Market Outlook`,
            `Analysts Upgrade ${ticker} Price Target After Strategic Announcement`,
            `${ticker} Announces New Partnership in Growing Market Sector`,
            `${ticker} Leadership Team Outlines Vision for Future Growth`,
            `${ticker} Shares Rise on Strong Revenue Growth Projections`
        ];
        
        const sources = ["Bloomberg", "Reuters", "MarketWatch", "Financial Times", "CNBC", "WSJ"];
        const timeAgo = ["1 hour ago", "2 hours ago", "3 hours ago", "4 hours ago", "5 hours ago", "6 hours ago"];
        
        // Generate 3 random but consistent news items based on ticker hash
        const hash = ticker.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        const mockNews = [];
        for (let i = 0; i < 3; i++) {
            const templateIndex = Math.abs(hash + i) % newsTemplates.length;
            const sourceIndex = Math.abs(hash + i * 2) % sources.length;
            const timeIndex = i; // Recent to older
            
            mockNews.push({
                headline: newsTemplates[templateIndex],
                source: sources[sourceIndex],
                time: timeAgo[timeIndex]
            });
        }
        
        const newsHTML = mockNews.map(news => `
            <div class="news-item">
                <div class="news-headline">${news.headline}</div>
                <div class="news-source">${news.source} • ${news.time}</div>
            </div>
        `).join('');
        
        newsContainer.innerHTML = newsHTML;
    }

    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        this.refreshInterval = setInterval(() => {
            if (this.currentTicker) {
                this.fetchStockData(this.currentTicker);
                this.fetchNews(this.currentTicker);
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
                this.fetchNews(savedTicker);
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