// KiCad PCB physical metrics extracted from Hades Micro 50x50mm design
const BOARD_METRICS = {
  boardDimensions: "50.1 × 50.1 mm",
  totalTracks: 1065,
  copperVias: 86,
  unconnectedNets: 0,
  smdComponents: 90,
  signalLayers: "2 (F.Cu / B.Cu)",
  copperClearance: "0.20 mm",
  minDrill: "0.30 mm",
  boardArea: "2510 mm²",
  estimatedTraceLength: "1840 mm",
  routingStatus: "100% ROUTED (0 UNCONNECTED)"
};

const CHIP_ROSTER = [
  { id: "STM32", ref: "MCU1", name: "STM32F405RGT6", role: "Central Flight Computer (Decide)", pins: 64, color: "#38bdf8" },
  { id: "IMU", ref: "IMU1", name: "Bosch BMI088 6-DOF", role: "Attitude & Inertial Sensor (Sense)", pins: 16, color: "#10b981" },
  { id: "PMU", ref: "REG1", name: "LD39200 3.3V LDO", role: "Power Delivery (3.3V / VBAT)", pins: 8, color: "#ef4444" },
  { id: "ESC", ref: "PWM1", name: "PCA9685BS 8-Ch PWM", role: "Motor Actuation (Act)", pins: 28, color: "#f59e0b" },
  { id: "GPS", ref: "GPS1", name: "u-blox M8N UART", role: "Satellite Navigation (Nav)", pins: 4, color: "#06b6d4" },
  { id: "Comm", ref: "TELEM1", name: "CH330 USB/Telemetry", role: "Ground Station Uplink (Link)", pins: 8, color: "#a855f7" }
];

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.BOARD_METRICS = BOARD_METRICS;
  window.FC.CHIP_ROSTER = CHIP_ROSTER;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BOARD_METRICS, CHIP_ROSTER };
}
