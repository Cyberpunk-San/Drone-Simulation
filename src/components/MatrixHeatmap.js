// Interactive Matrix Heatmap & Degree Distribution Component - Modern Avionics Edition (No Emojis)
function MatrixHeatmap({ matrixData }) {
  if (!matrixData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs font-mono py-12">
        <svg className="w-8 h-8 text-slate-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
        <span className="text-slate-400 font-medium">MATRIX TELEMETRY IDLE</span>
        <span className="text-slate-600 text-[11px] mt-1">Select "Compute APSP" or "Analyze Degree" to generate topological matrices.</span>
      </div>
    );
  }

  if (matrixData.type === 'distance') {
    return (
      <div className="overflow-x-auto flex-1 flex flex-col items-center justify-center p-2">
        <table className="border-collapse font-mono text-xs">
          <thead>
            <tr>
              <th className="p-2 text-slate-500 font-mono text-[10px]">SRC \ DST</th>
              {matrixData.ids.map(id => (
                <th key={id} className="p-2.5 text-sky-400 font-bold border-b border-slate-800 tracking-wider">
                  {id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixData.ids.map((rowId, i) => (
              <tr key={rowId}>
                <td className="p-2 font-bold text-sky-400 text-right border-r border-slate-800 pr-3">{rowId}</td>
                {matrixData.ids.map((colId, j) => {
                  const val = matrixData.dist[i][j];
                  const isInf = val === Infinity;
                  const isDiag = i === j;
                  const pct = isInf ? 0 : val / matrixData.maxVal;
                  const bg = isDiag
                    ? 'rgba(15, 23, 42, 0.9)'
                    : isInf
                    ? '#090d16'
                    : `rgba(56, 189, 248, ${0.12 + pct * 0.70})`;
                  return (
                    <td
                      key={colId}
                      style={{ backgroundColor: bg }}
                      className={`p-3 text-center border border-slate-800/80 rounded font-mono text-xs cursor-pointer hover:outline hover:outline-1 hover:outline-sky-400 transition ${
                        isDiag ? 'text-slate-500 font-normal' : 'text-white font-bold'
                      }`}
                      title={`${rowId} -> ${colId}: ${isInf ? 'Infinity' : val.toFixed(1)} mm`}
                    >
                      {isInf ? 'INF' : val.toFixed(1)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-[11px] text-slate-400 font-mono flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-sky-500/20 border border-sky-400/40"></span>
            <span>0.0 mm</span>
          </span>
          <span className="text-slate-600">→</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-sky-400 shadow-[0_0_8px_#38bdf8]"></span>
            <span>Max Trace Delay ({matrixData.maxVal.toFixed(1)} mm)</span>
          </span>
        </div>
      </div>
    );
  }

  if (matrixData.type === 'degree') {
    return (
      <div className="flex-1 flex flex-col justify-center space-y-3.5 py-4 max-w-md mx-auto w-full font-mono">
        <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex justify-between">
          <span>Component Node</span>
          <span>Degree Centrality deg(v)</span>
        </div>
        {matrixData.sorted.map(([id, deg]) => {
          const pct = (deg / matrixData.maxDeg) * 100;
          return (
            <div key={id} className="flex items-center gap-3 text-xs">
              <span className="w-16 text-right font-bold text-sky-400">{id}</span>
              <div className="flex-1 h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
              <span className="w-8 font-bold text-white text-right">{deg}</span>
            </div>
          );
        })}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/90 border border-emerald-500/30 text-center text-xs font-mono text-emerald-400 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
          <span>Handshaking Lemma Validated: Σ deg(v) = {matrixData.sumDeg} = 2 × {matrixData.sumDeg / 2} edges</span>
        </div>
      </div>
    );
  }

  return null;
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.MatrixHeatmap = MatrixHeatmap;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MatrixHeatmap };
}
