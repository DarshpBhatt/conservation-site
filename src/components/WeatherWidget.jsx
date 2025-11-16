// Purpose: Weather widget component to display current weather at the conservation site

import React, { useState, useEffect } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { FaSun, FaCloud, FaCloudRain, FaSnowflake, FaSmog } from "react-icons/fa";

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Conservation site coordinates (71 St. Pauls Lane, French Village, NS)
  const lat = 44.623917;
  const lon = -63.920472;

  const resolvedApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || "bd5e378503939ddaee76f12ad7a97608";

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = resolvedApiKey;
        console.log("API Key check:", apiKey ? "Found" : "Missing");

        if (!apiKey) {
          console.error("Weather API key not configured");
          setError("API key missing");
          setLoading(false);
          return;
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        console.log("Fetching weather from:", url.replace(apiKey, "***"));

        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Weather API error:", response.status, errorData);
          throw new Error(`Failed to fetch weather: ${response.status}`);
        }

        const data = await response.json();
        console.log("Weather data received:", data);
        setWeather(data);
        setError(null);
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError(err.message || "Unable to load weather");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, [resolvedApiKey]);

  const getWeatherIcon = (weatherMain) => {
    const iconMap = {
      Clear: <FaSun className="text-lg text-amber-400" />,
      Clouds: <FaCloud className="text-lg text-slate-400" />,
      Rain: <FaCloudRain className="text-lg text-sky-500" />,
      Drizzle: <FaCloudRain className="text-lg text-sky-500" />,
      Snow: <FaSnowflake className="text-lg text-blue-200" />,
      Mist: <FaSmog className="text-lg text-slate-300" />,
      Fog: <FaSmog className="text-lg text-slate-300" />,
    };
    return iconMap[weatherMain] || <FaSun className="text-lg text-amber-400" />;
  };

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

  return (
    <div className="flex items-center justify-center gap-2 text-xs text-slate-700 dark:text-slate-200 w-full">
      <div className="flex-shrink-0">{getWeatherIcon(weather.weather[0].main)}</div>
      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
        <span className="font-semibold whitespace-nowrap">{Math.round(weather.main.temp)}°C</span>
        <span className="hidden sm:inline text-slate-500 dark:text-slate-400">•</span>
        <span className="capitalize text-slate-600 dark:text-slate-300 text-center sm:text-left">{weather.weather[0].description}</span>
      </div>
    </div>
  );
};

export default WeatherWidget;

