# FinPeek - Stock Ticker Dashboard

A simple, mobile-first web app for glanceable stock information, optimized for iPhone Safari in landscape mode on MagSafe stands.

## Features

✅ **Stock Price Display**
- Enter any stock ticker (e.g., AAPL, TSLA, GOOGL)
- Shows current price and daily change percentage
- Green/red color coding for up/down movements
- Auto-refreshes every 10 seconds

✅ **News Headlines**
- Displays 3 recent news headlines related to the stock
- Mock news data for demonstration (can be replaced with real news API)

✅ **Mobile-First Design**
- Optimized for iPhone Safari
- Responsive layout for landscape mode
- Clean, minimal interface

✅ **Anti-Sleep Features**
- Prevents iPhone Safari from auto-sleeping
- Uses Wake Lock API when available
- Fallback methods for older devices

✅ **PWA Support**
- Installable as a Progressive Web App
- Can be added to iPhone home screen
- Works offline with cached data

✅ **Local Storage**
- Remembers your last searched ticker
- Automatically loads on app start

## How to Use

1. **Open the app** in iPhone Safari
2. **Enter a stock ticker** (e.g., AAPL) in the input field
3. **Tap "GET QUOTE"** or press Enter
4. **View the stock data** with color-coded price changes
5. **Place your phone** on a MagSafe stand in landscape mode
6. **Let it run** - it will auto-refresh every 10 seconds

## Installation as PWA

1. Open the app in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Tap "Add" to confirm
5. Launch from your home screen

## Technical Details

- **Stock Data**: Yahoo Finance API (free)
- **Anti-Sleep**: Wake Lock API + fallback methods
- **Offline Support**: Service Worker caching
- **Storage**: localStorage for ticker persistence

## Files

- `index.html` - Main HTML structure and styles
- `app.js` - JavaScript functionality and API integration
- `manifest.json` - PWA configuration
- `sw.js` - Service worker for offline functionality

Perfect for keeping an eye on your stocks while your phone sits on a desk stand!