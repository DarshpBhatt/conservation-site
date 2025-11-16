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

  const locationLabel = "French Village, NS";

  const getWeatherIcon = (weatherMain) => {
    const iconMap = {
      Clear: <FaSun className="text-2xl text-amber-400" />,
      Clouds: <FaCloud className="text-2xl text-slate-400" />,
      Rain: <FaCloudRain className="text-2xl text-sky-500" />,
      Drizzle: <FaCloudRain className="text-2xl text-sky-500" />,
      Snow: <FaSnowflake className="text-2xl text-blue-200" />,
      Mist: <FaSmog className="text-2xl text-slate-300" />,
      Fog: <FaSmog className="text-2xl text-slate-300" />,
    };
    return iconMap[weatherMain] || <FaSun className="text-2xl text-amber-400" />;
  };

  const WidgetContainer = ({ children }) => (
    <div className="flex w-full max-w-[320px] items-center gap-3 rounded-2xl border border-white/50 bg-white/85 px-4 py-3 text-sm text-slate-700 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/75 dark:text-slate-100 sm:max-w-sm sm:px-5">
      {children}
    </div>
  );

  if (loading) {
    return (
      <WidgetContainer>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50/70 text-emerald-500 dark:bg-slate-800/70">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
        <div className="flex flex-1 flex-col text-center sm:text-left">
          <span className="text-[0.7rem] uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {locationLabel}
          </span>
          <span className="text-base font-semibold text-slate-600 dark:text-slate-300">Fetching weather...</span>
        </div>
      </WidgetContainer>
    );
  }

  if (error || !weather) {
    return (
      <WidgetContainer>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
          <IoLocationOutline className="text-xl" />
        </div>
        <div className="flex flex-1 flex-col text-center sm:text-left">
          <span className="text-[0.7rem] uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {locationLabel}
          </span>
          <span className="text-base font-semibold text-slate-600 dark:text-slate-300">Weather unavailable</span>
          {error && <span className="text-xs text-slate-400 dark:text-slate-500">Tap to retry later</span>}
        </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer>
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50/70 text-emerald-500 shadow-inner shadow-slate-900/5 dark:bg-slate-800/70">
        {getWeatherIcon(weather.weather[0].main)}
      </div>
      <div className="flex flex-1 flex-col text-center sm:text-left">
        <span className="text-[0.7rem] uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {locationLabel}
        </span>
        <span className="text-2xl font-semibold leading-tight text-slate-800 dark:text-white">
          {Math.round(weather.main.temp)}°C
        </span>
        <span className="text-sm capitalize text-slate-500 dark:text-slate-300">{weather.weather[0].description}</span>
      </div>
    </WidgetContainer>
  );
};

export default WeatherWidget;

