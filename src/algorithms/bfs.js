// Breadth-First Search (BFS) Traversal for PCB Connectivity Validation
function computeBFS(adj, startNode, totalNodeCount) {
  const seen = new Set([startNode]);
  const queue = [startNode];
  const order = [];
  const edgeSteps = [];

  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    for (const neighbor of (adj[u] || [])) {
      if (!seen.has(neighbor.to)) {
        seen.add(neighbor.to);
        queue.push(neighbor.to);
        edgeSteps.push({ edgeIdx: neighbor.i, node: neighbor.to });
      }
    }
  }

  const isFullyConnected = order.length === totalNodeCount;
  return {
    order,
    edgeSteps,
    isFullyConnected,
    summary: `BFS Traversal from ${startNode}: Reached ${order.length}/${totalNodeCount} modules. Status: ${isFullyConnected ? 'CONNECTED' : 'DISCONNECTED'}.`
  };
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.computeBFS = computeBFS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeBFS };
}
