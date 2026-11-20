// Engineering Output Terminal Component
function TerminalOutput({ terminalText, onClear }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col flex-1">
      <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-mono text-slate-400 ml-1">Terminal Output</span>
        </div>
        <button onClick={onClear} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
      </div>
      <div className="p-3.5 font-mono text-[11px] text-sky-400 overflow-y-auto max-h-[170px] whitespace-pre-wrap leading-relaxed">
        {terminalText}
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.TerminalOutput = TerminalOutput;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TerminalOutput };
}
