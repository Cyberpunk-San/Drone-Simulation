// Degree Analysis and Handshaking Lemma (Σ deg(v) = 2|E|)
function computeDegreeCentrality(nodes, edges, adj) {
  const degrees = {};
  nodes.forEach(n => degrees[n.id] = (adj[n.id] || []).length);

  const sorted = Object.entries(degrees).sort((a, b) => b[1] - a[1]);
  const sumDeg = Object.values(degrees).reduce((a, b) => a + b, 0);
  const handshakingValid = sumDeg === 2 * edges.length;

  return {
    degrees,
    sorted,
    sumDeg,
    maxDeg: sorted[0] ? sorted[0][1] : 0,
    handshakingValid,
    summary: `Degree Analysis: Σ deg(v) = ${sumDeg} = 2 × ${edges.length} edges (${handshakingValid ? 'HANDSHAKING LEMMA VERIFIED' : 'ERROR'}).`
  };
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.computeDegreeCentrality = computeDegreeCentrality;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeDegreeCentrality };
}
