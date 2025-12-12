/**
 * ================================================================================
 * File: Sitemap.jsx
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: Interactive trail map component with static view, geolocation tracking,
 * proximity-based audio triggers (Talking Trees), and real-time POI detection.
 * Uses Leaflet for map rendering and geospatial utilities for distance calculations.
 * ================================================================================
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  Circle,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import mapData from "../data/map.json";
import {
  pointInPolygon,
  distanceToPolygonMeters,
  getClosestPoiWithinRadius,
} from "../utils/geo";

// Import marker images
import hikingIcon from "../assets/hiking.png";
import farmIcon from "../assets/farm.png";
import wellIcon from "../assets/water-well.png";
import sittingIcon from "../assets/sitting.png";
import birchIcon from "../assets/birch.png";
import forestIcon from "../assets/homepage-banner.jpg";

// ============================================================================
// Icon Configuration
// ============================================================================

/**
 * Custom icon for user's current location marker
 * Uses divIcon for custom styling with gradient and shadow
 */
const userLocationIcon = L.divIcon({
  className: "user-location-icon",
  html: `<div style="
      width: 14px;
      height: 14px;
      border-radius: 9999px;
      border: 2px solid rgba(255,255,255,0.85);
      background: linear-gradient(135deg, #0ea5e9, #2563eb);
      box-shadow: 0 0 12px rgba(14,165,233,0.65);
    "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Default icon configuration for POIs without specific type
const DEFAULT_ICON_CONFIG = {
  image: forestIcon,
  color: "#ef4444",
};

// Icon configurations mapped to POI types
// Each type has custom image and color for visual distinction
const ICON_CONFIGS = {
  trailhead: {
    image: hikingIcon,
    color: "#10b981",
  },
  farmhouse: {
    image: farmIcon,
    color: "#8b5cf6",
  },
  well: {
    image: wellIcon,
    color: "#3b82f6",
  },
  sitting: {
    image: sittingIcon,
    color: "#f59e0b",
  },
  "yellow-birch": {
    image: birchIcon,
    color: "#84cc16",
  },
  exercise: {
    image: hikingIcon,
    color: "#0ea5e9",
  },
  telephone: {
    image: sittingIcon,
    color: "#f97316",
  },
  labyrinth: {
    image: forestIcon,
    color: "#14b8a6",
  },
};

// ============================================================================
// Constants
// ============================================================================

// Map view modes: overview shows all areas, trail focuses on trail path
const VIEW_MODES = {
  OVERVIEW: "overview",
  TRAIL: "trail",
};

// Offset for navigation bar height (prevents map from being hidden behind nav)
const NAV_LAYOUT_OFFSET_PX = 160;

// Styling for different conservation areas on map
const AREA_STYLES = {
  rewildingArea: {
    stroke: "#15803d",
    fill: "rgba(74, 222, 128, 0.28)",
    label: "Rewilding Area",
  },
  yellowBirchArea: {
    stroke: "#ca8a04",
    fill: "rgba(250, 204, 21, 0.25)",
    label: "Yellow Birch Area",
  },
  wetlandArea: {
    stroke: "#0ea5e9",
    fill: "rgba(14, 165, 233, 0.18)",
    label: "Wetland Area",
  },
};

// Ordered list of POI IDs along the trail route
// Used to filter and display trail markers in sequence
const TRAIL_POI_IDS = [
  "trailhead",
  "well1",
  "exercise-bar",
  "farmhouse",
  "sitting",
  "yellow-birch",
  "telephone-2",
  "labyrinth",
];

// ============================================================================
// Error Boundary Component
// ============================================================================

/**
 * ErrorBoundary - Catches runtime errors in map component and displays on-screen
 * Prevents entire app from crashing if map initialization or geolocation fails
 * Displays error message in red box for debugging
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(error) {
    return { err: error };
  }
  componentDidCatch(error, info) {
    console.error("Sitemap runtime error:", error, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 16, color: "#b91c1c", background: "#fef2f2" }}>
          <strong>Map error:</strong> {String(this.state.err?.message || this.state.err)}
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// Leaflet Icon Configuration
// ============================================================================

/**
 * Configure default Leaflet marker icons from CDN
 * Prevents missing icon errors when Leaflet tries to load default markers
 * Safe check ensures L.Icon exists before accessing
 */
if (L?.Icon?.Default) {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

/**
 * Create custom Leaflet icon for POI markers
 * Uses divIcon with HTML/CSS for custom styling per POI type
 * @param {string} type - POI type (trailhead, well, farmhouse, etc.)
 * @returns {L.DivIcon} Leaflet divIcon instance
 */
const createCustomIcon = (type) => {
  const config = ICON_CONFIGS[type] || DEFAULT_ICON_CONFIG;

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${config.color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      overflow: hidden;
    ">
      <img src="${config.image}" alt="${type}" style="
        width: 24px;
        height: 24px;
        object-fit: cover;
        border-radius: 50%;
      " />
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

/* --------------- Disable Interactions --------------- */
function DisableInteractions() {
  const map = useMapEvents({});
  map.dragging.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  map.touchZoom.disable();
  if (map.zoomControl) map.zoomControl.remove();
  return null;
}

/* --------------- Type guards --------------- */
function isLatLngPair(pair) {
  return (
    Array.isArray(pair) &&
    pair.length === 2 &&
    typeof pair[0] === "number" &&
    typeof pair[1] === "number"
  );
}

/**
 * Sanitize polygon coordinates by filtering invalid points
 * Prevents map rendering errors from malformed coordinate data
 * @param {Array} poly - Array of coordinate pairs
 * @returns {Array} Cleaned array of valid [lat, lng] pairs
 */
function sanitizePolygonCoords(poly) {
  if (!Array.isArray(poly)) return [];
  const cleaned = poly.filter(isLatLngPair);
  if (cleaned.length !== poly.length) {
    console.warn("Polygon had invalid points; filtered some out.");
  }
  return cleaned;
}

// ============================================================================
// Sitemap Component
// ============================================================================

/**
 * Sitemap Component - Interactive trail map with geolocation and proximity audio
 * Features static map view, real-time user tracking, and Talking Trees (3m proximity)
 * @returns {JSX.Element}
 */
export default function Sitemap() {
  // ============================================================================
  // State Management
  // ============================================================================
  
  // Detect mobile viewport for responsive layout adjustments
  const [isMobile, setIsMobile] = useState(false);
  // Current map view mode (overview or trail-focused)
  const [viewMode, setViewMode] = useState(VIEW_MODES.OVERVIEW);
  // Track when Leaflet map instance is ready for interaction
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  // ============================================================================
  // Side Effects
  // ============================================================================
  
  /**
   * Detect mobile viewport and update state on resize
   * 720px breakpoint matches Tailwind's md breakpoint
   */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 720);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Run once on mount, cleanup on unmount

  /**
   * Store Leaflet map instance reference when map is created
   * Allows programmatic map control (zoom, pan, etc.)
   */
  const handleMapCreated = (mapInstance) => {
    mapRef.current = mapInstance;
    setMapReady(true);
  };

  // ============================================================================
  // Data Processing (Memoized)
  // ============================================================================
  
  /**
   * Extract and sanitize site border polygon from map data
   * Multiple fallback paths handle different data structure versions
   * Memoized to avoid recalculation on every render
   */
  const siteBorder = useMemo(() => {
    const raw = mapData?.areas?.siteBorder || mapData?.siteBorder || mapData?.border || [];
    const cleaned = sanitizePolygonCoords(raw);
    if (!cleaned.length && raw?.length) {
      console.warn("siteBorder provided but contained no valid [lat,lng] pairs.");
    }
    return cleaned;
  }, []); // Process once on mount

  /**
   * Process conservation areas from map data
   * Filters out siteBorder and invalid entries, applies styling
   * Memoized to avoid recalculation on every render
   */
  const areas = useMemo(() => {
    const rawAreas = mapData?.areas || {};
    const areaEntries = Object.entries(rawAreas).filter(([key, value]) => 
      key !== 'siteBorder' && Array.isArray(value)
    );
    
    return areaEntries.map(([key, coords]) => ({
      id: key,
      name:
        AREA_STYLES[key]?.label ||
        key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      style: AREA_STYLES[key] || {
        stroke: "#15803d",
        fill: "rgba(34,197,94,0.15)",
      },
      coords: sanitizePolygonCoords(coords),
    })).filter((a) => a.coords.length > 0);
  }, []); // Process once on mount

  /**
   * Process points of interest (POIs) from map data
   * Validates coordinates and audio sources, filters invalid entries
   * Memoized to avoid recalculation on every render
   */
  const pois = useMemo(() => {
    const rawPois = Array.isArray(mapData?.pois) ? mapData.pois : [];
    const cleaned = rawPois.filter(
      (p) =>
        typeof p?.name === "string" &&
        typeof p?.lat === "number" &&
        typeof p?.lng === "number"
    );
    if (cleaned.length !== rawPois.length) {
      console.warn("Some POIs were invalid and were filtered out.");
    }
    return cleaned.map((poi) => {
      const audio =
        typeof poi.audioSrc === "string" && poi.audioSrc.trim().length
          ? poi.audioSrc
          : null;
      return { ...poi, audioSrc: audio };
    });
  }, []); // Process once on mount

  /**
   * Calculate map center point
   * Uses explicit center if provided, otherwise falls back to first border point or first POI
   * Final fallback is conservation site coordinates
   */
  const center = useMemo(() => {
    const c = mapData?.center;
    if (c && typeof c.lat === "number" && typeof c.lng === "number") {
      return [c.lat, c.lng];
    }
    if (siteBorder.length) return [siteBorder[0][0], siteBorder[0][1]];
    if (pois.length) return [pois[0].lat, pois[0].lng];
    // Fallback: conservation site coordinates (71 St. Pauls Lane)
    return [44.623917, -63.920472];
  }, [siteBorder, pois]); // Recalculate if border or POIs change

  // ============================================================================
  // Geolocation State
  // ============================================================================
  
  // Track whether geolocation watch is active
  const [watching, setWatching] = useState(false);
  // Current user position from geolocation API
  const [userPos, setUserPos] = useState(null);
  // Store watchPosition ID for cleanup
  const watchIdRef = useRef(null);

  const startWatch = () => {
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation not available.");
      return;
    }
    if (watchIdRef.current) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos({ lat: latitude, lng: longitude });
      },
      (err) => {
        console.warn("Geolocation error:", err);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
    watchIdRef.current = id;
    setWatching(true);
  };

  const stopWatch = () => {
    if (watchIdRef.current && navigator.geolocation.clearWatch) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = null;
    setWatching(false);
    setUserPos(null);
    setClosestPoi3m(null);
  };

  /* ------- Talking Trees (3 m / 15 s) ------- */
  const [closestPoi3m, setClosestPoi3m] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio();
    const onEnded = () => setIsPlaying(false);
    audioRef.current.addEventListener("ended", onEnded);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("ended", onEnded);
      }
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!watching || !userPos) {
      setClosestPoi3m(null);
      return;
    }
    const scan = () => {
      try {
        const res = getClosestPoiWithinRadius(pois, userPos, 3.0);
        setClosestPoi3m(res);
        setLastCheckedAt(new Date());
      } catch (e) {
        console.error("Scan error:", e);
      }
    };
    scan();
    const id = setInterval(scan, 15000);
    return () => clearInterval(id);
  }, [watching, userPos, pois]);

  const handlePlayPoiAudio = () => {
    if (!closestPoi3m?.poi?.audioSrc || !audioRef.current) return;
    try {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = closestPoi3m.poi.audioSrc;
      const p = audioRef.current.play();
      if (p && typeof p.then === "function") {
        p.then(() => setIsPlaying(true)).catch((e) => {
          console.warn("Audio play blocked/failed:", e);
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn("Audio error:", e);
      setIsPlaying(false);
    }
  };

  const handleStopAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  /* ------- Inside / Near text ------- */
  const insideMsg = useMemo(() => {
    try {
      if (!userPos || !siteBorder.length) return null;
      const inside = pointInPolygon(userPos, siteBorder);
      if (inside) return "You’re inside the Woodland Conservation Area.";
      const dist = distanceToPolygonMeters(userPos, siteBorder);
      if (dist <= 50) return "You’re near the Woodland Conservation Area.";
      return null;
    } catch (e) {
      console.warn("Inside/near calc error:", e);
      return null;
    }
  }, [userPos, siteBorder]);

  const displayPois = useMemo(() => {
    if (viewMode === VIEW_MODES.TRAIL) {
      const filtered = pois.filter((poi) => TRAIL_POI_IDS.includes(poi.id));
      return filtered.length ? filtered : pois;
    }
    return pois;
  }, [pois, viewMode]);

  const computeBounds = (points) => {
    if (!points.length) return null;
    const lats = points.map((p) => p[0]);
    const lngs = points.map((p) => p[1]);
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
  };

  const activeBounds = useMemo(() => {
    if (viewMode === VIEW_MODES.TRAIL) {
      const points = displayPois.map((poi) => [poi.lat, poi.lng]);
      return computeBounds(points);
    }
    const points = [];
    if (Array.isArray(siteBorder) && siteBorder.length) {
      points.push(...siteBorder);
    }
    areas.forEach((area) => {
      if (Array.isArray(area.coords) && area.coords.length) {
        points.push(...area.coords);
      }
    });
    if (!points.length) {
      displayPois.forEach((poi) => points.push([poi.lat, poi.lng]));
    }
    return computeBounds(points);
  }, [viewMode, displayPois, siteBorder, areas]);

  const displayCenter = useMemo(() => {
    if (!displayPois.length) return null;
    const avgLat =
      displayPois.reduce((acc, poi) => acc + poi.lat, 0) / displayPois.length;
    const avgLng =
      displayPois.reduce((acc, poi) => acc + poi.lng, 0) / displayPois.length;
    return [avgLat, avgLng];
  }, [displayPois]);

    const mapHeight = useMemo(() => `calc(100vh - ${NAV_LAYOUT_OFFSET_PX}px)`, []);
  const boundsPadding = useMemo(() => {
    const base = viewMode === VIEW_MODES.TRAIL ? 24 : 48;
    const mobileBase = viewMode === VIEW_MODES.TRAIL ? 16 : 32;
    return isMobile ? [mobileBase, mobileBase] : [base, base];
  }, [isMobile, viewMode]);
    const modeButtonClass = (mode) =>
    [
      "px-4 py-1.5 text-sm sm:text-base font-semibold rounded-full transition-all duration-200",
      viewMode === mode
        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
        : "bg-white/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-900/60",
    ].join(" ");
  const overlayButtonStyle = {
    background: "rgba(255,255,255,0.65)",
    color: "#0f172a",
    padding: "8px 18px",
    borderRadius: 9999,
    border: "1px solid rgba(255,255,255,0.5)",
    boxShadow: "0 12px 28px rgba(15,23,42,0.2)",
    backdropFilter: "blur(18px)",
    fontWeight: 600,
    fontSize: "0.75rem",
    letterSpacing: "0.02em",
  };
  const overlayDangerButtonStyle = {
    ...overlayButtonStyle,
    background: "rgba(220,38,38,0.9)",
    border: "1px solid rgba(255,255,255,0.6)",
    color: "#ffffff",
  };
  const controlPositionStyle = isMobile
    ? {
        position: "absolute",
        left: "50%",
        bottom: 20,
        transform: "translateX(-50%)",
        zIndex: 10,
        display: "flex",
        gap: 8,
      }
    : {
        position: "absolute",
        left: 12,
        top: 12,
        zIndex: 10,
        display: "flex",
        gap: 8,
      };
    const isTrailMode = viewMode === VIEW_MODES.TRAIL;
  const trailLineCoords = useMemo(() => {
    return TRAIL_POI_IDS.map((id) => {
      const poi = pois.find((p) => p.id === id);
      return poi ? [poi.lat, poi.lng] : null;
    }).filter(Boolean);
  }, [pois]);

    const legendTheme = useMemo(
      () => ({
        cardBg: "rgba(255,255,255,0.85)",
        cardBorder: "1px solid rgba(255,255,255,0.6)",
        cardShadow: "0 12px 32px rgba(15,23,42,0.15)",
        textColor: "#0f172a",
        headerColor: "#0f172a",
      }),
      []
    );

    const mapLegendItems = [
      { label: "Site Border", stroke: "#000", variant: "line" },
      {
        label: AREA_STYLES.rewildingArea.label,
        stroke: AREA_STYLES.rewildingArea.stroke,
        fill: AREA_STYLES.rewildingArea.fill,
      },
      {
        label: AREA_STYLES.yellowBirchArea.label,
        stroke: AREA_STYLES.yellowBirchArea.stroke,
        fill: AREA_STYLES.yellowBirchArea.fill,
      },
      {
        label: AREA_STYLES.wetlandArea.label,
        stroke: AREA_STYLES.wetlandArea.stroke,
        fill: AREA_STYLES.wetlandArea.fill,
      },
    ];

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 120);
  }, [mapReady, viewMode, isMobile]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !activeBounds) return;
    const map = mapRef.current;
    map.fitBounds(activeBounds, { padding: boundsPadding, animate: false });
    if (isTrailMode && displayCenter) {
      setTimeout(() => {
        if (!mapRef.current) return;
        const currentZoom =
          typeof map.getZoom === "function" ? map.getZoom() : map.getMaxZoom();
        const maxZoom =
          typeof map.getMaxZoom === "function" ? map.getMaxZoom() : 19;
        const desiredZoom = Math.min(currentZoom + 1.5, maxZoom - 0.5);
        map.setView(displayCenter, desiredZoom, { animate: false });
      }, 140);
    }
  }, [activeBounds, boundsPadding, isTrailMode, displayCenter, mapReady]);

  /* ------- Render ------- */
  return (
    <ErrorBoundary>
      <div
        className="relative w-full"
        style={{
          height: mapHeight,
          minHeight: mapHeight,
          maxHeight: mapHeight,
          overflow: "hidden",
        }}
      >
        {/* Mode toggle */}
        <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/40 bg-white/40 px-2 py-2 shadow-lg shadow-slate-900/10 backdrop-blur-2xl dark:border-slate-500/40 dark:bg-slate-900/40">
            <button
              type="button"
              className={modeButtonClass(VIEW_MODES.OVERVIEW)}
              onClick={() => setViewMode(VIEW_MODES.OVERVIEW)}
            >
              Overview
            </button>
            <button
              type="button"
              className={modeButtonClass(VIEW_MODES.TRAIL)}
              onClick={() => setViewMode(VIEW_MODES.TRAIL)}
            >
              Trail
            </button>
          </div>
        </div>

        {/* North arrow from /public/images */}
        <img
          src="/images/north-arrow.jpg"
          alt="North arrow"
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            height: 64,
            opacity: 0.9,
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 10,
          }}
        />

        {/* Controls */}
        <div style={controlPositionStyle}>
          <button onClick={startWatch} style={overlayButtonStyle}>
            Locate
          </button>
          <button onClick={stopWatch} style={overlayDangerButtonStyle}>
            Stop
          </button>
        </div>

        {/* Inside/Near notice */}
        {insideMsg && (
          <div
            style={{
              position: "absolute",
              left: 8,
              top: 56,
              zIndex: 10,
              background: "rgba(255,255,255,0.55)",
              color: "#111",
              padding: 8,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.35)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 10px 30px rgba(15,23,42,0.18)",
            }}
          >
            {insideMsg}
          </div>
        )}

        {/* STATIC MAP */}
        <MapContainer
          key={viewMode}
          center={center}
          bounds={activeBounds || undefined}
          boundsOptions={{ padding: boundsPadding }}
          style={{
            height: "100%",
            width: "100%",
            zIndex: 1,
          }}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          whenCreated={handleMapCreated}
        >
          <DisableInteractions />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Site border */}
            {viewMode === VIEW_MODES.OVERVIEW && siteBorder.length > 1 && (
              <Polyline
                positions={[...siteBorder, siteBorder[0]]}
                pathOptions={{ color: "#111", weight: 3, opacity: 1 }}
              >
                <Tooltip sticky direction="top">
                  Woodland Site Border
                </Tooltip>
              </Polyline>
            )}

          {/* Areas */}
          {viewMode === VIEW_MODES.OVERVIEW &&
            areas.map((a) => (
            <Polygon
              key={a.id}
              positions={a.coords}
              pathOptions={{
                color: a.style.stroke,
                weight: 2.2,
                fillColor: a.style.fill,
                fillOpacity: 1,
              }}
            >
              <Tooltip sticky direction="center">
                {a.name}
              </Tooltip>
            </Polygon>
            ))}

          {/* Trail line */}
          {viewMode === VIEW_MODES.TRAIL && trailLineCoords.length > 1 && (
            <Polyline
              positions={trailLineCoords}
              pathOptions={{ color: "#111", weight: 4, opacity: 0.9 }}
            />
          )}

          {/* POIs */}
          {viewMode === VIEW_MODES.TRAIL && displayPois.map((p) => (
            <Marker 
              key={p.id || `${p.lat},${p.lng}`} 
              position={[p.lat, p.lng]}
              icon={createCustomIcon(p.type)}
            >
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
                    {p.name}
                  </div>
                  {p.clickText && (
                    <div style={{ fontSize: 12, color: "#666", lineHeight: '1.4' }}>
                      {p.clickText}
                    </div>
                  )}
                  {p.audioSrc && (
                    <div style={{ marginTop: '8px', fontSize: 11, color: "#888" }}>
                      🔊 Audio available
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User */}
          {userPos && (
            <>
              <Marker position={[userPos.lat, userPos.lng]} icon={userLocationIcon}>
                <Popup>You are here</Popup>
              </Marker>
              <Circle
                center={[userPos.lat, userPos.lng]}
                radius={2}
                pathOptions={{ color: "#0ea5e9", weight: 1 }}
              />
            </>
          )}
        </MapContainer>

        {/* Talking Trees panel */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: isMobile ? 72 : 16,
            zIndex: 10,
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.48)",
              backdropFilter: "blur(18px)",
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.45)",
              boxShadow: "0 12px 30px rgba(15,23,42,0.2)",
              pointerEvents: "auto",
            }}
          >
            {!closestPoi3m && (
              <div style={{ fontSize: 14, color: "#111" }}>
                Move closer to a Talking Tree (within 3 m) to enable audio.
              </div>
            )}
            {closestPoi3m && (
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 14, color: "#111" }}>
                  <strong>{closestPoi3m.poi.name}</strong>{" "}
                  <span style={{ color: "#6b7280" }}>
                    ({closestPoi3m.distance.toFixed(1)} m)
                  </span>
                </div>
                {!isPlaying ? (
                  <button
                    onClick={handlePlayPoiAudio}
                    style={{
                      background: "#059669",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: 6,
                    }}
                  >
                    ▶ Play Audio
                  </button>
                ) : (
                  <button
                    onClick={handleStopAudio}
                    style={{
                      background: "#e11d48",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: 6,
                    }}
                  >
                    ■ Stop
                  </button>
                )}
              </div>
            )}
            {lastCheckedAt && (
              <div style={{ marginTop: 4, fontSize: 11, color: "#6b7280" }}>
                last check: {lastCheckedAt.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Legends */}
          {viewMode === VIEW_MODES.OVERVIEW && (
            <div
              style={{
                position: "absolute",
                right: 12,
                top: 100,
                zIndex: 20,
                padding: "12px 16px",
                borderRadius: 12,
                minWidth: 180,
                background: legendTheme.cardBg,
                border: legendTheme.cardBorder,
                boxShadow: legendTheme.cardShadow,
                color: legendTheme.textColor,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: 8,
                  fontSize: 14,
                  color: legendTheme.headerColor,
                }}
              >
                Map Legend
              </div>
              {mapLegendItems.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                    fontSize: 13,
                    color: legendTheme.textColor,
                  }}
                >
                  {item.variant === "line" ? (
                    <span
                      style={{
                        width: 32,
                        height: 3,
                        borderRadius: 999,
                        backgroundColor: item.stroke,
                        display: "inline-block",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 24,
                        height: 12,
                        borderRadius: 4,
                        border: `2px solid ${item.stroke}`,
                        background: item.fill,
                      }}
                    />
                  )}
                  {item.label}
                </div>
              ))}
            </div>
          )}

          {viewMode === VIEW_MODES.TRAIL && (
            <div
              style={{
                position: "absolute",
                right: 12,
                top: 100,
                zIndex: 20,
                padding: "12px 16px",
                borderRadius: 12,
                minWidth: 160,
                background: legendTheme.cardBg,
                border: legendTheme.cardBorder,
                boxShadow: legendTheme.cardShadow,
                color: legendTheme.textColor,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: 8,
                  fontSize: 14,
                  color: legendTheme.headerColor,
                }}
              >
                Trail Legend
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: legendTheme.textColor,
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 3,
                    background: "#000",
                    borderRadius: 999,
                    display: "inline-block",
                  }}
                />
                Main Trail
              </div>
            </div>
          )}

        {/* (Legend and trail timeline removed per request) */}
      </div>
    </ErrorBoundary>
  );
}
