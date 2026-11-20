// Viva Oracle Component with Vector Audio Synthesizer Controls (No Emojis)
function VivaOracle({ onReadAloud }) {
  const VIVA_QUESTIONS = (typeof window !== 'undefined' && window.FC && window.FC.VIVA_QUESTIONS) || [];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-white font-sans">Viva Voce Guide & Technical Defense</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
              ORACLE DEFENSE MATRIX
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Rigorous mathematical justifications, electrical boundaries, and engineering claims for lab evaluation.
          </p>
        </div>
        <div className="text-right font-mono text-[11px] text-slate-500">
          <span>8 VERIFIED PROOFS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VIVA_QUESTIONS.map((item, idx) => (
          <div
            key={item.id}
            className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between transition group shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-200 font-sans leading-snug">{item.question}</span>
                </div>
                <button
                  onClick={() => onReadAloud(item.question, item.answer)}
                  className="shrink-0 text-[10px] font-mono px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition flex items-center gap-1.5 active:scale-95"
                  title="Synthesize vocalized audio explanation"
                >
                  <svg className="w-3 h-3 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                  <span>BRIEF</span>
                </button>
              </div>
              <div className="text-xs text-slate-400 leading-relaxed font-sans">{item.answer}</div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>STATUS: DEFENDED</span>
              <span className="text-slate-600">SEM V VIVA</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.VivaOracle = VivaOracle;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VivaOracle };
}
