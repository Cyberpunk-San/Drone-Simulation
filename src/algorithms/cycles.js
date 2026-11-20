// Fundamental Cycle Finder & Cyclomatic Complexity (M = E - V + P)
function computeCyclomaticComplexity(nodes, edges, connectedComponents = 1) {
  const V = nodes.length;
  const E = edges.length;
  const P = connectedComponents;
  const M = E - V + P;

  return {
    vertices: V,
    edges: E,
    components: P,
    complexity: M,
    summary: `Cyclomatic Complexity M = |E| - |V| + P = ${E} - ${V} + ${P} = ${M} independent electrical cycles.`
  };
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.computeCyclomaticComplexity = computeCyclomaticComplexity;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeCyclomaticComplexity };
}
