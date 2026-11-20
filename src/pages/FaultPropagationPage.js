// AEROLAB Differentiator Screen 01 — Cross-Layer Fault Propagation Engine
// Traces causal blast radius across 4 layers: Physical Component -> PCB Netlist -> Control Loop -> 3D Flight Consequence
function FaultPropagationPage({ graphData }) {
  const [selectedComponent, setSelectedComponent] = React.useState('IMU');
  const [activeGraphView, setActiveGraphView] = React.useState('dependency'); // 'dependency' | 'pcb' | 'control'
  const [isSimulatingCascade, setIsSimulatingCascade] = React.useState(false);
  const [cascadeStep, setCascadeStep] = React.useState(4); // 1 to 4

  const faultData = (window.FC && window.FC.traceFaultPropagation)
    ? window.FC.traceFaultPropagation(selectedComponent)
    : null;

  const availableFaults = (window.FC && window.FC.getAvailableFaultComponents)
    ? window.FC.getAvailableFaultComponents()
    : [
        { id: 'IMU', name: 'IMU Sensor (BMI088)', category: 'Sensor' },
        { id: 'MOTOR_3', name: 'Motor 3 (Rear-Left)', category: 'Actuator' },
        { id: 'PMU', name: 'PMU 3.3V Regulator', category: 'Power' },
        { id: 'GPS', name: 'GPS Receiver', category: 'Navigation' },
        { id: 'STM32', name: 'STM32 MCU', category: 'Compute' }
      ];

  // Trigger automated cascading blast radius animation
  const handleTriggerCascade = (compKey) => {
    setSelectedComponent(compKey);
    setIsSimulatingCascade(true);
    setCascadeStep(1);

    setTimeout(() => setCascadeStep(2), 600);
    setTimeout(() => setCascadeStep(3), 1200);
    setTimeout(() => {
      setCascadeStep(4);
      setIsSimulatingCascade(false);
    }, 1800);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6 font-mono text-xs select-none">
      {/* 1. Header & Differentiator Banner */}
      <div className="bg-panel border border-subtle rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-accent-cyan tracking-wider uppercase">
              CROSS-LAYER FAULT PROPAGATION & CAUSALITY ENGINE
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-accent-amber border border-amber-500/30 font-mono text-[10px] font-bold">
              GRAPH BLAST RADIUS
            </span>
          </div>
          <h1 className="text-xl font-bold text-primary font-sans">
            Explainable Fault Propagation Across 4 Cyber-Physical Layers
          </h1>
          <p className="text-xs text-secondary font-sans mt-0.5 max-w-3xl leading-relaxed">
            A standard simulator shows what a drone does. AEROLAB explains <em>why</em> it fails by tracing hardware component breakdown across PCB electrical nets, control loop dependencies, and physical flight dynamics.
          </p>
        </div>

        {/* Quick Component Fault Injection Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {availableFaults.map(f => (
            <button
              key={f.id}
              onClick={() => handleTriggerCascade(f.id)}
              className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition flex items-center gap-1.5 ${
                selectedComponent === f.id
                  ? 'bg-red-500/20 text-accent-red border-red-500/50 shadow-[0_0_12px_rgba(240,107,112,0.25)]'
                  : 'bg-elevated hover:bg-hover border-subtle text-secondary'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-red"></span>
              <span>{f.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. The 4-Layer Causal Propagation Chain */}
      {faultData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Layer 1: Physical Component Fault */}
          <div className={`bg-panel border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 ${cascadeStep >= 1 ? 'border-red-500/60 shadow-[0_0_15px_rgba(240,107,112,0.1)]' : 'border-subtle opacity-40'}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-subtle/50 pb-2">
                <span className="text-[10px] text-muted uppercase">LAYER 01</span>
                <span className="px-2 py-0.5 rounded bg-red-900/40 text-accent-red font-bold text-[9px] border border-red-500/40">
                  PHYSICAL COMPONENT
                </span>
              </div>

              <div>
                <span className="text-muted text-[10px] block">FAILED COMPONENT</span>
                <h3 className="text-sm font-bold text-primary font-sans mt-0.5">{faultData.name}</h3>
                <span className="text-accent-amber font-mono text-[10px] font-semibold">{faultData.category}</span>
              </div>

              <div className="bg-elevated/70 p-2.5 rounded border border-subtle/60 text-[11px] text-secondary font-sans leading-relaxed">
                <strong className="text-primary block font-mono text-[10px] mb-0.5">FAILURE MODE:</strong>
                {faultData.physicalFailure}
              </div>

              <div className="p-2 rounded bg-black/40 border border-subtle text-[11px] text-accent-red font-bold">
                {faultData.layer1_component.status}: {faultData.layer1_component.detail}
              </div>
            </div>

            <div className="pt-3 border-t border-subtle/40 text-[10px] text-muted flex items-center justify-between">
              <span>Initiating Trigger</span>
              <span className="text-accent-cyan font-bold">Step 1 of 4 →</span>
            </div>
          </div>

          {/* Layer 2: PCB Netlist & Connectivity Graph */}
          <div className={`bg-panel border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 ${cascadeStep >= 2 ? 'border-amber-500/60 shadow-[0_0_15px_rgba(242,180,91,0.1)]' : 'border-subtle opacity-40'}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-subtle/50 pb-2">
                <span className="text-[10px] text-muted uppercase">LAYER 02</span>
                <span className="px-2 py-0.5 rounded bg-amber-900/40 text-accent-amber font-bold text-[9px] border border-amber-500/40">
                  PCB NETLIST GRAPH
                </span>
              </div>

              <div>
                <span className="text-muted text-[10px] block">AFFECTED COPPER NETS</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {faultData.layer2_pcbNet.affectedNets.map(net => (
                    <span key={net} className="px-1.5 py-0.5 rounded bg-black/40 text-accent-amber border border-amber-500/30 text-[10px]">
                      {net}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-elevated/70 p-2.5 rounded border border-subtle/60 text-[11px] text-secondary font-sans leading-relaxed">
                <strong className="text-primary block font-mono text-[10px] mb-0.5">ELECTRICAL IMPACT:</strong>
                {faultData.layer2_pcbNet.traceStatus}
              </div>

              <div className="text-[11px]">
                <span className="text-muted block text-[10px]">ADJACENT AFFECTED ICs:</span>
                <span className="text-primary font-bold">{faultData.layer2_pcbNet.affectedNeighbors.join(', ')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-subtle/40 text-[10px] text-muted flex items-center justify-between">
              <span>Electrical Propagation</span>
              <span className="text-accent-cyan font-bold">Step 2 of 4 →</span>
            </div>
          </div>

          {/* Layer 3: Control & Software Dependency Graph */}
          <div className={`bg-panel border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 ${cascadeStep >= 3 ? 'border-sky-500/60 shadow-[0_0_15px_rgba(85,200,232,0.1)]' : 'border-subtle opacity-40'}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-subtle/50 pb-2">
                <span className="text-[10px] text-muted uppercase">LAYER 03</span>
                <span className="px-2 py-0.5 rounded bg-sky-900/40 text-accent-cyan font-bold text-[9px] border border-sky-500/40">
                  CONTROL LOOP DEPENDENCY
                </span>
              </div>

              <div>
                <span className="text-muted text-[10px] block">AFFECTED CONTROL STAGE</span>
                <h4 className="text-xs font-bold text-primary font-sans mt-0.5">{faultData.layer3_controlLoop.stage}</h4>
              </div>

              <div className="bg-elevated/70 p-2.5 rounded border border-subtle/60 text-[11px] text-secondary font-sans leading-relaxed">
                <strong className="text-primary block font-mono text-[10px] mb-0.5">FEEDBACK DISRUPTION:</strong>
                {faultData.layer3_controlLoop.impact}
              </div>

              <div className="text-[11px]">
                <span className="text-muted block text-[10px]">DOWNSTREAM CASCADE:</span>
                <span className="text-accent-cyan font-bold">{faultData.layer3_controlLoop.cascadeTo}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-subtle/40 text-[10px] text-muted flex items-center justify-between">
              <span>Control Divergence</span>
              <span className="text-accent-cyan font-bold">Step 3 of 4 →</span>
            </div>
          </div>

          {/* Layer 4: 3D Flight Physics Consequence */}
          <div className={`bg-panel border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 ${cascadeStep >= 4 ? 'border-red-500/80 shadow-[0_0_20px_rgba(240,107,112,0.2)]' : 'border-subtle opacity-40'}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-subtle/50 pb-2">
                <span className="text-[10px] text-muted uppercase">LAYER 04</span>
                <span className="px-2 py-0.5 rounded bg-red-900/60 text-red-200 font-bold text-[9px] border border-red-500">
                  3D FLIGHT CONSEQUENCE
                </span>
              </div>

              <div>
                <span className="text-muted text-[10px] block">DYNAMIC AIRCRAFT REACTION</span>
                <h4 className="text-xs font-bold text-accent-red font-sans mt-0.5">{faultData.layer4_flightPhysics.severity}</h4>
              </div>

              <div className="bg-elevated/70 p-2.5 rounded border border-subtle/60 text-[11px] text-secondary font-sans leading-relaxed">
                {faultData.layer4_flightPhysics.consequence}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-1.5 rounded bg-black/40 border border-subtle">
                  <span className="text-muted block text-[9px]">TIME TO TUMBLE:</span>
                  <span className="text-accent-amber font-bold">{faultData.layer4_flightPhysics.timeToTumble}</span>
                </div>
                <div className="p-1.5 rounded bg-black/40 border border-subtle">
                  <span className="text-muted block text-[9px]">ALTITUDE DROP:</span>
                  <span className="text-red-400 font-bold">{faultData.layer4_flightPhysics.altitudeDropRate}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-subtle/40 text-[10px] text-muted flex items-center justify-between">
              <span>Physical Outcome</span>
              <span className="text-accent-red font-bold">Failure Realized</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Autonomous Recovery Strategy & Decision Support */}
      {faultData && (
        <div className="bg-panel border border-subtle rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-subtle/60 pb-2">
            <span className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
              AUTONOMOUS FAULT RECOVERY & MITIGATION ADVISORY
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${faultData.recoveryStrategy.available ? 'bg-emerald-500/15 text-accent-green border-emerald-500/30' : 'bg-red-500/15 text-accent-red border-red-500/30'}`}>
              RECOVERY: {faultData.recoveryStrategy.available ? 'POSSIBLE' : 'IMPOSSIBLE (SPOF)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
            <div className="md:col-span-2 space-y-2">
              <div>
                <span className="text-muted text-[10px] block">RECOMMENDED FLIGHT CONTROLLER ACTION</span>
                <span className="font-bold text-primary text-sm font-sans block mt-0.5">
                  {faultData.recoveryStrategy.action}
                </span>
              </div>
              <div className="text-secondary font-sans leading-relaxed">
                <strong className="text-primary font-mono text-[11px]">Hardware Design Mitigation: </strong>
                {faultData.recoveryStrategy.mitigation}
              </div>
            </div>

            <div className="p-3 bg-elevated rounded-lg border border-subtle flex flex-col justify-between">
              <div>
                <span className="text-muted text-[10px] uppercase block">RECOVERY CONFIDENCE</span>
                <span className={`text-2xl font-bold font-mono mt-1 block ${parseInt(faultData.recoveryStrategy.confidence) > 70 ? 'text-accent-green' : (parseInt(faultData.recoveryStrategy.confidence) > 0 ? 'text-accent-amber' : 'text-accent-red')}`}>
                  {faultData.recoveryStrategy.confidence}
                </span>
              </div>
              <span className="text-[10px] text-muted">Estimated from simulated control margin</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.FaultPropagationPage = FaultPropagationPage;
}
