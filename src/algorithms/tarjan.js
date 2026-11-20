// Tarjan's Bridge and Articulation Point (Single Point of Failure) Algorithm
function computeTarjan(nodes, edges, adj) {
  const disc = {};
  const low = {};
  const bridges = [];
  const artic = new Set();
  let time = 0;

  function dfs(u, parentEdge) {
    disc[u] = low[u] = ++time;
    let children = 0;
    for (const { to, i } of (adj[u] || [])) {
      if (i === parentEdge) continue;
      if (disc[to] !== undefined) {
        low[u] = Math.min(low[u], disc[to]);
      } else {
        children++;
        dfs(to, i);
        low[u] = Math.min(low[u], low[to]);
        if (low[to] > disc[u]) bridges.push(i);
        if (parentEdge !== null && low[to] >= disc[u]) artic.add(u);
      }
    }
    if (parentEdge === null && children > 1) artic.add(u);
  }

  nodes.forEach(n => {
    if (disc[n.id] === undefined) dfs(n.id, null);
  });

  return {
    bridges,
    articulationPoints: [...artic],
    summary: `Tarjan Analysis: ${artic.size} Articulation Points (${[...artic].join(', ')}), ${bridges.length} Bridges.`
  };
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.computeTarjan = computeTarjan;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeTarjan };
}
