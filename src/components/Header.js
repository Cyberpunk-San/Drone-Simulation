// Header Component with Avionics HUD Controls and Vector Icons (No Emojis)
function Header({ voiceEnabled, setVoiceEnabled, soundEnabled, setSoundEnabled, isAutoPiloting, autoPilotStep, onStartAutoPilot }) {
  return (
    <header className="bg-slate-950/95 border-b border-slate-800/90 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Avionics Logo Badge */}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 via-sky-600/30 to-indigo-600/40 border border-sky-500/40 text-sky-400 font-mono font-black text-sm tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.25)]">
          <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17" />
            <circle cx="12" cy="12" r="3" fill="#0284c7" />
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-bold text-white tracking-wide font-sans flex items-center gap-2">
              <span>DRONE FLIGHT CONTROLLER</span>
              <span className="text-slate-600 font-normal">/</span>
              <span className="text-sky-400 font-mono text-xs">KICAD PCB GRAPH LAB</span>
            </h1>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
              SYSTEM READY
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Graph Theory Lab, Sem V (2026-27) • Team: Sansriti Mishra, Agnibha Nanda, Pavani Agarwal, Ashutosh Pandey
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* AI Voice Toggle */}
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-2 transition-all ${
            voiceEnabled
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:border-slate-700'
          }`}
          title="Toggle Text-to-Speech Voice Narration"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {voiceEnabled ? (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.2" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </>
            ) : (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </>
            )}
          </svg>
          <span>VOICE: {voiceEnabled ? 'ACTIVE' : 'MUTED'}</span>
        </button>

        {/* Telemetry SFX Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-2 transition-all ${
            soundEnabled
              ? 'bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
              : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:border-slate-700'
          }`}
          title="Toggle Web Audio Telemetry SFX"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {soundEnabled ? (
              <>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="currentColor" fillOpacity="0.2" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </>
            ) : (
              <>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
                <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
                <path d="M18 8a6 6 0 0 0-9.33-5" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            )}
          </svg>
          <span>SFX: {soundEnabled ? 'ACTIVE' : 'MUTED'}</span>
        </button>

        {/* Autonomous AI Viva Presentation Trigger */}
        <button
          onClick={onStartAutoPilot}
          disabled={isAutoPiloting}
          className={`relative overflow-hidden text-xs font-mono font-bold px-4 py-2 rounded-lg border transition-all flex items-center gap-2.5 ${
            isAutoPiloting
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
              : 'bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:from-sky-500 hover:to-indigo-500 text-white border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.3)] active:scale-[0.98]'
          }`}
        >
          {isAutoPiloting ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              <span>DEMO IN PROGRESS [PHASE {autoPilotStep}/8]</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" fillOpacity="0.3" />
              </svg>
              <span>RUN AUTONOMOUS VIVA DEMO</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.Header = Header;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Header };
}
