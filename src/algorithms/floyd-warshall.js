// Floyd-Warshall All-Pairs Shortest Paths Algorithm & Graph Diameter
function computeFloydWarshall(nodes, edges) {
  const ids = nodes.map(n => n.id);
  const N = ids.length;
  const idx = {};
  ids.forEach((id, i) => idx[id] = i);

  const dist = Array.from({ length: N }, () => Array(N).fill(Infinity));
  ids.forEach((_, i) => dist[i][i] = 0);

  edges.forEach(e => {
    const u = idx[e.a];
    const v = idx[e.b];
    if (u !== undefined && v !== undefined) {
      dist[u][v] = Math.min(dist[u][v], e.weight);
      dist[v][u] = Math.min(dist[v][u], e.weight);
    }
  });

  for (let k = 0; k < N; k++) {
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }

  let maxDiameter = 0;
  let diamPair = ['', ''];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      if (dist[i][j] < Infinity && dist[i][j] > maxDiameter) {
        maxDiameter = dist[i][j];
        diamPair = [ids[i], ids[j]];
      }
    }
  }

  return {
    ids,
    dist,
    maxDiameter,
    diamPair,
    summary: `Floyd-Warshall: O(V³) full distance matrix. PCB Diameter is ${maxDiameter.toFixed(2)} mm.`
  };
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.computeFloydWarshall = computeFloydWarshall;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeFloydWarshall };
}
