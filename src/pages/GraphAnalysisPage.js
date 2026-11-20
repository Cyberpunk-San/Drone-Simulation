// AEROLAB Screen 03 — Graph Analysis Page (Spec Section 7)
function GraphAnalysisPage({ graphData, onAudioTrigger }) {
  const nodes = (graphData && graphData.nodes) || [];
  const edges = (graphData && (graphData.functional_edges || graphData.edges)) || [];

  // Algorithm state
  const [selectedAlgo, setSelectedAlgo] = React.useState('dijkstra');
  const [sourceNode, setSourceNode] = React.useState('PMU');
  const [destNode, setDestNode] = React.useState('IMU');
  const [isRunning, setIsRunning] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [speed, setSpeed] = React.useState(400); // ms per step
  const [result, setResult] = React.useState(null);
  const [logs, setLogs] = React.useState([]);

  // Coordinate normalizer for 50.1 x 50.1mm KiCad PCB
  const normX = (x) => ((x - 19.95) / 50.1) * 100;
  const normY = (y) => ((y - 19.95) / 50.1) * 100;

  // Build Adjacency List
  const buildAdj = React.useCallback(() => {
    const adj = {};
    nodes.forEach(n => { adj[n.id] = []; });
    edges.forEach((e, i) => {
      const u = e.from || e.a;
      const v = e.to || e.b;
      const w = e.weight || e.cost || 10;
      if (adj[u]) adj[u].push({ to: v, w, i });
      if (adj[v]) adj[v].push({ to: u, w, i });
    });
    return adj;
  }, [nodes, edges]);

  // Execute Algorithm and compile step sequence
  const computeAlgorithm = React.useCallback(() => {
    const adj = buildAdj();
    const timestamp = () => new Date().toLocaleTimeString('en-GB');

    if (selectedAlgo === 'dijkstra') {
      const dijkstraFn = (window.FC && window.FC.computeDijkstra);
      const res = dijkstraFn ? dijkstraFn(nodes, adj, edges, sourceNode, destNode) : null;
      
      // Build discrete steps for animation
      const steps = [];
      steps.push({ activeNode: sourceNode, visitedNodes: [sourceNode], activeEdges: [], log: `[${timestamp()}] DIJKSTRA: Initialized at source module ${sourceNode} (dist=0.00)` });
      
      if (res && res.path && res.path.length > 1) {
        for (let i = 1; i < res.path.length; i++) {
          const curr = res.path[i];
          const subPath = res.path.slice(0, i + 1);
          const subEdges = res.edgeList.slice(0, i);
          steps.push({
            activeNode: curr,
            visitedNodes: subPath,
            activeEdges: subEdges,
            log: `[${timestamp()}] DIJKSTRA: Settled intermediate node ${curr} (total cost: ${res.totalCost.toFixed(2)} mm-eq)`
          });
        }
      }
      steps.push({
        activeNode: destNode,
        visitedNodes: res ? res.path : [sourceNode, destNode],
        activeEdges: res ? res.edgeList : [],
        isComplete: true,
        log: `[${timestamp()}] DIJKSTRA: Path converged to ${destNode}. Shortest routing cost = ${res ? res.totalCost.toFixed(2) : 0} mm-eq.`
      });

      setResult({
        type: 'dijkstra',
        status: 'Completed',
        source: sourceNode,
        destination: destNode,
        path: res ? res.path : [],
        cost: res ? res.totalCost : 0,
        edges: res ? res.edgeList : [],
        steps
      });
      setLogs([`[${timestamp()}] DIJKSTRA: Ready to trace optimal trace-cost route from ${sourceNode} to ${destNode}`]);
      setCurrentStep(0);
    } else if (selectedAlgo === 'bfs') {
      const bfsFn = (window.FC && window.FC.computeBFS);
      const res = bfsFn ? bfsFn(adj, sourceNode, nodes.length) : null;
      const steps = [];
      const visited = [];
      const activeE = [];

      if (res && res.order) {
        res.order.forEach((nodeId, idx) => {
          visited.push(nodeId);
          if (idx > 0 && res.edgeSteps[idx - 1]) {
            activeE.push(res.edgeSteps[idx - 1].edgeIdx);
          }
          steps.push({
            activeNode: nodeId,
            visitedNodes: [...visited],
            activeEdges: [...activeE],
            log: `[${timestamp()}] BFS: Discovered module ${nodeId} (level ${idx})`
          });
        });
      }

      setResult({
        type: 'bfs',
        status: 'Completed',
        source: sourceNode,
        order: res ? res.order : [],
        isFullyConnected: res ? res.isFullyConnected : true,
        edges: activeE,
        steps
      });
      setLogs([`[${timestamp()}] BFS: Connectivity traversal initialized from ${sourceNode}`]);
      setCurrentStep(0);
    } else if (selectedAlgo === 'prim') {
      const primFn = (window.FC && window.FC.computePrim);
      const res = primFn ? primFn(nodes, adj, edges, sourceNode) : null;
      const steps = [];
      const activeE = [];
      const visited = [sourceNode];

      if (res && res.edges) {
        res.edges.forEach((edgeIdx, idx) => {
          activeE.push(edgeIdx);
          const edge = edges[edgeIdx];
          const nextNode = visited.includes(edge.from || edge.a) ? (edge.to || edge.b) : (edge.from || edge.a);
          visited.push(nextNode);
          steps.push({
            activeNode: nextNode,
            visitedNodes: [...visited],
            activeEdges: [...activeE],
            log: `[${timestamp()}] PRIM: Added edge ${edge.from || edge.a}—${edge.to || edge.b} (cost ${(edge.weight || edge.cost || 0).toFixed(1)} mm-eq)`
          });
        });
      }

      setResult({
        type: 'prim',
        status: 'Completed',
        source: sourceNode,
        mstEdges: res ? res.edges : [],
        totalCost: res ? res.totalCost : 0,
        isFullyConnected: res ? res.isFullyConnected : true,
        steps
      });
      setLogs([`[${timestamp()}] PRIM: Minimum Spanning Tree initialized from ${sourceNode}`]);
      setCurrentStep(0);
    } else if (selectedAlgo === 'tarjan') {
      const tarjanFn = (window.FC && window.FC.computeTarjan);
      const res = tarjanFn ? tarjanFn(nodes, edges, adj) : null;
      
      const steps = [
        {
          activeNode: null,
          visitedNodes: nodes.map(n => n.id),
          activeEdges: res ? res.bridges : [],
          criticalNodes: res ? res.articulationPoints : [],
          isComplete: true,
          log: `[${timestamp()}] TARJAN: Critical bridges and articulation points evaluated.`
        }
      ];

      setResult({
        type: 'tarjan',
        status: 'Completed',
        bridges: res ? res.bridges : [],
        articulationPoints: res ? res.articulationPoints : [],
        steps
      });
      setLogs([
        `[${timestamp()}] TARJAN: Discovered ${res ? res.articulationPoints.length : 0} Articulation Points: ${res ? res.articulationPoints.join(', ') : 'None'}`,
        `[${timestamp()}] TARJAN: Discovered ${res ? res.bridges.length : 0} Critical Bridge Traces`
      ]);
      setCurrentStep(0);
    }
  }, [selectedAlgo, sourceNode, destNode, nodes, edges, buildAdj]);

  // Recalculate whenever selection changes
  React.useEffect(() => {
    setIsRunning(false);
    computeAlgorithm();
  }, [selectedAlgo, sourceNode, destNode, computeAlgorithm]);

  // Step-by-step playback timer
  React.useEffect(() => {
    let timer = null;
    if (isRunning && result && result.steps && result.steps.length > 0) {
      timer = setTimeout(() => {
        if (currentStep < result.steps.length - 1) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          if (result.steps[nextStep] && result.steps[nextStep].log) {
            setLogs(prev => [result.steps[nextStep].log, ...prev.slice(0, 40)]);
          }
        } else {
          setIsRunning(false);
        }
      }, speed);
    }
    return () => clearTimeout(timer);
  }, [isRunning, currentStep, result, speed]);

  // Active step snapshot
  const activeSnapshot = (result && result.steps && result.steps[currentStep]) || {
    activeNode: null,
    visitedNodes: [],
    activeEdges: []
  };

  const algoCategories = [
    {
      group: 'Traversal',
      items: [
        { id: 'bfs', name: 'Breadth-First Search', complexity: 'O(V + E)', purpose: 'Reachability & layer sweep' }
      ]
    },
    {
      group: 'Optimisation',
      items: [
        { id: 'dijkstra', name: 'Dijkstra Shortest Path', complexity: 'O(E log V)', purpose: 'Minimum trace routing cost' },
        { id: 'prim', name: 'Prim Minimum Spanning Tree', complexity: 'O(E log V)', purpose: 'Minimum copper interconnect tree' }
      ]
    },
    {
      group: 'Reliability',
      items: [
        { id: 'tarjan', name: 'Tarjan Articulation & Bridges', complexity: 'O(V + E)', purpose: 'Single point of failure analysis' }
      ]
    }
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-4 h-[calc(100vh-6.5rem)] min-h-[640px]">
      {/* 1. Left Column: Algorithm Catalogue (230px) */}
      <div className="w-full xl:w-60 bg-panel border border-subtle rounded-xl flex flex-col shrink-0 select-none">
        <div className="h-12 bg-sidebar border-b border-subtle px-4 flex items-center justify-between shrink-0">
          <span className="text-xs font-mono font-bold text-accent-cyan tracking-wider uppercase">
            ALGORITHM SUITE
          </span>
          <span className="text-[10px] font-mono text-muted">AEROLAB</span>
        </div>

        <div className="p-3 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
          {algoCategories.map((cat, cIdx) => (
            <div key={cIdx} className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block px-1">
                {cat.group}
              </span>
              {cat.items.map(item => {
                const isActive = selectedAlgo === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedAlgo(item.id); setIsRunning(false); }}
                    className={`w-full text-left p-2.5 rounded-lg border transition ${
                      isActive
                        ? 'bg-sky-500/15 border-sky-400/50 text-accent-cyan shadow-[0_0_12px_rgba(85,200,232,0.15)]'
                        : 'bg-elevated hover:bg-hover border-subtle text-secondary hover:text-primary'
                    }`}
                  >
                    <div className="font-bold font-sans text-xs flex items-center justify-between">
                      <span>{item.name}</span>
                    </div>
                    <div className="text-[10px] text-muted mt-1 leading-snug">
                      {item.purpose}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[9px]">
                      <span className="px-1.5 py-0.5 rounded bg-black/40 text-accent-amber font-mono">
                        {item.complexity}
                      </span>
                      {isActive && (
                        <span className="text-accent-cyan font-bold tracking-wider">ACTIVE</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Centre Column: PCB Graph Visualization & Playback (Flexible, min 500px) */}
      <div className="flex-1 bg-panel border border-subtle rounded-xl flex flex-col overflow-hidden relative">
        {/* Workspace Header */}
        <div className="h-14 bg-sidebar border-b border-subtle px-4 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-primary font-sans uppercase tracking-wide">
              {selectedAlgo.toUpperCase()}
            </h2>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-accent-amber border border-amber-500/30 font-mono text-[10px] font-bold">
              {selectedAlgo === 'dijkstra' || selectedAlgo === 'prim' ? 'O(E log V)' : 'O(V + E)'}
            </span>
          </div>

          {/* Node Selectors (for Dijkstra, BFS, Prim) */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-muted text-[11px]">SOURCE:</span>
              <select
                value={sourceNode}
                onChange={e => setSourceNode(e.target.value)}
                className="bg-elevated border border-subtle rounded px-2 py-1 text-primary text-xs font-mono focus:outline-none focus:border-accent-cyan"
              >
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.id} ({n.name})</option>
                ))}
              </select>
            </div>

            {selectedAlgo === 'dijkstra' && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted text-[11px]">DEST:</span>
                <select
                  value={destNode}
                  onChange={e => setDestNode(e.target.value)}
                  className="bg-elevated border border-subtle rounded px-2 py-1 text-primary text-xs font-mono focus:outline-none focus:border-accent-cyan"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.id} ({n.name})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* PCB Graph Canvas */}
        <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-black/40">
          <div className="relative w-[500px] h-[500px] select-none">
            {/* Real PCB Background Image */}
            <img
              src="pcb.svg"
              alt="PCB Canvas"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-40 shadow-xl rounded-lg"
              onError={(e) => { e.target.style.display = 'none'; }}
            />

            {/* SVG Interactive Overlay */}
            <svg className="absolute inset-0 w-full h-full z-10">
              <defs>
                <filter id="algoGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Edges */}
              {edges.map((edge, idx) => {
                const srcNode = nodes.find(n => n.id === (edge.from || edge.a));
                const dstNode = nodes.find(n => n.id === (edge.to || edge.b));
                if (!srcNode || !dstNode) return null;

                const x1 = (normX(srcNode.x) / 100) * 500;
                const y1 = (normY(srcNode.y) / 100) * 500;
                const x2 = (normX(dstNode.x) / 100) * 500;
                const y2 = (normY(dstNode.y) / 100) * 500;

                const isActiveEdge = activeSnapshot.activeEdges && activeSnapshot.activeEdges.includes(idx);
                const isBridge = selectedAlgo === 'tarjan' && result && result.bridges && result.bridges.includes(idx);

                let strokeColor = '#1f2e3d';
                let strokeWidth = 2;

                if (isBridge) {
                  strokeColor = '#F06B70';
                  strokeWidth = 3.5;
                } else if (isActiveEdge) {
                  strokeColor = '#36C98F';
                  strokeWidth = 3.5;
                }

                return (
                  <line
                    key={`e-${idx}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    filter={isActiveEdge || isBridge ? 'url(#algoGlow)' : undefined}
                    className="transition-colors duration-200"
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const cx = (normX(node.x) / 100) * 500;
                const cy = (normY(node.y) / 100) * 500;

                const isCurrent = activeSnapshot.activeNode === node.id;
                const isVisited = activeSnapshot.visitedNodes && activeSnapshot.visitedNodes.includes(node.id);
                const isCritical = (activeSnapshot.criticalNodes && activeSnapshot.criticalNodes.includes(node.id)) ||
                                  (selectedAlgo === 'tarjan' && result && result.articulationPoints && result.articulationPoints.includes(node.id));

                let fillColor = '#1A2A3A';
                let strokeColor = '#334D66';
                let radius = 11;

                if (isCritical) {
                  fillColor = '#F06B70';
                  strokeColor = '#FFFFFF';
                  radius = 13;
                } else if (isCurrent) {
                  fillColor = '#F2B45B';
                  strokeColor = '#FFFFFF';
                  radius = 13;
                } else if (isVisited) {
                  fillColor = '#36C98F';
                  strokeColor = '#55C8E8';
                  radius = 12;
                }

                return (
                  <g key={`n-${node.id}`} className="transition-all duration-200">
                    {/* Pulsing ring for current node */}
                    {(isCurrent || isCritical) && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius + 6}
                        fill="none"
                        stroke={isCritical ? '#F06B70' : '#F2B45B'}
                        strokeWidth="2"
                        className="animate-ping opacity-60"
                      />
                    )}

                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="2"
                      filter={isCurrent || isVisited || isCritical ? 'url(#algoGlow)' : undefined}
                    />

                    {/* Node text tag */}
                    <g transform={`translate(${cx}, ${cy + radius + 11})`}>
                      <rect
                        x="-24"
                        y="-7"
                        width="48"
                        height="14"
                        rx="3"
                        fill="#0B121B"
                        stroke={isCritical ? '#F06B70' : (isVisited ? '#36C98F' : '#223244')}
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        dy="3"
                        fill={isCritical ? '#F06B70' : '#E6EDF3'}
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="bold"
                      >
                        {node.id}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Playback Controls Toolbar (Spec Section 7) */}
        <div className="h-14 bg-sidebar border-t border-subtle px-4 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (result && currentStep >= (result.steps.length - 1)) {
                  setCurrentStep(0);
                }
                setIsRunning(!isRunning);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                isRunning
                  ? 'bg-amber-500/20 text-accent-amber border border-amber-500/40'
                  : 'bg-emerald-500/20 text-accent-green border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              <span>{isRunning ? 'PAUSE' : 'RUN'}</span>
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                if (result && currentStep < result.steps.length - 1) {
                  setCurrentStep(s => s + 1);
                }
              }}
              disabled={isRunning || !result || currentStep >= (result.steps.length - 1)}
              className="px-3 py-1.5 rounded-lg bg-elevated hover:bg-hover disabled:opacity-40 text-secondary border border-subtle text-xs font-mono transition"
            >
              STEP FORWARD
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setCurrentStep(0);
              }}
              className="px-3 py-1.5 rounded-lg bg-elevated hover:bg-hover text-secondary border border-subtle text-xs font-mono transition"
            >
              RESET
            </button>
          </div>

          {/* Speed Controls */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-muted text-[11px]">SPEED:</span>
            <div className="flex bg-elevated rounded-md border border-subtle p-0.5">
              <button
                onClick={() => setSpeed(800)}
                className={`px-2 py-0.5 rounded text-[10px] ${speed === 800 ? 'bg-panel text-accent-cyan font-bold' : 'text-muted'}`}
              >
                Slow
              </button>
              <button
                onClick={() => setSpeed(400)}
                className={`px-2 py-0.5 rounded text-[10px] ${speed === 400 ? 'bg-panel text-accent-cyan font-bold' : 'text-muted'}`}
              >
                Normal
              </button>
              <button
                onClick={() => setSpeed(150)}
                className={`px-2 py-0.5 rounded text-[10px] ${speed === 150 ? 'bg-panel text-accent-cyan font-bold' : 'text-muted'}`}
              >
                Fast
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Right Column: Structured Results & Terminal Event Log (320px) */}
      <div className="w-full xl:w-80 bg-panel border border-subtle rounded-xl flex flex-col shrink-0 overflow-hidden">
        {/* Results Header */}
        <div className="h-12 bg-sidebar border-b border-subtle px-4 flex items-center justify-between shrink-0">
          <span className="text-xs font-mono font-bold text-primary tracking-wide uppercase">
            EXECUTION RESULTS
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-accent-green border border-emerald-500/30 text-[10px] font-mono font-bold">
            {result ? result.status.toUpperCase() : 'READY'}
          </span>
        </div>

        {/* Structured Result Cards */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Card: Dijkstra Output */}
          {selectedAlgo === 'dijkstra' && result && result.path && (
            <div className="space-y-3">
              <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-subtle/60 pb-2">
                  <span className="text-muted text-[10px] uppercase">OPTIMAL PATH</span>
                  <span className="text-accent-cyan font-bold">
                    {(result.path || []).join(' → ')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted text-[10px] uppercase">TOTAL ROUTING COST</span>
                  <span className="text-accent-amber font-bold text-sm">
                    {(result.cost || 0).toFixed(2)} mm-eq
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">SOURCE MODULE:</span>
                  <span className="text-primary font-bold">{sourceNode}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">DEST MODULE:</span>
                  <span className="text-primary font-bold">{destNode}</span>
                </div>
              </div>

              <div className="bg-panel border border-subtle rounded-lg p-3 text-[11px] text-muted leading-relaxed">
                <span className="text-primary font-bold block mb-1">Cost Metric Explanation:</span>
                Routing cost combines physical trace distance in millimetres with a 2.0 mm penalty per layer-transition via.
              </div>
            </div>
          )}

          {/* Card: BFS Output */}
          {selectedAlgo === 'bfs' && result && result.order && (
            <div className="space-y-3">
              <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-2">
                <div className="text-[10px] text-muted uppercase">VISITATION ORDER</div>
                <div className="font-bold text-accent-cyan text-xs">
                  {(result.order || []).join(' → ')}
                </div>

                <div className="border-t border-subtle/60 pt-2 flex items-center justify-between">
                  <span className="text-muted text-[10px]">MODULES REACHED:</span>
                  <span className="text-primary font-bold">{(result.order || []).length} / {nodes.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted text-[10px]">FULL CONNECTIVITY:</span>
                  <span className={`font-bold ${result.isFullyConnected ? 'text-accent-green' : 'text-accent-red'}`}>
                    {result.isFullyConnected ? 'VERIFIED (100%)' : 'DISCONNECTED'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Card: Prim Output */}
          {selectedAlgo === 'prim' && result && result.mstEdges && (
            <div className="space-y-3">
              <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-2">
                <div className="text-[10px] text-muted uppercase">MINIMUM SPANNING TREE</div>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-[10px]">TOTAL MST COST:</span>
                  <span className="text-accent-amber font-bold text-sm">
                    {(result.totalCost || 0).toFixed(2)} mm-eq
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">EDGES SELECTED:</span>
                  <span className="text-primary font-bold">{(result.mstEdges || []).length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Card: Tarjan Output */}
          {selectedAlgo === 'tarjan' && result && result.articulationPoints && (
            <div className="space-y-3">
              <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-2.5">
                <div>
                  <span className="text-muted text-[10px] uppercase block">ARTICULATION POINTS</span>
                  <span className="font-bold text-accent-red text-xs mt-0.5 block">
                    {(result.articulationPoints || []).length > 0 ? (result.articulationPoints || []).join(', ') : 'None'}
                  </span>
                  <span className="text-[10px] text-muted block mt-0.5">
                    Critical modules whose removal disconnects the board.
                  </span>
                </div>

                <div className="border-t border-subtle/60 pt-2">
                  <span className="text-muted text-[10px] uppercase block">CRITICAL BRIDGES</span>
                  <span className="font-bold text-accent-amber text-xs mt-0.5 block">
                    {(result.bridges || []).length} trace bridge(s)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Compact Terminal Event Log (Spec Section 7) */}
          <div className="border-t border-subtle pt-3">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">
              EVENT LOG
            </span>
            <div className="bg-black/40 border border-subtle rounded-lg p-2.5 h-44 overflow-y-auto font-mono text-[10px] space-y-1 text-slate-300">
              {logs.map((log, lIdx) => (
                <div key={lIdx} className="leading-tight">
                  <span className="text-muted">{log.slice(0, 10)}</span>
                  <span className="text-secondary">{log.slice(10)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.GraphAnalysisPage = GraphAnalysisPage;
}
