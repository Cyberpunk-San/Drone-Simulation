// AEROLAB Screen 02 — PCB Explorer (Spec Section 6: Hero Screen)
function PcbExplorerPage({
  graphData,
  selectedNode,
  setSelectedNode,
  selectedEdge,
  setSelectedEdge,
  onSimulateFailure
}) {
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [startPan, setStartPan] = React.useState({ x: 0, y: 0 });
  const [showOverlay, setShowOverlay] = React.useState(true);
  const [showLabels, setShowLabels] = React.useState(true);
  const [activeLayers, setActiveLayers] = React.useState({ fCu: true, bCu: true });
  const [hoveredNode, setHoveredNode] = React.useState(null);
  const [hoveredEdge, setHoveredEdge] = React.useState(null);
  const [pcbDisplayMode, setPcbDisplayMode] = React.useState('kicad'); // 'kicad' | 'harness'

  const nodes = (graphData && graphData.nodes) || [];
  const edges = (graphData && (graphData.functional_edges || graphData.edges)) || [];

  // Coordinate normalizer (KiCad mm coordinates inside 50.1 x 50.1mm board)
  // Origin offset is (19.95, 19.95)
  const normX = (x) => ((x - 19.95) / 50.1) * 100;
  const normY = (y) => ((y - 19.95) / 50.1) * 100;

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.6));
  const handleResetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const handleFitView = () => { setZoom(1.15); setPan({ x: 0, y: 0 }); };

  // Pan controls
  const handleMouseDown = (e) => {
    if (e.target.closest('.interactive-node') || e.target.closest('.interactive-edge')) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(Math.max(prev * factor, 0.6), 3.5));
  };

  // Find incident edges for selected node
  const getIncidentEdges = (nodeId) => {
    if (!nodeId) return [];
    return edges.filter(e => (e.from === nodeId || e.to === nodeId || e.a === nodeId || e.b === nodeId));
  };

  // Find connected neighbors
  const getConnectedNeighbors = (nodeId) => {
    if (!nodeId) return [];
    const incidents = getIncidentEdges(nodeId);
    return incidents.map(e => {
      const neighborId = (e.from === nodeId ? e.to : (e.to === nodeId ? e.from : (e.a === nodeId ? e.b : e.a)));
      const neighborNode = nodes.find(n => n.id === neighborId);
      return {
        id: neighborId,
        node: neighborNode,
        edge: e
      };
    });
  };

  const incidentEdges = selectedNode ? getIncidentEdges(selectedNode.id) : [];
  const neighborList = selectedNode ? getConnectedNeighbors(selectedNode.id) : [];

  if (pcbDisplayMode === 'harness') {
    return (
      <div className="space-y-4">
        {/* View Mode Bar */}
        <div className="bg-panel border border-subtle rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex bg-elevated p-0.5 rounded-lg border border-subtle text-xs font-mono">
            <button
              onClick={() => setPcbDisplayMode('kicad')}
              className="px-3 py-1.5 rounded-md font-semibold text-muted hover:text-primary transition"
            >
              KiCad Internal PCB Netlist
            </button>
            <button
              onClick={() => setPcbDisplayMode('harness')}
              className="px-3 py-1.5 rounded-md font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm transition flex items-center gap-2"
            >
              <span>Real Drone Harness & Heterogeneous AI</span>
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></span>
            </button>
          </div>
          <div className="text-xs font-mono text-muted flex items-center gap-2">
            <span>STM32F7 Flight Controller • 'Bharati Kshetrā' Lock • 4 TOPS Coral Edge TPU</span>
          </div>
        </div>

        {window.FC && window.FC.HardwareHarnessPage && (
          <window.FC.HardwareHarnessPage graphData={graphData} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-6.5rem)] min-h-[640px]">
      {/* 1. Left / Center (70%): PCB Interactive Canvas */}
      <div className="flex-1 bg-panel border border-subtle rounded-xl flex flex-col overflow-hidden relative select-none">
        {/* Board Toolbar */}
        <div className="h-12 bg-sidebar border-b border-subtle px-4 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="inline-flex bg-elevated p-0.5 rounded-lg border border-subtle text-xs font-mono">
              <button
                onClick={() => setPcbDisplayMode('kicad')}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/20 text-accent-cyan border border-sky-400/40"
              >
                KiCad PCB
              </button>
              <button
                onClick={() => setPcbDisplayMode('harness')}
                className="px-2 py-0.5 rounded text-[11px] font-semibold text-muted hover:text-primary transition flex items-center gap-1"
              >
                <span>Real Drone Wires</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse"></span>
              </button>
            </div>
            <span className="text-border-strong">|</span>
            <span className="text-xs font-mono text-primary font-semibold hidden md:inline">
              Hades Micro 50x50mm
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Layer Toggles */}
            <div className="hidden sm:flex items-center gap-1 bg-elevated rounded-md p-1 border border-subtle text-[11px] font-mono">
              <button
                onClick={() => setActiveLayers(p => ({ ...p, fCu: !p.fCu }))}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${activeLayers.fCu ? 'bg-red-900/60 text-red-200 border border-red-500/40' : 'text-muted hover:text-secondary'}`}
                title="Toggle Front Copper (F.Cu)"
              >
                F.Cu
              </button>
              <button
                onClick={() => setActiveLayers(p => ({ ...p, bCu: !p.bCu }))}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${activeLayers.bCu ? 'bg-blue-900/60 text-blue-200 border border-blue-500/40' : 'text-muted hover:text-secondary'}`}
                title="Toggle Back Copper (B.Cu)"
              >
                B.Cu
              </button>
            </div>

            {/* Overlay Toggle */}
            <button
              onClick={() => setShowOverlay(!showOverlay)}
              className={`px-2.5 py-1 rounded text-xs font-mono border transition ${showOverlay ? 'bg-panel text-accent-cyan border-sky-500/40 font-semibold' : 'bg-elevated text-muted border-subtle'}`}
              title="Toggle Graph Topology Overlay"
            >
              Overlay: {showOverlay ? 'ON' : 'OFF'}
            </button>

            {/* Labels Toggle */}
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`hidden md:block px-2.5 py-1 rounded text-xs font-mono border transition ${showLabels ? 'bg-panel text-accent-amber border-amber-500/40' : 'bg-elevated text-muted border-subtle'}`}
              title="Toggle Component Labels"
            >
              Labels
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-elevated rounded-md border border-subtle p-0.5 font-mono text-xs">
              <button
                onClick={handleZoomOut}
                className="w-6 h-6 flex items-center justify-center hover:bg-hover rounded text-secondary"
                title="Zoom Out"
              >
                -
              </button>
              <span className="w-10 text-center text-[11px] font-medium text-primary">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="w-6 h-6 flex items-center justify-center hover:bg-hover rounded text-secondary"
                title="Zoom In"
              >
                +
              </button>
            </div>

            <button
              onClick={handleFitView}
              className="px-2 py-1 rounded bg-elevated hover:bg-hover text-secondary border border-subtle text-[11px] font-mono transition"
              title="Fit Board to View"
            >
              Fit
            </button>

            <button
              onClick={handleResetView}
              className="px-2 py-1 rounded bg-elevated hover:bg-hover text-secondary border border-subtle text-[11px] font-mono transition"
              title="Reset Zoom & Pan"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Viewport Canvas */}
        <div
          className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing flex items-center justify-center bg-black/40"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Coordinate grid background pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #223244 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Transform Container (Synchronous Image + Overlay Scale & Translate) */}
          <div
            className="relative transition-transform duration-75 ease-out select-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              width: '560px',
              height: '560px'
            }}
          >
            {/* Real KiCad PCB Image Export (pcb.svg) */}
            <img
              src="pcb.svg"
              alt="Hades Micro KiCad PCB"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none shadow-2xl rounded-lg"
              style={{
                filter: activeLayers.fCu && activeLayers.bCu
                  ? 'brightness(1.05) contrast(1.1)'
                  : activeLayers.fCu
                    ? 'sepia(0.3) hue-rotate(-30deg) brightness(1.05)'
                    : 'hue-rotate(180deg) brightness(0.95)'
              }}
              onError={(e) => {
                // If pcb.svg fails to load, gracefully display realistic PCB board background
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />

            {/* Fallback PCB Canvas if pcb.svg file is absent */}
            <div
              className="absolute inset-0 w-full h-full rounded-xl border border-emerald-500/30 bg-[#061e14] hidden pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 40px rgba(16, 185, 129, 0.15), 0 0 25px rgba(0,0,0,0.8)'
              }}
            >
              <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400/70 font-semibold tracking-wider">
                HADES MICRO 50×50mm • 4-LAYER COPPER
              </div>
            </div>

            {/* SVG Graph Overlay (Coordinate-aligned with PCB 50.1 x 50.1mm) */}
            {showOverlay && (
              <svg className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#55C8E8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#36C98F" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Edges */}
                {edges.map((edge, idx) => {
                  const srcId = edge.from || edge.a;
                  const dstId = edge.to || edge.b;
                  const srcNode = nodes.find(n => n.id === srcId);
                  const dstNode = nodes.find(n => n.id === dstId);
                  if (!srcNode || !dstNode) return null;

                  const x1 = (normX(srcNode.x) / 100) * 560;
                  const y1 = (normY(srcNode.y) / 100) * 560;
                  const x2 = (normX(dstNode.x) / 100) * 560;
                  const y2 = (normY(dstNode.y) / 100) * 560;

                  const isSelected = selectedEdge &&
                    ((selectedEdge.from === srcId && selectedEdge.to === dstId) ||
                     (selectedEdge.a === srcId && selectedEdge.b === dstId) ||
                     (selectedEdge.from === dstId && selectedEdge.to === srcId) ||
                     (selectedEdge.a === dstId && selectedEdge.b === srcId));

                  const isIncidentToSelectedNode = selectedNode &&
                    (srcId === selectedNode.id || dstId === selectedNode.id);

                  const isHovered = hoveredEdge &&
                    ((hoveredEdge.from === srcId && hoveredEdge.to === dstId) ||
                     (hoveredEdge.a === srcId && hoveredEdge.b === dstId));

                  let strokeColor = '#223244';
                  let strokeWidth = 2;
                  let strokeDash = 'none';

                  if (isSelected) {
                    strokeColor = '#F2B45B';
                    strokeWidth = 3.5;
                  } else if (isIncidentToSelectedNode) {
                    strokeColor = '#55C8E8';
                    strokeWidth = 3;
                  } else if (isHovered) {
                    strokeColor = '#8FE0F8';
                    strokeWidth = 2.5;
                  } else {
                    strokeColor = edge.color || '#334D66';
                  }

                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2;

                  return (
                    <g
                      key={`edge-${idx}`}
                      className="interactive-edge cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEdge(edge);
                        setSelectedNode(null);
                      }}
                      onMouseEnter={() => setHoveredEdge(edge)}
                      onMouseLeave={() => setHoveredEdge(null)}
                    >
                      {/* Thick transparent stroke for easier clicking */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="transparent"
                        strokeWidth="14"
                      />
                      {/* Visible Trace Line */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDash}
                        filter={isSelected || isIncidentToSelectedNode ? 'url(#glow)' : undefined}
                        className="transition-colors duration-150"
                      />
                      {/* Cost badge on edge */}
                      {showLabels && (isSelected || isIncidentToSelectedNode || isHovered) && (
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x="-18"
                            y="-9"
                            width="36"
                            height="18"
                            rx="4"
                            fill="#0B121B"
                            stroke={strokeColor}
                            strokeWidth="1"
                          />
                          <text
                            textAnchor="middle"
                            dy="3.5"
                            fill="#E6EDF3"
                            fontSize="9"
                            fontFamily="JetBrains Mono, monospace"
                            fontWeight="bold"
                          >
                            {(edge.weight || edge.cost || 0).toFixed(1)}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                  const cx = (normX(node.x) / 100) * 560;
                  const cy = (normY(node.y) / 100) * 560;

                  const isSelected = selectedNode && selectedNode.id === node.id;
                  const isNeighbor = neighborList.some(nb => nb.id === node.id);
                  const isHovered = hoveredNode && hoveredNode.id === node.id;

                  let nodeColor = node.color || '#55C8E8';
                  let ringColor = 'transparent';
                  let radius = 10;

                  if (isSelected) {
                    ringColor = '#F2B45B';
                    radius = 12;
                  } else if (isNeighbor) {
                    ringColor = '#55C8E8';
                    radius = 11;
                  } else if (isHovered) {
                    ringColor = '#ffffff';
                    radius = 11;
                  }

                  return (
                    <g
                      key={`node-${node.id}`}
                      className="interactive-node cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(node);
                        setSelectedEdge(null);
                      }}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {/* Outer pulse / selection ring */}
                      {(isSelected || isNeighbor) && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={radius + 6}
                          fill="none"
                          stroke={ringColor}
                          strokeWidth="2"
                          strokeDasharray={isSelected ? 'none' : '3 3'}
                          className={isSelected ? 'animate-pulse' : ''}
                          opacity="0.85"
                        />
                      )}

                      {/* Node Body */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill={nodeColor}
                        stroke="#0B121B"
                        strokeWidth="2.5"
                        filter={isSelected ? 'url(#glow)' : undefined}
                      />

                      {/* Inner Target Pip */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="3.5"
                        fill="#080D14"
                      />

                      {/* Node Label */}
                      {showLabels && (
                        <g transform={`translate(${cx}, ${cy + radius + 12})`}>
                          <rect
                            x="-28"
                            y="-8"
                            width="56"
                            height="16"
                            rx="3"
                            fill="#0B121B"
                            stroke={isSelected ? '#F2B45B' : '#223244'}
                            strokeWidth="1"
                            opacity="0.9"
                          />
                          <text
                            textAnchor="middle"
                            dy="3.5"
                            fill={isSelected ? '#F2B45B' : '#E6EDF3'}
                            fontSize="9.5"
                            fontFamily="JetBrains Mono, monospace"
                            fontWeight="bold"
                          >
                            {node.id}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Reset View Floating Button */}
          <button
            onClick={handleResetView}
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-panel/90 border border-subtle text-secondary hover:text-primary hover:border-border-strong text-xs font-mono transition shadow-lg backdrop-blur-sm z-20"
          >
            Reset View
          </button>
        </div>

        {/* Canvas Bottom Legend (Spec Section 6.2 & 2.2) */}
        <div className="h-10 bg-sidebar border-t border-subtle px-4 flex items-center justify-between text-[11px] font-mono shrink-0 overflow-x-auto">
          <div className="flex items-center gap-4">
            <span className="text-muted font-bold text-[10px] tracking-wider uppercase">LEGEND:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan"></span>
              <span className="text-secondary">MCU (STM32)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-green"></span>
              <span className="text-secondary">IMU Sensor</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-red"></span>
              <span className="text-secondary">Power (PMU)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-amber"></span>
              <span className="text-secondary">Motor (ESC)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              <span className="text-secondary">Comm / GPS</span>
            </div>
          </div>

          <div className="text-muted text-[10px]">
            Scroll to zoom • Drag to pan • Click node/edge to inspect
          </div>
        </div>
      </div>

      {/* 2. Right (30%): Component / Edge Inspector Panel */}
      <div className="w-full lg:w-80 xl:w-96 bg-panel border border-subtle rounded-xl flex flex-col overflow-hidden shrink-0">
        {/* Panel Header */}
        <div className="h-12 bg-sidebar border-b border-subtle px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span className="text-xs font-mono font-bold text-primary tracking-wide uppercase">
              {selectedNode ? 'Component Inspector' : (selectedEdge ? 'Edge Inspector' : 'Topology Inspector')}
            </span>
          </div>

          {(selectedNode || selectedEdge) && (
            <button
              onClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
              className="text-[11px] font-mono text-muted hover:text-secondary transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Panel Content (Scrollable) */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
          {/* CASE 1: NODE SELECTED */}
          {selectedNode && (
            <div className="space-y-4">
              {/* Primary Node Badge */}
              <div className="bg-elevated border border-subtle rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-muted uppercase tracking-wider block">MODULE</span>
                    <h3 className="text-base font-bold text-primary font-sans mt-0.5">
                      {selectedNode.name || selectedNode.id}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-sky-500/15 text-accent-cyan border border-sky-500/30 font-bold text-[10px]">
                    {selectedNode.ref || selectedNode.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] border-t border-subtle/60 pt-2.5">
                  <div>
                    <span className="text-muted block text-[10px]">PART / CHIP</span>
                    <span className="text-secondary font-medium truncate block" title={selectedNode.chip}>
                      {selectedNode.chip || 'Standard IC'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px]">PIN COUNT</span>
                    <span className="text-secondary font-medium">
                      {selectedNode.pins || 16} pins
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px]">COORDINATES</span>
                    <span className="text-secondary font-medium">
                      X: {selectedNode.x}mm, Y: {selectedNode.y}mm
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px]">ROLE</span>
                    <span className="text-accent-amber font-medium truncate block">
                      {selectedNode.role || 'Peripheral'}
                    </span>
                  </div>
                </div>

                {selectedNode.description && (
                  <p className="text-[11px] text-secondary font-sans mt-2.5 leading-relaxed bg-black/20 p-2 rounded border border-subtle/50">
                    {selectedNode.description}
                  </p>
                )}
              </div>

              {/* Connected Neighbors Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                    CONNECTED NEIGHBORS ({neighborList.length})
                  </span>
                  <span className="text-[10px] text-accent-cyan">
                    Routing Cost (mm-eq)
                  </span>
                </div>

                <div className="space-y-1.5">
                  {neighborList.map((nb, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedNode(nb.node || nodes.find(n => n.id === nb.id))}
                      className="p-2 rounded bg-elevated hover:bg-hover border border-subtle flex items-center justify-between cursor-pointer transition"
                    >
                      <div>
                        <div className="font-bold text-primary flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: (nb.node && nb.node.color) || '#55C8E8' }}
                          />
                          <span>{nb.id}</span>
                          <span className="text-muted font-normal text-[10px]">
                            ({(nb.node && nb.node.ref) || 'EXT'})
                          </span>
                        </div>
                        <div className="text-[10px] text-muted mt-0.5 truncate max-w-[160px]">
                          {nb.edge.nets ? nb.edge.nets.join(', ') : 'Direct SPI/I2C/Power'}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-accent-cyan text-xs">
                          {(nb.edge.weight || nb.edge.cost || 0).toFixed(1)}
                        </span>
                        <span className="text-[9px] text-muted block">mm-eq</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Node Actions */}
              <div className="pt-2 border-t border-subtle space-y-2">
                <button
                  onClick={() => onSimulateFailure && onSimulateFailure(selectedNode.id)}
                  className="w-full py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-accent-red border border-red-500/40 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                  </svg>
                  SIMULATE FAILURE IN SCENARIO 04
                </button>
              </div>
            </div>
          )}

          {/* CASE 2: EDGE SELECTED (Spec Section 19.6) */}
          {!selectedNode && selectedEdge && (
            <div className="space-y-4">
              <div className="bg-elevated border border-subtle rounded-lg p-3">
                <span className="text-[10px] text-muted uppercase tracking-wider block">MODULE CONNECTIVITY GRAPH EDGE</span>
                <div className="flex items-center gap-2 mt-1 font-bold text-base text-primary">
                  <span>{selectedEdge.from || selectedEdge.a}</span>
                  <span className="text-accent-cyan">→</span>
                  <span>{selectedEdge.to || selectedEdge.b}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] border-t border-subtle/60 pt-2.5">
                  <div>
                    <span className="text-muted block text-[10px]">GRAPH EDGE COST</span>
                    <span className="text-accent-cyan font-bold text-sm">
                      {(selectedEdge.weight || selectedEdge.cost || 0).toFixed(2)} mm-eq
                    </span>
                    <span className="text-[9px] text-muted block">Net-level aggregate</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px]">VIA PENALTY</span>
                    <span className="text-secondary font-medium">
                      +2.0 mm / via
                    </span>
                    <span className="text-[9px] text-muted block">{selectedEdge.vias || 1} via(s) configured</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px]">COPPER LAYERS</span>
                    <span className="text-secondary font-medium">
                      {selectedEdge.layer || (selectedEdge.layers ? selectedEdge.layers.join(', ') : 'F.Cu / B.Cu')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px]">SIGNAL TYPE</span>
                    <span className="text-accent-amber font-medium">
                      {selectedEdge.signal_type || 'Mixed Net'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 bg-black/20 p-2 rounded border border-subtle/50 text-[10px] text-muted">
                  <span className="text-secondary font-semibold block mb-0.5">Shared Extracted Nets:</span>
                  {selectedEdge.nets && selectedEdge.nets.length > 0
                    ? selectedEdge.nets.join(', ')
                    : 'SPI1_SCK, SPI1_MISO, SPI1_MOSI, +3V3, GND'}
                </div>
              </div>

              <div className="bg-panel border border-subtle rounded-lg p-3 text-[11px] text-muted leading-relaxed font-sans">
                <strong className="text-primary block mb-1 font-mono text-xs">Technical Semantics Disclosure:</strong>
                This edge represents an abstract module-connectivity relationship between IC footprints sharing one or more nets.
                The edge cost reflects the netlist extraction model (trace distance plus a 2.0 mm penalty per via) rather than an isolated single copper segment.
              </div>
            </div>
          )}

          {/* CASE 3: NOTHING SELECTED */}
          {!selectedNode && !selectedEdge && (
            <div className="space-y-4">
              <div className="p-3 bg-elevated/50 border border-subtle rounded-lg text-secondary text-xs leading-relaxed font-sans">
                Select a module or trace line on the PCB to inspect its hardware mapping, physical coordinates, and connected graph topology.
              </div>

              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">
                  MODULE CATALOGUE ({nodes.length})
                </span>
                <div className="space-y-1.5">
                  {nodes.map((node) => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className="p-2 rounded bg-elevated hover:bg-hover border border-subtle flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: node.color || '#55C8E8' }}
                        />
                        <div>
                          <div className="font-bold text-primary text-xs">{node.id}</div>
                          <div className="text-[10px] text-muted">{node.name}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-accent-cyan font-mono">
                        {node.ref}
                      </span>
                    </div>
                  ))}
                </div>
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
  window.FC.PcbExplorerPage = PcbExplorerPage;
}
