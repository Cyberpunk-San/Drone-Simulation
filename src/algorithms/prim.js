// Prim's Minimum Spanning Tree Algorithm (Vertex-Greedy)
function computePrim(nodes, adj, startNode) {
  const root = startNode || nodes[0].id;
  const inTree = new Set([root]);
  const used = [];
  let totalCost = 0;

  while (inTree.size < nodes.length) {
    let best = null;
    for (const u of inTree) {
      for (const { to, w, i } of (adj[u] || [])) {
        if (!inTree.has(to) && (!best || w < best.w)) {
          best = { u, to, w, i };
        }
      }
    }
    if (!best) break;
    inTree.add(best.to);
    used.push(best);
    totalCost += best.w;
  }

  return {
    root,
    used,
    totalCost,
    edgeIndices: used.map(b => b.i),
    summary: `Prim MST: ${used.length} links kept | Total Cost: ${totalCost.toFixed(2)} mm copper infrastructure.`
  };
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.computePrim = computePrim;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computePrim };
}
