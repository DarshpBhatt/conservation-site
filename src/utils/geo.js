/**
 * ================================================================================
 * File: geo.js
 * Author: ADM (Abhishek Darsh Manar) 2025 Fall - Software Engineering (CSCI-3428-1)
 * Description: Geospatial utility functions for calculating distances, point-in-polygon
 * tests, and finding nearest points of interest. Used by map components for location
 * services and proximity detection.
 * ================================================================================
 */

// ============================================================================
// Distance Calculations
// ============================================================================

/**
 * Calculate great-circle distance between two lat/lng points using Haversine formula
 * Accurate for distances up to ~20,000 km on Earth's surface
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  // Earth's radius in meters (mean radius)
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  // Haversine formula: a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================================================================
// Polygon Operations
// ============================================================================

/**
 * Determine if a point is inside a polygon using ray-casting algorithm
 * Ray-casting is efficient and handles complex polygons correctly
 * @param {Object} point - Point object with lat and lng properties
 * @param {Array<Array<number>>} polygon - Array of [lat, lng] coordinate pairs
 * @returns {boolean} True if point is inside polygon
 */
export function pointInPolygon(point, polygon) {
  const x = point.lng;
  const y = point.lat;
  let inside = false;

  // Ray-casting: count edge intersections with horizontal ray from point
  // Odd number of intersections = inside, even = outside
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1],
      yi = polygon[i][0];
    const xj = polygon[j][1],
      yj = polygon[j][0];

    // Check if ray crosses this edge
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Calculate minimum distance from point to polygon edge
 * Returns 0 if point is inside polygon, otherwise distance to nearest edge
 * @param {Object} point - Point object with lat and lng properties
 * @param {Array<Array<number>>} polygon - Array of [lat, lng] coordinate pairs
 * @returns {number} Distance in meters
 */
export function distanceToPolygonMeters(point, polygon) {
  // If point is inside polygon, distance is zero
  if (pointInPolygon(point, polygon)) return 0;

  // Find minimum distance to any polygon edge segment
  let min = Infinity;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length]; // Wrap to first point for last edge
    const d = _distancePointToSegmentMeters(point, a, b);
    if (d < min) min = d;
  }
  return min;
}

/**
 * Calculate distance from point to line segment (internal helper)
 * Uses equirectangular projection for local coordinate conversion
 * @param {Object} p - Point {lat, lng}
 * @param {Array<number>} a - Segment start [lat, lng]
 * @param {Array<number>} b - Segment end [lat, lng]
 * @returns {number} Distance in meters
 */
function _distancePointToSegmentMeters(p, a, b) {
  // Convert lat/lng to approximate meters using equirectangular projection
  // This is accurate for small distances (conservation site scale)
  const latScale = 111320; // meters per degree latitude (constant globally)
  // Longitude scale varies by latitude - calculate for segment midpoint
  const lonScale = 111320 * Math.cos(((a[0] + b[0]) / 2) * (Math.PI / 180));

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
  // Project point onto line segment, clamp to segment endpoints
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / (ab2 || 1)));
  // Closest point on segment
  const cx = ax + t * abx;
  const cy = ay + t * aby;

  // Distance from point to closest point on segment
  const dx = px - cx;
  const dy = py - cy;
  return Math.sqrt(dx * dx + dy * dy);
}

// ============================================================================
// Point of Interest (POI) Operations
// ============================================================================

/**
 * Find nearest point of interest within specified radius
 * Used by map component to detect when user is near trail markers
 * @param {Array<Object>} pois - Array of POI objects with lat and lng properties
 * @param {Object} user - User location object with lat and lng properties
 * @param {number} radiusMeters - Search radius in meters
 * @returns {Object|null} Object with poi and distance properties, or null if none found
 */
export function getClosestPoiWithinRadius(pois, user, radiusMeters) {
  // Validate inputs
  if (!user || !Array.isArray(pois) || !pois.length) return null;
  
  let closest = null;
  let best = Infinity;

  // Linear search through all POIs to find closest within radius
  // For small POI sets (<100), linear search is faster than spatial indexing
  for (const poi of pois) {
    // Skip POIs with invalid coordinates
    if (typeof poi.lat !== "number" || typeof poi.lng !== "number") continue;
    
    const d = haversineMeters(user.lat, user.lng, poi.lat, poi.lng);
    // Update closest if within radius and closer than previous best
    if (d <= radiusMeters && d < best) {
      best = d;
      closest = { poi, distance: d };
    }
  }
  return closest;
}
