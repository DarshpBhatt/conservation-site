/* src/utils/geo.js
   Purpose: Geospatial helpers for Woodland site.
   - haversineMeters: distance (m) between two lat/lng points
   - pointInPolygon: ray-casting point-in-polygon test
   - distanceToPolygonMeters: approx min distance from point to polygon edge
   - getClosestPoiWithinRadius: nearest POI within a given radius (m)
*/

// --- Distance between two lat/lng points (meters) ---
export function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- Point in polygon (lat/lng array of [lat,lng]) ---
export function pointInPolygon(point, polygon) {
  // polygon: [[lat,lng], [lat,lng], ...]
  const x = point.lng;
  const y = point.lat;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1],
      yi = polygon[i][0];
    const xj = polygon[j][1],
      yj = polygon[j][0];

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// --- Approx min distance from point to polygon (meters) ---
export function distanceToPolygonMeters(point, polygon) {
  // If inside, distance is 0
  if (pointInPolygon(point, polygon)) return 0;

  // Otherwise, min distance to each segment (planar approx -> then scale)
  let min = Infinity;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const d = _distancePointToSegmentMeters(point, a, b);
    if (d < min) min = d;
  }
  return min;
}

function _distancePointToSegmentMeters(p, a, b) {
  // Convert to rough meters using local projection (simple equirectangular)
  const latScale = 111320; // meters per deg latitude
  const lonScale = 111320 * Math.cos(((a[0] + b[0]) / 2) * (Math.PI / 180)); // meters per deg longitude near segment

  const px = p.lng * lonScale;
  const py = p.lat * latScale;
  const ax = a[1] * lonScale;
  const ay = a[0] * latScale;
  const bx = b[1] * lonScale;
  const by = b[0] * latScale;

  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;

  const ab2 = abx * abx + aby * aby;
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / (ab2 || 1)));
  const cx = ax + t * abx;
  const cy = ay + t * aby;

  const dx = px - cx;
  const dy = py - cy;
  return Math.sqrt(dx * dx + dy * dy);
}

// --- Nearest POI within radius (m). Returns { poi, distance } or null ---
export function getClosestPoiWithinRadius(pois, user, radiusMeters) {
  if (!user || !Array.isArray(pois) || !pois.length) return null;
  let closest = null;
  let best = Infinity;

  for (const poi of pois) {
    if (typeof poi.lat !== "number" || typeof poi.lng !== "number") continue;
    const d = haversineMeters(user.lat, user.lng, poi.lat, poi.lng);
    if (d <= radiusMeters && d < best) {
      best = d;
      closest = { poi, distance: d };
    }
  }
  return closest;
}
