/* src/components/Sitemap.jsx
   STATIC map + Talking Trees (3 m proximity) + DIAGNOSTICS
   - Totally static (no zoom, drag, pan)
   - ErrorBoundary prints runtime errors on-screen
   - Defensive guards for polygons/POIs
   - Uses /public/images/north-arrow.jpeg for the compass
*/

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Circle,
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

/* ---------------- Error Boundary ---------------- */
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

/* --------------- Leaflet Icon Setup (safe) --------------- */
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

/* --------------- Custom Icons for POI Types using existing assets --------------- */
const createCustomIcon = (type) => {
  const iconConfigs = {
    trailhead: { 
      image: '/src/assets/hiking.png',
      color: '#10b981' 
    },
    farmhouse: { 
      image: '/src/assets/farm.png',
      color: '#8b5cf6' 
    },
    well: { 
      image: '/src/assets/water-well.png',
      color: '#3b82f6' 
    },
    sitting: { 
      image: '/src/assets/sitting.png',
      color: '#f59e0b' 
    },
    'yellow-birch': { 
      image: '/src/assets/birch.png',
      color: '#84cc16' 
    },
  };
  
  const config = iconConfigs[type] || { 
    image: '/src/assets/forest1.png', 
    color: '#ef4444' 
  };
  
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

function sanitizePolygonCoords(poly) {
  if (!Array.isArray(poly)) return [];
  const cleaned = poly.filter(isLatLngPair);
  if (cleaned.length !== poly.length) {
    console.warn("Polygon had invalid points; filtered some out.");
  }
  return cleaned;
}

export default function Sitemap() {
  /* ------- Debug logging ------- */
  console.log("Sitemap: mapData loaded:", !!mapData);
  console.log("Sitemap: mapData structure:", mapData ? Object.keys(mapData) : "No data");

  /* ------- Map data with strong guards ------- */
  const siteBorder = useMemo(() => {
    const raw = mapData?.areas?.siteBorder || mapData?.siteBorder || mapData?.border || [];
    const cleaned = sanitizePolygonCoords(raw);
    console.log("Sitemap: siteBorder coords:", cleaned.length);
    if (!cleaned.length && raw?.length) {
      console.warn("siteBorder provided but contained no valid [lat,lng] pairs.");
    }
    return cleaned;
  }, []);

  const areas = useMemo(() => {
    const rawAreas = mapData?.areas || {};
    const areaEntries = Object.entries(rawAreas).filter(([key, value]) => 
      key !== 'siteBorder' && Array.isArray(value)
    );
    
    return areaEntries.map(([key, coords]) => ({
      id: key,
      name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      color: "#16a34a",
      coords: sanitizePolygonCoords(coords),
    })).filter((a) => a.coords.length > 0);
  }, []);

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
    return cleaned;
  }, []);

  const center = useMemo(() => {
    const c = mapData?.center;
    if (c && typeof c.lat === "number" && typeof c.lng === "number") {
      return [c.lat, c.lng];
    }
    if (siteBorder.length) return [siteBorder[0][0], siteBorder[0][1]];
    if (pois.length) return [pois[0].lat, pois[0].lng];
    return [44.623917, -63.920472]; // fallback
  }, [siteBorder, pois]);

  /* ------- Geolocation ------- */
  const [watching, setWatching] = useState(false);
  const [userPos, setUserPos] = useState(null);
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

  /* ------- Render ------- */
  return (
    <ErrorBoundary>
      <div className="relative w-full" style={{ minHeight: "80vh" }}>
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
        <div
          style={{
            position: "absolute",
            left: 8,
            top: 8,
            zIndex: 10,
            display: "flex",
            gap: 8,
          }}
        >
          <button
            onClick={startWatch}
            style={{
              background: "#0369a1",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 6,
            }}
          >
            YOU ARE HERE
          </button>
          <button
            onClick={stopWatch}
            style={{
              background: "#404040",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 6,
            }}
          >
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
              background: "rgba(255,255,255,0.9)",
              color: "#111",
              padding: 8,
              borderRadius: 6,
            }}
          >
            {insideMsg}
          </div>
        )}

        {/* STATIC MAP */}
        <MapContainer
          center={center}
          zoom={16}
          style={{ height: "80vh", width: "100%", zIndex: 1 }}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
        >
          <DisableInteractions />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Site border */}
          {siteBorder.length > 0 && (
            <Polygon
              positions={siteBorder}
              pathOptions={{ color: "blue", weight: 2, fillOpacity: 0.08 }}
            />
          )}

          {/* Areas */}
          {areas.map((a) => (
            <Polygon
              key={a.id}
              positions={a.coords}
              pathOptions={{ color: a.color, weight: 2, fillOpacity: 0.08 }}
            />
          ))}

          {/* POIs */}
          {pois.map((p) => (
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
              <Marker position={[userPos.lat, userPos.lng]}>
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
            left: 0,
            right: 0,
            bottom: 16,
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(4px)",
              padding: 12,
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
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
      </div>
    </ErrorBoundary>
  );
}
