// Purpose: Weather widget component to display current weather at the conservation site

import React, { useState, useEffect } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { FaSun, FaCloud, FaCloudRain, FaSnowflake, FaSmog, FaMoon } from "react-icons/fa";
import { fetchWeatherApi } from "openmeteo";

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Conservation site coordinates (71 St. Pauls Lane, French Village, NS)
  const lat = 44.623917;
  const lon = -63.920472;
  const CACHE_KEY = "weather_cache";
  const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

  // Map WMO weather codes to weather conditions
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

  // Check if cached data is still valid
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

  // Save weather data to cache
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

  const resolvedApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || "bd5e378503939ddaee76f12ad7a97608";

  useEffect(() => {
    // Try to load from cache first
    const cachedWeather = getCachedWeather();
    if (cachedWeather) {
      setWeather(cachedWeather);
      setError(null);
      setLoading(false);
    }

    const fetchWeather = async () => {
      try {
<<<<<<< HEAD
        const params = {
          latitude: lat,
          longitude: lon,
          hourly: "temperature_2m",
          current: ["temperature_2m", "weather_code", "is_day"],
        };
        const url = "https://api.open-meteo.com/v1/forecast";
        const responses = await fetchWeatherApi(url, params);
=======
        const apiKey = resolvedApiKey;
        console.log("API Key check:", apiKey ? "Found" : "Missing");

        if (!apiKey) {
          console.error("Weather API key not configured");
          setError("API key missing");
          setLoading(false);
          return;
        }
>>>>>>> afed99339a48712be9497c5e11b39e6e8c434e9b

        // Process first location
        const response = responses[0];
        const current = response.current();

        // Get current weather data
        // Note: The order of weather variables in the URL query and the indices below need to match!
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

    // Only fetch if we don't have cached data
    if (!cachedWeather) {
      fetchWeather();
    }
    
    // Refresh every 15 minutes (reduced from 10 to minimize API calls)
    const interval = setInterval(fetchWeather, 900000);
    return () => clearInterval(interval);
  }, [resolvedApiKey]);

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

  const baseClasses = "inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-100";

  if (loading) {
    return (
      <div className={`${baseClasses} text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400`}>
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden />
        <span>Weather</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`${baseClasses} text-slate-500 dark:text-slate-400`}>
        <IoLocationOutline className="text-base" />
        <span className="text-xs uppercase tracking-wide">Weather offline</span>
      </div>
    );
  }

<<<<<<< HEAD
  // Determine if it's day or night - use API value if available, otherwise calculate from current time
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
=======
  const temperature = Math.round(weather.main?.temp ?? 0);
  const conditionMain = weather.weather?.[0]?.main || "Clear";
  const conditionDescription = weather.weather?.[0]?.description || conditionMain;

  return (
    <div className={baseClasses} aria-label="Current weather">
      <span className="inline-flex items-center justify-center text-emerald-500 dark:text-emerald-300">
        {getWeatherIcon(conditionMain)}
      </span>
      <span className="text-base font-semibold leading-none text-slate-900 dark:text-white">{temperature}°C</span>
      <span className="text-xs capitalize text-slate-500 dark:text-slate-400">{conditionDescription}</span>
>>>>>>> afed99339a48712be9497c5e11b39e6e8c434e9b
    </div>
  );
};

export default WeatherWidget;

