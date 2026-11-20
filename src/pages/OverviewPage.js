// AEROLAB Screen 01 — Overview Page (Spec Section 5)
function OverviewPage({
  graphData,
  onNavigate,
  onStartGuidedDemo
}) {
  const nodes = (graphData && graphData.nodes) || [];
  const edges = (graphData && (graphData.functional_edges || graphData.edges)) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="bg-panel border border-subtle rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono font-bold text-accent-cyan tracking-wider uppercase mb-1">
            FLIGHT CONTROLLER / GRAPH THEORY LAB
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight font-sans">
            Flight Controller Analysis
          </h1>
          <p className="text-sm text-secondary mt-1 max-w-2xl leading-relaxed">
            Explore the board topology, evaluate graph properties, and inspect a simplified flight-control loop.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('pcb-explorer')}
            className="px-4 py-2 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-accent-cyan border border-sky-400/40 text-xs font-mono font-bold flex items-center gap-2 transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="9" width="6" height="6" />
            </svg>
            <span>OPEN PCB EXPLORER</span>
          </button>

          <button
            onClick={onStartGuidedDemo}
            className="px-4 py-2 rounded-lg bg-elevated hover:bg-hover text-primary border border-subtle text-xs font-mono font-medium transition"
          >
            RUN GUIDED DEMO
          </button>
        </div>
      </div>

      {/* 2. Project Status Strip (4 Items) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 font-mono text-xs">
        <div className="bg-panel border border-subtle rounded-lg p-3.5 flex flex-col justify-between">
          <span className="text-[10px] text-muted uppercase">PCB IMAGE</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-accent-green"></span>
            <span className="font-semibold text-primary">Ready (pcb.svg)</span>
          </div>
          <span className="text-[10px] text-secondary mt-1">Hades Micro 50×50mm</span>
        </div>

        <div className="bg-panel border border-subtle rounded-lg p-3.5 flex flex-col justify-between">
          <span className="text-[10px] text-muted uppercase">GRAPH DATA</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-accent-cyan"></span>
            <span className="font-semibold text-primary">Loaded ({nodes.length} Nodes, {edges.length} Edges)</span>
          </div>
          <span className="text-[10px] text-secondary mt-1">KiCad 10.0 netlist</span>
        </div>

        <div className="bg-panel border border-subtle rounded-lg p-3.5 flex flex-col justify-between">
          <span className="text-[10px] text-muted uppercase">KICAD VALIDATION</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-accent-green"></span>
            <span className="font-semibold text-primary">ERC / DRC Passed</span>
          </div>
          <span className="text-[10px] text-secondary mt-1">0 Errors, 0 Violations</span>
        </div>

        <div className="bg-panel border border-subtle rounded-lg p-3.5 flex flex-col justify-between">
          <span className="text-[10px] text-muted uppercase">HARDWARE VALIDATION</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-accent-amber"></span>
            <span className="font-semibold text-accent-amber">Stage 1-2 Passed</span>
          </div>
          <span className="text-[10px] text-secondary mt-1">Stage 4 Bring-up Pending</span>
        </div>
      </div>

      {/* 3. Main Feature Panel (Real PCB Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-panel border border-subtle rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between border-b border-subtle pb-3 mb-4">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">HERO PREVIEW</span>
              <h2 className="text-sm font-bold text-primary font-sans">KiCad Physical PCB & Graph Overlay</h2>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-elevated border border-subtle text-secondary">50.1 × 50.1 mm</span>
              <span className="px-2 py-0.5 rounded bg-elevated border border-subtle text-secondary">2-Layer FR4</span>
            </div>
          </div>

          {/* Board Centerpiece Viewport */}
          <div
            onClick={() => onNavigate('pcb-explorer')}
            className="relative h-80 bg-app rounded-lg border border-subtle flex items-center justify-center overflow-hidden cursor-pointer hover:border-accent-cyan/50 transition group"
          >
            <img
              src="pcb.svg"
              alt="Hades Micro KiCad PCB"
              className="max-h-full max-w-full object-contain filter contrast-125 opacity-90 group-hover:scale-102 transition duration-300"
            />

            {/* Subtle Overlay Node Badges */}
            <div className="absolute inset-0 pointer-events-none">
              {nodes.map(n => {
                const px = ((n.x - 19.95) / 50.1) * 100;
                const py = ((n.y - 19.95) / 50.1) * 100;
                return (
                  <div
                    key={n.id}
                    style={{ left: `${px}%`, top: `${py}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-accent-cyan bg-elevated flex items-center justify-center shadow-[0_0_8px_rgba(85,200,232,0.4)]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan"></span>
                  </div>
                );
              })}
            </div>

            <div className="absolute bottom-3 right-3 bg-elevated/90 border border-subtle px-3 py-1.5 rounded text-[11px] font-mono text-accent-cyan flex items-center gap-1.5 backdrop-blur-sm group-hover:border-accent-cyan">
              <span>EXPLORE BOARD IN DEPTH</span>
              <span>→</span>
            </div>
          </div>
        </div>

        {/* 4. Graph Model Summary (Right of feature panel) */}
        <div className="lg:col-span-4 bg-panel border border-subtle rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-subtle pb-3 mb-4">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">TOPOLOGY DEFINITION</span>
              <h2 className="text-sm font-bold text-primary font-sans">Graph Extraction Model</h2>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-elevated border border-subtle flex justify-between items-center">
                <span className="text-secondary">Vertices (|V|):</span>
                <span className="font-bold text-accent-cyan">{nodes.length} Modules</span>
              </div>
              <div className="p-3 rounded-lg bg-elevated border border-subtle flex justify-between items-center">
                <span className="text-secondary">Edges (|E|):</span>
                <span className="font-bold text-accent-amber">{edges.length} Shared Nets</span>
              </div>
              <div className="p-3 rounded-lg bg-elevated border border-subtle space-y-1">
                <div className="text-secondary text-[11px]">Weight Cost Formula:</div>
                <div className="text-primary font-semibold text-[11px]">Cost = Trace Length + 2.0 mm × Vias</div>
              </div>
              <div className="p-3 rounded-lg bg-elevated border border-subtle space-y-1 text-[11px]">
                <div className="text-secondary">Ignored Nets:</div>
                <div className="text-muted text-[10px]">GND (Ground plane obscured structure)</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-subtle">
            <button
              onClick={() => onNavigate('graph-analysis')}
              className="w-full py-2 px-3 rounded-lg bg-elevated hover:bg-hover text-primary border border-subtle text-xs font-mono font-medium flex items-center justify-center gap-2 transition"
            >
              <span>RUN GRAPH ALGORITHMS</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Supporting Panels: Analysis Modules, Demo Sequence & Honesty Disclaimer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Analysis Modules */}
        <div className="bg-panel border border-subtle rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan"></span>
            ANALYSIS MODULES
          </h3>
          <div className="space-y-1.5 text-xs font-mono">
            <button onClick={() => onNavigate('graph-analysis')} className="w-full p-2 rounded bg-elevated hover:bg-hover text-left flex justify-between items-center border border-transparent hover:border-subtle transition">
              <span className="text-primary">BFS / DFS Traversal</span>
              <span className="text-muted text-[10px]">O(V+E)</span>
            </button>
            <button onClick={() => onNavigate('graph-analysis')} className="w-full p-2 rounded bg-elevated hover:bg-hover text-left flex justify-between items-center border border-transparent hover:border-subtle transition">
              <span className="text-primary">Dijkstra Shortest Path</span>
              <span className="text-muted text-[10px]">O(E log V)</span>
            </button>
            <button onClick={() => onNavigate('graph-analysis')} className="w-full p-2 rounded bg-elevated hover:bg-hover text-left flex justify-between items-center border border-transparent hover:border-subtle transition">
              <span className="text-primary">Prim & Kruskal MST</span>
              <span className="text-muted text-[10px]">MST</span>
            </button>
            <button onClick={() => onNavigate('graph-analysis')} className="w-full p-2 rounded bg-elevated hover:bg-hover text-left flex justify-between items-center border border-transparent hover:border-subtle transition">
              <span className="text-primary">Tarjan Articulation Points</span>
              <span className="text-muted text-[10px]">Bridges</span>
            </button>
            <button onClick={() => onNavigate('research-lab')} className="w-full p-2 rounded bg-sky-500/10 hover:bg-sky-500/20 text-left flex justify-between items-center border border-sky-500/30 transition">
              <span className="text-accent-cyan font-bold">Research Lab in EDA</span>
              <span className="text-accent-amber text-[10px]">6 Concepts</span>
            </button>
          </div>
        </div>

        {/* Demo Sequence */}
        <div className="bg-panel border border-subtle rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-amber"></span>
            DEMO SEQUENCE (8-10 MIN)
          </h3>
          <div className="space-y-2 text-xs font-mono text-secondary">
            <div className="flex items-start gap-2.5">
              <span className="px-1.5 py-0.5 rounded bg-elevated text-accent-cyan text-[10px]">1</span>
              <span>Inspect physical KiCad board layout & ERC/DRC.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="px-1.5 py-0.5 rounded bg-elevated text-accent-cyan text-[10px]">2</span>
              <span>Run graph algorithms directly over real copper traces.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="px-1.5 py-0.5 rounded bg-elevated text-accent-amber text-[10px]">3</span>
              <span>Simulate PMU and STM32 single-point failures.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="px-1.5 py-0.5 rounded bg-elevated text-accent-green text-[10px]">4</span>
              <span>Demonstrate closed-loop drone PID flight & waypoint guidance.</span>
            </div>
          </div>
        </div>

        {/* Evidence & Limitations */}
        <div className="bg-panel border border-subtle rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-accent-amber font-mono uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-amber"></span>
            EVIDENCE & LIMITATIONS
          </h3>
          <div className="space-y-2 text-xs font-sans text-secondary leading-relaxed">
            <p>
              • <strong>Graph Model Scope:</strong> The graph visualizes shared electrical nets and trace costs; it does not model electrical noise, RF, or thermal behavior.
            </p>
            <p>
              • <strong>Honest Claim:</strong> Graph simulation does not prove the PCB works electrically. True electrical validation requires bench and flight bring-up.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.OverviewPage = OverviewPage;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OverviewPage };
}
