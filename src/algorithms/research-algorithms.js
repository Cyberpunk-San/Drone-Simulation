// Research-Level Graph Theory Algorithms for PCB Design Applications
// Implements: Graph Coloring, Planarity, Max-Flow/Min-Cut, Spectral Analysis, Monte Carlo Reliability
(function() {
  window.FC = window.FC || {};

  // ================================================================
  // 1. GRAPH COLORING (Welsh-Powell Greedy Heuristic)
  // PCB Application: Minimum copper layer assignment for zero-crosstalk
  // ================================================================
  window.FC.graphColoring = function(nodes, adj) {
    var sorted = nodes.slice().sort(function(a, b) {
      return (adj[b.id] || []).length - (adj[a.id] || []).length;
    });

    var colors = {};
    var maxColor = 0;

    for (var si = 0; si < sorted.length; si++) {
      var node = sorted[si];
      var usedColors = {};
      var neighbors = adj[node.id] || [];
      for (var ni = 0; ni < neighbors.length; ni++) {
        if (colors[neighbors[ni].to] !== undefined) {
          usedColors[colors[neighbors[ni].to]] = true;
        }
      }
      var c = 0;
      while (usedColors[c]) c++;
      colors[node.id] = c;
      if (c > maxColor) maxColor = c;
    }

    var colorGroups = {};
    for (var id in colors) {
      var col = colors[id];
      if (!colorGroups[col]) colorGroups[col] = [];
      colorGroups[col].push(id);
    }

    return {
      colors: colors,
      chromaticNumber: maxColor + 1,
      colorGroups: colorGroups
    };
  };

  // ================================================================
  // 2. PLANARITY ANALYSIS (Euler formula + edge-count bound)
  // PCB Application: Single-layer routability assessment
  // ================================================================
  window.FC.planarityAnalysis = function(nodes, edges) {
    var V = nodes.length;
    var E = edges.length;
    var maxPlanarEdges = 3 * V - 6;
    var isPlanarByCount = E <= maxPlanarEdges;
    var maxPossibleEdges = V * (V - 1) / 2;
    var density = maxPossibleEdges > 0 ? E / maxPossibleEdges : 0;

    var degrees = {};
    nodes.forEach(function(n) { degrees[n.id] = 0; });
    edges.forEach(function(e) {
      var u = e.from || e.a;
      var v = e.to || e.b;
      degrees[u] = (degrees[u] || 0) + 1;
      degrees[v] = (degrees[v] || 0) + 1;
    });

    var degreeValues = Object.values(degrees).sort(function(a, b) { return b - a; });
    var avgDegree = degreeValues.reduce(function(s, d) { return s + d; }, 0) / V;
    var crossingLowerBound = Math.max(0, E - maxPlanarEdges);

    return {
      V: V, E: E,
      maxPlanarEdges: maxPlanarEdges,
      isPlanarByCount: isPlanarByCount,
      density: density,
      avgDegree: avgDegree,
      degrees: degrees,
      crossingLowerBound: crossingLowerBound,
      estimatedVias: crossingLowerBound,
      minLayers: isPlanarByCount ? 1 : Math.ceil(E / maxPlanarEdges) + 1
    };
  };

  // ================================================================
  // 3. MAX-FLOW / MIN-CUT (Edmonds-Karp BFS Augmentation)
  // PCB Application: Maximum power delivery capacity & bottleneck traces
  // ================================================================
  window.FC.maxFlow = function(nodes, edges, source, sink) {
    var nodeIds = nodes.map(function(n) { return n.id; });
    var cap = {};
    nodeIds.forEach(function(u) {
      cap[u] = {};
      nodeIds.forEach(function(v) { cap[u][v] = 0; });
    });

    edges.forEach(function(e) {
      var u = e.from || e.a;
      var v = e.to || e.b;
      var w = e.weight || e.cost || 10;
      var capacity = Math.round(1000 / w) / 10;
      cap[u][v] += capacity;
      cap[v][u] += capacity;
    });

    var flow = {};
    nodeIds.forEach(function(u) {
      flow[u] = {};
      nodeIds.forEach(function(v) { flow[u][v] = 0; });
    });

    var totalFlow = 0;
    var augPaths = [];

    function bfsPath() {
      var parent = {};
      var visited = {};
      visited[source] = true;
      var queue = [source];
      while (queue.length > 0) {
        var u = queue.shift();
        for (var vi = 0; vi < nodeIds.length; vi++) {
          var v = nodeIds[vi];
          if (!visited[v] && cap[u][v] - flow[u][v] > 0.001) {
            visited[v] = true;
            parent[v] = u;
            if (v === sink) return parent;
            queue.push(v);
          }
        }
      }
      return null;
    }

    var path;
    while ((path = bfsPath()) !== null) {
      var bottleneck = Infinity;
      var v = sink;
      var pathNodes = [sink];
      while (v !== source) {
        var u = path[v];
        var residual = cap[u][v] - flow[u][v];
        if (residual < bottleneck) bottleneck = residual;
        pathNodes.unshift(u);
        v = u;
      }
      v = sink;
      while (v !== source) {
        var u2 = path[v];
        flow[u2][v] += bottleneck;
        flow[v][u2] -= bottleneck;
        v = u2;
      }
      totalFlow += bottleneck;
      augPaths.push({ path: pathNodes, flow: Math.round(bottleneck * 100) / 100 });
    }

    var reachable = {};
    reachable[source] = true;
    var queue2 = [source];
    while (queue2.length > 0) {
      var u3 = queue2.shift();
      for (var vi2 = 0; vi2 < nodeIds.length; vi2++) {
        var v3 = nodeIds[vi2];
        if (!reachable[v3] && cap[u3][v3] - flow[u3][v3] > 0.001) {
          reachable[v3] = true;
          queue2.push(v3);
        }
      }
    }

    var minCutEdges = [];
    for (var ru in reachable) {
      for (var vi3 = 0; vi3 < nodeIds.length; vi3++) {
        var v4 = nodeIds[vi3];
        if (!reachable[v4] && cap[ru][v4] > 0) {
          minCutEdges.push({ from: ru, to: v4, capacity: cap[ru][v4] });
        }
      }
    }

    var edgeFlows = {};
    edges.forEach(function(e, i) {
      var eu = e.from || e.a;
      var ev = e.to || e.b;
      edgeFlows[i] = Math.round(Math.abs(flow[eu][ev]) * 100) / 100;
    });

    return {
      totalFlow: Math.round(totalFlow * 100) / 100,
      augPaths: augPaths,
      minCutEdges: minCutEdges,
      edgeFlows: edgeFlows,
      reachableFromSource: Object.keys(reachable)
    };
  };

  // ================================================================
  // 4. SPECTRAL GRAPH ANALYSIS (Laplacian + Jacobi Eigenvalues)
  // PCB Application: Algebraic connectivity measures board robustness
  // ================================================================
  window.FC.spectralAnalysis = function(nodes, edges) {
    var n = nodes.length;
    var nodeIds = nodes.map(function(nd) { return nd.id; });
    var idx = {};
    nodeIds.forEach(function(id, i) { idx[id] = i; });

    var adjMatrix = [];
    var i, j;
    for (i = 0; i < n; i++) {
      adjMatrix[i] = [];
      for (j = 0; j < n; j++) adjMatrix[i][j] = 0;
    }

    edges.forEach(function(e) {
      var u = idx[e.from || e.a];
      var v = idx[e.to || e.b];
      if (u !== undefined && v !== undefined) {
        adjMatrix[u][v] = 1;
        adjMatrix[v][u] = 1;
      }
    });

    var laplacian = [];
    for (i = 0; i < n; i++) {
      laplacian[i] = [];
      var deg = 0;
      for (j = 0; j < n; j++) deg += adjMatrix[i][j];
      for (j = 0; j < n; j++) {
        laplacian[i][j] = (i === j) ? deg : -adjMatrix[i][j];
      }
    }

    var eigenvalues = jacobiEigenvalues(laplacian, n);
    var sortedEigen = eigenvalues.slice().sort(function(a, b) { return a - b; });
    var fiedlerValue = sortedEigen.length > 1 ? sortedEigen[1] : 0;
    var spectralRadius = sortedEigen[n - 1] || 0;

    return {
      laplacian: laplacian,
      adjMatrix: adjMatrix,
      eigenvalues: sortedEigen.map(function(v) { return Math.round(v * 1000) / 1000; }),
      fiedlerValue: Math.round(Math.abs(fiedlerValue) * 1000) / 1000,
      spectralGap: Math.round(Math.abs(sortedEigen.length > 1 ? sortedEigen[1] - sortedEigen[0] : 0) * 1000) / 1000,
      spectralRadius: Math.round(spectralRadius * 1000) / 1000,
      nodeIds: nodeIds
    };
  };

  function jacobiEigenvalues(matrix, n) {
    var A = matrix.map(function(row) { return row.slice(); });
    var maxIter = 300;
    var iter, i, maxVal, p, q, j;

    for (iter = 0; iter < maxIter; iter++) {
      maxVal = 0; p = 0; q = 1;
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          if (Math.abs(A[i][j]) > maxVal) {
            maxVal = Math.abs(A[i][j]);
            p = i; q = j;
          }
        }
      }
      if (maxVal < 1e-10) break;

      var diff = A[q][q] - A[p][p];
      var t;
      if (Math.abs(diff) < 1e-10) { t = 1; }
      else {
        var phi = diff / (2 * A[p][q]);
        t = (phi >= 0 ? 1 : -1) / (Math.abs(phi) + Math.sqrt(phi * phi + 1));
      }
      var c = 1 / Math.sqrt(1 + t * t);
      var s = t * c;

      var app = A[p][p], aqq = A[q][q], apq = A[p][q];
      A[p][p] = c*c*app - 2*s*c*apq + s*s*aqq;
      A[q][q] = s*s*app + 2*s*c*apq + c*c*aqq;
      A[p][q] = A[q][p] = 0;

      for (i = 0; i < n; i++) {
        if (i !== p && i !== q) {
          var aip = A[i][p], aiq = A[i][q];
          A[i][p] = A[p][i] = c * aip - s * aiq;
          A[i][q] = A[q][i] = s * aip + c * aiq;
        }
      }
    }

    var eigenvalues = [];
    for (i = 0; i < n; i++) {
      eigenvalues.push(Math.abs(A[i][i]) < 1e-8 ? 0 : A[i][i]);
    }
    return eigenvalues;
  }

  // ================================================================
  // 5. MONTE CARLO NETWORK RELIABILITY SIMULATION
  // PCB Application: Probability that board remains functional under trace failures
  // ================================================================
  window.FC.monteCarloReliability = function(nodes, edges, trials) {
    trials = trials || 500;
    var failProbSteps = [0.0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80];
    var reliabilityCurve = [];

    for (var fi = 0; fi < failProbSteps.length; fi++) {
      var fp = failProbSteps[fi];
      var connected = 0;

      for (var t = 0; t < trials; t++) {
        var activeEdges = [];
        for (var ei = 0; ei < edges.length; ei++) {
          if (Math.random() > fp) activeEdges.push(edges[ei]);
        }
        var tempAdj = {};
        nodes.forEach(function(n) { tempAdj[n.id] = []; });
        activeEdges.forEach(function(e) {
          var u = e.from || e.a;
          var v = e.to || e.b;
          if (tempAdj[u]) tempAdj[u].push(v);
          if (tempAdj[v]) tempAdj[v].push(u);
        });
        var visited = {};
        visited[nodes[0].id] = true;
        var queue = [nodes[0].id];
        while (queue.length > 0) {
          var curr = queue.shift();
          var nbrs = tempAdj[curr] || [];
          for (var ni = 0; ni < nbrs.length; ni++) {
            if (!visited[nbrs[ni]]) {
              visited[nbrs[ni]] = true;
              queue.push(nbrs[ni]);
            }
          }
        }
        if (Object.keys(visited).length === nodes.length) connected++;
      }

      reliabilityCurve.push({
        failProb: fp,
        reliability: Math.round((connected / trials) * 1000) / 1000
      });
    }

    var critThreshold = 1.0;
    for (var ri = 0; ri < reliabilityCurve.length; ri++) {
      if (reliabilityCurve[ri].reliability < 0.5) {
        critThreshold = reliabilityCurve[ri].failProb;
        break;
      }
    }

    return {
      reliabilityCurve: reliabilityCurve,
      trials: trials,
      criticalThreshold: critThreshold
    };
  };

  // ================================================================
  // 6. STEINER TREE APPROXIMATION (MST-based 2-approximation)
  // PCB Application: Optimal routing for a specific signal net (subset of nodes)
  // ================================================================
  window.FC.steinerTreeApprox = function(nodes, edges, adj, terminals) {
    if (!terminals || terminals.length < 2) return { edges: [], cost: 0 };

    // Dijkstra from each terminal to build metric closure
    function dijkstraFrom(src) {
      var dist = {};
      var prev = {};
      nodes.forEach(function(n) { dist[n.id] = Infinity; });
      dist[src] = 0;
      var done = {};

      for (var step = 0; step < nodes.length; step++) {
        var u = null;
        for (var id in dist) {
          if (!done[id] && (u === null || dist[id] < dist[u])) u = id;
        }
        if (u === null || dist[u] === Infinity) break;
        done[u] = true;
        var nbrs = adj[u] || [];
        for (var ni = 0; ni < nbrs.length; ni++) {
          var nb = nbrs[ni];
          if (dist[u] + nb.w < dist[nb.to]) {
            dist[nb.to] = dist[u] + nb.w;
            prev[nb.to] = u;
          }
        }
      }
      return { dist: dist, prev: prev };
    }

    // Metric closure: shortest path between every pair of terminals
    var closureEdges = [];
    var shortPaths = {};
    for (var ti = 0; ti < terminals.length; ti++) {
      shortPaths[terminals[ti]] = dijkstraFrom(terminals[ti]);
    }

    for (var i = 0; i < terminals.length; i++) {
      for (var j = i + 1; j < terminals.length; j++) {
        var d = shortPaths[terminals[i]].dist[terminals[j]];
        if (d < Infinity) {
          closureEdges.push({ a: terminals[i], b: terminals[j], weight: d });
        }
      }
    }

    // MST on the metric closure (Kruskal)
    closureEdges.sort(function(a, b) { return a.weight - b.weight; });
    var parent = {};
    terminals.forEach(function(t) { parent[t] = t; });
    function find(x) {
      while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
      return x;
    }

    var mstEdges = [];
    var totalCost = 0;
    for (var ei = 0; ei < closureEdges.length; ei++) {
      var ce = closureEdges[ei];
      var ra = find(ce.a), rb = find(ce.b);
      if (ra !== rb) {
        parent[ra] = rb;
        mstEdges.push(ce);
        totalCost += ce.weight;
      }
    }

    // Reconstruct paths on original graph
    var steinerEdgeIndices = [];
    var steinerNodes = {};
    terminals.forEach(function(t) { steinerNodes[t] = true; });

    for (var mi = 0; mi < mstEdges.length; mi++) {
      var me = mstEdges[mi];
      var prev = shortPaths[me.a].prev;
      var curr = me.b;
      while (curr && curr !== me.a) {
        steinerNodes[curr] = true;
        var from = prev[curr];
        if (from) {
          for (var eii = 0; eii < edges.length; eii++) {
            var eg = edges[eii];
            var eu = eg.from || eg.a;
            var ev = eg.to || eg.b;
            if ((eu === from && ev === curr) || (eu === curr && ev === from)) {
              if (steinerEdgeIndices.indexOf(eii) === -1) steinerEdgeIndices.push(eii);
            }
          }
        }
        curr = from;
      }
    }

    return {
      steinerEdgeIndices: steinerEdgeIndices,
      steinerNodes: Object.keys(steinerNodes),
      totalCost: Math.round(totalCost * 100) / 100,
      terminalCount: terminals.length,
      mstClosureEdges: mstEdges
    };
  };

})();
