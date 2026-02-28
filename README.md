# 🌦️ Weather Analytics Dashboard

A modern, responsive Weather Analytics Dashboard built with **React (Vite)** that provides real-time weather insights, forecasts, historical trends, and interactive visualizations.

This application allows users to explore short-term and long-term weather patterns for multiple cities in a clean, production-style UI.

---

## 🚀 Features

### 🌤 Dashboard
- Displays multiple city weather summary cards
- Shows:
  - Current temperature
  - Weather condition icon
  - Humidity
  - Wind speed
- Real-time updates (auto refresh every 60 seconds)
- Add/remove favorite cities
- Persistent favorites (saved in localStorage)

### 🔍 Detailed City View
- 5–7 Day forecast
- Hourly temperature trends
- Daily temperature trends
- Precipitation patterns
- Wind speed & direction visualization
- Interactive charts (Recharts)

### 🔎 Search & Autocomplete
- API-powered city search
- Instant suggestions
- Add searched cities to dashboard

### ⚙ Settings
- Toggle between Celsius ↔ Fahrenheit
- Unit preference persisted between sessions

### 🔐 Google Authentication (Bonus)
- Simple Google Sign-In
- User profile displayed in navbar
- Session persisted via localStorage

### ⚡ Real-Time & Caching (Bonus)
- TanStack Query used for:
  - Smart caching
  - Background refetching
  - Automatic stale data handling
- Data never older than 60 seconds
- Reduced unnecessary API calls

---

## 🛠 Tech Stack

- ⚛ React (Vite)
- 🔀 React Router DOM
- 🗂 Redux (State management)
- 🔄 TanStack Query (Caching & Real-time fetching)
- 📊 Recharts (Data visualization)
- 🎨 Tailwind CSS (UI styling)
- 🔐 @react-oauth/google (Authentication)
- 🌍 WeatherAPI.com (Weather Data API)

---

## 📡 API Integration

Weather data is fetched from **WeatherAPI.com (Free Tier)**:

- Current weather
- 7-day forecast
- Hourly forecast
- Historical data
- City search autocomplete

Caching strategy ensures:
- Optimized API usage
- Data refresh every 60 seconds
- Smooth user experience

---


---

## ▶ Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Manikantkr-1004/Manikant-Weather-WebApp.git
npm install
npm run dev
```

### Make sure to add these in .env file
- VITE_WEATHER_API_KEY=your_weatherapi_key
- VITE_WEATHER_API_URL=https://api.weatherapi.com/v1
- VITE_GOOGLE_CLIENT_ID=your_google_client_id