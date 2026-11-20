// Algorithm Actions Grid Panel - Modern Avionics Edition (No Emojis)
function AlgorithmControls({
  onRunBFS,
  onRunDFS,
  onRunDijkstra,
  onRunPrim,
  onRunKruskal,
  onShowCritical,
  onFailModule,
  onShowColors,
  onReset
}) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          GRAPH CONCEPT BENCHMARKS
        </h3>
        <span className="text-[10px] font-mono text-slate-500 uppercase">PCB TRACE ALGORITHMS</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Connectivity BFS / DFS */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">7.1 Connectivity</span>
            <span className="text-[10px] font-mono text-sky-400/80 bg-sky-500/10 px-1.5 py-0.5 rounded">O(V+E)</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={onRunBFS}
              className="flex-1 py-1.5 text-xs font-mono font-semibold bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/40 rounded-lg transition"
            >
              BFS
            </button>
            <button
              onClick={onRunDFS}
              className="flex-1 py-1.5 text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition"
            >
              DFS
            </button>
          </div>
        </div>

        {/* Shortest Path Dijkstra */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">7.2 Dijkstra Path</span>
            <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded">O(E log V)</span>
          </div>
          <button
            onClick={onRunDijkstra}
            className="w-full py-1.5 text-xs font-mono font-semibold bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/40 rounded-lg transition flex items-center justify-center gap-1.5"
          >
            <span>PMU</span>
            <span className="text-amber-500">→</span>
            <span>IMU</span>
          </button>
        </div>

        {/* MST Prim & Kruskal */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">7.3 Spanning Tree</span>
            <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">MST</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={onRunPrim}
              className="flex-1 py-1.5 text-xs font-mono font-semibold bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 rounded-lg transition"
            >
              Prim
            </button>
            <button
              onClick={onRunKruskal}
              className="flex-1 py-1.5 text-xs font-mono font-semibold bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-300 border border-cyan-500/40 rounded-lg transition"
            >
              Kruskal
            </button>
          </div>
        </div>

        {/* Tarjan's Articulation Points */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">7.4 SPoF Tarjan</span>
            <span className="text-[10px] font-mono text-rose-400/80 bg-rose-500/10 px-1.5 py-0.5 rounded">Bridges</span>
          </div>
          <button
            onClick={onShowCritical}
            className="w-full py-1.5 text-xs font-mono font-semibold bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/40 rounded-lg transition"
          >
            Locate SPoF Hubs
          </button>
        </div>

        {/* Fail a Module Simulation */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">7.5 Fail Module</span>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Fault Cut</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => onFailModule('PMU')}
              className="flex-1 py-1.5 text-xs font-mono font-semibold bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/50 rounded-lg transition"
            >
              Cut PMU
            </button>
            <button
              onClick={() => onFailModule('STM32')}
              className="flex-1 py-1.5 text-xs font-mono font-semibold bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/50 rounded-lg transition"
            >
              Cut MCU
            </button>
          </div>
        </div>

        {/* Coloring & Planarity */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-2 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">7.6 Planarity</span>
            <span className="text-[10px] font-mono text-indigo-400/80 bg-indigo-500/10 px-1.5 py-0.5 rounded">Layer Cu</span>
          </div>
          <button
            onClick={onShowColors}
            className="w-full py-1.5 text-xs font-mono font-semibold bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-300 border border-indigo-500/40 rounded-lg transition"
          >
            Signal Classes
          </button>
        </div>

      </div>

      <div className="mt-3">
        <button
          onClick={onReset}
          className="w-full py-1.5 text-xs font-mono font-medium bg-slate-800/90 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/80 hover:border-slate-600 transition flex items-center justify-center gap-2"
        >
          <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>CLEAR HIGHLIGHTING & RESTORE TOPOLOGY</span>
        </button>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.AlgorithmControls = AlgorithmControls;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AlgorithmControls };
}
