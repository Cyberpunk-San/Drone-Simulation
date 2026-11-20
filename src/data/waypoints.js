// Mission Waypoint Graph for Drone 2D Autonomous Navigation
const MISSION_WAYPOINTS = [
  { id: 'PAD-A', label: 'LAUNCH PAD A', x: 80,  y: 310, color: '#10b981', isPad: true },
  { id: 'WP-1',  label: 'WP-1 (ALPHA)',  x: 180, y: 130, color: '#38bdf8', isPad: false },
  { id: 'WP-2',  label: 'WP-2 (BRAVO)',  x: 310, y: 260, color: '#a855f7', isPad: false },
  { id: 'WP-3',  label: 'WP-3 (CHARLIE)',x: 350, y: 100, color: '#f59e0b', isPad: false },
  { id: 'WP-4',  label: 'WP-4 (DELTA)',  x: 490, y: 210, color: '#06b6d4', isPad: false },
  { id: 'PAD-B', label: 'TARGET PAD B', x: 580, y: 310, color: '#ef4444', isPad: true }
];

const MISSION_EDGES = [
  { from: 'PAD-A', to: 'WP-1', weight: 14.2 },
  { from: 'PAD-A', to: 'WP-2', weight: 24.5 },
  { from: 'WP-1',  to: 'WP-3', weight: 16.8 },
  { from: 'WP-2',  to: 'WP-3', weight: 14.3 },
  { from: 'WP-2',  to: 'WP-4', weight: 18.2 },
  { from: 'WP-3',  to: 'WP-4', weight: 15.6 },
  { from: 'WP-4',  to: 'PAD-B', weight: 12.8 },
  { from: 'WP-2',  to: 'PAD-B', weight: 26.4 }
];

// Dijkstra shortest path on the waypoint graph
function computeMissionDijkstra(startId = 'PAD-A', endId = 'PAD-B') {
  const adj = {};
  MISSION_WAYPOINTS.forEach(wp => adj[wp.id] = []);
  MISSION_EDGES.forEach(e => {
    adj[e.from].push({ to: e.to, w: e.weight });
    adj[e.to].push({ to: e.from, w: e.weight });
  });

  const dist = {};
  const prev = {};
  const visited = new Set();

  MISSION_WAYPOINTS.forEach(wp => dist[wp.id] = Infinity);
  dist[startId] = 0;

  while (visited.size < MISSION_WAYPOINTS.length) {
    let u = null;
    for (const wp of MISSION_WAYPOINTS) {
      if (!visited.has(wp.id) && (u === null || dist[wp.id] < dist[u])) {
        u = wp.id;
      }
    }
    if (u === null || dist[u] === Infinity || u === endId) break;
    visited.add(u);

    for (const { to, w } of adj[u]) {
      if (!visited.has(to) && dist[u] + w < dist[to]) {
        dist[to] = dist[u] + w;
        prev[to] = u;
      }
    }
  }

  const path = [];
  let curr = endId;
  while (curr) {
    path.unshift(curr);
    curr = prev[curr];
  }

  return {
    path: path[0] === startId ? path : [startId, endId],
    totalDistance: dist[endId] !== Infinity ? dist[endId] : 50.9
  };
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.MISSION_WAYPOINTS = MISSION_WAYPOINTS;
  window.FC.MISSION_EDGES = MISSION_EDGES;
  window.FC.computeMissionDijkstra = computeMissionDijkstra;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MISSION_WAYPOINTS, MISSION_EDGES, computeMissionDijkstra };
}
