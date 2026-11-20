// Interactive SVG Board Visualizer superimposed on KiCad PCB
// Polished Aerospace & EDA CAD Design System
function PcbVisualizer({
  nodes,
  edges,
  nodePosMap,
  highlightedNodes,
  highlightedEdges,
  failedNode,
  isolatedNodes,
  onNodeClick,
  hoveredNode,
  setHoveredNode,
  hoveredEdge,
  setHoveredEdge,
  tooltipPos,
  setTooltipPos,
  includeAux,
  setIncludeAux,
  graphMode,
  setGraphMode
}) {
  return (
    <div className="bg-panel border border-subtle rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* CAD Toolbar Header */}
      <div className="p-3.5 border-b border-subtle flex flex-wrap items-center justify-between gap-3 bg-sidebar/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#36C98F]"></div>
          <div>
            <h2 className="text-xs font-bold text-primary flex items-center gap-2">
              <span>KiCad PCB & Electrical Net Graph Overlay</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                Hades Micro 50.1 × 50.1 mm
              </span>
            </h2>
            <div className="text-[10px] text-muted font-mono">2-Layer FR4 • 100% Routed (0 Unconnected Nets)</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          {/* Aux Toggle */}
          <button
            onClick={() => setIncludeAux(!includeAux)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition flex items-center gap-1.5 cursor-pointer ${
              includeAux
                ? 'bg-sky-500/20 text-accent-cyan border-sky-400/40'
                : 'bg-elevated text-muted hover:text-primary border-subtle'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${includeAux ? 'bg-accent-cyan' : 'bg-muted'}`}></span>
            <span>Aux Sensors</span>
          </button>

          {/* Topology Mode Switcher */}
          <div className="inline-flex bg-elevated p-0.5 rounded-lg border border-subtle text-[11px]">
            <button
              onClick={() => setGraphMode('functional')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                graphMode === 'functional'
                  ? 'bg-sky-500 text-white shadow-sm font-semibold'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Star Bus
            </button>
            <button
              onClick={() => setGraphMode('mesh')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                graphMode === 'mesh'
                  ? 'bg-sky-500 text-white shadow-sm font-semibold'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Full Mesh
            </button>
          </div>
        </div>
      </div>

      {/* PCB Board Container */}
      <div className="relative aspect-square w-full bg-[#05080E] overflow-hidden select-none crt-grid">
        <img
          src="pcb.svg"
          alt="KiCad Board"
          className="w-full h-full object-contain filter contrast-110 brightness-105 opacity-90 transition-opacity"
        />

        {/* SVG Graph Overlay */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Edges / Copper Traces */}
          {edges.map((e, idx) => {
            const p = nodePosMap[e.a || e.from];
            const q = nodePosMap[e.b || e.to];
            if (!p || !q) return null;
            const hl = highlightedEdges[e.i !== undefined ? e.i : idx];
            const stroke = hl ? hl.color : 'rgba(85, 200, 232, 0.45)';
            const strokeWidth = hl ? hl.width : 1.1;
            const isEdgeHl = !!hl;

            return (
              <g key={'e_' + idx}>
                {/* Invisible hover hitbox */}
                <line
                  x1={p.x} y1={p.y} x2={q.x} y2={q.y}
                  stroke="transparent"
                  strokeWidth={8}
                  className="cursor-pointer"
                  onMouseEnter={(ev) => {
                    setHoveredEdge(e);
                    setTooltipPos({ x: ev.clientX, y: ev.clientY });
                  }}
                  onMouseLeave={() => setHoveredEdge(null)}
                />
                {/* Physical trace line */}
                <line
                  x1={p.x} y1={p.y} x2={q.x} y2={q.y}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  className={isEdgeHl ? 'edge-active' : ''}
                />
              </g>
            );
          })}

          {/* Microelectronic Component Nodes */}
          {nodes.map(n => {
            const p = nodePosMap[n.id];
            if (!p) return null;

            const isFailed = failedNode === n.id;
            const isIsolated = isolatedNodes.includes(n.id);
            const customColor = highlightedNodes[n.id];

            let fill = n.color || '#38bdf8';
            if (isFailed) fill = '#ef4444';
            else if (isIsolated) fill = '#64748b';
            else if (customColor) fill = customColor;

            const isHl = !!customColor || isFailed;

            return (
              <g
                key={'n_' + n.id}
                className="cursor-pointer group"
                onClick={() => onNodeClick(n.id)}
                onMouseEnter={(ev) => {
                  setHoveredNode(n);
                  setTooltipPos({ x: ev.clientX, y: ev.clientY });
                }}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Outer Glow Ring */}
                {isHl && (
                  <circle
                    cx={p.x} cy={p.y} r={4.5}
                    fill="none"
                    stroke={fill}
                    strokeWidth={0.8}
                    className={isFailed ? 'glow-critical' : 'animate-pulse'}
                  />
                )}

                {/* Substrate Solder Ring */}
                <circle
                  cx={p.x} cy={p.y} r={3.2}
                  fill="rgba(8, 13, 20, 0.85)"
                  stroke={fill}
                  strokeWidth={0.6}
                  className="transition-all group-hover:scale-110"
                />

                {/* Core Component Die */}
                <circle
                  cx={p.x} cy={p.y} r={2.0}
                  fill={fill}
                  stroke="#ffffff"
                  strokeWidth={0.4}
                />

                {/* Node Label Text */}
                <text
                  x={p.x} y={p.y - 3.8}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={2.7}
                  fontFamily="Inter, sans-serif"
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                >
                  {n.id}
                </text>

                {/* Reference Designator Subtitle */}
                <text
                  x={p.x} y={p.y + 4.6}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize={1.9}
                  fontFamily="JetBrains Mono, monospace"
                  className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                >
                  {n.ref || ''}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Inspector Tooltip Popup */}
        {(hoveredNode || hoveredEdge) && (
          <div
            className="fixed z-50 glass-hud text-primary text-xs p-3 rounded-xl pointer-events-none shadow-2xl"
            style={{
              left: Math.min(window.innerWidth - 260, tooltipPos.x + 16),
              top: Math.min(window.innerHeight - 180, tooltipPos.y + 16),
              maxWidth: 260
            }}
          >
            {hoveredNode && (
              <div className="space-y-1 font-mono">
                <div className="flex items-center justify-between border-b border-subtle pb-1">
                  <span className="font-bold text-accent-cyan text-[11px]">{hoveredNode.name}</span>
                  <span className="text-[9px] text-muted bg-panel px-1 rounded">{hoveredNode.id}</span>
                </div>
                <div className="text-[10px] text-secondary"><span className="text-muted">Chip:</span> {hoveredNode.chip}</div>
                <div className="text-[10px] text-secondary"><span className="text-muted">Role:</span> {hoveredNode.role}</div>
                <div className="text-[10px] text-secondary"><span className="text-muted">Footprint:</span> ({hoveredNode.x}mm, {hoveredNode.y}mm)</div>
                <div className="text-[9px] text-accent-amber pt-1 border-t border-subtle">
                  • Click component to simulate cascade failure
                </div>
              </div>
            )}
            {hoveredEdge && (
              <div className="space-y-1 font-mono">
                <div className="flex items-center justify-between border-b border-subtle pb-1">
                  <span className="font-bold text-accent-amber text-[11px]">Trace: {hoveredEdge.a || hoveredEdge.from} ↔ {hoveredEdge.b || hoveredEdge.to}</span>
                  <span className="text-[9px] text-accent-cyan bg-panel px-1 rounded">{hoveredEdge.signal_type || 'SIGNAL'}</span>
                </div>
                <div className="text-[10px] text-secondary"><span className="text-muted">Length:</span> <strong className="text-primary">{hoveredEdge.weight || hoveredEdge.distM} mm</strong></div>
                <div className="text-[10px] text-secondary"><span className="text-muted">Vias:</span> {hoveredEdge.vias || 0} | <span className="text-muted">Layers:</span> {(hoveredEdge.layers || ['F.Cu', 'B.Cu']).join(', ')}</div>
                <div className="text-[10px] text-secondary truncate"><span className="text-muted">Nets:</span> {(hoveredEdge.nets || ['SPI_SCK', 'I2C_SDA']).join(', ')}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Board Footer Status Strip */}
      <div className="p-3 bg-sidebar border-t border-subtle text-[11px] font-mono text-secondary flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> STM32 (MCU)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> IMU (Sense)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> PMU (Power)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> ESC (Act)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500"></span> GPS (Nav)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Comm (Link)</span>
        </div>
        <div className="text-[10px] text-muted">
          Click any component to trigger fault propagation
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.PcbVisualizer = PcbVisualizer;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PcbVisualizer };
}
