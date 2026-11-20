// AEROLAB Differentiator Screen 02 — Twin vs Reality: Digital Discrepancy Monitor
// Real-time divergence tracking between 6-DOF dynamic simulation model and live physical drone telemetry
function TwinVsRealityPage({ graphData }) {
  const [selectedChannel, setSelectedChannel] = React.useState('roll'); // 'roll', 'pitch', 'motor3', 'battery', 'yawRate'
  const [isInjectingDiscrepancy, setIsInjectingDiscrepancy] = React.useState(false);
  const [calibrationMode, setCalibrationMode] = React.useState('auto'); // 'auto' | 'manual'
  
  // Model Calibration Tuning Sliders
  const [gyroBiasComp, setGyroBiasComp] = React.useState(0.0); // deg/s
  const [batteryInternalR, setBatteryInternalR] = React.useState(22); // mOhm
  const [aerodynamicDragCoeff, setAerodynamicDragCoeff] = React.useState(1.05); // Cd multiplier
  const [motorThrustGain, setMotorThrustGain] = React.useState(1.0); // Kt multiplier

  // Streaming history buffer for SVG Oscilloscope (50 samples)
  const [timeSeries, setTimeSeries] = React.useState(() => {
    const initial = [];
    for (let i = 0; i < 50; i++) {
      initial.push({
        predicted: 0,
        actual: 0,
        upperSigma: 0.8,
        lowerSigma: -0.8,
        delta: 0,
        isAnomaly: false
      });
    }
    return initial;
  });

  // Current Instantaneous Telemetry Snapshots
  const [currentSnapshot, setCurrentSnapshot] = React.useState({
    roll: { pred: 1.8, actual: 2.1, unit: '°', sigma: 0.45, name: 'Roll Angle' },
    pitch: { pred: -0.6, actual: -0.8, unit: '°', sigma: 0.45, name: 'Pitch Angle' },
    yawRate: { pred: 0.0, actual: 0.42, unit: '°/s', sigma: 0.25, name: 'Yaw Rate (Drift)' },
    motor3: { pred: 18400, actual: 17950, unit: 'RPM', sigma: 350, name: 'Motor 3 Velocity' },
    battery: { pred: 15.65, actual: 15.38, unit: 'V', sigma: 0.18, name: 'Battery Voltage' },
    ekfResidual: { pred: 0.02, actual: 0.048, unit: 'var', sigma: 0.03, name: 'EKF Innovation Residual' }
  });

  // Animation and stream generator
  React.useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick += 0.15;
      const noise = (scale) => (Math.random() - 0.5) * scale;

      // Base sine oscillations representing drone hover motion
      const baseRoll = Math.sin(tick * 0.8) * 2.2;
      const basePitch = Math.cos(tick * 0.6) * 1.4;
      const baseMotor = 18200 + Math.sin(tick * 1.2) * 450;
      const baseBatt = 15.7 - (tick * 0.002);
      const baseYawRate = Math.sin(tick * 0.4) * 0.3;

      // Injected hardware physical imperfections
      const extraDiscrepancy = isInjectingDiscrepancy ? 2.5 : 0.0;
      const actualRoll = baseRoll + 0.35 + extraDiscrepancy * Math.sin(tick * 1.5) + noise(0.25) - (gyroBiasComp * 0.4);
      const actualPitch = basePitch - 0.2 + noise(0.2);
      const actualMotor = (baseMotor * motorThrustGain) - (isInjectingDiscrepancy ? 950 : 220) + noise(150);
      const actualBatt = baseBatt - ((batteryInternalR / 1000) * 14.5) + noise(0.04);
      const actualYawRate = baseYawRate + 0.38 - gyroBiasComp + noise(0.12);

      const newSnap = {
        roll: { pred: baseRoll, actual: actualRoll, unit: '°', sigma: 0.55, name: 'Roll Angle' },
        pitch: { pred: basePitch, actual: actualPitch, unit: '°', sigma: 0.5, name: 'Pitch Angle' },
        yawRate: { pred: baseYawRate, actual: actualYawRate, unit: '°/s', sigma: 0.3, name: 'Yaw Rate (Drift)' },
        motor3: { pred: baseMotor, actual: actualMotor, unit: 'RPM', sigma: 400, name: 'Motor 3 Velocity' },
        battery: { pred: baseBatt, actual: actualBatt, unit: 'V', sigma: 0.22, name: 'Battery Voltage' },
        ekfResidual: { pred: 0.02, actual: 0.035 + (isInjectingDiscrepancy ? 0.08 : 0.0) + noise(0.01), unit: 'var', sigma: 0.035, name: 'EKF Innovation Residual' }
      };
      setCurrentSnapshot(newSnap);

      // Select active channel for oscilloscope plot
      let predVal, actVal, sigmaVal;
      if (selectedChannel === 'roll') {
        predVal = newSnap.roll.pred;
        actVal = newSnap.roll.actual;
        sigmaVal = newSnap.roll.sigma;
      } else if (selectedChannel === 'pitch') {
        predVal = newSnap.pitch.pred;
        actVal = newSnap.pitch.actual;
        sigmaVal = newSnap.pitch.sigma;
      } else if (selectedChannel === 'yawRate') {
        predVal = newSnap.yawRate.pred;
        actVal = newSnap.yawRate.actual;
        sigmaVal = newSnap.yawRate.sigma;
      } else if (selectedChannel === 'motor3') {
        // Normalize motor RPM to -5 to +5 scale for oscilloscope
        predVal = (newSnap.motor3.pred - 18200) / 150;
        actVal = (newSnap.motor3.actual - 18200) / 150;
        sigmaVal = 2.0;
      } else { // battery
        predVal = (newSnap.battery.pred - 15.5) * 8;
        actVal = (newSnap.battery.actual - 15.5) * 8;
        sigmaVal = 1.5;
      }

      const delta = actVal - predVal;
      const isAnomaly = Math.abs(delta) > (sigmaVal * 2);

      setTimeSeries(prev => {
        const next = prev.slice(1);
        next.push({
          predicted: predVal,
          actual: actVal,
          upperSigma: predVal + (sigmaVal * 2),
          lowerSigma: predVal - (sigmaVal * 2),
          delta: delta,
          isAnomaly: isAnomaly
        });
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isInjectingDiscrepancy, selectedChannel, gyroBiasComp, batteryInternalR, motorThrustGain]);

  // Calibration action helpers
  const handleAutoCalibrate = () => {
    setGyroBiasComp(0.38);
    setBatteryInternalR(18);
    setAerodynamicDragCoeff(1.02);
    setMotorThrustGain(1.0);
    setIsInjectingDiscrepancy(false);
  };

  const handleResetCalibration = () => {
    setGyroBiasComp(0.0);
    setBatteryInternalR(22);
    setAerodynamicDragCoeff(1.05);
    setMotorThrustGain(1.0);
  };

  // Compute Overall Mean Absolute Discrepancy
  const activeDelta = currentSnapshot[selectedChannel] 
    ? (currentSnapshot[selectedChannel].actual - currentSnapshot[selectedChannel].pred)
    : 0;
  const isOutOfEnvelope = Math.abs(activeDelta) > ((currentSnapshot[selectedChannel]?.sigma || 1) * 2);

  // SVG dimensions for Oscilloscope
  const svgWidth = 720;
  const svgHeight = 220;
  const zeroY = svgHeight / 2;
  const yScale = 22; // pixels per unit

  // Generate SVG path strings
  const predPoints = timeSeries.map((d, i) => {
    const x = (i / (timeSeries.length - 1)) * svgWidth;
    const y = zeroY - (d.predicted * yScale);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const actPoints = timeSeries.map((d, i) => {
    const x = (i / (timeSeries.length - 1)) * svgWidth;
    const y = zeroY - (d.actual * yScale);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  // 2-Sigma confidence envelope polygon
  const upperPoints = timeSeries.map((d, i) => {
    const x = (i / (timeSeries.length - 1)) * svgWidth;
    const y = zeroY - (d.upperSigma * yScale);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const lowerPoints = timeSeries.slice().reverse().map((d, i) => {
    const revIndex = timeSeries.length - 1 - i;
    const x = (revIndex / (timeSeries.length - 1)) * svgWidth;
    const y = zeroY - (d.lowerSigma * yScale);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const envelopePolygon = upperPoints.concat(lowerPoints).join(' ');

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6 font-mono text-xs select-none">
      {/* 1. Header Banner */}
      <div className="bg-panel border border-subtle rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-accent-cyan tracking-wider uppercase">
              DIFFERENTIATOR 02 • DIGITAL DISCREPANCY MONITOR
            </span>
            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
              isOutOfEnvelope 
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse' 
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              {isOutOfEnvelope ? 'ANOMALY: 2σ ENVELOPE BREACH' : 'CONFIDENCE ENVELOPE: 2σ (95.4%)'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-primary font-sans">
            Twin vs. Reality Discrepancy & Kalman Innovation Tracking
          </h1>
          <p className="text-xs text-secondary font-sans mt-0.5 max-w-3xl leading-relaxed">
            In mission-critical aerospace digital twins, running a simulation in a silo is insufficient. AEROLAB continuously computes the residual divergence between virtual state estimations and physical hardware telemetry to isolate model mismatch and hardware degradation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsInjectingDiscrepancy(!isInjectingDiscrepancy)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition flex items-center gap-2 ${
              isInjectingDiscrepancy
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(240,107,112,0.3)]'
                : 'bg-hover text-secondary border-subtle hover:text-primary hover:bg-elevated'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isInjectingDiscrepancy ? 'bg-rose-400 animate-ping' : 'bg-muted'}`}></span>
            {isInjectingDiscrepancy ? 'INJECTING HARDWARE FAULT' : 'INJECT DISCREPANCY'}
          </button>

          <button
            onClick={handleAutoCalibrate}
            className="px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-accent-cyan border border-sky-400/40 font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_10px_rgba(85,200,232,0.15)]"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span>AUTO-CALIBRATE TWIN</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-panel border border-subtle rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-muted uppercase tracking-wider font-semibold">Mean Absolute Discrepancy</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-primary">
              {Math.abs(activeDelta).toFixed(2)}
            </span>
            <span className="text-xs text-muted font-mono">{currentSnapshot[selectedChannel]?.unit}</span>
          </div>
          <div className="text-[10px] text-accent-cyan flex items-center gap-1 font-sans">
            <span>Nominal hover baseline threshold: {'< 0.50'}</span>
          </div>
        </div>

        <div className="bg-panel border border-subtle rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-muted uppercase tracking-wider font-semibold">Kalman Innovation Residual νₖ</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-primary">
              {currentSnapshot.ekfResidual.actual.toFixed(3)}
            </span>
            <span className="text-xs text-muted font-mono">cov</span>
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Filter covariance converged</span>
          </div>
        </div>

        <div className="bg-panel border border-subtle rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-muted uppercase tracking-wider font-semibold">Statistical Confidence Bound</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-accent-amber">± 2.0σ</span>
            <span className="text-xs text-muted font-mono">(95.45%)</span>
          </div>
          <div className="text-[10px] text-muted font-sans">
            <span>Gaussian distribution envelope</span>
          </div>
        </div>

        <div className="bg-panel border border-subtle rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-muted uppercase tracking-wider font-semibold">Model Convergence Health</div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-bold font-mono ${isOutOfEnvelope ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isOutOfEnvelope ? '86.4%' : '99.2%'}
            </span>
            <span className="text-xs text-muted font-mono">match</span>
          </div>
          <div className="text-[10px] text-muted font-sans">
            <span>{isOutOfEnvelope ? 'Physical drift detected' : 'Virtual twin synced to telemetry'}</span>
          </div>
        </div>
      </div>

      {/* 3. Main Center Viewport: Oscilloscope & Side-by-Side Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Oscilloscope Panel (8 Cols) */}
        <div className="lg:col-span-8 bg-panel border border-subtle rounded-xl p-4 space-y-3 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle pb-3">
            {/* Channel Selection Tabs */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'roll', label: 'Roll Angle (θx)' },
                { id: 'pitch', label: 'Pitch Angle (θy)' },
                { id: 'yawRate', label: 'Yaw Rate (ωz)' },
                { id: 'motor3', label: 'Motor 3 RPM' },
                { id: 'battery', label: 'Battery (V)' }
              ].map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                    selectedChannel === ch.id
                      ? 'bg-sky-500/20 text-accent-cyan border border-sky-400/40 font-bold'
                      : 'text-muted hover:text-primary hover:bg-hover'
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>

            {/* Trace Legend */}
            <div className="flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-accent-cyan inline-block"></span>
                <span className="text-muted">Twin Prediction (x̂)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-white inline-block"></span>
                <span className="text-secondary">Physical Telemetry (y)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-sky-500/15 border border-sky-400/30 inline-block rounded-xs"></span>
                <span className="text-muted">±2σ Uncertainty</span>
              </div>
            </div>
          </div>

          {/* Real-time SVG Canvas */}
          <div className="flex-1 bg-elevated/40 border border-subtle rounded-lg p-3 relative overflow-hidden flex flex-col justify-center">
            {/* Live Delta Readout HUD */}
            <div className="absolute top-4 right-4 bg-sidebar/85 border border-subtle backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-3 font-mono text-[11px] z-10 shadow-lg">
              <div>
                <span className="text-muted text-[10px] block">DISCREPANCY (Δ)</span>
                <span className={`font-bold ${isOutOfEnvelope ? 'text-rose-400' : 'text-accent-amber'}`}>
                  {activeDelta > 0 ? '+' : ''}{activeDelta.toFixed(3)} {currentSnapshot[selectedChannel]?.unit}
                </span>
              </div>
              <div className="h-6 w-px bg-subtle"></div>
              <div>
                <span className="text-muted text-[10px] block">STATUS</span>
                <span className={`font-semibold ${isOutOfEnvelope ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isOutOfEnvelope ? 'DRIFT ALERT' : 'IN BOUNDS'}
                </span>
              </div>
            </div>

            {/* Oscilloscope Grid & Waveforms */}
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-48 overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Background Grid Lines */}
              <line x1="0" y1={zeroY - 44} x2={svgWidth} y2={zeroY - 44} stroke="#1A2536" strokeDasharray="3 3" />
              <line x1="0" y1={zeroY} x2={svgWidth} y2={zeroY} stroke="#223247" strokeWidth="1.2" />
              <line x1="0" y1={zeroY + 44} x2={svgWidth} y2={zeroY + 44} stroke="#1A2536" strokeDasharray="3 3" />

              {/* Shaded ±2σ Gaussian Confidence Envelope */}
              <polygon
                points={envelopePolygon}
                fill="rgba(85, 200, 232, 0.08)"
                stroke="rgba(85, 200, 232, 0.25)"
                strokeDasharray="2 2"
                strokeWidth="1"
              />

              {/* Virtual Twin Model Prediction Trace (Cyan Dashed) */}
              <polyline
                points={predPoints}
                fill="none"
                stroke="#55C8E8"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* Physical Hardware Telemetry Trace (White/Yellow Solid) */}
              <polyline
                points={actPoints}
                fill="none"
                stroke={isOutOfEnvelope ? '#F06B70' : '#FFFFFF'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Latest Value Pulsing Reticle */}
              {timeSeries.length > 0 && (
                <circle
                  cx={svgWidth}
                  cy={zeroY - (timeSeries[timeSeries.length - 1].actual * yScale)}
                  r="4"
                  fill={isOutOfEnvelope ? '#F06B70' : '#36C98F'}
                  className="animate-ping"
                />
              )}
            </svg>

            <div className="flex justify-between items-center text-[10px] text-muted font-mono mt-1 px-1">
              <span>T - 5.0 seconds</span>
              <span>Kalman Continuous Estimation • 50 Hz Update</span>
              <span>T = 0.0s (Live)</span>
            </div>
          </div>
        </div>

        {/* Tabular Side-by-Side Channels Matrix (4 Cols) */}
        <div className="lg:col-span-4 bg-panel border border-subtle rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-subtle pb-2 mb-2">
              <span className="font-bold text-primary text-xs uppercase tracking-wide">
                Channel Discrepancy Matrix
              </span>
              <span className="text-[10px] text-muted">6 Telemetry Nets</span>
            </div>

            <div className="space-y-2">
              {Object.keys(currentSnapshot).map(key => {
                const item = currentSnapshot[key];
                const delta = item.actual - item.pred;
                const outOfBounds = Math.abs(delta) > (item.sigma * 2);
                const isSelected = selectedChannel === key;

                return (
                  <div
                    key={key}
                    onClick={() => {
                      if (key !== 'ekfResidual') setSelectedChannel(key);
                    }}
                    className={`p-2 rounded-lg border transition cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/10 border-sky-400/40 shadow-sm'
                        : 'bg-elevated/40 border-subtle hover:bg-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary text-[11px]">{item.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        outOfBounds ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {outOfBounds ? 'OUTLIER' : 'SYNCED'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-1.5 text-[10px] font-mono">
                      <div>
                        <span className="text-muted block text-[9px]">TWIN (x̂)</span>
                        <span className="text-accent-cyan font-medium">
                          {item.pred.toFixed(2)} {item.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block text-[9px]">REAL (y)</span>
                        <span className="text-primary font-medium">
                          {item.actual.toFixed(2)} {item.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted block text-[9px]">DELTA (Δ)</span>
                        <span className={`font-bold ${outOfBounds ? 'text-rose-400' : 'text-accent-amber'}`}>
                          {delta > 0 ? '+' : ''}{delta.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-elevated/60 border border-subtle text-[11px] text-muted space-y-1">
            <div className="text-primary font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan"></span>
              <span>Why Real Systems Diverge</span>
            </div>
            <p className="text-[10px] leading-relaxed text-secondary font-sans">
              Unlike ideal graph abstractions, physical quadcopters suffer from non-linear motor saturation, aerodynamic blade-vortex ground effects, and thermal drift across silicon dies.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Model Calibration Tuning & Cyber-Physical Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Model Calibration Sliders (Tuning the Virtual Twin) */}
        <div className="bg-panel border border-subtle rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-subtle pb-2">
            <div>
              <div className="font-bold text-primary text-xs uppercase tracking-wide">
                Virtual Twin Calibration Sliders
              </div>
              <div className="text-[10px] text-muted">
                Tune physical model coefficients to converge virtual twin with hardware
              </div>
            </div>
            <button
              onClick={handleResetCalibration}
              className="text-[10px] px-2 py-1 rounded bg-hover text-secondary hover:text-primary transition"
            >
              Reset Defaults
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {/* Slider 1: Gyroscope Zero-Rate Bias Compensation */}
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-secondary font-sans font-medium">Gyro Zero-Rate Bias (bg):</span>
                <span className="font-mono text-accent-cyan font-bold">{gyroBiasComp.toFixed(2)} °/s</span>
              </div>
              <input
                type="range"
                min="-1.0"
                max="1.0"
                step="0.02"
                value={gyroBiasComp}
                onChange={(e) => setGyroBiasComp(parseFloat(e.target.value))}
                className="w-full accent-accent-cyan cursor-pointer h-1.5 bg-elevated rounded"
              />
              <div className="flex justify-between text-[9px] text-muted font-mono mt-0.5">
                <span>-1.0 °/s (Negative drift)</span>
                <span>0.0 (Calibrated)</span>
                <span>+1.0 °/s (Positive drift)</span>
              </div>
            </div>

            {/* Slider 2: Battery Internal Resistance ESR */}
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-secondary font-sans font-medium">Battery Internal Resistance (R_int):</span>
                <span className="font-mono text-accent-cyan font-bold">{batteryInternalR} mΩ</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="1"
                value={batteryInternalR}
                onChange={(e) => setBatteryInternalR(parseInt(e.target.value, 10))}
                className="w-full accent-accent-cyan cursor-pointer h-1.5 bg-elevated rounded"
              />
              <div className="flex justify-between text-[9px] text-muted font-mono mt-0.5">
                <span>5 mΩ (New LiPo cell)</span>
                <span>22 mΩ (Nominal)</span>
                <span>45 mΩ (Aged / Cold pack)</span>
              </div>
            </div>

            {/* Slider 3: Motor Thrust Coefficient Kt */}
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-secondary font-sans font-medium">Motor Thrust Scaling Factor (Kt):</span>
                <span className="font-mono text-accent-cyan font-bold">{(motorThrustGain * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.15"
                step="0.01"
                value={motorThrustGain}
                onChange={(e) => setMotorThrustGain(parseFloat(e.target.value))}
                className="w-full accent-accent-cyan cursor-pointer h-1.5 bg-elevated rounded"
              />
              <div className="flex justify-between text-[9px] text-muted font-mono mt-0.5">
                <span>85% (Propeller tip wear)</span>
                <span>100% (Nominal)</span>
                <span>115% (High air density)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cyber-Physical Root Cause Explanations */}
        <div className="bg-panel border border-subtle rounded-xl p-4 space-y-3">
          <div className="border-b border-subtle pb-2">
            <div className="font-bold text-primary text-xs uppercase tracking-wide">
              Physical Mechanisms Behind Discrepancies
            </div>
            <div className="text-[10px] text-muted">
              Aerospace engineering analysis of why hardware deviates from math models
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="p-2.5 rounded-lg bg-elevated/40 border border-subtle">
              <div className="font-semibold text-primary text-xs flex items-center justify-between">
                <span>1. PCB Copper Parasitics & Inductive Kick</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-accent-amber border border-amber-500/30">
                  L · di/dt
                </span>
              </div>
              <p className="text-[11px] text-secondary font-sans mt-1 leading-relaxed">
                High-frequency 24kHz PWM motor switching induces transient inductive voltage spikes along the battery rail traces. This ripples into the 3.3V analog reference rail, causing ±0.2° gyro jitter not predicted by kinematic equations.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-elevated/40 border border-subtle">
              <div className="font-semibold text-primary text-xs flex items-center justify-between">
                <span>2. MEMS Sensor Thermal Drift</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/15 text-accent-cyan border border-sky-400/30">
                  Δf / ΔT
                </span>
              </div>
              <p className="text-[11px] text-secondary font-sans mt-1 leading-relaxed">
                As the STM32F405 MCU dissipates 1.2W of heat during flight computation, the thermal gradient across the FR4 substrate warms the adjacent BMI088 IMU, causing a zero-rate drift of +0.38°/s on the z-axis gyro.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-elevated/40 border border-subtle">
              <div className="font-semibold text-primary text-xs flex items-center justify-between">
                <span>3. Aerodynamic Blade Vortex Ground Interaction</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  IGE Effect
                </span>
              </div>
              <p className="text-[11px] text-secondary font-sans mt-1 leading-relaxed">
                When hovering within 1 rotor diameter of a surface, tip vortices recirculate beneath the arms, generating turbulent ground cushion forces that cause the 2.1° roll oscillation seen in live telemetry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.TwinVsRealityPage = TwinVsRealityPage;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TwinVsRealityPage };
}
