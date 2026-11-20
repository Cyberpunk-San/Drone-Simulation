// AEROLAB Screen — Heterogeneous AI & Real Drone Wiring Workbench
// STM32F7 Flight Controller with 'Bharati Kshetrā' DGCA Compliance Lock + Google Coral Edge TPU 4 TOPS Companion Computer
function HardwareHarnessPage({ graphData }) {
  // Wire Harness Connection States
  const [harnesses, setHarnesses] = React.useState({
    aiBridge: true,      // STM32F7 J4 <-> Companion SBC (High-Speed DMA UART7 @ 3Mbps)
    coralTpu: true,      // Companion SBC <-> Google Coral Edge TPU (USB 3.0 / PCIe Gen2 @ 4 TOPS)
    cameraCsi: true,     // Front Depth Camera <-> Companion SBC (MIPI CSI-2 2-Lane)
    gnssGps: true,       // u-blox M9N GNSS <-> STM32F7 J3 (UART4 + I2C) ['Bharati Kshetrā' Feed]
    escMotors: true,     // STM32F7 J2 <-> 4-in-1 ESC (DShot600 CH1-CH4)
    powerPmu: true       // LiPo Battery PMU <-> STM32F7 J1 & Companion SBC (5V / VBAT)
  });

  // Selected Airspace Zone for 'Bharati Kshetrā' Compliance Lock
  const [selectedAirspace, setSelectedAirspace] = React.useState('delhi-igi'); // 'delhi-igi', 'central-vista', 'bengaluru-hal', 'rural-green'
  
  // Hovered Wire / Component Inspector
  const [hoveredWire, setHoveredWire] = React.useState(null);
  const [selectedComponent, setSelectedComponent] = React.useState('stm32f7');

  // Live Simulated Perception & Hardware Stream (30Hz)
  const [aiStream, setAiStream] = React.useState({
    fps: 30,
    latencyMs: 3.8,
    detectedObject: 'Transmission Pylon',
    distanceM: 2.1,
    confidence: 96.4,
    avoidanceVector: { dx: 1.25, dy: -0.60, dz: 0.15 },
    rawUartPacket: 'AA 55 12 01 7D FF 4E C8 9B'
  });

  // Toggle individual wire harness
  const toggleHarness = (key) => {
    setHarnesses(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Preset Configurations
  const applyPreset = (presetId) => {
    if (presetId === 'all-connected') {
      setHarnesses({
        aiBridge: true,
        coralTpu: true,
        cameraCsi: true,
        gnssGps: true,
        escMotors: true,
        powerPmu: true
      });
    } else if (presetId === 'no-ai') {
      setHarnesses(prev => ({ ...prev, aiBridge: false, coralTpu: false }));
    } else if (presetId === 'no-gps') {
      setHarnesses(prev => ({ ...prev, gnssGps: false }));
    } else if (presetId === 'benchtop-test') {
      setHarnesses({
        aiBridge: true,
        coralTpu: true,
        cameraCsi: true,
        gnssGps: true,
        escMotors: false,
        powerPmu: true
      });
    }
  };

  // 'Bharati Kshetrā' Airspace Geofence Database Definitions
  const airspaceZones = {
    'delhi-igi': {
      name: 'Indira Gandhi International Airport (VIDP)',
      category: 'RED ZONE',
      rule: 'DGCA Category 1 Exclusion Zone (0–5 km Runway Buffer)',
      lat: '28.5562° N',
      lon: '77.1000° E',
      status: 'MOTOR DISARM ENFORCED',
      color: '#F06B70',
      action: 'Firmware Lock: PWM/DShot motor output gate disabled by hardware interrupt. Flight strictly prohibited.'
    },
    'central-vista': {
      name: 'Central Vista & Rashtrapati Bhavan, New Delhi',
      category: 'RED ZONE',
      rule: 'DGCA High Security Government Perimeter',
      lat: '28.6143° N',
      lon: '77.1994° E',
      status: 'MOTOR DISARM ENFORCED',
      color: '#F06B70',
      action: 'Firmware Lock: Geofence boundary breach triggers immediate autonomous motor interlock.'
    },
    'bengaluru-hal': {
      name: 'HAL Airport Controlled Airspace, Bengaluru',
      category: 'YELLOW ZONE',
      rule: 'DGCA Controlled Airspace (5–12 km Airport Radius)',
      lat: '12.9500° N',
      lon: '77.6680° E',
      status: 'CEILING 60M ENFORCED',
      color: '#F2B45B',
      action: 'Firmware Lock: Barometric & GPS altitude capped at 60m AGL. Return-to-Home if boundary approached.'
    },
    'rural-green': {
      name: 'Rural Hoskote Farmland, Karnataka',
      category: 'GREEN ZONE',
      rule: 'DGCA Open Unrestricted Airspace (< 400ft AGL)',
      lat: '13.0700° N',
      lon: '77.7900° E',
      status: 'FLIGHT AUTHORIZED',
      color: '#36C98F',
      action: 'Firmware Lock: Compliance verified. Full 4 TOPS obstacle avoidance and 1kHz flight controller loop active.'
    }
  };

  const currentZone = airspaceZones[selectedAirspace];
  const isGpsActive = harnesses.gnssGps;
  const isAiActive = harnesses.aiBridge && harnesses.coralTpu && harnesses.cameraCsi;
  const isEscActive = harnesses.escMotors;
  const isPowerActive = harnesses.powerPmu;

  // Real-time animation tick for AI obstacle movement
  React.useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.1;
      if (isAiActive) {
        const dist = 1.8 + Math.sin(t * 0.7) * 0.6;
        const dx = 1.2 + Math.sin(t * 0.9) * 0.4;
        const dy = -0.5 + Math.cos(t * 0.8) * 0.3;
        setAiStream(prev => ({
          ...prev,
          distanceM: parseFloat(dist.toFixed(2)),
          avoidanceVector: {
            dx: parseFloat(dx.toFixed(2)),
            dy: parseFloat(dy.toFixed(2)),
            dz: 0.12
          },
          confidence: parseFloat((95.5 + Math.random() * 2.5).toFixed(1))
        }));
      }
    }, 120);
    return () => clearInterval(interval);
  }, [isAiActive]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6 font-mono text-xs select-none">
      {/* 1. Top Header Banner */}
      <div className="bg-panel border border-subtle rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-accent-cyan tracking-wider uppercase">
              HETEROGENEOUS COMPUTING & DRONE HARNESS WORKBENCH
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
              STM32F7 • 4 TOPS CORAL TPU
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-accent-amber border border-amber-500/30 font-mono text-[10px] font-bold">
              BHARATI KSHETRĀ COMPLIANT
            </span>
          </div>
          <h1 className="text-xl font-bold text-primary font-sans">
            Real Drone PCB Wiring & Heterogeneous AI Vision Integration
          </h1>
          <p className="text-xs text-secondary font-sans mt-0.5 max-w-3xl leading-relaxed">
            Directly inspect and connect real physical drone wiring harnesses: link the <strong>STM32F7 Flight Controller</strong> (running deterministic 1kHz FreeRTOS loops and the <em>Bharati Kshetrā</em> DGCA No-Fly geofence lock) to the <strong>Companion Computer + 4 TOPS Google Coral Edge TPU</strong> for real-time 30 FPS autonomous obstacle avoidance.
          </p>
        </div>

        {/* Quick Setup Presets */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0 bg-elevated/60 p-1.5 rounded-lg border border-subtle">
          {[
            { id: 'all-connected', label: 'All Wires Connected' },
            { id: 'no-ai', label: 'Unplug AI Bridge' },
            { id: 'no-gps', label: 'Unplug GNSS' },
            { id: 'benchtop-test', label: 'Benchtop HIL Mode' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className="px-2.5 py-1 rounded text-[11px] font-mono transition bg-hover text-secondary hover:text-primary border border-subtle hover:border-sky-400/40"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Central Real Drone Wiring Graph & Physical Interconnect Canvas */}
      <div className="bg-panel border border-subtle rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between border-b border-subtle pb-3 gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold text-primary text-xs uppercase tracking-wide flex items-center gap-2">
              <span>Physical Drone Wiring Graph & Connector Pinouts</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
            <span className="text-[10px] text-muted">
              Click any wire harness to plug/unplug in real time
            </span>
          </div>

          {/* Quick Harness Toggle Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            <button
              onClick={() => toggleHarness('aiBridge')}
              className={`px-2 py-0.5 rounded border transition font-mono ${
                harnesses.aiBridge ? 'bg-sky-500/20 text-accent-cyan border-sky-400/40 font-bold' : 'bg-elevated text-muted border-subtle'
              }`}
            >
              AI Bridge (3Mbps): {harnesses.aiBridge ? 'CONNECTED' : 'DISCONNECTED'}
            </button>

            <button
              onClick={() => toggleHarness('coralTpu')}
              className={`px-2 py-0.5 rounded border transition font-mono ${
                harnesses.coralTpu ? 'bg-purple-500/20 text-purple-300 border-purple-400/40 font-bold' : 'bg-elevated text-muted border-subtle'
              }`}
            >
              Coral TPU (4 TOPS): {harnesses.coralTpu ? 'LINKED' : 'OFFLINE'}
            </button>

            <button
              onClick={() => toggleHarness('gnssGps')}
              className={`px-2 py-0.5 rounded border transition font-mono ${
                harnesses.gnssGps ? 'bg-amber-500/20 text-accent-amber border-amber-400/40 font-bold' : 'bg-elevated text-muted border-subtle'
              }`}
            >
              GNSS Bharati Lock: {harnesses.gnssGps ? 'LOCKED' : 'NO SIGNAL'}
            </button>

            <button
              onClick={() => toggleHarness('escMotors')}
              className={`px-2 py-0.5 rounded border transition font-mono ${
                harnesses.escMotors ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40 font-bold' : 'bg-elevated text-muted border-subtle'
              }`}
            >
              DShot ESC: {harnesses.escMotors ? 'ARMED' : 'UNPLUGGED'}
            </button>
          </div>
        </div>

        {/* The SVG Real Drone Layout with Bézier Wire Harnesses */}
        <div className="relative bg-[#060A10] border border-subtle rounded-xl p-4 overflow-hidden min-h-[460px] flex items-center justify-center">
          {/* Subtle drone airframe silhouette in background */}
          <svg
            viewBox="0 0 960 480"
            className="w-full h-full max-h-[480px] overflow-visible"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Wire glow filter */}
              <filter id="wireGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Pulsing particle animations */}
              <style>{`
                @keyframes pulseData {
                  0% { stroke-dashoffset: 60; }
                  100% { stroke-dashoffset: 0; }
                }
                .flow-active {
                  stroke-dasharray: 6 6;
                  animation: pulseData 1.2s linear infinite;
                }
                .flow-fast {
                  stroke-dasharray: 4 4;
                  animation: pulseData 0.6s linear infinite;
                }
              `}</style>
            </defs>

            {/* Background Carbon-Fiber Airframe Outline */}
            <g opacity="0.18" stroke="#55C8E8" strokeWidth="2" fill="none">
              <line x1="220" y1="90" x2="740" y2="390" />
              <line x1="740" y1="90" x2="220" y2="390" />
              <circle cx="480" cy="240" r="160" strokeDasharray="6 6" />
              <circle cx="220" cy="90" r="45" />
              <circle cx="740" cy="90" r="45" />
              <circle cx="220" cy="390" r="45" />
              <circle cx="740" cy="390" r="45" />
            </g>

            {/* ========================================================= */}
            {/* 1. PHYSICAL WIRE HARNESSES (Curved Bézier Splines)        */}
            {/* ========================================================= */}

            {/* Wire 1: High-Speed AI Telemetry Bridge (Companion SBC <-> STM32F7 FC) */}
            {/* From SBC (x: 230, y: 240) to STM32F7 J4 (x: 440, y: 220) */}
            <g
              className="cursor-pointer"
              onClick={() => toggleHarness('aiBridge')}
              onMouseEnter={() => setHoveredWire('AI Telemetry Bridge: 3 Mbps High-Speed DMA UART7 + SPI2 sync')}
              onMouseLeave={() => setHoveredWire(null)}
            >
              <path
                d="M 230 240 C 310 210, 370 210, 440 220"
                fill="none"
                stroke={harnesses.aiBridge ? '#55C8E8' : '#223244'}
                strokeWidth={harnesses.aiBridge ? 4.5 : 2}
                strokeLinecap="round"
                opacity={harnesses.aiBridge ? 0.95 : 0.4}
              />
              {harnesses.aiBridge && (
                <path
                  d="M 230 240 C 310 210, 370 210, 440 220"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="flow-fast"
                  filter="url(#wireGlow)"
                />
              )}
            </g>

            {/* Wire 2: Coral TPU Accelerator Link (Companion SBC <-> Coral Edge TPU) */}
            {/* From Coral (x: 100, y: 150) to SBC (x: 180, y: 210) */}
            <g
              className="cursor-pointer"
              onClick={() => toggleHarness('coralTpu')}
              onMouseEnter={() => setHoveredWire('Google Coral Edge TPU Link: USB 3.0 / PCIe Gen2 x1 @ 4.0 TOPS')}
              onMouseLeave={() => setHoveredWire(null)}
            >
              <path
                d="M 120 170 C 140 200, 160 210, 180 230"
                fill="none"
                stroke={harnesses.coralTpu ? '#A855F7' : '#223244'}
                strokeWidth={harnesses.coralTpu ? 4 : 2}
                strokeLinecap="round"
              />
              {harnesses.coralTpu && (
                <path
                  d="M 120 170 C 140 200, 160 210, 180 230"
                  fill="none"
                  stroke="#E9D5FF"
                  strokeWidth="1.8"
                  className="flow-fast"
                />
              )}
            </g>

            {/* Wire 3: Front Depth Camera Ribbon (Camera <-> SBC CSI Port) */}
            {/* From Camera (x: 100, y: 320) to SBC (x: 180, y: 260) */}
            <g
              className="cursor-pointer"
              onClick={() => toggleHarness('cameraCsi')}
              onMouseEnter={() => setHoveredWire('Camera CSI-2 Flex Ribbon: 2-Lane MIPI @ 1080p 60FPS')}
              onMouseLeave={() => setHoveredWire(null)}
            >
              <path
                d="M 120 310 C 145 280, 160 270, 180 250"
                fill="none"
                stroke={harnesses.cameraCsi ? '#EAB308' : '#223244'}
                strokeWidth={harnesses.cameraCsi ? 3.5 : 1.8}
                strokeLinecap="round"
              />
              {harnesses.cameraCsi && (
                <path
                  d="M 120 310 C 145 280, 160 270, 180 250"
                  fill="none"
                  stroke="#FEF08A"
                  strokeWidth="1.5"
                  className="flow-active"
                />
              )}
            </g>

            {/* Wire 4: GNSS GPS / Compass Harness (u-blox <-> STM32F7 J3) ['Bharati Kshetrā' Feed] */}
            {/* From GPS (x: 780, y: 150) to STM32F7 J3 (x: 520, y: 220) */}
            <g
              className="cursor-pointer"
              onClick={() => toggleHarness('gnssGps')}
              onMouseEnter={() => setHoveredWire("GNSS Antenna Harness: UART4 NMEA/UBX + I2C Compass -> 'Bharati Kshetrā' Compliance Engine")}
              onMouseLeave={() => setHoveredWire(null)}
            >
              <path
                d="M 760 170 C 670 190, 590 200, 520 220"
                fill="none"
                stroke={harnesses.gnssGps ? '#F2B45B' : '#223244'}
                strokeWidth={harnesses.gnssGps ? 4 : 2}
                strokeLinecap="round"
              />
              {harnesses.gnssGps && (
                <path
                  d="M 760 170 C 670 190, 590 200, 520 220"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  className="flow-active"
                />
              )}
            </g>

            {/* Wire 5: ESC DShot600 Harness (STM32F7 J2 <-> 4-in-1 ESC & Motors) */}
            {/* From STM32F7 J2 (x: 480, y: 280) to 4-in-1 ESC (x: 480, y: 390) */}
            <g
              className="cursor-pointer"
              onClick={() => toggleHarness('escMotors')}
              onMouseEnter={() => setHoveredWire('ESC DShot600 8-Pin Harness: Motor 1-4 PWM/DShot + Telemetry Return')}
              onMouseLeave={() => setHoveredWire(null)}
            >
              <path
                d="M 480 280 L 480 370"
                fill="none"
                stroke={harnesses.escMotors ? '#36C98F' : '#223244'}
                strokeWidth={harnesses.escMotors ? 4.5 : 2}
                strokeLinecap="round"
              />
              {harnesses.escMotors && (
                <path
                  d="M 480 280 L 480 370"
                  fill="none"
                  stroke="#A7F3D0"
                  strokeWidth="2"
                  className="flow-fast"
                />
              )}
            </g>

            {/* Wire 6: Power PMU Harness (LiPo 14.8V <-> STM32F7 & Companion SBC) */}
            {/* From LiPo (x: 780, y: 330) to STM32F7 J1 (x: 520, y: 260) */}
            <g
              className="cursor-pointer"
              onClick={() => toggleHarness('powerPmu')}
              onMouseEnter={() => setHoveredWire('Power PMU Harness: 14.8V VBAT + Regulated 5V 3A & Current Sensing Shunt')}
              onMouseLeave={() => setHoveredWire(null)}
            >
              <path
                d="M 760 330 C 670 300, 590 280, 520 260"
                fill="none"
                stroke={harnesses.powerPmu ? '#EF4444' : '#223244'}
                strokeWidth={harnesses.powerPmu ? 4.5 : 2}
                strokeLinecap="round"
              />
              {harnesses.powerPmu && (
                <path
                  d="M 760 330 C 670 300, 590 280, 520 260"
                  fill="none"
                  stroke="#FCA5A5"
                  strokeWidth="1.8"
                  className="flow-active"
                />
              )}
            </g>

            {/* ========================================================= */}
            {/* 2. PHYSICAL BOARDS & MODULE HARDWARE RENDERING            */}
            {/* ========================================================= */}

            {/* A. STM32F7 FLIGHT CONTROLLER (Center 50x50mm PCB) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedComponent('stm32f7')}
              transform="translate(420, 180)"
            >
              {/* PCB Substrate (FR4 Dark Blue) */}
              <rect
                x="0" y="0" width="120" height="120" rx="10"
                fill="#0B1B2B"
                stroke="#55C8E8"
                strokeWidth="2"
                filter="url(#wireGlow)"
              />
              {/* Mounting Holes */}
              <circle cx="12" cy="12" r="4.5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
              <circle cx="108" cy="12" r="4.5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
              <circle cx="12" cy="108" r="4.5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
              <circle cx="108" cy="108" r="4.5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />

              {/* STM32F7 MCU IC (Cortex-M7 216MHz) */}
              <rect x="36" y="36" width="48" height="48" rx="3" fill="#132030" stroke="#38BDF8" strokeWidth="1.2" />
              <text x="60" y="56" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="bold">STM32F7</text>
              <text x="60" y="68" textAnchor="middle" fill="#55C8E8" fontSize="6">216MHz M7</text>

              {/* JST Headers */}
              {/* J4 AI Bridge Header (Left side) */}
              <rect x="-4" y="35" width="8" height="20" rx="1" fill="#334155" stroke="#94A3B8" />
              <text x="-8" y="48" textAnchor="end" fill="#55C8E8" fontSize="6" fontWeight="bold">J4: AI BRIDGE</text>

              {/* J3 GNSS Header (Right top) */}
              <rect x="116" y="35" width="8" height="20" rx="1" fill="#334155" stroke="#94A3B8" />
              <text x="128" y="48" textAnchor="start" fill="#F2B45B" fontSize="6" fontWeight="bold">J3: GNSS</text>

              {/* J1 Power Header (Right bottom) */}
              <rect x="116" y="75" width="8" height="20" rx="1" fill="#334155" stroke="#94A3B8" />
              <text x="128" y="88" textAnchor="start" fill="#EF4444" fontSize="6" fontWeight="bold">J1: PMU</text>

              {/* J2 ESC DShot Header (Bottom side) */}
              <rect x="45" y="116" width="30" height="8" rx="1" fill="#334155" stroke="#94A3B8" />
              <text x="60" y="132" textAnchor="middle" fill="#36C98F" fontSize="6" fontWeight="bold">J2: 4-IN-1 ESC</text>

              {/* 'Bharati Kshetrā' Lock Indicator LED */}
              <circle
                cx="25" cy="25" r="3.5"
                fill={currentZone.category === 'RED ZONE' ? '#F06B70' : '#36C98F'}
                className="animate-pulse"
              />
              <text x="32" y="27" fill="#E2E8F0" fontSize="5.5" fontWeight="bold">BHARATI LOCK</text>
            </g>

            {/* B. COMPANION COMPUTER (SBC / Raspberry Pi CM4 / Radxa) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedComponent('companion')}
              transform="translate(160, 200)"
            >
              <rect
                x="0" y="0" width="85" height="75" rx="6"
                fill="#16202E"
                stroke="#A855F7"
                strokeWidth="1.8"
              />
              <text x="42" y="22" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="bold">COMPANION SBC</text>
              <text x="42" y="34" textAnchor="middle" fill="#C084FC" fontSize="6">Linux / ROS 2</text>

              {/* High-speed UART DMA & USB ports */}
              <rect x="75" y="22" width="14" height="12" rx="2" fill="#334155" stroke="#55C8E8" />
              <text x="42" y="52" textAnchor="middle" fill="#94A3B8" fontSize="5.5">UART7 DMA @ 3Mbps</text>
              <text x="42" y="64" textAnchor="middle" fill="#A855F7" fontSize="5.5">Vision Pipeline</text>
            </g>

            {/* C. GOOGLE CORAL EDGE TPU (4 TOPS M.2 / USB Accelerator) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedComponent('coral')}
              transform="translate(45, 120)"
            >
              <rect
                x="0" y="0" width="80" height="55" rx="5"
                fill="#1E1730"
                stroke="#C084FC"
                strokeWidth="1.8"
                filter="url(#wireGlow)"
              />
              <text x="40" y="18" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">GOOGLE CORAL</text>
              <text x="40" y="30" textAnchor="middle" fill="#A855F7" fontSize="8" fontWeight="bold">4 TOPS TPU</text>
              <text x="40" y="44" textAnchor="middle" fill="#E9D5FF" fontSize="5.5">3.8ms Latency • 2W</text>
            </g>

            {/* D. FRONT DEPTH CAMERA (MIPI CSI-2 Perception) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedComponent('camera')}
              transform="translate(45, 290)"
            >
              <rect
                x="0" y="0" width="80" height="50" rx="5"
                fill="#201E14"
                stroke="#EAB308"
                strokeWidth="1.5"
              />
              <circle cx="40" cy="22" r="11" fill="#0F172A" stroke="#FDE047" strokeWidth="1.5" />
              <circle cx="40" cy="22" r="5" fill="#38BDF8" />
              <text x="40" y="42" textAnchor="middle" fill="#FEF08A" fontSize="6" fontWeight="bold">DEPTH CAMERA (120°)</text>
            </g>

            {/* E. u-blox M9N GNSS + COMPASS (Feeds 'Bharati Kshetrā' Lock) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedComponent('gnss')}
              transform="translate(730, 120)"
            >
              <rect
                x="0" y="0" width="85" height="55" rx="5"
                fill="#241E10"
                stroke="#F2B45B"
                strokeWidth="1.8"
              />
              <rect x="25" y="10" width="35" height="25" rx="2" fill="#78350F" stroke="#FBBF24" />
              <text x="42" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="bold">u-blox M9N</text>
              <text x="42" y="45" textAnchor="middle" fill="#FDE68A" fontSize="5.5">NavIC / GPS L1/L5</text>
            </g>

            {/* F. 4S LiPo BATTERY & PMU POWER BOARD */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedComponent('pmu')}
              transform="translate(730, 300)"
            >
              <rect
                x="0" y="0" width="85" height="60" rx="5"
                fill="#2B1214"
                stroke="#EF4444"
                strokeWidth="1.8"
              />
              <text x="42" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">4S 1500mAh LiPo</text>
              <text x="42" y="32" textAnchor="middle" fill="#FCA5A5" fontSize="6.5">14.8V • PMU BEC</text>
              <text x="42" y="46" textAnchor="middle" fill="#94A3B8" fontSize="5.5">5V/3A + Current Shunt</text>
            </g>

            {/* G. 4-IN-1 ESC & BRUSHLESS MOTORS */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedComponent('esc')}
              transform="translate(425, 375)"
            >
              <rect
                x="0" y="0" width="110" height="45" rx="6"
                fill="#0F241A"
                stroke="#36C98F"
                strokeWidth="1.8"
              />
              <text x="55" y="18" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">4-IN-1 45A ESC</text>
              <text x="55" y="30" textAnchor="middle" fill="#6EE7B7" fontSize="6">DShot600 Protocol</text>
              <text x="55" y="40" textAnchor="middle" fill="#A7F3D0" fontSize="5">4x 2306 2450KV Motors</text>
            </g>
          </svg>

          {/* Real-time Wire Inspection Toast */}
          <div className="absolute bottom-3 left-4 right-4 bg-sidebar/90 border border-subtle backdrop-blur-md px-4 py-2 rounded-lg flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] font-mono z-20 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></span>
              <span className="text-secondary font-medium">HARNESS STATUS:</span>
              <span className="text-primary font-bold">
                {hoveredWire || "Hover over any harness wire to inspect its electrical protocol and physical pinout"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-muted">
              <span>Click wires to toggle connection</span>
              <span>•</span>
              <span className="text-accent-cyan">Active 3 Mbps DMA Bridge</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Split: 'Bharati Kshetrā' Compliance Lock & 4 TOPS Coral Edge TPU */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: 'Bharati Kshetrā' DGCA Compliance Lock Monitor */}
        <div className="bg-panel border border-subtle rounded-xl p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-subtle pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary text-xs uppercase tracking-wide">
                  'Bharati Kshetrā' DGCA Compliance Lock
                </span>
                <span className={`px-2 py-0.2 rounded font-mono text-[9px] font-bold border ${
                  currentZone.category === 'RED ZONE'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : currentZone.category === 'YELLOW ZONE'
                    ? 'bg-amber-500/15 text-accent-amber border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  {currentZone.category}
                </span>
              </div>
              <div className="text-[10px] text-muted mt-0.5">
                Hard-coded in STM32F7 internal Flash Sector 3 (Immutable Option Bytes Lock)
              </div>
            </div>

            {/* Live Arming State */}
            <div className="text-right font-mono">
              <div className="text-[9px] text-muted">ARMING GATE</div>
              <div className={`text-xs font-bold ${currentZone.category === 'RED ZONE' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {currentZone.category === 'RED ZONE' ? 'DISARMED (LOCKED)' : 'ARM PERMITTED'}
              </div>
            </div>
          </div>

          {/* Interactive Airspace Zone Selector */}
          <div>
            <div className="text-[11px] font-semibold text-secondary mb-1.5 flex justify-between">
              <span>Select DGCA Airspace Geofence Region:</span>
              <span className="font-mono text-muted text-[10px]">{currentZone.lat}, {currentZone.lon}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'delhi-igi', label: 'Delhi IGI Airport (VIDP)', tag: 'RED ZONE' },
                { id: 'central-vista', label: 'Central Vista Perimeter', tag: 'RED ZONE' },
                { id: 'bengaluru-hal', label: 'Bengaluru HAL Airport', tag: 'YELLOW ZONE' },
                { id: 'rural-green', label: 'Rural Hoskote Farmland', tag: 'GREEN ZONE' }
              ].map(z => (
                <button
                  key={z.id}
                  onClick={() => setSelectedAirspace(z.id)}
                  className={`p-2 rounded-lg border text-left transition font-mono text-[10px] ${
                    selectedAirspace === z.id
                      ? 'bg-sky-500/15 border-sky-400/40 text-primary font-bold shadow-sm'
                      : 'bg-elevated/40 border-subtle text-muted hover:text-primary'
                  }`}
                >
                  <div className="truncate">{z.label}</div>
                  <div className={`text-[9px] mt-0.5 ${
                    z.tag.includes('RED') ? 'text-rose-400' : z.tag.includes('YELLOW') ? 'text-accent-amber' : 'text-emerald-400'
                  }`}>
                    {z.tag}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Geofence Enforcement Status */}
          <div className="p-3 rounded-lg bg-elevated/50 border border-subtle space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-secondary font-medium">Regulatory Airspace Rule:</span>
              <span className="text-primary font-mono font-bold">{currentZone.name}</span>
            </div>
            <p className="text-[11px] text-secondary font-sans leading-relaxed">
              {currentZone.action}
            </p>

            <div className="pt-2 border-t border-subtle grid grid-cols-3 gap-2 text-[10px] font-mono text-center">
              <div>
                <span className="text-muted block text-[9px]">GEOFENCE ALGO</span>
                <span className="text-accent-cyan font-bold">Ray-Casting PiP</span>
              </div>
              <div>
                <span className="text-muted block text-[9px]">EXECUTION TIME</span>
                <span className="text-primary font-bold">38 µs (FPU)</span>
              </div>
              <div>
                <span className="text-muted block text-[9px]">FLASH TAMPER</span>
                <span className="text-emerald-400 font-bold">SECURE LOCK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Heterogeneous AI Platform (Google Coral Edge TPU 4 TOPS) */}
        <div className="bg-panel border border-subtle rounded-xl p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-subtle pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary text-xs uppercase tracking-wide">
                  Heterogeneous AI Perception Engine
                </span>
                <span className={`px-2 py-0.2 rounded font-mono text-[9px] font-bold border ${
                  isAiActive
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {isAiActive ? '4 TOPS ACTIVE' : 'AI OFFLINE'}
                </span>
              </div>
              <div className="text-[10px] text-muted mt-0.5">
                Google Coral Edge TPU Coprocessor + Companion SBC Vision Pipeline
              </div>
            </div>

            {/* Real-time Inference Rate */}
            <div className="text-right font-mono">
              <div className="text-[9px] text-muted">INFERENCE RATE</div>
              <div className="text-xs font-bold text-purple-400">
                {isAiActive ? `${aiStream.fps} FPS (3.8ms)` : '0 FPS (OFFLINE)'}
              </div>
            </div>
          </div>

          {/* Real-Time Vision Inference & Bounding Box HUD */}
          <div className="relative bg-black/60 border border-subtle rounded-lg p-3 overflow-hidden flex flex-col justify-between h-40">
            {/* Simulated camera visual overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.2) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />

            {/* Camera Reticle & Target Box */}
            {isAiActive ? (
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-center text-[10px] text-purple-300 font-mono">
                  <span>CAMERA CSI-2 • 1080p @ 60FPS</span>
                  <span className="px-1.5 py-0.2 rounded bg-purple-500/20 border border-purple-400/40">
                    INT8 YOLOv8n
                  </span>
                </div>

                {/* Simulated Target Detection Box */}
                <div className="self-center bg-purple-500/10 border-2 border-purple-400 rounded p-2 text-center w-56 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <div className="text-xs font-bold text-purple-200">
                    {aiStream.detectedObject}
                  </div>
                  <div className="text-[10px] text-purple-300 font-mono mt-0.5">
                    Range: {aiStream.distanceM}m • Confidence: {aiStream.confidence}%
                  </div>
                </div>

                {/* Avoidance Vector Sent to STM32F7 */}
                <div className="flex justify-between items-center text-[10px] font-mono bg-sidebar/80 px-2.5 py-1 rounded border border-subtle">
                  <span className="text-muted">HIGH-SPEED DMA AVOIDANCE VECTOR:</span>
                  <span className="text-accent-cyan font-bold">
                    ΔX: +{aiStream.avoidanceVector.dx}m/s | ΔY: {aiStream.avoidanceVector.dy}m/s
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted font-mono space-y-1">
                <span className="text-rose-400 font-bold text-xs">AI ACCELERATOR DISCONNECTED</span>
                <span className="text-[10px]">
                  Unplugged harness. Fallback to basic blind STM32F7 PID attitude control without obstacle avoidance.
                </span>
              </div>
            )}
          </div>

          {/* Inter-Board High-Speed DMA Protocol Specs */}
          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-center pt-1">
            <div className="p-2 rounded bg-elevated/40 border border-subtle">
              <span className="text-muted block text-[9px]">UART7 BAUD</span>
              <span className="text-accent-cyan font-bold">3,000,000 bps</span>
            </div>
            <div className="p-2 rounded bg-elevated/40 border border-subtle">
              <span className="text-muted block text-[9px]">DMA BUFFER</span>
              <span className="text-primary font-bold">Circular 512B</span>
            </div>
            <div className="p-2 rounded bg-elevated/40 border border-subtle">
              <span className="text-muted block text-[9px]">PID PREEMPTION</span>
              <span className="text-emerald-400 font-bold">0 µs (Zero Jitter)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Embedded Architecture & Hardware-Software Co-Design Overview */}
      <div className="bg-panel border border-subtle rounded-xl p-4 space-y-2.5">
        <div className="border-b border-subtle pb-2">
          <div className="font-bold text-primary text-xs uppercase tracking-wide">
            Architectural Design & Hardware-Software Co-Design Summary
          </div>
          <div className="text-[10px] text-muted">
            Embedded engineering role: deterministic control loop porting and high-speed heterogeneous inter-board communication
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-secondary text-[11px] font-sans">
          <div className="p-2.5 rounded-lg bg-elevated/40 border border-subtle space-y-1">
            <div className="font-bold text-primary text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan"></span>
              <span>1. Deterministic 1kHz Flight Loop</span>
            </div>
            <p className="text-[10px] leading-relaxed">
              Ported FreeRTOS on the STM32F7 Cortex-M7 with strict task prioritization: the 1kHz attitude estimation and PID loop runs on TIM2 hardware interrupts and is never preempted by telemetry parsing or AI vector handling.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-elevated/40 border border-subtle space-y-1">
            <div className="font-bold text-primary text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              <span>2. Heterogeneous 4 TOPS AI Acceleration</span>
            </div>
            <p className="text-[10px] leading-relaxed">
              Standard H7 microcontrollers lack neural tensor hardware. By pairing an SBC + Google Coral Edge TPU via USB 3.0/PCIe, we achieve 4 TOPS INT8 inference in 3.8ms, bridging avoidance vectors over high-speed 3Mbps DMA UART with zero frame drops.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-elevated/40 border border-subtle space-y-1">
            <div className="font-bold text-primary text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>3. 'Bharati Kshetrā' Regulatory Lock</span>
            </div>
            <p className="text-[10px] leading-relaxed">
              DGCA Indian Airspace No-Fly geofences are hard-compiled into Flash Sector 3 with Option Byte write-protection. If GPS coordinates enter a DGCA Red Zone, motor gates are hardware-inhibited, guaranteeing tamper-proof regulatory compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.HardwareHarnessPage = HardwareHarnessPage;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HardwareHarnessPage };
}
