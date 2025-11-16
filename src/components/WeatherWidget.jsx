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
    </div>
  );
};

export default WeatherWidget;

