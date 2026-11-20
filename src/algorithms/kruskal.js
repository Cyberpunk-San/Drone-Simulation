// Kruskal's Minimum Spanning Tree Algorithm with Disjoint Set Union (Union-Find)
function computeKruskal(nodes, edges) {
  const parent = {};
  const rank = {};
  nodes.forEach(n => { parent[n.id] = n.id; rank[n.id] = 0; });

  function find(i) {
    if (parent[i] === i) return i;
    return parent[i] = find(parent[i]);
  }
  function union(i, j) {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI === rootJ) return false;
    if (rank[rootI] < rank[rootJ]) parent[rootI] = rootJ;
    else if (rank[rootI] > rank[rootJ]) parent[rootJ] = rootI;
    else { parent[rootJ] = rootI; rank[rootI]++; }
    return true;
  }

  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  const mstEdges = [];
  let cost = 0;

  for (const e of sortedEdges) {
    if (union(e.a, e.b)) {
      mstEdges.push(e);
      cost += e.weight;
      if (mstEdges.length === nodes.length - 1) break;
    }
  }

  return {
    mstEdges,
    totalCost: cost,
    edgeIndices: mstEdges.map(e => e.i),
    summary: `Kruskal MST: ${mstEdges.length} edges selected | Total Cost: ${cost.toFixed(2)} mm.`
  };
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.computeKruskal = computeKruskal;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeKruskal };
}
