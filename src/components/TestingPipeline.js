// 4-Stage Testing Pipeline Display Component
function TestingPipeline() {
  const PIPELINE_STAGES = (typeof window !== 'undefined' && window.FC && window.FC.PIPELINE_STAGES) || [];
  const BRINGUP_CHECKLIST = (typeof window !== 'undefined' && window.FC && window.FC.BRINGUP_CHECKLIST) || [];
  const BOARD_METRICS = (typeof window !== 'undefined' && window.FC && window.FC.BOARD_METRICS) || {};

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div>
        <h2 className="text-base font-bold text-white">4-Stage Flight Controller Testing Pipeline</h2>
        <p className="text-xs text-slate-400">Verification steps from KiCad schematics to autonomous maiden flight.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {PIPELINE_STAGES.map((s, idx) => (
          <div key={idx} className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">Stage {s.stage}</span>
              <h3 className="text-sm font-bold text-white mt-1">{s.title}</h3>
              <div className="text-[11px] text-slate-400 mt-0.5">Tool: {s.tool}</div>
              <div className="mt-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 inline-block border border-emerald-500/30">{s.status}</div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{s.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bring-Up Checklist */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
        <h3 className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider">Stage 4 Hardware Bring-Up Checklist</h3>
        <ol className="text-xs text-slate-300 space-y-1.5 list-decimal pl-5">
          {BRINGUP_CHECKLIST.map((step, idx) => (
            <li key={idx} className="leading-relaxed">{step}</li>
          ))}
        </ol>
      </div>

      {/* Board Metrics */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-sky-400 uppercase font-mono tracking-wider">KiCad Physical Board Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><div className="text-sm font-bold font-mono text-white">{BOARD_METRICS.boardDimensions}</div><div className="text-[10px] text-slate-400">Dimensions</div></div>
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><div className="text-sm font-bold font-mono text-white">{BOARD_METRICS.totalTracks}</div><div className="text-[10px] text-slate-400">Tracks</div></div>
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><div className="text-sm font-bold font-mono text-white">{BOARD_METRICS.copperVias}</div><div className="text-[10px] text-slate-400">Vias</div></div>
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><div className="text-sm font-bold font-mono text-emerald-400">{BOARD_METRICS.unconnectedNets}</div><div className="text-[10px] text-slate-400">Unconnected</div></div>
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><div className="text-sm font-bold font-mono text-white">{BOARD_METRICS.smdComponents}</div><div className="text-[10px] text-slate-400">SMD Parts</div></div>
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800"><div className="text-sm font-bold font-mono text-white">{BOARD_METRICS.signalLayers}</div><div className="text-[10px] text-slate-400">Layers</div></div>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.TestingPipeline = TestingPipeline;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestingPipeline };
}
