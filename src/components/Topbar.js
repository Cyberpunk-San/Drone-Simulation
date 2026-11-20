// AEROLAB Topbar Component — Aerospace Telemetry & Mission Header
function Topbar({
  activePage,
  selectedNode,
  selectedEdge,
  activeAlgorithm,
  voiceEnabled,
  setVoiceEnabled,
  soundEnabled,
  setSoundEnabled,
  isGuidedDemo,
  guidedStep,
  onStartGuidedDemo
}) {
  const pageNames = {
    'digital-twin': 'Digital Twin Studio',
    'flight-simulator': 'Flight Simulation',
    'live-telemetry': 'Live Telemetry',
    'fault-propagation': 'Fault Propagation',
    'twin-vs-reality': 'Twin vs Reality',
    'what-if-lab': 'What-If Flight Lab',
    'pcb-explorer': 'PCB Representation',
    'hardware-harness': 'Real Drone Wiring & AI',
    'failure-analysis': 'Failure & Reliability',
    'research-lab': 'Flight Intelligence',
    'board-reports': 'Board Reports',
    'overview': 'Executive Overview'
  };

  const getBreadcrumbSub = () => {
    if (activePage === 'digital-twin') return '3D Quadcopter Virtual Twin';
    if (activePage === 'live-telemetry') return 'MAVLink & 9-DOF Ingestion';
    if (activePage === 'fault-propagation') return 'Cross-Layer Causality Engine';
    if (activePage === 'twin-vs-reality') return 'Digital Discrepancy Monitor';
    if (activePage === 'what-if-lab') return 'Counterfactual Mission Lab';
    if (activePage === 'hardware-harness') return 'STM32F7 • Coral TPU • Bharati Kshetrā';
    if (activePage === 'pcb-explorer') {
      if (selectedNode) return selectedNode.name || selectedNode.id;
      if (selectedEdge) return `${selectedEdge.a} → ${selectedEdge.b}`;
      return 'KiCad Layout';
    }
    if (activePage === 'failure-analysis') return 'Topological Reachability';
    if (activePage === 'flight-simulator') return '6-DOF Aerodynamic Physics';
    if (activePage === 'board-reports') return 'ERC / DRC Evidence';
    if (activePage === 'research-lab') return 'Graph Theory in EDA / PCB';
    return 'Mission Overview';
  };

  return (
    <header className="h-14 bg-sidebar/90 border-b border-subtle px-5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Breadcrumbs (Left) */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-muted font-bold tracking-wide">AEROLAB</span>
        <span className="text-border-strong">/</span>
        <span className="text-primary font-medium">{pageNames[activePage] || 'Dashboard'}</span>
        <span className="text-border-strong">/</span>
        <span className="text-accent-cyan font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse"></span>
          <span>{getBreadcrumbSub()}</span>
        </span>
      </div>

      {/* Right Mission Status Bar */}
      <div className="flex items-center gap-2 text-xs font-mono">
        {/* Unified Telemetry Pill */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 rounded-full bg-elevated/70 border border-subtle text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-muted">BOARD:</span>
            <span className="text-primary font-semibold">ONLINE</span>
          </div>
          <span className="text-border-strong">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan"></span>
            <span className="text-muted">GRAPH:</span>
            <span className="text-accent-cyan font-semibold">6N • 6E</span>
          </div>
          <span className="text-border-strong">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse"></span>
            <span className="text-muted">STATUS:</span>
            <span className="text-accent-amber font-semibold">1kHz PID</span>
          </div>
        </div>

        {/* Guided Demo Button */}
        <button
          onClick={onStartGuidedDemo}
          className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
            isGuidedDemo
              ? 'bg-amber-500/20 text-accent-amber border-amber-500/50 shadow-[0_0_12px_rgba(242,180,91,0.25)]'
              : 'bg-elevated hover:bg-hover text-primary border-subtle'
          }`}
        >
          {isGuidedDemo ? (
            <>
              <span className="w-2 h-2 rounded-full bg-accent-amber animate-pulse"></span>
              <span>DEMO [{guidedStep}/6]</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-accent-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>GUIDED DEMO</span>
            </>
          )}
        </button>

        {/* Audio Toggles Group */}
        <div className="inline-flex bg-elevated/60 p-0.5 rounded-xl border border-subtle">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-2 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1 cursor-pointer ${
              voiceEnabled
                ? 'bg-emerald-500/20 text-accent-green font-bold border border-emerald-500/40'
                : 'text-muted hover:text-secondary'
            }`}
            title="Toggle vocal narration"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              {voiceEnabled && <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />}
            </svg>
            <span className="hidden sm:inline">VOICE</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-2 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1 cursor-pointer ${
              soundEnabled
                ? 'bg-sky-500/20 text-accent-cyan font-bold border border-sky-400/40'
                : 'text-muted hover:text-secondary'
            }`}
            title="Toggle telemetry audio SFX"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="hidden sm:inline">SFX</span>
          </button>
        </div>
      </div>
    </header>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.Topbar = Topbar;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Topbar };
}
