// Depth-First Search (DFS) Traversal for High-Speed Loop & Feedback Exploration
function computeDFS(adj, startNode, totalNodeCount) {
  const seen = new Set([startNode]);
  const stack = [startNode];
  const order = [];
  const edgeSteps = [];

  while (stack.length) {
    const u = stack.pop();
    order.push(u);
    for (const neighbor of (adj[u] || [])) {
      if (!seen.has(neighbor.to)) {
        seen.add(neighbor.to);
        stack.push(neighbor.to);
        edgeSteps.push({ edgeIdx: neighbor.i, node: neighbor.to });
      }
    }
  }

  return {
    order,
    edgeSteps,
    summary: `DFS Depth Traversal from ${startNode}: Visited ${order.length}/${totalNodeCount} modules along deep branch traces.`
  };
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.computeDFS = computeDFS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeDFS };
}
