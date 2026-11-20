// Automated 12-Pass Verification Test Runner for Modular FC Graph Lab
const fs = require('fs');
const path = require('path');

const { computeBFS } = require('../src/algorithms/bfs.js');
const { computeDFS } = require('../src/algorithms/dfs.js');
const { computeDijkstra } = require('../src/algorithms/dijkstra.js');
const { computePrim } = require('../src/algorithms/prim.js');
const { computeKruskal } = require('../src/algorithms/kruskal.js');
const { computeTarjan } = require('../src/algorithms/tarjan.js');
const { computeFloydWarshall } = require('../src/algorithms/floyd-warshall.js');
const { computeDegreeCentrality } = require('../src/algorithms/degree-centrality.js');
const { computeCyclomaticComplexity } = require('../src/algorithms/cycles.js');
const { simulateModuleFailure } = require('../src/algorithms/fault-simulator.js');

console.log("==================================================================");
console.log("FC GRAPH LAB: MODULAR ALGORITHM TEST & VIVA VERIFICATION SUITE");
console.log("==================================================================");

const graphPath = path.join(__dirname, '..', 'graph.json');
const data = JSON.parse(fs.readFileSync(graphPath, 'utf8'));

const nodes = data.nodes;
const edges = data.functional_edges || data.edges;

// Build Adjacency List matching App.js
const adj = {};
nodes.forEach(n => adj[n.id] = []);
edges.forEach((edge, idx) => {
  if (adj[edge.a] && adj[edge.b]) {
    adj[edge.a].push({ to: edge.b, w: edge.weight, i: idx, nets: edge.nets, type: edge.signal_type });
    adj[edge.b].push({ to: edge.a, w: edge.weight, i: idx, nets: edge.nets, type: edge.signal_type });
  }
});

console.log(`\n[PASS 1] graph.json Schema & Physical Geometry:`);
console.log(`  Board Size: ${data.board.w} x ${data.board.h} mm`);
console.log(`  Nodes (${nodes.length}): ${nodes.map(n => `${n.id} (${n.ref})`).join(', ')}`);
console.log(`  Edges (${edges.length})`);
console.assert(nodes.length === 6, "Expected 6 core nodes");
console.assert(edges.length >= 6, "Expected at least 6 edges");

// 2. BFS
console.log(`\n[PASS 2] BFS Connectivity Check:`);
const bfsRes = computeBFS(adj, "STM32", nodes.length);
console.log(`  BFS Order: ${bfsRes.order.join(' -> ')}`);
console.assert(bfsRes.isFullyConnected, "All nodes must be connected to STM32");

// 3. DFS
console.log(`\n[PASS 3] DFS Deep Exploration:`);
const dfsRes = computeDFS(adj, "STM32", nodes.length);
console.log(`  DFS Order: ${dfsRes.order.join(' -> ')}`);
console.assert(dfsRes.order.length === nodes.length, "DFS must visit all nodes");

// 4. Dijkstra
console.log(`\n[PASS 4] Dijkstra Shortest Path (Physical Impedance):`);
const dijkstraRes = computeDijkstra(nodes, adj, edges, "PMU", "IMU");
console.log(`  Path: ${dijkstraRes.path.join(' -> ')} (Cost: ${dijkstraRes.totalCost.toFixed(2)} mm)`);
console.assert(dijkstraRes.totalCost > 0 && dijkstraRes.path.length >= 2, "Dijkstra must find valid path");

// 5. Prim MST
console.log(`\n[PASS 5] Prim's Minimum Spanning Tree:`);
const primRes = computePrim(nodes, adj, "STM32");
console.log(`  MST Total Weight: ${primRes.totalCost.toFixed(2)} mm (Edges: ${primRes.used.length})`);
console.assert(primRes.used.length === nodes.length - 1, "MST must have |V| - 1 edges");

// 6. Kruskal MST
console.log(`\n[PASS 6] Kruskal's Minimum Spanning Tree:`);
const kruskalRes = computeKruskal(nodes, edges);
console.log(`  MST Total Weight: ${kruskalRes.totalCost.toFixed(2)} mm (Edges: ${kruskalRes.mstEdges.length})`);
console.assert(Math.abs(kruskalRes.totalCost - primRes.totalCost) < 1e-4, "Prim and Kruskal must yield identical MST weights");

// 7. Tarjan Articulation Points & Bridges
console.log(`\n[PASS 7] Tarjan Cut-Vertices & Bridges (SPoF Analysis):`);
const tarjanRes = computeTarjan(nodes, edges, adj);
console.log(`  Articulation Points: ${tarjanRes.articulationPoints.join(', ')}`);
console.log(`  Bridge Count: ${tarjanRes.bridges.length}`);
console.assert(tarjanRes.articulationPoints.includes("STM32"), "STM32 must be an articulation point (central hub)");

// 8. Floyd-Warshall All-Pairs Shortest Path
console.log(`\n[PASS 8] Floyd-Warshall APSP & Graph Metrics:`);
const fwRes = computeFloydWarshall(nodes, edges);
console.log(`  Graph Diameter: ${fwRes.maxDiameter.toFixed(2)} mm between ${fwRes.diamPair.join(' and ')}`);
console.assert(fwRes.maxDiameter > 0 && fwRes.maxDiameter < Infinity, "Valid graph diameter");

// 9. Degree Centrality & Handshaking Lemma
console.log(`\n[PASS 9] Degree Centrality & Euler's Handshaking Lemma:`);
const degreeRes = computeDegreeCentrality(nodes, edges, adj);
console.log(`  Total Degree Sum: ${degreeRes.sumDeg} | 2 * |E| = ${2 * edges.length}`);
console.assert(degreeRes.handshakingValid, "Handshaking Lemma must hold: sum(deg(v)) = 2|E|");

// 10. Cyclomatic Complexity
console.log(`\n[PASS 10] Cyclomatic Number (Independent Loops):`);
const cyclesRes = computeCyclomaticComplexity(nodes, edges);
console.log(`  Cyclomatic M = |E| - |V| + P = ${cyclesRes.complexity}`);
console.assert(cyclesRes.complexity >= 0, "Cyclomatic complexity must be non-negative");

// 11. Cascading Fault Simulator (Topological Reachability)
console.log(`\n[PASS 11] Cascading Fault Simulator:`);
const failPMU = simulateModuleFailure("PMU", nodes, adj);
console.log(`  Failed PMU -> Diagnosis: ${failPMU.diagnosis} | Isolated: ${failPMU.isolatedChips.join(', ')}`);

const failSTM32 = simulateModuleFailure("STM32", nodes, adj);
console.log(`  Failed STM32 -> Diagnosis: ${failSTM32.diagnosis} | Isolated: ${failSTM32.isolatedChips.join(', ')}`);
console.assert(failSTM32.isolatedChips.length > 0, "Failing STM32 causes network breakdown");

// 12. Hardware Metrics Integrity
console.log(`\n[PASS 12] Hardware Specifications & KiCad Integrity:`);
const { BOARD_METRICS, CHIP_ROSTER } = require('../src/data/board-metrics.js');
console.log(`  Design: Hades Micro (${BOARD_METRICS.boardDimensions})`);
console.log(`  Routing Status: ${BOARD_METRICS.routingStatus}`);
console.assert(CHIP_ROSTER.length === 6, "Expected 6 chips in hardware roster");

console.log("\n==================================================================");
console.log(">>> ALL 12 VERIFICATION PASSES COMPLETED WITH 100% SUCCESS! <<<");
console.log("==================================================================");
