/**
 * ================================================================================
 * File: WeatherWidget.jsx
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: Weather display component fetching current conditions from Open-Meteo API
 * with 15-minute caching to reduce API calls and improve performance.
 * ================================================================================
 */

import React, { useState, useEffect } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { FaSun, FaCloud, FaCloudRain, FaSnowflake, FaSmog, FaMoon } from "react-icons/fa";
import { fetchWeatherApi } from "openmeteo";

// ============================================================================
// WeatherWidget Component
// ============================================================================

/**
 * WeatherWidget Component - Displays current weather conditions at conservation site
 * @returns {JSX.Element}
 */
const WeatherWidget = () => {
  // ============================================================================
  // State Management
  // ============================================================================
  
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================================================
  // Constants
  // ============================================================================
  
  // Conservation site coordinates (71 St. Pauls Lane, French Village, NS)
  const lat = 44.623917;
  const lon = -63.920472;
  const CACHE_KEY = "weather_cache";
  // Cache duration: 15 minutes to balance freshness with API call reduction
  const CACHE_DURATION = 15 * 60 * 1000;

  // ============================================================================
  // Utility Functions
  // ============================================================================
  
  /**
   * Map WMO weather interpretation codes to readable weather conditions
   * WMO codes are standard numeric codes used by meteorological services
   * @param {number} code - WMO weather code (0-99)
   * @returns {Object} Object with main condition and description
   */
  const getWeatherFromCode = (code) => {
    // WMO Weather interpretation codes (WW)
    // 0: Clear sky
    if (code === 0) return { main: "Clear", description: "clear sky" };
    // 1, 2, 3: Mainly clear, partly cloudy, overcast
    if (code >= 1 && code <= 3) return { main: "Clouds", description: "partly cloudy" };
    // 45, 48: Fog
    if (code === 45 || code === 48) return { main: "Fog", description: "foggy" };
    // 51, 53, 55: Drizzle
    if (code >= 51 && code <= 55) return { main: "Drizzle", description: "drizzle" };
    // 56, 57: Freezing drizzle
    if (code === 56 || code === 57) return { main: "Drizzle", description: "freezing drizzle" };
    // 61, 63, 65: Rain
    if (code >= 61 && code <= 65) return { main: "Rain", description: "rain" };
    // 66, 67: Freezing rain
    if (code === 66 || code === 67) return { main: "Rain", description: "freezing rain" };
    // 71, 73, 75, 77: Snow
    if (code >= 71 && code <= 77) return { main: "Snow", description: "snow" };
    // 80, 81, 82: Rain showers
    if (code >= 80 && code <= 82) return { main: "Rain", description: "rain showers" };
    // 85, 86: Snow showers
    if (code >= 85 && code <= 86) return { main: "Snow", description: "snow showers" };
    // 95, 96, 99: Thunderstorm
    if (code >= 95 && code <= 99) return { main: "Rain", description: "thunderstorm" };
    // Default
    return { main: "Clouds", description: "cloudy" };
  };

  /**
   * Retrieve cached weather data if still valid
   * Returns null if cache is expired or missing
   * @returns {Object|null} Cached weather data or null
   */
  const getCachedWeather = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        if (now - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch (err) {
      console.error("Error reading cache:", err);
    }
    return null;
  };

  /**
   * Save weather data to localStorage with timestamp
   * @param {Object} data - Weather data to cache
   */
  const setCachedWeather = (data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error("Error saving cache:", err);
    }
  };

  // ============================================================================
  // Data Fetching & Side Effects
  // ============================================================================
  
  /**
   * Fetch weather data on mount and set up refresh interval
   * Checks cache first to avoid unnecessary API calls
   * Empty dependency array: fetch once on mount, then every 15 minutes
   */
  useEffect(() => {
    // Load from cache first for instant display
    const cachedWeather = getCachedWeather();
    if (cachedWeather) {
      setWeather(cachedWeather);
      setError(null);
      setLoading(false);
    }

    /**
     * Fetch current weather from Open-Meteo API
     * Open-Meteo is free and doesn't require API keys
     */
    const fetchWeather = async () => {
      try {
        const params = {
          latitude: lat,
          longitude: lon,
          hourly: "temperature_2m",
          current: ["temperature_2m", "weather_code", "is_day"],
        };
        const url = "https://api.open-meteo.com/v1/forecast";
        const responses = await fetchWeatherApi(url, params);

        // Process first location
        const response = responses[0];
        const current = response.current();

        // Extract weather data - variable order must match API request order
        const temperature_2m = current.variables(0).value();
        const weather_code = current.variables(1).value();
        const is_day = current.variables(2).value();

        // Map weather code to our format
        const weatherInfo = getWeatherFromCode(weather_code);

        // Transform to match expected format for UI compatibility
        const data = {
          main: {
            temp: temperature_2m,
          },
          weather: [
            {
              main: weatherInfo.main,
              description: weatherInfo.description,
            },
          ],
          is_day: is_day,
        };

        setWeather(data);
        setCachedWeather(data);
        setError(null);
      } catch (err) {
        console.error("Weather fetch error:", err);
        // Try to use cached data if available
        const cached = getCachedWeather();
        if (cached) {
          setWeather(cached);
          setError(null);
        } else {
          setError(err.message || "Unable to load weather");
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch from API if cache is missing or expired
    if (!cachedWeather) {
      fetchWeather();
    }
    
    // Set up refresh interval: fetch every 15 minutes to keep data current
    const interval = setInterval(fetchWeather, 900000);
    return () => clearInterval(interval);
  }, []); // Empty array: setup once on mount

  // ============================================================================
  // Rendering Helpers
  // ============================================================================
  
  /**
   * Get appropriate weather icon based on condition and time of day
   * Shows sun/moon for clear weather, specific icons for other conditions
   * @param {string} weatherMain - Main weather condition (Clear, Clouds, Rain, etc.)
   * @param {number} isDay - 1 for day, 0 for night
   * @returns {JSX.Element} Weather icon component
   */
  const getWeatherIcon = (weatherMain, isDay) => {
    // For clear weather, show sun during day and moon at night
    // isDay can be 1 (day) or 0 (night) from Open-Meteo API
    if (weatherMain === "Clear") {
      const isDayTime = isDay === 1 || isDay === true;
      return isDayTime ? (
        <FaSun className="text-lg text-amber-400" />
      ) : (
        <FaMoon className="text-lg text-slate-300" />
      );
    }

    const iconMap = {
      Clouds: <FaCloud className="text-lg text-slate-400" />,
      Rain: <FaCloudRain className="text-lg text-sky-500" />,
      Drizzle: <FaCloudRain className="text-lg text-sky-500" />,
      Snow: <FaSnowflake className="text-lg text-blue-200" />,
      Mist: <FaSmog className="text-lg text-slate-400" />,
      Fog: <FaSmog className="text-lg text-slate-400" />,
    };
    return iconMap[weatherMain] || <FaSun className="text-lg text-amber-400" />;
  };

  // ============================================================================
  // Render
  // ============================================================================
  
  // Show loading spinner while fetching initial data
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
        <span className="hidden sm:inline">Loading...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <IoLocationOutline />
        <span className="hidden sm:inline">Weather unavailable</span>
      </div>
    );
  }

  // Show fallback message if weather data unavailable
  if (error || !weather) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <IoLocationOutline />
        <span className="hidden sm:inline">Weather unavailable</span>
      </div>
    );
  }

  /**
   * Determine if it's day or night for icon selection
   * Uses API value if available, otherwise calculates from current time
   * @returns {boolean} True if day, false if night
   */
  const getIsDay = () => {
    if (weather.is_day !== undefined) {
      return weather.is_day === 1 || weather.is_day === true;
    }
    // Fallback: check if current time is between 6 AM and 8 PM (rough day/night check)
    const hour = new Date().getHours();
    return hour >= 6 && hour < 20;
  };

  return (
    <div className="flex items-center justify-center gap-2 text-xs text-slate-700 dark:text-slate-200 w-full">
      <div className="flex-shrink-0">{getWeatherIcon(weather.weather[0].main, getIsDay() ? 1 : 0)}</div>
      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
        <span className="font-semibold whitespace-nowrap">{Math.round(weather.main.temp)}°C</span>
        <span className="hidden sm:inline text-slate-500 dark:text-slate-400">•</span>
        <span className="capitalize text-slate-600 dark:text-slate-300 text-center sm:text-left">{weather.weather[0].description}</span>
      </div>
    </div>
  );
};

export default WeatherWidget;

