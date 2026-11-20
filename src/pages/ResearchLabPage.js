// AEROLAB Screen 07 — Research Lab: Graph Theory x PCB Design
// Demonstrates how 6 research-level graph theory concepts directly solve PCB engineering problems
function ResearchLabPage({ graphData }) {
  const nodes = (graphData && graphData.nodes) || [];
  const edges = (graphData && (graphData.functional_edges || graphData.edges)) || [];
  const allEdges = (graphData && graphData.functional_edges || []).concat(graphData && graphData.aux_edges || []);

  const [activeConcept, setActiveConcept] = React.useState('coloring');

  // Coordinate normalizer (KiCad 50.1 x 50.1mm board)
  const normX = (x) => ((x - 19.95) / 50.1) * 100;
  const normY = (y) => ((y - 19.95) / 50.1) * 100;

  // Build adjacency list
  const adj = React.useMemo(() => {
    var a = {};
    nodes.forEach(function(n) { a[n.id] = []; });
    edges.forEach(function(e, i) {
      var u = e.from || e.a;
      var v = e.to || e.b;
      var w = e.weight || e.cost || 10;
      if (a[u]) a[u].push({ to: v, w: w, i: i });
      if (a[v]) a[v].push({ to: u, w: w, i: i });
    });
    return a;
  }, [nodes, edges]);

  // Steiner tree terminal selection
  const [steinerTerminals, setSteinerTerminals] = React.useState(['PMU', 'STM32', 'ESC']);
  // Max-flow source/sink
  const [flowSource, setFlowSource] = React.useState('PMU');
  const [flowSink, setFlowSink] = React.useState('GPS');

  // ======================================================================
  // Compute results for active concept using useMemo (synchronous, safe)
  // ======================================================================
  const coloringResult = React.useMemo(() => {
    if (!window.FC || !window.FC.graphColoring || nodes.length === 0) return null;
    return window.FC.graphColoring(nodes, adj);
  }, [nodes, adj]);

  const planarityResult = React.useMemo(() => {
    if (!window.FC || !window.FC.planarityAnalysis || nodes.length === 0) return null;
    var funcResult = window.FC.planarityAnalysis(nodes, edges);
    var fullResult = window.FC.planarityAnalysis(nodes, allEdges.length > 0 ? allEdges : edges);
    return { functional: funcResult, full: fullResult };
  }, [nodes, edges, allEdges]);

  const flowResult = React.useMemo(() => {
    if (!window.FC || !window.FC.maxFlow || nodes.length === 0) return null;
    return window.FC.maxFlow(nodes, edges, flowSource, flowSink);
  }, [nodes, edges, flowSource, flowSink]);

  const spectralResult = React.useMemo(() => {
    if (!window.FC || !window.FC.spectralAnalysis || nodes.length === 0) return null;
    return window.FC.spectralAnalysis(nodes, edges);
  }, [nodes, edges]);

  const reliabilityResult = React.useMemo(() => {
    if (!window.FC || !window.FC.monteCarloReliability || nodes.length === 0) return null;
    return window.FC.monteCarloReliability(nodes, edges, 500);
  }, [nodes, edges]);

  const steinerResult = React.useMemo(() => {
    if (!window.FC || !window.FC.steinerTreeApprox || nodes.length === 0) return null;
    return window.FC.steinerTreeApprox(nodes, edges, adj, steinerTerminals);
  }, [nodes, edges, adj, steinerTerminals]);

  // Color palette for graph coloring visualization
  const layerColors = ['#55C8E8', '#F2B45B', '#36C98F', '#F06B70', '#a855f7', '#06b6d4'];
  const layerNames = ['Layer A (F.Cu)', 'Layer B (B.Cu)', 'Layer C (In1.Cu)', 'Layer D (In2.Cu)', 'Layer E', 'Layer F'];

  // Concept metadata
  const concepts = [
    {
      id: 'coloring',
      title: 'Graph Coloring',
      subtitle: 'Copper Layer Assignment',
      tag: 'NP-HARD',
      icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
      desc: 'The chromatic number determines the minimum number of copper layers needed so no two adjacent signal traces share a layer, preventing electromagnetic crosstalk.',
      formula: 'Chromatic Number: min k such that G is k-colorable'
    },
    {
      id: 'planarity',
      title: 'Planarity Testing',
      subtitle: 'Single-Layer Routability',
      tag: 'KURATOWSKI',
      icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z',
      desc: 'By Kuratowski/Wagner theorem, a planar graph can be routed on a single copper layer. If E > 3V-6, the graph is non-planar and multi-layer routing with vias is structurally required.',
      formula: 'Planar iff no K5 or K3,3 subdivision; necessary: E <= 3V - 6'
    },
    {
      id: 'maxflow',
      title: 'Max-Flow / Min-Cut',
      subtitle: 'Power Delivery Capacity',
      tag: 'FORD-FULKERSON',
      icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
      desc: 'The max-flow theorem (Ford-Fulkerson / Edmonds-Karp) finds the maximum power delivery capacity from PMU to any module. The min-cut identifies the bottleneck traces that limit current.',
      formula: 'Max Flow = Min Cut (Ford-Fulkerson duality theorem)'
    },
    {
      id: 'spectral',
      title: 'Spectral Analysis',
      subtitle: 'Algebraic Connectivity',
      tag: 'FIEDLER',
      icon: 'M3 3v18h18M9 17V9l4 8V5l4 12',
      desc: 'The Fiedler value (second-smallest Laplacian eigenvalue) quantifies how well-connected the board is. Higher algebraic connectivity means the board is more robust against trace cuts.',
      formula: 'Fiedler value = second smallest eigenvalue of Laplacian L = D - A'
    },
    {
      id: 'reliability',
      title: 'Monte Carlo Reliability',
      subtitle: 'Stochastic Failure Analysis',
      tag: 'PROBABILISTIC',
      icon: 'M12 20V10M18 20V4M6 20v-4',
      desc: 'Monte Carlo simulation randomly fails traces with probability p and measures the probability that all modules remain connected. Reveals the critical failure threshold for the board.',
      formula: 'R(p) = P(G connected | each edge fails independently with prob p)'
    },
    {
      id: 'steiner',
      title: 'Steiner Tree',
      subtitle: 'Optimal Net Routing',
      tag: 'NP-HARD',
      icon: 'M6 3v12M18 9a3 3 0 01-3 3h-6M12 3v18',
      desc: 'The Steiner Tree Problem finds the minimum-cost subgraph connecting a signal net (subset of terminals). This directly models PCB net routing: connect required pads with minimal copper.',
      formula: 'Minimum-weight tree spanning terminal set T, allowing Steiner points from V \\ T'
    }
  ];

  const active = concepts.find(function(c) { return c.id === activeConcept; });

  // Get node color for current concept
  const getNodeColor = (nodeId) => {
    if (activeConcept === 'coloring' && coloringResult) {
      return layerColors[coloringResult.colors[nodeId] || 0];
    }
    if (activeConcept === 'steiner' && steinerResult) {
      if (steinerTerminals.includes(nodeId)) return '#F2B45B';
      if ((steinerResult.steinerNodes || []).includes(nodeId)) return '#36C98F';
      return '#1A2A3A';
    }
    if (activeConcept === 'maxflow' && flowResult) {
      if (nodeId === flowSource) return '#36C98F';
      if (nodeId === flowSink) return '#F06B70';
      if ((flowResult.reachableFromSource || []).includes(nodeId)) return '#55C8E8';
      return '#1A2A3A';
    }
    var nd = nodes.find(function(n) { return n.id === nodeId; });
    return (nd && nd.color) || '#55C8E8';
  };

  // Get edge style for current concept
  const getEdgeStyle = (edgeIdx) => {
    if (activeConcept === 'maxflow' && flowResult) {
      var f = (flowResult.edgeFlows || {})[edgeIdx] || 0;
      var maxF = Math.max.apply(null, Object.values(flowResult.edgeFlows || { 0: 1 }));
      var ratio = maxF > 0 ? f / maxF : 0;
      var isCut = (flowResult.minCutEdges || []).some(function(mc) {
        var e = edges[edgeIdx];
        var eu = e.from || e.a;
        var ev = e.to || e.b;
        return (mc.from === eu && mc.to === ev) || (mc.from === ev && mc.to === eu);
      });
      return {
        color: isCut ? '#F06B70' : (ratio > 0.3 ? '#36C98F' : '#223244'),
        width: 2 + ratio * 5,
        dash: isCut ? '5 3' : 'none'
      };
    }
    if (activeConcept === 'steiner' && steinerResult) {
      var isInTree = (steinerResult.steinerEdgeIndices || []).includes(edgeIdx);
      return {
        color: isInTree ? '#F2B45B' : '#151f2b',
        width: isInTree ? 4 : 1.5,
        dash: isInTree ? 'none' : '2 3'
      };
    }
    if (activeConcept === 'coloring' && coloringResult) {
      var e2 = edges[edgeIdx];
      var eu2 = e2.from || e2.a;
      var ev2 = e2.to || e2.b;
      var cA = coloringResult.colors[eu2];
      var cB = coloringResult.colors[ev2];
      return {
        color: (cA !== cB) ? '#334D66' : '#F06B70',
        width: 2.5,
        dash: 'none'
      };
    }
    return { color: '#223244', width: 2, dash: 'none' };
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 h-[calc(100vh-6.5rem)] min-h-[640px]">
      {/* 1. LEFT: Research Concept Catalogue (240px) */}
      <div className="w-full xl:w-64 bg-panel border border-subtle rounded-xl flex flex-col shrink-0 select-none overflow-hidden">
        <div className="h-12 bg-sidebar border-b border-subtle px-4 flex items-center justify-between shrink-0">
          <span className="text-xs font-mono font-bold text-accent-cyan tracking-wider uppercase">
            RESEARCH CONCEPTS
          </span>
          <span className="text-[10px] font-mono text-muted">6 ALGORITHMS</span>
        </div>

        <div className="p-3 flex-1 overflow-y-auto space-y-2 text-xs font-mono">
          {concepts.map(function(concept) {
            var isActive = activeConcept === concept.id;
            return (
              <button
                key={concept.id}
                onClick={function() { setActiveConcept(concept.id); }}
                className={'w-full text-left p-3 rounded-lg border transition ' + (
                  isActive
                    ? 'bg-sky-500/15 border-sky-400/50 text-accent-cyan shadow-[0_0_12px_rgba(85,200,232,0.12)]'
                    : 'bg-elevated hover:bg-hover border-subtle text-secondary hover:text-primary'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold font-sans text-xs">{concept.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/40 text-accent-amber text-[8px] font-bold tracking-wider shrink-0">
                    {concept.tag}
                  </span>
                </div>
                <div className="text-[10px] text-muted mt-1 leading-snug">
                  {concept.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER: PCB Graph Visualization + Theory Card */}
      <div className="flex-1 bg-panel border border-subtle rounded-xl flex flex-col overflow-hidden relative">
        {/* Concept Header */}
        <div className="bg-sidebar border-b border-subtle px-5 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 shrink-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-primary font-sans uppercase tracking-wide">
                {active ? active.title : ''}
              </h2>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-accent-amber border border-amber-500/30 font-mono text-[10px] font-bold">
                {active ? active.tag : ''}
              </span>
              <span className="text-xs text-muted font-mono">
                {active ? active.subtitle : ''}
              </span>
            </div>
            <p className="text-[11px] text-secondary mt-1 max-w-2xl leading-relaxed font-sans">
              {active ? active.desc : ''}
            </p>
          </div>

          {/* Concept-specific controls */}
          {activeConcept === 'maxflow' && (
            <div className="flex items-center gap-3 text-xs font-mono shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-muted text-[11px]">SOURCE:</span>
                <select value={flowSource} onChange={function(e) { setFlowSource(e.target.value); }}
                  className="bg-elevated border border-subtle rounded px-2 py-1 text-primary text-xs font-mono focus:outline-none focus:border-accent-cyan">
                  {nodes.map(function(n) { return <option key={n.id} value={n.id}>{n.id}</option>; })}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted text-[11px]">SINK:</span>
                <select value={flowSink} onChange={function(e) { setFlowSink(e.target.value); }}
                  className="bg-elevated border border-subtle rounded px-2 py-1 text-primary text-xs font-mono focus:outline-none focus:border-accent-cyan">
                  {nodes.map(function(n) { return <option key={n.id} value={n.id}>{n.id}</option>; })}
                </select>
              </div>
            </div>
          )}

          {activeConcept === 'steiner' && (
            <div className="flex items-center gap-2 text-xs font-mono shrink-0 flex-wrap">
              <span className="text-muted text-[11px]">TERMINALS:</span>
              {nodes.map(function(n) {
                var isT = steinerTerminals.includes(n.id);
                return (
                  <button key={n.id} onClick={function() {
                    if (isT) setSteinerTerminals(steinerTerminals.filter(function(t) { return t !== n.id; }));
                    else setSteinerTerminals(steinerTerminals.concat([n.id]));
                  }}
                    className={'px-2 py-0.5 rounded border text-[10px] font-bold transition ' + (
                      isT ? 'bg-amber-500/20 text-accent-amber border-amber-500/40' : 'bg-elevated text-muted border-subtle hover:text-secondary'
                    )}>
                    {n.id}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Graph Canvas */}
        <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-black/40">
          <div className="relative w-[480px] h-[480px] select-none">
            <img src="pcb.svg" alt="PCB" className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-25 rounded-lg"
              onError={function(e) { e.target.style.display = 'none'; }} />

            <svg className="absolute inset-0 w-full h-full z-10">
              <defs>
                <filter id="researchGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Edges */}
              {edges.map(function(edge, idx) {
                var srcNode = nodes.find(function(n) { return n.id === (edge.from || edge.a); });
                var dstNode = nodes.find(function(n) { return n.id === (edge.to || edge.b); });
                if (!srcNode || !dstNode) return null;

                var x1 = (normX(srcNode.x) / 100) * 480;
                var y1 = (normY(srcNode.y) / 100) * 480;
                var x2 = (normX(dstNode.x) / 100) * 480;
                var y2 = (normY(dstNode.y) / 100) * 480;
                var style = getEdgeStyle(idx);

                return (
                  <g key={'re-' + idx}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={style.color} strokeWidth={style.width}
                      strokeDasharray={style.dash}
                      filter={style.width > 3 ? 'url(#researchGlow)' : undefined}
                      className="transition-all duration-300" />
                    {activeConcept === 'maxflow' && flowResult && (flowResult.edgeFlows || {})[idx] > 0 && (
                      <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6}
                        textAnchor="middle" fill="#E6EDF3" fontSize="9"
                        fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                        {((flowResult.edgeFlows || {})[idx] || 0).toFixed(1)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map(function(node) {
                var cx = (normX(node.x) / 100) * 480;
                var cy = (normY(node.y) / 100) * 480;
                var fillColor = getNodeColor(node.id);
                var radius = 12;
                var isTerminal = activeConcept === 'steiner' && steinerTerminals.includes(node.id);
                var isFlowEnd = activeConcept === 'maxflow' && (node.id === flowSource || node.id === flowSink);

                return (
                  <g key={'rn-' + node.id}>
                    {(isTerminal || isFlowEnd) && (
                      <circle cx={cx} cy={cy} r={radius + 7} fill="none"
                        stroke={fillColor} strokeWidth="2" className="animate-ping opacity-60" />
                    )}
                    <circle cx={cx} cy={cy} r={radius} fill={fillColor}
                      stroke="#0B121B" strokeWidth="2.5"
                      filter={(isTerminal || isFlowEnd) ? 'url(#researchGlow)' : undefined} />
                    <g transform={'translate(' + cx + ', ' + (cy + radius + 12) + ')'}>
                      <rect x="-24" y="-7.5" width="48" height="15" rx="3"
                        fill="#0B121B" stroke={fillColor} strokeWidth="1" opacity="0.95" />
                      <text textAnchor="middle" dy="3.5" fill="#E6EDF3" fontSize="9"
                        fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                        {node.id}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Formula Footer */}
        <div className="h-10 bg-sidebar border-t border-subtle px-5 flex items-center justify-between text-[11px] font-mono shrink-0">
          <span className="text-secondary">
            {active ? active.formula : ''}
          </span>
          <span className="text-muted text-[10px]">
            V = {nodes.length}, E = {edges.length}
          </span>
        </div>
      </div>

      {/* 3. RIGHT: Quantitative Results & PCB Interpretation (340px) */}
      <div className="w-full xl:w-96 bg-panel border border-subtle rounded-xl flex flex-col shrink-0 overflow-hidden">
        <div className="h-12 bg-sidebar border-b border-subtle px-4 flex items-center justify-between shrink-0">
          <span className="text-xs font-mono font-bold text-primary tracking-wide uppercase">
            PCB DESIGN INTERPRETATION
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-accent-green border border-emerald-500/30 text-[10px] font-mono font-bold">
            COMPUTED
          </span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
          {/* ============ GRAPH COLORING RESULTS ============ */}
          {activeConcept === 'coloring' && coloringResult && (
            <div className="space-y-4">
              <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-subtle/60 pb-2">
                  <span className="text-muted text-[10px] uppercase">CHROMATIC NUMBER</span>
                  <span className="text-2xl font-bold text-accent-cyan">{coloringResult.chromaticNumber}</span>
                </div>
                <div className="text-[11px] text-secondary font-sans leading-relaxed">
                  Your board graph requires a minimum of <strong className="text-accent-cyan">{coloringResult.chromaticNumber} distinct copper layers</strong> to route
                  all adjacent traces without electromagnetic crosstalk.
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">
                  LAYER ASSIGNMENT MAP
                </span>
                {Object.keys(coloringResult.colorGroups).map(function(colorIdx) {
                  var group = coloringResult.colorGroups[colorIdx];
                  return (
                    <div key={colorIdx} className="flex items-center gap-2 py-1.5 border-b border-subtle/30 last:border-0">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: layerColors[colorIdx] || '#888' }}></span>
                      <span className="text-secondary font-bold text-[11px] w-28 shrink-0">{layerNames[colorIdx] || 'Layer ' + colorIdx}</span>
                      <span className="text-primary font-mono">{group.join(', ')}</span>
                    </div>
                  );
                })}
              </div>

              <div className="p-2.5 rounded bg-black/30 border border-subtle text-[10px] text-muted leading-snug font-sans">
                <strong className="text-secondary block mb-0.5">Research Insight:</strong>
                Graph coloring is NP-hard in general. The Welsh-Powell greedy heuristic provides an upper bound.
                For PCB layout, this maps directly to the layer-assignment problem in EDA (Electronic Design Automation) tools like KiCad's autorouter.
              </div>
            </div>
          )}

          {/* ============ PLANARITY RESULTS ============ */}
          {activeConcept === 'planarity' && planarityResult && (
            <div className="space-y-4">
              <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-2.5">
                <div className="text-[10px] text-muted uppercase mb-1">FUNCTIONAL GRAPH (6 edges)</div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Edge Count / Max Planar:</span>
                  <span className="font-bold text-primary">
                    {planarityResult.functional.E} / {planarityResult.functional.maxPlanarEdges}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Planar (E {'<='} 3V-6)?</span>
                  <span className={'font-bold ' + (planarityResult.functional.isPlanarByCount ? 'text-accent-green' : 'text-accent-red')}>
                    {planarityResult.functional.isPlanarByCount ? 'YES (Single-Layer Possible)' : 'NO (Multi-Layer Required)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Edge Density:</span>
                  <span className="text-accent-amber font-bold">
                    {(planarityResult.functional.density * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-2.5">
                <div className="text-[10px] text-muted uppercase mb-1">FULL CONNECTIVITY GRAPH ({allEdges.length > 0 ? allEdges.length : edges.length} edges)</div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Edge Count / Max Planar:</span>
                  <span className="font-bold text-primary">
                    {planarityResult.full.E} / {planarityResult.full.maxPlanarEdges}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Planar?</span>
                  <span className={'font-bold ' + (planarityResult.full.isPlanarByCount ? 'text-accent-green' : 'text-accent-red')}>
                    {planarityResult.full.isPlanarByCount ? 'YES' : 'NO (via transitions required)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Min Crossing Lower Bound:</span>
                  <span className="text-accent-red font-bold">{planarityResult.full.crossingLowerBound} crossings</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-black/30 border border-subtle text-[10px] text-muted leading-snug font-sans">
                <strong className="text-secondary block mb-0.5">PCB Insight:</strong>
                The Kuratowski-Wagner theorem (1930/1937) states a graph is planar iff it contains no K5 or K3,3 subdivision.
                Each non-planar crossing in the PCB netlist requires a via to transition between copper layers, adding cost and parasitic capacitance.
              </div>
            </div>
          )}

          {/* ============ MAX-FLOW RESULTS ============ */}
          {activeConcept === 'maxflow' && flowResult && (
            <div className="space-y-4">
              <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-subtle/60 pb-2">
                  <span className="text-muted text-[10px] uppercase">MAXIMUM FLOW CAPACITY</span>
                  <span className="text-2xl font-bold text-accent-green">{flowResult.totalFlow}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">Source (Power):</span>
                  <span className="text-accent-green font-bold">{flowSource}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">Sink (Load):</span>
                  <span className="text-accent-red font-bold">{flowSink}</span>
                </div>
              </div>

              {/* Augmenting paths */}
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">
                  AUGMENTING PATHS (Edmonds-Karp)
                </span>
                {(flowResult.augPaths || []).map(function(ap, i) {
                  return (
                    <div key={i} className="p-2 rounded bg-elevated border border-subtle mb-1.5 flex items-center justify-between">
                      <span className="text-accent-cyan text-[11px]">{(ap.path || []).join(' \u2192 ')}</span>
                      <span className="text-accent-amber font-bold text-[11px]">{ap.flow} units</span>
                    </div>
                  );
                })}
              </div>

              {/* Min-Cut */}
              {(flowResult.minCutEdges || []).length > 0 && (
                <div className="bg-panel border border-red-500/30 rounded-lg p-3">
                  <span className="text-[10px] font-bold text-accent-red uppercase block mb-1.5">
                    MIN-CUT BOTTLENECK TRACES
                  </span>
                  {(flowResult.minCutEdges || []).map(function(mc, i) {
                    return (
                      <div key={i} className="text-[11px] text-secondary">
                        {mc.from} \u2192 {mc.to} (capacity: {mc.capacity.toFixed(1)})
                      </div>
                    );
                  })}
                  <p className="text-[10px] text-muted mt-2 font-sans">
                    These traces are the power delivery bottleneck. Widening them or adding parallel routes increases max flow.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ============ SPECTRAL ANALYSIS RESULTS ============ */}
          {activeConcept === 'spectral' && spectralResult && (
            <div className="space-y-4">
              <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-subtle/60 pb-2">
                  <span className="text-muted text-[10px] uppercase">FIEDLER VALUE (Algebraic Connectivity)</span>
                  <span className="text-2xl font-bold text-accent-amber">{spectralResult.fiedlerValue}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">Spectral Gap:</span>
                  <span className="text-primary font-bold">{spectralResult.spectralGap}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">Spectral Radius:</span>
                  <span className="text-primary font-bold">{spectralResult.spectralRadius}</span>
                </div>
              </div>

              {/* Laplacian Eigenvalue Spectrum Bar Chart */}
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">
                  LAPLACIAN EIGENVALUE SPECTRUM
                </span>
                <div className="bg-black/30 border border-subtle rounded-lg p-3">
                  <div className="flex items-end gap-2 h-28 justify-center">
                    {(spectralResult.eigenvalues || []).map(function(ev, i) {
                      var maxEv = Math.max.apply(null, spectralResult.eigenvalues.map(function(v) { return Math.abs(v); }));
                      var heightPct = maxEv > 0 ? (Math.abs(ev) / maxEv) * 100 : 5;
                      return (
                        <div key={i} className="flex flex-col items-center gap-1 w-10">
                          <span className="text-[9px] text-primary font-bold">{ev.toFixed(2)}</span>
                          <div className="w-6 rounded-t"
                            style={{
                              height: Math.max(4, heightPct) + '%',
                              backgroundColor: i === 0 ? '#334D66' : (i === 1 ? '#F2B45B' : '#55C8E8')
                            }}>
                          </div>
                          <span className="text-[8px] text-muted">{'\u03BB'}{i}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Laplacian Matrix Heatmap */}
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">
                  LAPLACIAN MATRIX L = D - A
                </span>
                <div className="bg-black/30 border border-subtle rounded-lg p-2 overflow-x-auto">
                  <table className="text-center text-[9px] font-mono">
                    <thead>
                      <tr>
                        <th className="w-10 text-muted"></th>
                        {(spectralResult.nodeIds || []).map(function(id) {
                          return <th key={id} className="px-1.5 py-1 text-accent-cyan font-bold">{id}</th>;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {(spectralResult.laplacian || []).map(function(row, ri) {
                        return (
                          <tr key={ri}>
                            <td className="text-accent-cyan font-bold pr-2 text-right">{(spectralResult.nodeIds || [])[ri]}</td>
                            {row.map(function(val, ci) {
                              var bg = val > 0 ? 'rgba(85,200,232,' + (val / 6) + ')' : (val < 0 ? 'rgba(240,107,112,' + (Math.abs(val) / 2) + ')' : 'transparent');
                              return (
                                <td key={ci} className="px-1.5 py-1 rounded" style={{ backgroundColor: bg }}>
                                  <span className="text-primary">{val}</span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-2.5 rounded bg-black/30 border border-subtle text-[10px] text-muted leading-snug font-sans">
                <strong className="text-secondary block mb-0.5">Research Context (Fiedler, 1973):</strong>
                The algebraic connectivity {'\u03BB'}2 quantifies how difficult it is to disconnect the board by cutting traces.
                Higher {'\u03BB'}2 means redundant paths exist between modules. VLSI partitioning tools use this for optimal chip floorplanning.
              </div>
            </div>
          )}

          {/* ============ MONTE CARLO RELIABILITY RESULTS ============ */}
          {activeConcept === 'reliability' && reliabilityResult && (
            <div className="space-y-4">
              <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-subtle/60 pb-2">
                  <span className="text-muted text-[10px] uppercase">CRITICAL FAILURE THRESHOLD</span>
                  <span className="text-2xl font-bold text-accent-red">
                    {(reliabilityResult.criticalThreshold * 100).toFixed(0)}% fail rate
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">Monte Carlo Trials:</span>
                  <span className="text-primary font-bold">{reliabilityResult.trials} per data point</span>
                </div>
                <div className="text-[11px] text-secondary font-sans leading-relaxed mt-1">
                  The board drops below 50% connectivity probability at <strong className="text-accent-red">{(reliabilityResult.criticalThreshold * 100).toFixed(0)}%</strong> trace failure rate.
                </div>
              </div>

              {/* Reliability Curve SVG Chart */}
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">
                  RELIABILITY CURVE R(p) vs TRACE FAILURE PROBABILITY
                </span>
                <div className="bg-black/30 border border-subtle rounded-lg p-3 h-44 relative">
                  <svg className="w-full h-full" viewBox="0 0 320 140" preserveAspectRatio="none">
                    {/* Grid */}
                    <line x1="40" y1="10" x2="40" y2="120" stroke="#223244" strokeWidth="1" />
                    <line x1="40" y1="120" x2="310" y2="120" stroke="#223244" strokeWidth="1" />
                    <line x1="40" y1="10" x2="310" y2="10" stroke="#223244" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="40" y1="65" x2="310" y2="65" stroke="#F06B70" strokeWidth="0.5" strokeDasharray="3 3" />
                    {/* Y-axis labels */}
                    <text x="35" y="14" textAnchor="end" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono">100%</text>
                    <text x="35" y="68" textAnchor="end" fill="#F06B70" fontSize="8" fontFamily="JetBrains Mono">50%</text>
                    <text x="35" y="123" textAnchor="end" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono">0%</text>
                    {/* X-axis label */}
                    <text x="175" y="137" textAnchor="middle" fill="#62748C" fontSize="8" fontFamily="JetBrains Mono">Trace Failure Probability p</text>
                    {/* Curve */}
                    {(reliabilityResult.reliabilityCurve || []).length > 1 && (
                      <polyline
                        points={(reliabilityResult.reliabilityCurve || []).map(function(pt) {
                          var x = 40 + (pt.failProb / 0.8) * 270;
                          var y = 120 - pt.reliability * 110;
                          return x + ',' + y;
                        }).join(' ')}
                        fill="none" stroke="#36C98F" strokeWidth="2.5"
                      />
                    )}
                    {/* Data points */}
                    {(reliabilityResult.reliabilityCurve || []).map(function(pt, i) {
                      var x = 40 + (pt.failProb / 0.8) * 270;
                      var y = 120 - pt.reliability * 110;
                      return <circle key={i} cx={x} cy={y} r="3" fill="#36C98F" stroke="#0B121B" strokeWidth="1.5" />;
                    })}
                  </svg>
                </div>
              </div>

              {/* Detailed curve values */}
              <div className="bg-elevated border border-subtle rounded-lg p-2 max-h-40 overflow-y-auto">
                <table className="w-full text-[10px] font-mono">
                  <thead>
                    <tr className="text-muted uppercase border-b border-subtle/50">
                      <th className="py-1 text-left">Failure Rate</th>
                      <th className="py-1 text-right">Connectivity</th>
                      <th className="py-1 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reliabilityResult.reliabilityCurve || []).map(function(pt, i) {
                      return (
                        <tr key={i} className="border-b border-subtle/20">
                          <td className="py-0.5 text-primary">{(pt.failProb * 100).toFixed(0)}%</td>
                          <td className="py-0.5 text-right font-bold text-accent-green">{(pt.reliability * 100).toFixed(1)}%</td>
                          <td className="py-0.5 text-right">
                            <span className={'font-bold ' + (pt.reliability > 0.9 ? 'text-accent-green' : (pt.reliability > 0.5 ? 'text-accent-amber' : 'text-accent-red'))}>
                              {pt.reliability > 0.9 ? 'SAFE' : (pt.reliability > 0.5 ? 'DEGRADED' : 'CRITICAL')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ STEINER TREE RESULTS ============ */}
          {activeConcept === 'steiner' && steinerResult && (
            <div className="space-y-4">
              <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-subtle/60 pb-2">
                  <span className="text-muted text-[10px] uppercase">STEINER TREE ROUTING COST</span>
                  <span className="text-2xl font-bold text-accent-amber">{steinerResult.totalCost} mm</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">Terminal Nodes:</span>
                  <span className="text-accent-amber font-bold">{steinerTerminals.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">Steiner Points Used:</span>
                  <span className="text-accent-green font-bold">
                    {(steinerResult.steinerNodes || []).filter(function(n) { return !steinerTerminals.includes(n); }).join(', ') || 'None (direct tree)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">Tree Edges:</span>
                  <span className="text-primary font-bold">{(steinerResult.steinerEdgeIndices || []).length}</span>
                </div>
              </div>

              <div className="text-[11px] text-secondary font-sans leading-relaxed bg-elevated border border-subtle rounded-lg p-3">
                <strong className="text-primary block mb-1">PCB Application:</strong>
                When routing a signal net (e.g., +3V3 power net connecting {steinerTerminals.join(', ')}), the Steiner tree gives the minimum copper trace length.
                This saves board area, reduces parasitic capacitance, and lowers manufacturing cost.
              </div>

              <div className="p-2.5 rounded bg-black/30 border border-subtle text-[10px] text-muted leading-snug font-sans">
                <strong className="text-secondary block mb-0.5">Complexity:</strong>
                The Steiner Tree Problem in graphs is NP-hard (Karp, 1972). The MST-based 2-approximation used here guarantees cost within 2x of optimal.
                EDA autorouters use Steiner heuristics (e.g., rectilinear Steiner tree) for every net on the board.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.ResearchLabPage = ResearchLabPage;
}
