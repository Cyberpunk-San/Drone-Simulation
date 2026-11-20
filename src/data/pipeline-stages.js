// 4-Stage Flight Controller Engineering Testing Pipeline
const PIPELINE_STAGES = [
  {
    stage: 1,
    title: "ERC & DRC Design Rules Check",
    tool: "KiCad 10.0 CLI (eeschema & pcbnew)",
    status: "PASS (0 Unconnected)",
    description: "Validates electrical design rules (no conflicting power outputs, valid power flags) and physical design rules (trace clearance ≥ 0.20mm, annular rings, 0 unrouted nets across 1065 tracks)."
  },
  {
    stage: 2,
    title: "Power Circuit Simulation",
    tool: "ngspice in KiCad",
    status: "PASS (Stable Rails)",
    description: "Simulates LD39200 3.3V LDO transient response under 100mA step load, 5V servo buck regulator stability, and battery voltage resistor divider ratio for safe ADC telemetry."
  },
  {
    stage: 3,
    title: "Flight Software in the Loop (SITL)",
    tool: "Betaflight SITL / Renode Emulation",
    status: "PASS (Firmware Verified)",
    description: "Executes STM32F405 firmware inside an emulated Cortex-M4 environment without hardware risk. Validates PID inner-loop execution rate at 4kHz and UAVLink protocol serialization."
  },
  {
    stage: 4,
    title: "Physical Board Bring-Up",
    tool: "Bench Supply, Multimeter, Betaflight Configurator",
    status: "Physical Hardware Sequence",
    description: "The only stage that physically proves the hardware works. Follows a strict 6-step bench order before maiden flight."
  }
];

const BRINGUP_CHECKLIST = [
  "Step 1: Bench supply with strict current limit (150mA at 12V LiPo input). Check thermal camera / DMM for heat or smoke.",
  "Step 2: Probe each voltage rail with DMM: verify 3.30V ± 2% on MCU VDD pins, 5.05V on servo bus.",
  "Step 3: Connect USB in DFU bootloader mode. Verify STM32 bootloader is recognized. Flash Betaflight/Hades firmware.",
  "Step 4: Connect Betaflight Configurator. Verify live 3-axis gyro/accel attitude readout and GPS lock. Physically tilt board and observe 3D model.",
  "Step 5: Motor spin test WITH PROPELLERS STRICTLY REMOVED. Verify correct rotation directions and ESC DShot calibration.",
  "Step 6: Tethered hover test in safety cage, followed by autonomous waypoint flight."
];

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.PIPELINE_STAGES = PIPELINE_STAGES;
  window.FC.BRINGUP_CHECKLIST = BRINGUP_CHECKLIST;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PIPELINE_STAGES, BRINGUP_CHECKLIST };
}
