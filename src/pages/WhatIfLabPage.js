// AEROLAB Differentiator Screen 03 — What-If Flight Laboratory (Counterfactual Simulation)
// Compare baseline nominal flight mission against hypothetical hardware degradations, environmental shear, and graph rerouting
function WhatIfLabPage({ graphData }) {
  // Scenario injection state
  const [motor3LossPct, setMotor3LossPct] = React.useState(35); // 0% to 100%
  const [imuPitchBiasDeg, setImuPitchBiasDeg] = React.useState(0); // -10 to +10 deg
  const [batteryVoltageSag, setBatteryVoltageSag] = React.useState(0.8); // 0 to 3.0 V
  const [crosswindSpeed, setCrosswindSpeed] = React.useState(6); // 0 to 15 m/s
  const [gpsDegraded, setGpsDegraded] = React.useState(false);
  const [traceDelamination, setTraceDelamination] = React.useState(false);

  // Active Preset Selection
  const [activePreset, setActivePreset] = React.useState('propeller-damage');

  // Apply Presets
  const applyPreset = (presetId) => {
    setActivePreset(presetId);
    if (presetId === 'nominal') {
      setMotor3LossPct(0);
      setImuPitchBiasDeg(0);
      setBatteryVoltageSag(0.0);
      setCrosswindSpeed(0);
      setGpsDegraded(false);
      setTraceDelamination(false);
    } else if (presetId === 'propeller-damage') {
      setMotor3LossPct(35);
      setImuPitchBiasDeg(0);
      setBatteryVoltageSag(0.4);
      setCrosswindSpeed(4);
      setGpsDegraded(false);
      setTraceDelamination(false);
    } else if (presetId === 'crosswind-storm') {
      setMotor3LossPct(0);
      setImuPitchBiasDeg(0);
      setBatteryVoltageSag(1.2);
      setCrosswindSpeed(14);
      setGpsDegraded(false);
      setTraceDelamination(false);
    } else if (presetId === 'imu-drift') {
      setMotor3LossPct(0);
      setImuPitchBiasDeg(6.5);
      setBatteryVoltageSag(0.2);
      setCrosswindSpeed(2);
      setGpsDegraded(false);
      setTraceDelamination(false);
    } else if (presetId === 'motor-cutoff') {
      setMotor3LossPct(100);
      setImuPitchBiasDeg(0);
      setBatteryVoltageSag(1.8);
      setCrosswindSpeed(5);
      setGpsDegraded(false);
      setTraceDelamination(false);
    } else if (presetId === 'battery-freeze') {
      setMotor3LossPct(10);
      setImuPitchBiasDeg(0);
      setBatteryVoltageSag(2.6);
      setCrosswindSpeed(8);
      setGpsDegraded(true);
      setTraceDelamination(false);
    }
  };

  // Counterfactual Computation Engine
  const computeCounterfactualResults = () => {
    // Baseline nominal values
    const baseline = {
      settleTimeSec: 0.38,
      maxDivergenceDeg: 1.2,
      controlEffortPct: 52,
      survivabilityScore: 100,
      status: 'OPTIMAL STABLE',
      mixerState: 'Quad-X Symmetrical (25% per arm)',
      altitudeRetention: '100% (Hold ± 0.05m)'
    };

    // Stress factor calculation
    let stress = 0;
    stress += (motor3LossPct / 100) * 55;
    stress += (Math.abs(imuPitchBiasDeg) / 10) * 20;
    stress += (batteryVoltageSag / 3.0) * 15;
    stress += (crosswindSpeed / 15) * 18;
    if (gpsDegraded) stress += 12;
    if (traceDelamination) stress += 25;

    // Counterfactual derived metrics
    let counterSettleTime = (0.38 + (stress * 0.045)).toFixed(2);
    let counterDivergence = (1.2 + (stress * 0.28)).toFixed(1);
    let counterEffort = Math.min(100, Math.round(52 + (stress * 0.65)));
    let counterSurvivability = Math.max(0, Math.round(100 - (stress * 1.05)));

    let counterStatus = 'DEGRADED STABILITY';
    let counterMixer = 'Asymmetric Bias Redistribution';
    let counterAltitude = 'Holding with ± 0.45m sag';

    if (motor3LossPct >= 90) {
      counterStatus = 'CRITICAL MOTOR COLLAPSE';
      counterSettleTime = 'DIVERGING (∞)';
      counterDivergence = '48.0° (Tumble)';
      counterEffort = 100;
      counterSurvivability = 12;
      counterMixer = 'Tri-Rotor Yaw Desaturation Mode';
      counterAltitude = 'Descent at -3.2 m/s';
    } else if (stress > 60) {
      counterStatus = 'MARGINAL CONTROL AUTHORITY';
      counterAltitude = 'Sagging -0.85m under peak pitch';
    } else if (stress < 15) {
      counterStatus = 'NOMINAL FLIGHT ENVELOPE';
      counterAltitude = 'Hold ± 0.10m';
    }

    return {
      baseline,
      counterfactual: {
        settleTimeSec: counterSettleTime,
        maxDivergenceDeg: counterDivergence,
        controlEffortPct: counterEffort,
        survivabilityScore: counterSurvivability,
        status: counterStatus,
        mixerState: counterMixer,
        altitudeRetention: counterAltitude,
        stressIndex: Math.round(stress)
      }
    };
  };

  const results = computeCounterfactualResults();

  // SVG Trajectory simulation points
  const baselineTraj = "0,70 100,68 200,72 300,70 400,69 500,71 600,70";
  
  // Calculate counterfactual flight path curve based on motor loss and pitch bias
  const cfPoints = [
    { x: 0, y: 70 },
    { x: 100, y: 70 + (motor3LossPct * 0.2) + (imuPitchBiasDeg * 1.5) },
    { x: 200, y: 70 + (motor3LossPct * 0.45) - (crosswindSpeed * 1.2) },
    { x: 300, y: 70 + (motor3LossPct * 0.75) + (imuPitchBiasDeg * 2.2) },
    { x: 400, y: 70 + (motor3LossPct * 0.95) + (batteryVoltageSag * 8) },
    { x: 500, y: 70 + (motor3LossPct * 1.1) },
    { x: 600, y: 70 + (motor3LossPct * 1.25) }
  ];
  const counterfactualTraj = cfPoints.map(p => `${p.x},${Math.min(135, Math.max(10, p.y.toFixed(1)))}`).join(' ');

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6 font-mono text-xs select-none">
      {/* 1. Header Banner */}
      <div className="bg-panel border border-subtle rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-accent-cyan tracking-wider uppercase">
              DIFFERENTIATOR 03 • COUNTERFACTUAL WHAT-IF LABORATORY
            </span>
            <span className="px-2 py-0.5 rounded bg-sky-500/15 text-accent-cyan border border-sky-400/30 font-mono text-[10px] font-bold">
              PARALLEL TWIN EVALUATION
            </span>
          </div>
          <h1 className="text-xl font-bold text-primary font-sans">
            What-If Flight Simulator & Autonomous Degradation Lab
          </h1>
          <p className="text-xs text-secondary font-sans mt-0.5 max-w-3xl leading-relaxed">
            Standard flight simulators test a drone under pristine laboratory conditions. AEROLAB allows engineers to ask counterfactual questions: <em>What if Motor 3 loses 35% thrust during a 14 m/s wind shear?</em> The digital twin compares baseline vs. perturbed outcomes instantly.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0 bg-elevated/60 p-1.5 rounded-lg border border-subtle">
          {[
            { id: 'nominal', label: 'Nominal Clean' },
            { id: 'propeller-damage', label: 'Motor 3 Damaged' },
            { id: 'crosswind-storm', label: '14m/s Wind Shear' },
            { id: 'imu-drift', label: 'IMU Pitch Drift' },
            { id: 'motor-cutoff', label: 'Motor 3 Loss' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                activePreset === p.id
                  ? 'bg-sky-500/20 text-accent-cyan border border-sky-400/40 font-bold shadow-sm'
                  : 'text-muted hover:text-primary hover:bg-hover'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Side-by-Side Dual KPI Evaluation: Baseline vs Counterfactual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* KPI 1: Settling Time */}
        <div className="bg-panel border border-subtle rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-muted uppercase tracking-wider font-semibold">Attitude Settling Time (t_settle)</div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-muted block">BASELINE</span>
              <span className="text-base font-bold text-primary font-mono">{results.baseline.settleTimeSec}s</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted block">WHAT-IF TWIN</span>
              <span className={`text-base font-bold font-mono ${
                results.counterfactual.settleTimeSec.toString().includes('DIVERGING') 
                  ? 'text-rose-400' 
                  : 'text-accent-amber'
              }`}>
                {results.counterfactual.settleTimeSec}{typeof results.counterfactual.settleTimeSec === 'number' ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="text-[9px] text-muted font-sans pt-1 border-t border-subtle flex justify-between">
            <span>Divergence factor:</span>
            <span className="font-mono text-accent-cyan font-semibold">
              {results.counterfactual.settleTimeSec.toString().includes('DIVERGING') ? 'Unbounded' : `+${((results.counterfactual.settleTimeSec - 0.38)).toFixed(2)}s`}
            </span>
          </div>
        </div>

        {/* KPI 2: Max Attitude Divergence */}
        <div className="bg-panel border border-subtle rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-muted uppercase tracking-wider font-semibold">Peak Attitude Deviation (Δθ_max)</div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-muted block">BASELINE</span>
              <span className="text-base font-bold text-primary font-mono">{results.baseline.maxDivergenceDeg}°</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted block">WHAT-IF TWIN</span>
              <span className={`text-base font-bold font-mono ${
                parseFloat(results.counterfactual.maxDivergenceDeg) > 20 ? 'text-rose-400' : 'text-accent-amber'
              }`}>
                {results.counterfactual.maxDivergenceDeg}°
              </span>
            </div>
          </div>
          <div className="text-[9px] text-muted font-sans pt-1 border-t border-subtle flex justify-between">
            <span>Max allowable limit:</span>
            <span className="font-mono text-primary">15.0°</span>
          </div>
        </div>

        {/* KPI 3: Control Effort & Saturation */}
        <div className="bg-panel border border-subtle rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-muted uppercase tracking-wider font-semibold">Mixer Control Effort (ESC Headroom)</div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-muted block">BASELINE</span>
              <span className="text-base font-bold text-primary font-mono">{results.baseline.controlEffortPct}%</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted block">WHAT-IF TWIN</span>
              <span className={`text-base font-bold font-mono ${
                results.counterfactual.controlEffortPct >= 95 ? 'text-rose-400' : 'text-accent-cyan'
              }`}>
                {results.counterfactual.controlEffortPct}%
              </span>
            </div>
          </div>
          <div className="text-[9px] text-muted font-sans pt-1 border-t border-subtle flex justify-between">
            <span>ESC Saturation Risk:</span>
            <span className={`font-mono font-semibold ${results.counterfactual.controlEffortPct >= 90 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {results.counterfactual.controlEffortPct >= 90 ? 'HIGH SATURATION' : 'ADEQUATE MARGIN'}
            </span>
          </div>
        </div>

        {/* KPI 4: Survivability Index */}
        <div className="bg-panel border border-subtle rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-muted uppercase tracking-wider font-semibold">Predicted Mission Survivability</div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-muted block">BASELINE</span>
              <span className="text-base font-bold text-emerald-400 font-mono">100%</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted block">WHAT-IF TWIN</span>
              <span className={`text-base font-bold font-mono ${
                results.counterfactual.survivabilityScore < 50 ? 'text-rose-400' : results.counterfactual.survivabilityScore < 80 ? 'text-accent-amber' : 'text-emerald-400'
              }`}>
                {results.counterfactual.survivabilityScore}%
              </span>
            </div>
          </div>
          <div className="text-[9px] text-muted font-sans pt-1 border-t border-subtle flex justify-between">
            <span>Stability status:</span>
            <span className="font-mono text-primary truncate max-w-[120px]">
              {results.counterfactual.status}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Center Split: Interactive Degradation Controls & Flight Path Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Scenario Sliders (5 Cols) */}
        <div className="lg:col-span-5 bg-panel border border-subtle rounded-xl p-4 space-y-4">
          <div className="border-b border-subtle pb-2">
            <div className="font-bold text-primary text-xs uppercase tracking-wide">
              Counterfactual Parameter Injections
            </div>
            <div className="text-[10px] text-muted">
              Select perturbation variables to evaluate system robustness
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Slider 1: Motor 3 Degradation */}
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-secondary font-sans font-medium">Motor 3 Thrust Loss:</span>
                <span className={`font-mono font-bold ${motor3LossPct > 50 ? 'text-rose-400' : 'text-accent-amber'}`}>
                  {motor3LossPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={motor3LossPct}
                onChange={(e) => setMotor3LossPct(parseInt(e.target.value, 10))}
                className="w-full accent-accent-amber cursor-pointer h-1.5 bg-elevated rounded"
              />
              <div className="flex justify-between text-[9px] text-muted font-mono mt-0.5">
                <span>0% (Nominal)</span>
                <span>50% (Rotor chipped)</span>
                <span>100% (Complete loss)</span>
              </div>
            </div>

            {/* Slider 2: IMU Pitch Sensor Bias */}
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-secondary font-sans font-medium">IMU Pitch Bias Drift:</span>
                <span className="font-mono text-accent-cyan font-bold">{imuPitchBiasDeg > 0 ? '+' : ''}{imuPitchBiasDeg.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.5"
                value={imuPitchBiasDeg}
                onChange={(e) => setImuPitchBiasDeg(parseFloat(e.target.value))}
                className="w-full accent-accent-cyan cursor-pointer h-1.5 bg-elevated rounded"
              />
              <div className="flex justify-between text-[9px] text-muted font-mono mt-0.5">
                <span>-10° (Nose down)</span>
                <span>0.0° (Calibrated)</span>
                <span>+10° (Nose up)</span>
              </div>
            </div>

            {/* Slider 3: Environmental Crosswind Gust */}
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-secondary font-sans font-medium">Lateral Crosswind Shear:</span>
                <span className="font-mono text-sky-400 font-bold">{crosswindSpeed} m/s</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={crosswindSpeed}
                onChange={(e) => setCrosswindSpeed(parseInt(e.target.value, 10))}
                className="w-full accent-sky-400 cursor-pointer h-1.5 bg-elevated rounded"
              />
              <div className="flex justify-between text-[9px] text-muted font-mono mt-0.5">
                <span>0 m/s (Still air)</span>
                <span>8 m/s (Moderate breeze)</span>
                <span>15 m/s (Near gale force)</span>
              </div>
            </div>

            {/* Slider 4: Battery Voltage Sag */}
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-secondary font-sans font-medium">Battery Pack Transient Sag:</span>
                <span className="font-mono text-amber-400 font-bold">-{batteryVoltageSag.toFixed(1)} V</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.0"
                step="0.2"
                value={batteryVoltageSag}
                onChange={(e) => setBatteryVoltageSag(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-elevated rounded"
              />
              <div className="flex justify-between text-[9px] text-muted font-mono mt-0.5">
                <span>0.0 V (Fresh LiHV)</span>
                <span>-1.5 V (High throttle punch)</span>
                <span>-3.0 V (Aged cell cutoff)</span>
              </div>
            </div>

            {/* Hardware Glitch Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-subtle">
              <button
                onClick={() => setGpsDegraded(!gpsDegraded)}
                className={`p-2 rounded-lg border text-left transition font-mono text-[10px] ${
                  gpsDegraded
                    ? 'bg-amber-500/15 border-amber-500/40 text-accent-amber font-bold'
                    : 'bg-elevated/40 border-subtle text-muted hover:text-primary'
                }`}
              >
                <div className="font-semibold">GPS Glitch (HDOP 4.2)</div>
                <div className="text-[9px] text-secondary mt-0.5 font-sans">
                  {gpsDegraded ? 'Dead reckoning active' : '18 sats locked (0.8)'}
                </div>
              </button>

              <button
                onClick={() => setTraceDelamination(!traceDelamination)}
                className={`p-2 rounded-lg border text-left transition font-mono text-[10px] ${
                  traceDelamination
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-bold'
                    : 'bg-elevated/40 border-subtle text-muted hover:text-primary'
                }`}
              >
                <div className="font-semibold">I2C Trace Delamination</div>
                <div className="text-[9px] text-secondary mt-0.5 font-sans">
                  {traceDelamination ? 'Bus pullup 2.8kΩ sag' : 'Nominal copper net'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Trajectory & Motor Dynamics (7 Cols) */}
        <div className="lg:col-span-7 bg-panel border border-subtle rounded-xl p-4 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between border-b border-subtle pb-2 mb-2">
              <span className="font-bold text-primary text-xs uppercase tracking-wide">
                Flight Path & Trajectory Comparison
              </span>
              <div className="flex items-center gap-3 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-accent-cyan inline-block"></span>
                  <span className="text-muted">Baseline Nominal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-400 inline-block"></span>
                  <span className="text-accent-amber">Counterfactual Perturbed</span>
                </div>
              </div>
            </div>

            {/* SVG Flight Trajectory Strip */}
            <div className="bg-elevated/40 border border-subtle rounded-lg p-3 relative h-40 flex flex-col justify-center overflow-hidden">
              <svg viewBox="0 0 600 140" className="w-full h-32 overflow-visible" preserveAspectRatio="none">
                {/* Horizontal reference flight lane */}
                <line x1="0" y1="70" x2="600" y2="70" stroke="#1A2536" strokeDasharray="4 4" />
                <line x1="0" y1="20" x2="600" y2="20" stroke="#121C2A" strokeDasharray="2 2" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#121C2A" strokeDasharray="2 2" />

                {/* Baseline Flight Path (Cyan Straight Hover) */}
                <polyline
                  points={baselineTraj}
                  fill="none"
                  stroke="#55C8E8"
                  strokeWidth="2.5"
                />

                {/* Counterfactual Perturbed Path (Amber / Red Path) */}
                <polyline
                  points={counterfactualTraj}
                  fill="none"
                  stroke={motor3LossPct >= 90 ? '#F06B70' : '#F2B45B'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Drone Symbol at destination */}
                <circle cx="590" cy="70" r="4" fill="#55C8E8" />
                <circle
                  cx="590"
                  cy={Math.min(135, Math.max(10, (70 + (motor3LossPct * 1.25))))}
                  r="5"
                  fill={motor3LossPct >= 90 ? '#F06B70' : '#F2B45B'}
                  className="animate-pulse"
                />
              </svg>

              <div className="flex justify-between items-center text-[10px] text-muted font-mono mt-1 px-1">
                <span>Waypoint Alpha (0.0m)</span>
                <span>Altitude Plane: 2.5m AGL</span>
                <span>Waypoint Bravo (+15.0m)</span>
              </div>
            </div>

            {/* Motor Thrust Distribution Breakdown */}
            <div className="mt-4">
              <div className="text-[11px] font-bold text-primary mb-2 flex justify-between items-center">
                <span>Motor Mixer Thrust Allocation</span>
                <span className="text-[10px] text-muted font-mono">{results.counterfactual.mixerState}</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center font-mono text-[10px]">
                {/* Motor 1 */}
                <div className="p-2 rounded bg-elevated/50 border border-subtle">
                  <div className="text-muted">M1 (Front-R)</div>
                  <div className="text-accent-cyan font-bold text-sm mt-0.5">
                    {Math.min(100, Math.round(52 + (motor3LossPct * 0.35)))}%
                  </div>
                  <div className="text-[9px] text-muted mt-0.5">CW</div>
                </div>

                {/* Motor 2 */}
                <div className="p-2 rounded bg-elevated/50 border border-subtle">
                  <div className="text-muted">M2 (Rear-R)</div>
                  <div className="text-accent-cyan font-bold text-sm mt-0.5">
                    {Math.min(100, Math.round(52 + (motor3LossPct * 0.45)))}%
                  </div>
                  <div className="text-[9px] text-muted mt-0.5">CCW</div>
                </div>

                {/* Motor 3 (Perturbed) */}
                <div className={`p-2 rounded border ${
                  motor3LossPct > 50 ? 'bg-rose-500/10 border-rose-500/40' : 'bg-elevated/50 border-subtle'
                }`}>
                  <div className="text-muted">M3 (Rear-L)</div>
                  <div className={`font-bold text-sm mt-0.5 ${motor3LossPct > 50 ? 'text-rose-400' : 'text-accent-amber'}`}>
                    {Math.max(0, Math.round(52 * (1 - (motor3LossPct / 100))))}%
                  </div>
                  <div className="text-[9px] text-muted mt-0.5">CW (Degraded)</div>
                </div>

                {/* Motor 4 */}
                <div className="p-2 rounded bg-elevated/50 border border-subtle">
                  <div className="text-muted">M4 (Front-L)</div>
                  <div className="text-accent-cyan font-bold text-sm mt-0.5">
                    {Math.min(100, Math.round(52 + (motor3LossPct * 0.25)))}%
                  </div>
                  <div className="text-[9px] text-muted mt-0.5">CCW</div>
                </div>
              </div>
            </div>
          </div>

          {/* Autonomous Graph Mitigation Advice */}
          <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-400/30 text-[11px] space-y-1">
            <div className="font-bold text-accent-cyan flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Autonomous Graph-Aware Mitigation Recommendation</span>
            </div>
            <p className="text-[10px] text-secondary font-sans leading-relaxed">
              {motor3LossPct >= 90
                ? "Total loss of Motor 3 detected. Quadcopter cannot maintain attitude and yaw simultaneously. Recommended mitigation: Switch to Tri-Rotor Yaw Priority, sacrifice heading control, and perform continuous controlled yaw spin while commanding immediate 2.0 m/s emergency descent."
                : motor3LossPct > 30
                ? "Partial thrust degradation on Motor 3. Flight controller should apply +18% PWM trim to Motor 2 and de-rate maximum pitch command from 45° to 22° to avoid motor saturation during roll maneuvers."
                : "Perturbations are within nominal PID rejection authority. Dual Kalman filters can compensate without modifying motor mixer matrix."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.WhatIfLabPage = WhatIfLabPage;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WhatIfLabPage };
}
