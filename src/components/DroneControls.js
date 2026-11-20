// Drone Flight Controls, 2D Waypoint Navigation, Graph Fault Injection & PID Tuner (No Invalid Entities, No Emojis)
function DroneControls({
  droneState,
  setDroneState,
  onPushDrone,
  onResetLevel,
  onToggleEdgeCut,
  onToggleLatency,
  onRestoreAllEdges,
  onFlyDijkstra,
  onFlyToWaypoint,
  onPatrolMission,
  onReturnToLaunch
}) {
  const cuts = (droneState && droneState.cutEdges) || {};
  const isPmuCut = cuts.pmu;
  const isImuCut = cuts.imu;
  const isM1Cut = cuts.m1;
  const isEscCut = cuts.esc;
  const hasLatency = droneState && droneState.latencyJitter;

  const waypoints = [
    { id: 'PAD-A', label: 'PAD A (BASE)', x: 80,  y: 310, color: '#10b981' },
    { id: 'WP-1',  label: 'WP-1 (ALPHA)', x: 180, y: 130, color: '#38bdf8' },
    { id: 'WP-2',  label: 'WP-2 (BRAVO)', x: 310, y: 260, color: '#a855f7' },
    { id: 'WP-3',  label: 'WP-3 (CHARLIE)', x: 350, y: 100, color: '#f59e0b' },
    { id: 'WP-4',  label: 'WP-4 (DELTA)', x: 490, y: 210, color: '#06b6d4' },
    { id: 'PAD-B', label: 'PAD B (TARGET)', x: 580, y: 310, color: '#ef4444' }
  ];

  return (
    <div className="flex flex-col gap-4 font-mono">
      {/* 1. 2D Graph Waypoint Navigation Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            WAYPOINT GRAPH NAVIGATION (2D FLIGHT)
          </h3>
          <span className="text-[10px] text-sky-400 uppercase">AUTONOMOUS GUIDANCE</span>
        </div>

        {/* Primary Autonomous Navigation Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onFlyDijkstra}
            className="w-full py-2.5 px-3 rounded-xl border text-xs font-bold bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:from-sky-500 hover:to-indigo-500 text-white border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.25)] transition flex items-center justify-center gap-2 active:scale-98"
          >
            <span>NAVIGATE DIJKSTRA SHORTEST PATH [PAD-A → PAD-B]</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onPatrolMission}
              className="flex-1 py-1.5 px-2 rounded-lg border text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-300 border-indigo-500/40 transition"
            >
              PATROL FULL CYCLE
            </button>
            <button
              onClick={onReturnToLaunch}
              className="flex-1 py-1.5 px-2 rounded-lg border text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border-emerald-500/40 transition"
            >
              RETURN TO LAUNCH (RTL)
            </button>
          </div>
        </div>

        {/* Waypoint Selector Grid */}
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between">
            <span>DIRECT VECTOR DISPATCH</span>
            <span>CLICK NODE TO FLY</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            {waypoints.map((wp) => {
              const isCurrent = droneState.targetWpId === wp.id;
              return (
                <button
                  key={wp.id}
                  onClick={() => onFlyToWaypoint(wp)}
                  className={`py-1.5 px-2 rounded-lg border font-bold text-center transition ${
                    isCurrent
                      ? 'bg-sky-500/30 text-white border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {wp.id}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Graph Theory Fault Injection on Drone */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            GRAPH FAULT INJECTION (EDGE CUTS)
          </h3>
          <span className="text-[10px] text-slate-500 uppercase">CLOSED-LOOP EXPERIMENTS</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Cut IMU */}
          <button
            onClick={() => onToggleEdgeCut('imu')}
            className={`py-2 px-2.5 rounded-lg border font-semibold text-left transition flex flex-col gap-0.5 ${
              isImuCut
                ? 'bg-rose-500/25 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] text-slate-400 uppercase font-bold">1. SENSOR EDGE</span>
            <span className="font-bold">{isImuCut ? 'RESTORE IMU' : 'SEVER SPI TRACE'}</span>
          </button>

          {/* Cut Motor 1 */}
          <button
            onClick={() => onToggleEdgeCut('m1')}
            className={`py-2 px-2.5 rounded-lg border font-semibold text-left transition flex flex-col gap-0.5 ${
              isM1Cut
                ? 'bg-rose-500/25 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] text-slate-400 uppercase font-bold">2. STAR DEGREE</span>
            <span className="font-bold">{isM1Cut ? 'RESTORE M1' : 'CUT M1 WIRE'}</span>
          </button>

          {/* Cut ESC Actuation */}
          <button
            onClick={() => onToggleEdgeCut('esc')}
            className={`py-2 px-2.5 rounded-lg border font-semibold text-left transition flex flex-col gap-0.5 ${
              isEscCut
                ? 'bg-rose-500/25 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] text-slate-400 uppercase font-bold">3. BRIDGE CUT</span>
            <span className="font-bold">{isEscCut ? 'RESTORE ESC' : 'SEVER PWM BUS'}</span>
          </button>

          {/* Cut PMU */}
          <button
            onClick={() => onToggleEdgeCut('pmu')}
            className={`py-2 px-2.5 rounded-lg border font-semibold text-left transition flex flex-col gap-0.5 ${
              isPmuCut
                ? 'bg-rose-500/25 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] text-slate-400 uppercase font-bold">4. ROOT DAG</span>
            <span className="font-bold">{isPmuCut ? 'RESTORE PMU' : 'CUT 3.3V POWER'}</span>
          </button>
        </div>

        {/* Latency & Restore */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onToggleLatency}
            className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-semibold transition ${
              hasLatency
                ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {hasLatency ? 'LATENCY: JITTER (+15ms)' : 'INJECT TRACE LATENCY'}
          </button>

          <button
            onClick={onRestoreAllEdges}
            className="flex-1 py-1.5 px-2 rounded-lg border text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40 transition"
          >
            RESTORE ALL EDGES
          </button>
        </div>
      </div>

      {/* 3. Disturbances & Aerodynamics */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          AERODYNAMIC DISTURBANCES
        </h3>

        <div className="flex gap-2">
          <button
            onClick={() => onPushDrone(-18)}
            className="flex-1 py-2 text-xs font-bold bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 rounded-xl transition active:scale-95"
          >
            PUSH LEFT (-18°)
          </button>
          <button
            onClick={() => onPushDrone(18)}
            className="flex-1 py-2 text-xs font-bold bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 rounded-xl transition active:scale-95"
          >
            PUSH RIGHT (+18°)
          </button>
          <button
            onClick={onResetLevel}
            className="px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition"
          >
            LEVEL
          </button>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>CONTINUOUS CROSSWIND</span>
            <span className="font-mono text-sky-400 font-bold">{droneState.wind > 0 ? '+' : ''}{(droneState.wind || 0).toFixed(1)} N•m</span>
          </div>
          <input
            type="range" min="-12" max="12" step="0.5"
            value={droneState.wind || 0}
            onChange={e => setDroneState(prev => ({ ...prev, wind: parseFloat(e.target.value) }))}
            className="w-full accent-sky-400 cursor-pointer"
          />
        </div>
      </div>

      {/* 4. Discrete PID Parameters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          PID ATTITUDE CONTROLLER
        </h4>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>PROPORTIONAL (Kp)</span>
            <span className="font-mono text-white font-bold">{(droneState.kp || 6).toFixed(1)}</span>
          </div>
          <input
            type="range" min="0" max="15" step="0.5"
            value={droneState.kp || 6}
            onChange={e => setDroneState(prev => ({ ...prev, kp: parseFloat(e.target.value) }))}
            className="w-full accent-sky-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>INTEGRAL (Ki)</span>
            <span className="font-mono text-white font-bold">{(droneState.ki || 0.5).toFixed(2)}</span>
          </div>
          <input
            type="range" min="0" max="2" step="0.05"
            value={droneState.ki || 0.5}
            onChange={e => setDroneState(prev => ({ ...prev, ki: parseFloat(e.target.value) }))}
            className="w-full accent-sky-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>DERIVATIVE (Kd)</span>
            <span className="font-mono text-white font-bold">{(droneState.kd || 2.5).toFixed(1)}</span>
          </div>
          <input
            type="range" min="0" max="8" step="0.2"
            value={droneState.kd || 2.5}
            onChange={e => setDroneState(prev => ({ ...prev, kd: parseFloat(e.target.value) }))}
            className="w-full accent-sky-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.DroneControls = DroneControls;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DroneControls };
}
