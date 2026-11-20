// Drone Flight Canvas with 2D Waypoint Navigation, Graph Traversal, and Avionics HUD (No Invalid Entities, No Emojis)
function DroneFlightCanvas({
  canvasRef,
  droneState,
  onToggleEdgeCut,
  onCanvasClick,
  onSelectWaypoint
}) {
  const cuts = (droneState && droneState.cutEdges) || {};
  const isPmuCut = cuts.pmu;
  const isImuCut = cuts.imu;
  const isM1Cut = cuts.m1;
  const isEscCut = cuts.esc;
  const hasLatency = droneState && droneState.latencyJitter;

  const m1Thrust = droneState.m1Thrust !== undefined ? droneState.m1Thrust : 50;
  const m2Thrust = droneState.m2Thrust !== undefined ? droneState.m2Thrust : 50;
  const m3Thrust = droneState.m3Thrust !== undefined ? droneState.m3Thrust : 50;
  const m4Thrust = droneState.m4Thrust !== undefined ? droneState.m4Thrust : 50;
  const torque = droneState.lastTorque || 0;

  const statusColor = isPmuCut
    ? 'text-slate-500 border-slate-700 bg-slate-900/80'
    : (isImuCut || isM1Cut || isEscCut)
    ? 'text-rose-400 border-rose-500/50 bg-rose-500/10'
    : hasLatency
    ? 'text-amber-400 border-amber-500/50 bg-amber-500/10'
    : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';

  const handleCanvasClickEvent = (e) => {
    if (!canvasRef || !canvasRef.current || !onCanvasClick) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    onCanvasClick(clickX, clickY);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Main 2D Flight Navigation & Attitude Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]"></div>
            <div>
              <h2 className="text-xs font-mono font-bold text-white tracking-wider uppercase">
                2D MISSION NAVIGATION • GRAPH TRAVERSAL FLIGHT PLANT
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Click canvas or waypoints to fly • Dijkstra shortest flight corridor
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${statusColor} uppercase tracking-wider flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPmuCut ? 'bg-slate-500' : (isImuCut || isM1Cut || isEscCut) ? 'bg-rose-500 animate-ping' : hasLatency ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'}`}></span>
            {droneState.systemStatus || 'NOMINAL'}
          </span>
        </div>

        {/* 2D Canvas Viewport */}
        <div className="relative aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden cursor-crosshair">
          <canvas
            ref={canvasRef}
            width={660}
            height={420}
            onClick={handleCanvasClickEvent}
            className="w-full h-full block"
          />

          {/* Telemetry Overlay Card */}
          <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 rounded-xl backdrop-blur-md grid grid-cols-4 gap-3 text-xs font-mono shadow-xl pointer-events-none">
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">POS (X, Y)</div>
              <div className="text-xs font-bold text-sky-400">
                {Math.round(droneState.x || 80)}, {Math.round(droneState.y || 310)} px
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">PITCH / ROLL</div>
              <div className={`text-xs font-bold ${Math.abs(droneState.angle || 0) > 12 ? 'text-rose-400' : 'text-white'}`}>
                {(droneState.angle || 0).toFixed(1)}°
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">TARGET NODE</div>
              <div className="text-xs font-bold text-amber-400">
                {droneState.targetWpId || 'HOVER'}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider">AIRSPEED</div>
              <div className="text-xs font-bold text-emerald-400">
                {Math.round(Math.sqrt((droneState.vx || 0)**2 + (droneState.vy || 0)**2))} px/s
              </div>
            </div>
          </div>

          {/* Wind Vector Banner */}
          {Math.abs(droneState.wind || 0) > 0 && (
            <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-mono text-amber-400 flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>CROSSWIND: {droneState.wind > 0 ? '+' : ''}{(droneState.wind || 0).toFixed(1)} N•m</span>
            </div>
          )}
        </div>

        {/* 4-Motor Telemetry Gauges */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          {/* M1 */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-slate-400">M1 (FL / CW)</span>
              <span className={`font-bold ${isM1Cut ? 'text-rose-500' : 'text-emerald-400'}`}>
                {isM1Cut ? 'CUT (0%)' : `${m1Thrust}%`}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${isM1Cut ? 'bg-rose-500' : 'bg-gradient-to-r from-sky-500 to-emerald-400'}`}
                style={{ width: `${isM1Cut ? 0 : m1Thrust}%` }}
              ></div>
            </div>
          </div>

          {/* M2 */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-slate-400">M2 (FR / CCW)</span>
              <span className="text-amber-400 font-bold">{m2Thrust}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-400 transition-all duration-75"
                style={{ width: `${m2Thrust}%` }}
              ></div>
            </div>
          </div>

          {/* M3 */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-slate-400">M3 (RR / CW)</span>
              <span className="text-amber-400 font-bold">{m3Thrust}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-400 transition-all duration-75"
                style={{ width: `${m3Thrust}%` }}
              ></div>
            </div>
          </div>

          {/* M4 */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-slate-400">M4 (RL / CCW)</span>
              <span className="text-emerald-400 font-bold">{m4Thrust}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-75"
                style={{ width: `${m4Thrust}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Drone Control Loop Network Graph */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                FLIGHT CONTROLLER SIGNAL LOOP GRAPH (CLOSED-LOOP TOPOLOGY)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                DIRECTED CYCLE C
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Click any edge below to cut or restore the physical copper trace. Observe how graph disconnection alters flight stability.
            </p>
          </div>
          <div className="text-right text-[11px] font-mono">
            <span className="text-slate-500">CYCLE STATUS: </span>
            <span className={isPmuCut || isImuCut || isEscCut || isM1Cut ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {isPmuCut || isImuCut || isEscCut || isM1Cut ? 'BROKEN (OPEN LOOP)' : 'CLOSED-LOOP ACTIVE'}
            </span>
          </div>
        </div>

        {/* SVG Diagram of the Control Loop Graph */}
        <div className="relative w-full overflow-x-auto">
          <svg className="w-full h-44 min-w-[620px]" viewBox="0 0 740 160">
            <defs>
              <pattern id="graphGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="740" height="160" fill="url(#graphGrid)" rx="8" />

            {/* Edge: PMU -> STM32 */}
            <g onClick={() => onToggleEdgeCut('pmu')} className="cursor-pointer">
              <line
                x1="80" y1="35" x2="230" y2="75"
                stroke={isPmuCut ? '#ef4444' : '#ef4444'}
                strokeWidth={isPmuCut ? 3 : 2}
                strokeDasharray={isPmuCut ? '6 4' : 'none'}
                strokeOpacity={isPmuCut ? 0.9 : 0.6}
              />
              <text x="140" y="45" fill={isPmuCut ? '#ef4444' : '#f87171'} fontSize="9" fontFamily="monospace" textAnchor="middle">
                {isPmuCut ? '[3.3V CUT]' : '3.3V Power (22.4mm)'}
              </text>
            </g>

            {/* Edge: IMU -> STM32 (Sense) */}
            <g onClick={() => onToggleEdgeCut('imu')} className="cursor-pointer">
              <line
                x1="80" y1="115" x2="230" y2="85"
                stroke={isImuCut ? '#ef4444' : '#10b981'}
                strokeWidth={isImuCut ? 3 : 2.5}
                strokeDasharray={isImuCut ? '6 4' : 'none'}
                className={!isImuCut && !isPmuCut ? 'edge-active' : ''}
              />
              <text x="150" y="118" fill={isImuCut ? '#ef4444' : '#34d399'} fontSize="9" fontFamily="monospace" textAnchor="middle">
                {isImuCut ? '[SPI CUT: SENSOR LOSS]' : 'SPI Bus (11.2mm / 0.12ms)'}
              </text>
            </g>

            {/* Edge: STM32 -> PID */}
            <line x1="310" y1="80" x2="380" y2="80" stroke="#38bdf8" strokeWidth="2.5" className={!isPmuCut ? 'edge-active' : ''} />
            <text x="345" y="70" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">Core Reg</text>

            {/* Edge: PID -> ESC (Actuation bus) */}
            <g onClick={() => onToggleEdgeCut('esc')} className="cursor-pointer">
              <line
                x1="450" y1="80" x2="520" y2="80"
                stroke={isEscCut ? '#ef4444' : '#f59e0b'}
                strokeWidth={isEscCut ? 3 : 2.5}
                strokeDasharray={isEscCut ? '6 4' : 'none'}
                className={!isEscCut && !isPmuCut ? 'edge-active' : ''}
              />
              <text x="485" y="70" fill={isEscCut ? '#ef4444' : '#fbbf24'} fontSize="9" fontFamily="monospace" textAnchor="middle">
                {isEscCut ? '[PWM CUT]' : 'PWM (14.8mm)'}
              </text>
            </g>

            {/* Edges: ESC -> Motors (Star Network) */}
            <g onClick={() => onToggleEdgeCut('m1')} className="cursor-pointer">
              <line
                x1="590" y1="70" x2="660" y2="35"
                stroke={isM1Cut ? '#ef4444' : '#10b981'}
                strokeWidth={isM1Cut ? 3 : 2}
                strokeDasharray={isM1Cut ? '6 4' : 'none'}
              />
              <text x="635" y="42" fill={isM1Cut ? '#ef4444' : '#34d399'} fontSize="8" fontFamily="monospace">
                {isM1Cut ? '[M1 CUT]' : 'M1'}
              </text>
            </g>
            <line x1="590" y1="75" x2="660" y2="65" stroke={isEscCut ? '#64748b' : '#f59e0b'} strokeWidth="1.8" />
            <text x="635" y="68" fill="#fbbf24" fontSize="8" fontFamily="monospace">M2</text>
            <line x1="590" y1="85" x2="660" y2="95" stroke={isEscCut ? '#64748b' : '#f59e0b'} strokeWidth="1.8" />
            <text x="635" y="94" fill="#fbbf24" fontSize="8" fontFamily="monospace">M3</text>
            <line x1="590" y1="90" x2="660" y2="125" stroke={isEscCut ? '#64748b' : '#10b981'} strokeWidth="1.8" />
            <text x="635" y="120" fill="#34d399" fontSize="8" fontFamily="monospace">M4</text>

            {/* Kinetic Feedback Arc */}
            <path
              d="M 680 80 Q 730 155 370 152 Q 10 155 50 120"
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x="370" y="148" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
              Kinematic Feedback Loop (Attitude Dynamics θ • Gyro Rate ω)
            </text>

            {/* NODES */}
            <g transform="translate(45, 15)">
              <rect width="70" height="40" rx="8" fill="#1e1b4b" stroke={isPmuCut ? '#ef4444' : '#818cf8'} strokeWidth="1.5" />
              <text x="35" y="18" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">PMU</text>
              <text x="35" y="31" fill="#c7d2fe" fontSize="8" fontFamily="monospace" textAnchor="middle">3.3V LDO</text>
            </g>

            <g transform="translate(45, 95)">
              <rect width="70" height="40" rx="8" fill="#064e3b" stroke={isImuCut ? '#ef4444' : '#34d399'} strokeWidth="1.5" />
              <text x="35" y="18" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">IMU</text>
              <text x="35" y="31" fill="#a7f3d0" fontSize="8" fontFamily="monospace" textAnchor="middle">BMI088</text>
            </g>

            <g transform="translate(230, 60)">
              <rect width="80" height="40" rx="8" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2" />
              <text x="40" y="18" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">STM32</text>
              <text x="40" y="31" fill="#bae6fd" fontSize="8" fontFamily="monospace" textAnchor="middle">Cortex-M4</text>
            </g>

            <g transform="translate(380, 60)">
              <rect width="70" height="40" rx="8" fill="#312e81" stroke="#a78bfa" strokeWidth="1.5" />
              <text x="35" y="18" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">PID</text>
              <text x="35" y="31" fill="#ddd6fe" fontSize="8" fontFamily="monospace" textAnchor="middle">Output</text>
            </g>

            <g transform="translate(520, 60)">
              <rect width="70" height="40" rx="8" fill="#78350f" stroke={isEscCut ? '#ef4444' : '#f59e0b'} strokeWidth="1.5" />
              <text x="35" y="18" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">ESC</text>
              <text x="35" y="31" fill="#fde68a" fontSize="8" fontFamily="monospace" textAnchor="middle">4-in-1 PWM</text>
            </g>

            <g transform="translate(660, 20)">
              <rect width="60" height="120" rx="8" fill="#0f172a" stroke="#475569" strokeWidth="1" />
              <text x="30" y="22" fill={isM1Cut ? '#ef4444' : '#34d399'} fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">M1 (FL)</text>
              <text x="30" y="52" fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">M2 (FR)</text>
              <text x="30" y="82" fill="#fbbf24" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">M3 (RR)</text>
              <text x="30" y="112" fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">M4 (RL)</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.DroneFlightCanvas = DroneFlightCanvas;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DroneFlightCanvas };
}
