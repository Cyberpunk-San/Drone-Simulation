// AEROLAB Screen 04 — Failure Analysis Page (Spec Section 8)
function FailureAnalysisPage({ graphData, initialFailedNode }) {
  const nodes = (graphData && graphData.nodes) || [];
  const edges = (graphData && (graphData.functional_edges || graphData.edges)) || [];

  const [failedNodeId, setFailedNodeId] = React.useState(initialFailedNode || 'PMU');
  const [severedEdges, setSeveredEdges] = React.useState([]);

  // Coordinate normalizer
  const normX = (x) => ((x - 19.95) / 50.1) * 100;
  const normY = (y) => ((y - 19.95) / 50.1) * 100;

  // Compute PMU reachability when failedNodeId is active
  const { reachableNodes, cutoffNodes } = React.useMemo(() => {
    if (!failedNodeId) {
      return {
        reachableNodes: nodes.map(n => n.id),
        cutoffNodes: []
      };
    }

    if (failedNodeId === 'PMU') {
      // If PMU itself fails, all other nodes lose power reference!
      return {
        reachableNodes: [],
        cutoffNodes: nodes.map(n => n.id)
      };
    }

    // Graph BFS from PMU excluding failedNodeId
    const adj = {};
    nodes.forEach(n => { adj[n.id] = []; });
    edges.forEach(e => {
      const u = e.from || e.a;
      const v = e.to || e.b;
      adj[u].push(v);
      adj[v].push(u);
    });

    const visited = new Set(['PMU']);
    const queue = ['PMU'];

    while (queue.length > 0) {
      const curr = queue.shift();
      for (const neighbor of (adj[curr] || [])) {
        if (neighbor !== failedNodeId && !visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    const reachable = Array.from(visited);
    const cutoff = nodes.map(n => n.id).filter(id => !visited.has(id));

    return { reachableNodes: reachable, cutoffNodes: cutoff };
  }, [failedNodeId, nodes, edges]);

  const failedNode = nodes.find(n => n.id === failedNodeId);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-6.5rem)] min-h-[640px]">
      {/* 1. Left/Center: PCB Graph Failure Canvas */}
      <div className="flex-1 bg-panel border border-subtle rounded-xl flex flex-col overflow-hidden relative">
        {/* Header Strip */}
        <div className="h-12 bg-sidebar border-b border-subtle px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-accent-cyan tracking-wider uppercase">
              TOPOLOGICAL FAULT INJECTION
            </span>
            <span className="text-border-strong">|</span>
            <span className="text-xs font-mono text-secondary">
              Reference: <strong className="text-accent-red">PMU (Power Rail)</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFailedNodeId(null)}
              className="px-2.5 py-1 rounded bg-elevated hover:bg-hover text-secondary border border-subtle text-xs font-mono transition"
            >
              Restore All Modules
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-black/40">
          <div className="relative w-[520px] h-[520px] select-none">
            {/* Real PCB Background Image */}
            <img
              src="pcb.svg"
              alt="PCB Canvas"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-30 shadow-2xl rounded-lg"
              onError={(e) => { e.target.style.display = 'none'; }}
            />

            {/* SVG Failure Overlay */}
            <svg className="absolute inset-0 w-full h-full z-10">
              <defs>
                <filter id="failGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Edges */}
              {edges.map((edge, idx) => {
                const srcId = edge.from || edge.a;
                const dstId = edge.to || edge.b;
                const srcNode = nodes.find(n => n.id === srcId);
                const dstNode = nodes.find(n => n.id === dstId);
                if (!srcNode || !dstNode) return null;

                const x1 = (normX(srcNode.x) / 100) * 520;
                const y1 = (normY(srcNode.y) / 100) * 520;
                const x2 = (normX(dstNode.x) / 100) * 520;
                const y2 = (normY(dstNode.y) / 100) * 520;

                const isConnectedToFailed = failedNodeId && (srcId === failedNodeId || dstId === failedNodeId);
                const isSevered = cutoffNodes.includes(srcId) && cutoffNodes.includes(dstId);

                let strokeColor = '#223244';
                let strokeDash = 'none';

                if (isConnectedToFailed) {
                  strokeColor = '#F06B70';
                  strokeDash = '4 4';
                } else if (isSevered) {
                  strokeColor = '#3a2024';
                  strokeDash = '2 2';
                } else if (reachableNodes.includes(srcId) && reachableNodes.includes(dstId)) {
                  strokeColor = '#36C98F';
                }

                return (
                  <line
                    key={`fail-e-${idx}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={strokeColor}
                    strokeWidth={isConnectedToFailed ? 2.5 : 2}
                    strokeDasharray={strokeDash}
                    className="transition-colors duration-200"
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const cx = (normX(node.x) / 100) * 520;
                const cy = (normY(node.y) / 100) * 520;

                const isFailed = failedNodeId === node.id;
                const isReachable = reachableNodes.includes(node.id);
                const isCutoff = cutoffNodes.includes(node.id) && !isFailed;

                let fillColor = '#101A26';
                let strokeColor = '#334D66';
                let radius = 12;

                if (isFailed) {
                  fillColor = '#F06B70';
                  strokeColor = '#FFFFFF';
                  radius = 14;
                } else if (isCutoff) {
                  fillColor = '#1F2937';
                  strokeColor = '#4B5563';
                } else if (isReachable) {
                  fillColor = '#0F2F24';
                  strokeColor = '#36C98F';
                }

                return (
                  <g
                    key={`fail-n-${node.id}`}
                    onClick={() => setFailedNodeId(node.id === failedNodeId ? null : node.id)}
                    className="cursor-pointer group"
                  >
                    {isFailed && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius + 8}
                        fill="none"
                        stroke="#F06B70"
                        strokeWidth="2"
                        className="animate-ping opacity-75"
                      />
                    )}

                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isFailed || isReachable ? 2.5 : 1.5}
                      filter={isFailed ? 'url(#failGlow)' : undefined}
                    />

                    {/* Node Tag */}
                    <g transform={`translate(${cx}, ${cy + radius + 12})`}>
                      <rect
                        x="-26"
                        y="-7.5"
                        width="52"
                        height="15"
                        rx="3"
                        fill="#0B121B"
                        stroke={isFailed ? '#F06B70' : (isReachable ? '#36C98F' : '#4B5563')}
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        dy="3.5"
                        fill={isFailed ? '#F06B70' : (isReachable ? '#36C98F' : '#9CA3AF')}
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

        {/* Legend */}
        <div className="h-10 bg-sidebar border-t border-subtle px-4 flex items-center justify-between text-[11px] font-mono shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-red animate-pulse"></span>
              <span className="text-secondary">Failed Module</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-green"></span>
              <span className="text-secondary">Powered (Reachable from PMU)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
              <span className="text-secondary">Cut Off / Isolated</span>
            </div>
          </div>
          <span className="text-muted text-[10px]">Click any node on board to simulate hardware fault</span>
        </div>
      </div>

      {/* 2. Right Impact & Reliability Analysis Panel (340px) */}
      <div className="w-full lg:w-80 xl:w-96 bg-panel border border-subtle rounded-xl flex flex-col shrink-0 overflow-hidden">
        <div className="h-12 bg-sidebar border-b border-subtle px-4 flex items-center justify-between shrink-0">
          <span className="text-xs font-mono font-bold text-primary tracking-wide uppercase">
            IMPACT & RELIABILITY PANEL
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-accent-amber border border-amber-500/30 text-[10px] font-mono font-bold">
            {failedNodeId ? 'FAULT ACTIVE' : 'NOMINAL'}
          </span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Quick Scenario Buttons (Spec Section 19.7) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                INJECT FAULT SCENARIO
              </span>
              <span className="text-[9px] font-mono text-accent-amber font-semibold">
                SOFTWARE SIM ONLY
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFailedNodeId('PMU')}
                className={`p-2 rounded text-left border transition ${failedNodeId === 'PMU' ? 'bg-red-500/20 border-red-500/50 text-accent-red font-bold' : 'bg-elevated hover:bg-hover border-subtle text-secondary'}`}
              >
                <div className="text-[11px] font-bold">Fail PMU</div>
                <div className="text-[9px] text-muted">Primary rail loss</div>
              </button>

              <button
                onClick={() => setFailedNodeId('STM32')}
                className={`p-2 rounded text-left border transition ${failedNodeId === 'STM32' ? 'bg-red-500/20 border-red-500/50 text-accent-red font-bold' : 'bg-elevated hover:bg-hover border-subtle text-secondary'}`}
              >
                <div className="text-[11px] font-bold">Fail STM32</div>
                <div className="text-[9px] text-muted">MCU logic loss</div>
              </button>

              <button
                onClick={() => setFailedNodeId('IMU')}
                className={`p-2 rounded text-left border transition ${failedNodeId === 'IMU' ? 'bg-red-500/20 border-red-500/50 text-accent-red font-bold' : 'bg-elevated hover:bg-hover border-subtle text-secondary'}`}
              >
                <div className="text-[11px] font-bold">Fail IMU</div>
                <div className="text-[9px] text-muted">Attitude blindness</div>
              </button>

              <button
                onClick={() => setFailedNodeId('ESC')}
                className={`p-2 rounded text-left border transition ${failedNodeId === 'ESC' ? 'bg-red-500/20 border-red-500/50 text-accent-red font-bold' : 'bg-elevated hover:bg-hover border-subtle text-secondary'}`}
              >
                <div className="text-[11px] font-bold">Fail ESC</div>
                <div className="text-[9px] text-muted">Motor actuation loss</div>
              </button>
            </div>
          </div>

          {/* Scenario Details */}
          <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-2.5">
            <span className="text-[10px] text-muted uppercase tracking-wider block">
              DIAGNOSTIC SUMMARY
            </span>

            <div className="flex items-center justify-between border-b border-subtle/60 pb-2">
              <span className="text-muted">FAILED MODULE:</span>
              <span className="font-bold text-accent-red">
                {failedNodeId ? `${failedNodeId} (${failedNode ? failedNode.name : 'Unknown'})` : 'None (All Nominal)'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted">REACHABILITY REF:</span>
              <span className="text-primary font-bold">PMU (3.3V Logic)</span>
            </div>

            <div className="pt-1">
              <span className="text-muted block text-[10px] mb-1">MODULES CUT OFF ({cutoffNodes.length}):</span>
              <div className="flex flex-wrap gap-1">
                {cutoffNodes.length > 0 ? (
                  cutoffNodes.map(id => (
                    <span key={id} className="px-1.5 py-0.5 rounded bg-red-900/40 text-red-200 border border-red-500/40 text-[10px]">
                      {id}
                    </span>
                  ))
                ) : (
                  <span className="text-accent-green font-bold">0 (All Reachable)</span>
                )}
              </div>
            </div>

            <div className="pt-1">
              <span className="text-muted block text-[10px] mb-1">SURVIVING MODULES ({reachableNodes.length}):</span>
              <div className="flex flex-wrap gap-1">
                {reachableNodes.map(id => (
                  <span key={id} className="px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-200 border border-emerald-500/40 text-[10px]">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Interpretation Note (Spec Section 8) */}
          <div className="bg-panel border border-subtle rounded-lg p-3 text-[11px] text-secondary font-sans leading-relaxed space-y-2">
            <span className="font-bold text-primary font-mono text-xs block">
              Topological Interpretation:
            </span>
            {failedNodeId === 'PMU' && (
              <p>
                The PMU acts as the root power vertex. Severing the PMU isolates all components from power delivery, resulting in a total flight controller blackout.
              </p>
            )}
            {failedNodeId === 'STM32' && (
              <p>
                The STM32 is an articulation point for control signals. While other modules may physically remain on the 3.3V power rail, control telemetry, attitude computation, and motor commands are completely severed.
              </p>
            )}
            {failedNodeId !== 'PMU' && failedNodeId !== 'STM32' && (
              <p>
                The loss of {failedNodeId || 'a leaf peripheral'} isolates that specific sensor/interface without breaking power delivery to the rest of the board.
              </p>
            )}
          </div>

          {/* Honesty Note */}
          <div className="p-2.5 rounded bg-black/30 border border-subtle text-[10px] text-muted leading-snug">
            <strong className="text-secondary block mb-0.5">Model Limitation Note:</strong>
            This graph reachability model evaluates topological connectivity. It does not model electrical ground loops, thermal overload, or dynamic signal noise.
          </div>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.FailureAnalysisPage = FailureAnalysisPage;
}
