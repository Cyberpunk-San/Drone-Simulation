// AEROLAB Screen 01 — Digital Twin Studio
// Complete 3D Quadcopter Virtual Twin, Hierarchical Assembly, Exploded View, Component Inspector
function DigitalTwinStudioPage() {
  const Drone3DView = (window.FC && window.FC.Drone3DView);

  const [explodedAmount, setExplodedAmount] = React.useState(0); // 0 to 1
  const [selectedPartId, setSelectedPartId] = React.useState('fc_pcb');
  const [isIsolated, setIsIsolated] = React.useState(false);
  const [isMotorsSpinning, setIsMotorsSpinning] = React.useState(true);

  // Component Hierarchy Tree
  const components = [
    {
      id: 'fc_pcb',
      name: 'Flight Controller PCB (Hades Micro)',
      category: 'Avionics',
      ref: 'FC-PCB-REV1.2',
      mass: '14.2 g',
      specs: 'STM32F405 MCU (168MHz), BMI088 6-DOF IMU, LD39200 LDO, PCA9685 PWM',
      status: 'Nominal',
      voltage: '3.31 V',
      temp: '34.8 °C'
    },
    {
      id: 'motor_1',
      name: 'Motor 1 (Front-Right, CW)',
      category: 'Propulsion',
      ref: 'M1-2306-2450KV',
      mass: '32.5 g',
      specs: 'Brushless Outrunner, 3S-6S LiPo, 14-pole stator, 5-inch 3-blade prop',
      status: 'Active',
      rpm: '18,420 RPM',
      temp: '42.1 °C'
    },
    {
      id: 'motor_2',
      name: 'Motor 2 (Rear-Right, CCW)',
      category: 'Propulsion',
      ref: 'M2-2306-2450KV',
      mass: '32.5 g',
      specs: 'Brushless Outrunner, 3S-6S LiPo, 14-pole stator, 5-inch 3-blade prop',
      status: 'Active',
      rpm: '18,390 RPM',
      temp: '41.8 °C'
    },
    {
      id: 'motor_3',
      name: 'Motor 3 (Rear-Left, CW)',
      category: 'Propulsion',
      ref: 'M3-2306-2450KV',
      mass: '32.5 g',
      specs: 'Brushless Outrunner, 3S-6S LiPo, 14-pole stator, 5-inch 3-blade prop',
      status: 'Active',
      rpm: '18,410 RPM',
      temp: '42.5 °C'
    },
    {
      id: 'motor_4',
      name: 'Motor 4 (Front-Left, CCW)',
      category: 'Propulsion',
      ref: 'M4-2306-2450KV',
      mass: '32.5 g',
      specs: 'Brushless Outrunner, 3S-6S LiPo, 14-pole stator, 5-inch 3-blade prop',
      status: 'Active',
      rpm: '18,400 RPM',
      temp: '41.9 °C'
    },
    {
      id: 'battery',
      name: '4S LiPo Battery Pack (1500mAh)',
      category: 'Power Delivery',
      ref: 'BATT-4S-100C',
      mass: '178.0 g',
      specs: '14.8V Nominal (16.8V Max), 100C Discharge, XT60 Connector',
      status: 'Healthy',
      voltage: '15.92 V (3.98V/cell)',
      temp: '29.4 °C'
    },
    {
      id: 'top_plate',
      name: 'Carbon Fiber Top Plate (2.5mm)',
      category: 'Airframe',
      ref: 'CF-TP-25',
      mass: '28.0 g',
      specs: '3K Toray Carbon Fiber Weave, chamfered edges, antenna mounting slots',
      status: 'Structural Pass',
      voltage: 'N/A',
      temp: 'Ambient'
    },
    {
      id: 'bottom_plate',
      name: 'Carbon Fiber Bottom Plate (3.0mm)',
      category: 'Airframe',
      ref: 'CF-BP-30',
      mass: '44.0 g',
      specs: 'Integrated unibody carbon fiber plate with 50x50mm standoff pattern',
      status: 'Structural Pass',
      voltage: 'N/A',
      temp: 'Ambient'
    },
    {
      id: 'gps_module',
      name: 'u-blox M8N GPS & Compass Mast',
      category: 'Navigation',
      ref: 'GPS-M8N-UAV',
      mass: '18.5 g',
      specs: 'Concurrent GNSS (GPS, GLONASS, Galileo), 10Hz update rate, ceramic patch',
      status: '3D Fix (14 Sats)',
      voltage: '5.02 V',
      temp: '31.2 °C'
    }
  ];

  const currentPart = components.find(c => c.id === selectedPartId) || components[0];

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-6.5rem)] min-h-[640px]">
      {/* 1. Left Column: Component Hierarchy Tree (260px) */}
      <div className="w-full lg:w-64 bg-panel border border-subtle rounded-xl flex flex-col shrink-0 select-none overflow-hidden">
        <div className="h-12 bg-sidebar border-b border-subtle px-4 flex items-center justify-between shrink-0">
          <span className="text-xs font-mono font-bold text-accent-cyan tracking-wider uppercase">
            DIGITAL TWIN CAD TREE
          </span>
          <span className="text-[10px] font-mono text-muted">9 PARTS</span>
        </div>

        <div className="p-3 flex-1 overflow-y-auto space-y-1.5 text-xs font-mono">
          {components.map(part => {
            const isSelected = selectedPartId === part.id;
            return (
              <button
                key={part.id}
                onClick={() => setSelectedPartId(part.id)}
                className={`w-full text-left p-2.5 rounded-lg border transition ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-400 text-accent-cyan shadow-[0_0_10px_rgba(85,200,232,0.15)] font-bold'
                    : 'bg-elevated hover:bg-hover border-subtle text-secondary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-sans truncate">{part.name}</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-muted mt-1">
                  <span>{part.category}</span>
                  <span className="text-accent-amber font-mono">{part.mass}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Centre Column: 3D Photorealistic Viewport (Flexible) */}
      <div className="flex-1 bg-panel border border-subtle rounded-xl flex flex-col overflow-hidden relative">
        {/* Viewport Toolbar */}
        <div className="h-12 bg-sidebar border-b border-subtle px-4 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-primary tracking-wide uppercase">
              VIRTUAL PROTOTYPE (HADES MICRO QUAD)
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-accent-green border border-emerald-500/30 text-[10px] font-mono font-bold">
              6-DOF TWIN ACTIVE
            </span>
          </div>

          {/* Controls: Exploded Slider & Isolation */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Exploded View Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted uppercase">EXPLODED VIEW:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explodedAmount}
                onChange={e => setExplodedAmount(parseFloat(e.target.value))}
                className="w-24 accent-accent-cyan cursor-pointer"
              />
              <span className="text-accent-cyan font-bold text-[10px] w-8">
                {Math.round(explodedAmount * 100)}%
              </span>
            </div>

            {/* Isolate Toggle */}
            <button
              onClick={() => setIsIsolated(!isIsolated)}
              className={`px-2.5 py-1 rounded text-xs font-mono border transition ${
                isIsolated
                  ? 'bg-amber-500/20 text-accent-amber border-amber-500/40 font-bold'
                  : 'bg-elevated text-secondary border-subtle hover:text-primary'
              }`}
            >
              {isIsolated ? 'ISOLATION: ON' : 'ISOLATE PART'}
            </button>

            {/* Motor Spin Toggle */}
            <button
              onClick={() => setIsMotorsSpinning(!isMotorsSpinning)}
              className={`px-2.5 py-1 rounded text-xs font-mono border transition ${
                isMotorsSpinning
                  ? 'bg-panel text-accent-cyan border-sky-500/40'
                  : 'bg-elevated text-muted border-subtle'
              }`}
            >
              Motors: {isMotorsSpinning ? 'SPINNING' : 'IDLE'}
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas */}
        <div className="flex-1 w-full h-full relative bg-[#070c14]">
          {Drone3DView ? (
            <Drone3DView
              selectedPart={selectedPartId}
              onSelectPart={setSelectedPartId}
              explodedView={explodedAmount}
              isFlying={isMotorsSpinning}
              isolatedPart={isIsolated ? selectedPartId : null}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-secondary font-mono text-xs">
              Initializing WebGL 3D Canvas...
            </div>
          )}
        </div>

        {/* Bottom Legend */}
        <div className="h-10 bg-sidebar border-t border-subtle px-4 flex items-center justify-between text-[11px] font-mono shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-muted text-[10px]">ALLOY: Anodized 7075-T6</span>
            <span className="text-border-strong">|</span>
            <span className="text-muted text-[10px]">FRAME: 3K Twill Carbon Fiber</span>
            <span className="text-border-strong">|</span>
            <span className="text-muted text-[10px]">PCB: 4-Layer FR4 1.6mm</span>
          </div>
          <span className="text-muted text-[10px]">Total Takeoff Weight: 388.2 g</span>
        </div>
      </div>

      {/* 3. Right Column: Selected Component Telemetry & Spec Sheet (320px) */}
      <div className="w-full lg:w-80 xl:w-96 bg-panel border border-subtle rounded-xl flex flex-col shrink-0 overflow-hidden">
        <div className="h-12 bg-sidebar border-b border-subtle px-4 flex items-center justify-between shrink-0">
          <span className="text-xs font-mono font-bold text-primary tracking-wide uppercase">
            COMPONENT TELEMETRY & SPEC
          </span>
          <span className="px-2 py-0.5 rounded bg-sky-500/15 text-accent-cyan border border-sky-500/30 text-[10px] font-mono font-bold">
            {currentPart.ref}
          </span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Component Primary Banner */}
          <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block">NAME</span>
                <h3 className="text-sm font-bold text-primary font-sans mt-0.5">
                  {currentPart.name}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-subtle/50 text-[11px]">
              <div>
                <span className="text-muted block text-[10px]">CATEGORY</span>
                <span className="text-secondary font-medium">{currentPart.category}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">NET MASS</span>
                <span className="text-accent-amber font-bold">{currentPart.mass}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">HEALTH STATUS</span>
                <span className="text-accent-green font-bold">{currentPart.status}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">OPERATING VOLTAGE</span>
                <span className="text-primary font-bold">{currentPart.voltage}</span>
              </div>
            </div>
          </div>

          {/* Technical Specs Card */}
          <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-1.5">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
              ENGINEERING SPECIFICATION
            </span>
            <p className="text-[11px] text-secondary leading-relaxed font-sans">
              {currentPart.specs}
            </p>
          </div>

          {/* Real-time Dynamic Telemetry Readout */}
          <div className="bg-elevated border border-subtle rounded-lg p-3 space-y-2">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
              LIVE DIGITAL TWIN METRICS
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between py-1 border-b border-subtle/30">
                <span className="text-muted">Operating Temp:</span>
                <span className="text-accent-cyan font-bold">{currentPart.temp}</span>
              </div>
              {currentPart.rpm && (
                <div className="flex justify-between py-1 border-b border-subtle/30">
                  <span className="text-muted">Propulsion Speed:</span>
                  <span className="text-accent-amber font-bold">{currentPart.rpm}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-subtle/30">
                <span className="text-muted">Vibration Spectrum:</span>
                <span className="text-accent-green font-bold">0.08 G (RMS)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">Virtual Sync Delay:</span>
                <span className="text-primary font-bold">12.4 ms</span>
              </div>
            </div>
          </div>

          {/* Exploded View Hint */}
          <div className="p-2.5 rounded bg-black/30 border border-subtle text-[10px] text-muted leading-relaxed font-sans">
            <strong className="text-secondary block mb-0.5">Teardown Inspection Tip:</strong>
            Drag the Exploded View slider to separate the carbon fiber top and bottom plates, revealing the interior Hades Micro PCB standoffs and battery wiring.
          </div>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.DigitalTwinStudioPage = DigitalTwinStudioPage;
}
