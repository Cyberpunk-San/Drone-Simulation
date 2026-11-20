// AEROLAB Screen 03 — Live Telemetry & Hardware Sync
// Real-time MAVLink / Serial stream ingestion, 9-DOF IMU, Power & Battery discharge, Motor RPMs, GPS Constellation
function LiveTelemetryPage() {
  const [isHardwareConnected, setIsHardwareConnected] = React.useState(false);
  const [telemetryRate, setTelemetryRate] = React.useState(50); // Hz
  const [packetCount, setPacketCount] = React.useState(14820);
  const [droppedPackets, setDroppedPackets] = React.useState(0);

  // Live Simulated Sensors
  const [imuData, setImuData] = React.useState({
    ax: 0.02, ay: -0.01, az: 9.81,
    gx: 0.01, gy: 0.00, gz: 0.02,
    mx: 24.1, my: -12.4, mz: 42.8
  });

  const [batteryData, setBatteryData] = React.useState({
    voltage: 15.84,
    current: 16.2,
    power: 256.6,
    consumedMah: 512,
    c1: 3.96, c2: 3.96, c3: 3.95, c4: 3.97
  });

  const [motorTelemetry, setMotorTelemetry] = React.useState({
    m1: { rpm: 18400, temp: 42.1, curr: 4.1 },
    m2: { rpm: 18380, temp: 41.9, curr: 4.0 },
    m3: { rpm: 18420, temp: 42.3, curr: 4.1 },
    m4: { rpm: 18410, temp: 42.0, curr: 4.0 }
  });

  const [waveHistory, setWaveHistory] = React.useState([]);

  // Telemetry Stream Generator Tick (25Hz)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPacketCount(p => p + 1);

      // Micro sensor fluctuations
      const noise = (scale) => (Math.random() - 0.5) * scale;
      const newAz = 9.81 + noise(0.12);
      const newGx = noise(0.04);
      const newGy = noise(0.04);
      const newVolt = 15.84 + noise(0.05);

      setImuData({
        ax: noise(0.08),
        ay: noise(0.08),
        az: newAz,
        gx: newGx,
        gy: newGy,
        gz: noise(0.02),
        mx: 24.1 + noise(0.2),
        my: -12.4 + noise(0.2),
        mz: 42.8 + noise(0.3)
      });

      setBatteryData(b => ({
        ...b,
        voltage: newVolt,
        current: 16.2 + noise(0.8),
        power: newVolt * (16.2 + noise(0.8)),
        consumedMah: b.consumedMah + 0.18
      }));

      setWaveHistory(hist => [...hist.slice(-40), { az: newAz, gx: newGx, gy: newGy }]);
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6 font-mono text-xs select-none">
      {/* 1. Ingestion Header & Stream Control */}
      <div className="bg-panel border border-subtle rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-accent-cyan tracking-wider uppercase">
              MAVLINK / SERIAL TELEMETRY INGESTION STREAM
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isHardwareConnected ? 'bg-emerald-500/15 text-accent-green border-emerald-500/30' : 'bg-sky-500/15 text-accent-cyan border-sky-500/30'}`}>
              {isHardwareConnected ? 'LIVE HARDWARE SYNC' : 'HARDWARE EMULATOR STREAM'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-primary font-sans">
            Avionics & Sensor Telemetry Hub
          </h1>
          <p className="text-xs text-muted font-sans mt-0.5">
            Streaming calibrated high-rate IMU, 4-channel ESC motor telemetry, 4S LiPo rail monitoring, and GPS constellation locks.
          </p>
        </div>

        {/* Sync Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-elevated border border-subtle rounded-lg px-3 py-1.5 flex items-center gap-3 text-xs">
            <div>
              <span className="text-[10px] text-muted block">INGEST RATE</span>
              <span className="text-accent-cyan font-bold">{telemetryRate} Hz</span>
            </div>
            <div className="border-l border-subtle pl-3">
              <span className="text-[10px] text-muted block">PACKETS RX</span>
              <span className="text-primary font-bold">{packetCount.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => setIsHardwareConnected(!isHardwareConnected)}
            className={`px-3 py-2 rounded-lg font-bold border transition ${isHardwareConnected ? 'bg-emerald-500/20 text-accent-green border-emerald-500/40' : 'bg-elevated hover:bg-hover text-secondary border-subtle'}`}
          >
            {isHardwareConnected ? 'DISCONNECT HW' : 'CONNECT SERIAL COM'}
          </button>
        </div>
      </div>

      {/* 2. Top Sensor Grid (4 Cards: 9-DOF IMU, Battery, GPS, Motor RPMs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card A: 9-DOF IMU (BMI088) */}
        <div className="bg-panel border border-subtle rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-subtle/50 pb-2">
            <span className="font-bold text-primary text-xs uppercase">9-DOF INERTIAL SENSOR</span>
            <span className="text-[10px] text-accent-green">BMI088 (SPI)</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div>
              <span className="text-muted block text-[10px]">ACCELERATION (m/s²)</span>
              <div className="flex justify-between font-bold text-accent-cyan">
                <span>X: {imuData.ax.toFixed(2)}</span>
                <span>Y: {imuData.ay.toFixed(2)}</span>
                <span>Z: {imuData.az.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-1 border-t border-subtle/30">
              <span className="text-muted block text-[10px]">ANGULAR RATE (rad/s)</span>
              <div className="flex justify-between font-bold text-accent-amber">
                <span>P: {imuData.gx.toFixed(2)}</span>
                <span>Q: {imuData.gy.toFixed(2)}</span>
                <span>R: {imuData.gz.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-1 border-t border-subtle/30">
              <span className="text-muted block text-[10px]">MAGNETIC FIELD (µT)</span>
              <div className="flex justify-between text-secondary">
                <span>X: {imuData.mx.toFixed(1)}</span>
                <span>Y: {imuData.my.toFixed(1)}</span>
                <span>Z: {imuData.mz.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card B: 4S LiPo Battery Management */}
        <div className="bg-panel border border-subtle rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-subtle/50 pb-2">
            <span className="font-bold text-primary text-xs uppercase">POWER & LIPO RAIL</span>
            <span className="text-[10px] text-accent-amber">4S 1500mAh</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-muted">Pack Voltage:</span>
              <span className="text-base font-bold text-accent-green">{batteryData.voltage.toFixed(2)} V</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Current Draw:</span>
              <span className="font-bold text-accent-amber">{batteryData.current.toFixed(1)} A</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Total Power:</span>
              <span className="font-bold text-primary">{batteryData.power.toFixed(0)} W</span>
            </div>
            <div className="pt-1 border-t border-subtle/30">
              <span className="text-muted block text-[10px] mb-1">INDIVIDUAL CELLS (V)</span>
              <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                <div className="p-1 bg-elevated rounded text-accent-green font-bold">{batteryData.c1}V</div>
                <div className="p-1 bg-elevated rounded text-accent-green font-bold">{batteryData.c2}V</div>
                <div className="p-1 bg-elevated rounded text-accent-green font-bold">{batteryData.c3}V</div>
                <div className="p-1 bg-elevated rounded text-accent-green font-bold">{batteryData.c4}V</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card C: 4-Channel Motor RPM Gauges */}
        <div className="bg-panel border border-subtle rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-subtle/50 pb-2">
            <span className="font-bold text-primary text-xs uppercase">PROPULSION RPM & ESC</span>
            <span className="text-[10px] text-accent-cyan">PCA9685 DShot</span>
          </div>

          <div className="space-y-2 text-[11px]">
            {Object.keys(motorTelemetry).map((mKey, idx) => {
              const m = motorTelemetry[mKey];
              return (
                <div key={mKey} className="flex items-center justify-between bg-elevated p-1.5 rounded border border-subtle/40">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent-cyan"></span>
                    <span className="font-bold text-primary uppercase">{mKey}</span>
                  </div>
                  <span className="text-accent-amber font-bold">{m.rpm} RPM</span>
                  <span className="text-muted text-[10px]">{m.temp}°C</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card D: GPS Navigation Satellite Constellation */}
        <div className="bg-panel border border-subtle rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-subtle/50 pb-2">
            <span className="font-bold text-primary text-xs uppercase">GPS NAVIGATION</span>
            <span className="text-[10px] text-accent-green">u-blox M8N</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-muted">Fix Quality:</span>
              <span className="font-bold text-accent-green">3D DGPS FIX</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Satellites Tracked:</span>
              <span className="font-bold text-primary">14 Satellites</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">HDOP / VDOP:</span>
              <span className="text-accent-cyan font-bold">0.82 / 1.14</span>
            </div>
            <div className="pt-1 border-t border-subtle/30 text-[10px] text-secondary">
              <div>LAT: 28.6139° N</div>
              <div>LON: 77.2090° E • ALT: 214.2 m</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real-Time Oscilloscope Wave Stream Strip Charts */}
      <div className="bg-panel border border-subtle rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-subtle/60 pb-2">
          <span className="font-bold text-primary text-xs uppercase tracking-wider">
            HIGH-RATE SENSOR OSCILLOSCOPE (ACCEL Z & GYRO RATES)
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-accent-green inline-block"></span>
              <span className="text-secondary">Accel Z (m/s²)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-accent-amber inline-block"></span>
              <span className="text-secondary">Gyro P (rad/s)</span>
            </div>
          </div>
        </div>

        {/* Live SVG Oscilloscope Stream */}
        <div className="h-32 bg-[#060a0f] rounded-lg border border-subtle p-2 relative overflow-hidden">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
            {/* Grid Lines */}
            <line x1="0" y1="25" x2="400" y2="25" stroke="#182330" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="400" y2="50" stroke="#223244" strokeWidth="1.5" />
            <line x1="0" y1="75" x2="400" y2="75" stroke="#182330" strokeWidth="1" strokeDasharray="3 3" />

            {/* Accel Z Wave */}
            {waveHistory.length > 1 && (
              <polyline
                points={waveHistory.map((pt, idx) => {
                  const x = (idx / (waveHistory.length - 1)) * 400;
                  const y = 50 - (pt.az - 9.81) * 80;
                  return `${x},${Math.max(5, Math.min(95, y))}`;
                }).join(' ')}
                fill="none"
                stroke="#36C98F"
                strokeWidth="2"
              />
            )}

            {/* Gyro P Wave */}
            {waveHistory.length > 1 && (
              <polyline
                points={waveHistory.map((pt, idx) => {
                  const x = (idx / (waveHistory.length - 1)) * 400;
                  const y = 50 - pt.gx * 400;
                  return `${x},${Math.max(5, Math.min(95, y))}`;
                }).join(' ')}
                fill="none"
                stroke="#F2B45B"
                strokeWidth="1.5"
                opacity="0.85"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.LiveTelemetryPage = LiveTelemetryPage;
}
