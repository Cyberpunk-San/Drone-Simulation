// AEROLAB Guided Presentation Mode Modal (Spec Section 11)
function GuidedDemoModal({
  isOpen,
  onClose,
  onNavigate,
  voiceEnabled,
  soundEnabled
}) {
  const [currentStep, setCurrentStep] = React.useState(0);

  const demoSteps = [
    {
      num: 1,
      targetPage: 'overview',
      title: 'Flight Controller Architecture Overview',
      subtitle: 'Sense • Decide • Act Triad',
      cue: 'Introduce the team and the Hades Micro 50x50mm flight controller. Explain the three fundamental stages: Sense (IMU/GPS), Decide (STM32F405 MCU at 168MHz), and Act (PCA9685 PWM drivers commanding the motors).',
      actionLabel: 'GO TO OVERVIEW'
    },
    {
      num: 2,
      targetPage: 'board-reports',
      title: 'KiCad Engineering & ERC/DRC Evidence',
      subtitle: 'Design Rule Checks & Data Provenance',
      cue: 'Show KiCad 8.0 validation evidence: 0 ERC errors, 0 DRC clearance violations. Explain the extract_graph.py pipeline that extracts footprint pads and traces directly from fc.kicad_pcb into graph.json.',
      actionLabel: 'INSPECT REPORTS'
    },
    {
      num: 3,
      targetPage: 'pcb-explorer',
      title: 'Hero Screen: Real KiCad PCB with Graph Overlay',
      subtitle: 'Physical Traces & Routing Costs',
      cue: 'Present the core hero visual: the real KiCad pcb.svg with coordinate-aligned graph vertices. Click the STM32 to inspect its 64 pins, coordinates, and incident edges with mm-equivalent trace costs.',
      actionLabel: 'EXPLORE PCB'
    },
    {
      num: 4,
      targetPage: 'graph-analysis',
      title: 'Graph Algorithms & Optimization',
      subtitle: 'BFS, Dijkstra & Prim MST',
      cue: 'Demonstrate Dijkstra shortest-path routing from PMU to IMU (35.70 mm-eq with via penalties). Switch to Prim to show the minimum copper spanning tree, and Tarjan to highlight articulation points.',
      actionLabel: 'VIEW ALGORITHMS'
    },
    {
      num: 5,
      targetPage: 'failure-analysis',
      title: 'Reliability & Topological Fault Injection',
      subtitle: 'Single Point of Failure (SPoF) Analysis',
      cue: 'Simulate failing the PMU: observe the total power blackout where all downstream modules are isolated. Then simulate failing the STM32: note that modules remain physically powered, but control logic is lost.',
      actionLabel: 'SIMULATE FAULTS'
    },
    {
      num: 6,
      targetPage: 'flight-simulator',
      title: 'Autonomous Flight Corridor & 1-Axis PID Loop',
      subtitle: 'Waypoint Traversal & Closed-Loop Stabilization',
      cue: 'Dispatch the drone along the 2D mission corridor from PAD-A to PAD-B using Dijkstra waypoints. Then switch to the 1-axis PID attitude horizon to demonstrate disturbance recovery under crosswinds.',
      actionLabel: 'RUN SIMULATOR'
    },
    {
      num: 7,
      targetPage: 'research-lab',
      title: 'Research-Level Graph Theory in PCB Design',
      subtitle: 'Coloring • Planarity • Max-Flow • Spectral • Steiner',
      cue: 'Conclude with research concepts: Graph Coloring for copper layer allocation, Kuratowski planarity for via prediction, Max-Flow/Min-Cut for power bottleneck traces, Spectral Fiedler eigenvalue for board robustness, and Steiner trees for optimal net routing.',
      actionLabel: 'EXPLORE RESEARCH'
    },
    {
      num: 8,
      targetPage: 'hardware-harness',
      title: 'Heterogeneous Computing & Real Drone Wiring Workbench',
      subtitle: 'STM32F7 • Bharati Kshetrā Lock • Google Coral TPU (4 TOPS)',
      cue: 'Demonstrate real physical drone wiring harnesses: connect the STM32F7 flight controller to the Google Coral Edge TPU companion computer via high-speed 3Mbps DMA UART. Test the Bharati Kshetrā DGCA Compliance Lock against Indian No-Fly Zones to verify tamper-proof motor disarm enforcement.',
      actionLabel: 'EXPLORE HARNESS & AI'
    }
  ];

  const step = demoSteps[currentStep];

  // Optional voice cue speaking
  React.useEffect(() => {
    if (isOpen && voiceEnabled && window.FC && window.FC.speak) {
      window.FC.speak(step.cue);
    }
  }, [isOpen, currentStep, voiceEnabled, step]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-panel border border-subtle rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="h-14 bg-sidebar border-b border-subtle px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-accent-cyan tracking-wider uppercase">
              GUIDED PRESENTATION MODE (STEP {step.num} OF {demoSteps.length})
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-muted hover:text-primary transition p-1"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Progress bar */}
          <div className="w-full bg-elevated h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-accent-cyan h-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
            />
          </div>

          <div>
            <div className="text-[11px] font-mono text-accent-amber font-bold uppercase tracking-wider">
              {step.subtitle}
            </div>
            <h2 className="text-xl font-bold text-primary mt-1">
              {step.title}
            </h2>
          </div>

          {/* Presenter Cue Card */}
          <div className="bg-elevated border border-subtle rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-accent-cyan">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>PRESENTER CUE / TALKING POINTS</span>
            </div>
            <p className="text-sm text-secondary leading-relaxed font-sans">
              "{step.cue}"
            </p>
          </div>

          {/* Action button to jump to screen */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                onNavigate(step.targetPage);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-accent-cyan border border-sky-400/50 text-xs font-mono font-bold transition flex items-center gap-2"
            >
              <span>{step.actionLabel}</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="h-14 bg-sidebar border-t border-subtle px-6 flex items-center justify-between font-mono text-xs">
          <button
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
            disabled={currentStep === 0}
            className="px-3.5 py-1.5 rounded-lg bg-elevated hover:bg-hover disabled:opacity-30 text-secondary border border-subtle transition"
          >
            ← PREVIOUS
          </button>

          <span className="text-muted">
            Phase {currentStep + 1} / {demoSteps.length}
          </span>

          {currentStep < demoSteps.length - 1 ? (
            <button
              onClick={() => {
                const next = currentStep + 1;
                setCurrentStep(next);
                onNavigate(demoSteps[next].targetPage);
              }}
              className="px-4 py-1.5 rounded-lg bg-sky-500/20 text-accent-cyan border border-sky-500/40 hover:bg-sky-500/30 font-bold transition"
            >
              NEXT PHASE →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-500/20 text-accent-green border border-emerald-500/40 hover:bg-emerald-500/30 font-bold transition"
            >
              FINISH DEMO
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.GuidedDemoModal = GuidedDemoModal;
}
