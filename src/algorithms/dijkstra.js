// Dijkstra Shortest Path with Physical Trace mm + Via Penalties
function computeDijkstra(nodes, adj, edges, src, dst) {
  const dist = {};
  const prev = {};
  const done = new Set();

  nodes.forEach(n => dist[n.id] = Infinity);
  dist[src] = 0;

  while (done.size < nodes.length) {
    let u = null;
    for (const id in dist) {
      if (!done.has(id) && (u === null || dist[id] < dist[u])) u = id;
    }
    if (u === null || dist[u] === Infinity) break;
    done.add(u);

    for (const { to, w, i } of (adj[u] || [])) {
      if (dist[u] + w < dist[to]) {
        dist[to] = dist[u] + w;
        prev[to] = { from: u, edgeIdx: i, w };
      }
    }
  }

  if (dist[dst] === Infinity) {
    return { path: [], edgeList: [], totalCost: Infinity, reachable: false };
  }

  const path = [];
  const edgeList = [];
  let cur = dst;
  while (cur !== src && prev[cur]) {
    edgeList.unshift(prev[cur].edgeIdx);
    path.unshift(cur);
    cur = prev[cur].from;
  }
  path.unshift(src);

  return {
    path,
    edgeList,
    totalCost: dist[dst],
    reachable: true,
    summary: `Dijkstra Route: ${path.join(' -> ')} | Total Cost: ${dist[dst].toFixed(2)} mm (trace mm + 2.0mm/via).`
  };
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.computeDijkstra = computeDijkstra;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeDijkstra };
}
