// AEROLAB Cross-Layer Fault Propagation & Causality Engine
// Connects 4 distinct layers: Physical Component -> PCB Netlist -> Control Dependency -> 3D Flight Consequence
(function() {
  window.FC = window.FC || {};

  // Comprehensive multi-layer failure profiles
  const FAULT_PROFILES = {
    IMU: {
      id: 'IMU',
      name: 'Inertial Measurement Unit (BMI088)',
      category: 'Sensor',
      physicalFailure: 'MEMS capacitive sensing comb finger fracture under motor vibration.',
      layer1_component: {
        status: 'CRITICAL SENSOR LOSS',
        detail: 'Gyroscope angular rate output freezes. Accelerometer readings register NaN / 0.0 m/s².'
      },
      layer2_pcbNet: {
        affectedNets: ['SPI1_SCK', 'SPI1_MISO', 'SPI1_MOSI', 'INT_GYR', 'INT_ACC'],
        traceStatus: 'Traces physically intact, but SPI bus transactions timeout after 500µs.',
        affectedNeighbors: ['STM32']
      },
      layer3_controlLoop: {
        stage: 'Attitude State Estimator (EKF / Mahony Filter)',
        impact: 'Filter covariance diverges. Angular rate feedback lost. Derivative (Kd) term produces massive spike.',
        cascadeTo: 'PID Controller -> Motor Mixer'
      },
      layer4_flightPhysics: {
        consequence: 'Loss of attitude stabilization. Drone uncontrollably rolls and pitches.',
        timeToTumble: '0.42 seconds',
        severity: 'CATASTROPHIC UNCONTROLLED TUMBLE',
        altitudeDropRate: '4.8 m/s'
      },
      recoveryStrategy: {
        available: true,
        action: 'FALLBACK TO BAROMETER + ACCEL LEVELING / MOTOR CUTOFF DISARM',
        confidence: '68%',
        mitigation: 'Dual redundant IMU architecture on separate SPI bus recommended.'
      }
    },
    MOTOR_3: {
      id: 'MOTOR_3',
      name: 'Motor 3 (Rear-Left Brushless 2306)',
      category: 'Actuator',
      physicalFailure: 'Phase winding short-circuit due to magnet wire thermal insulation breakdown.',
      layer1_component: {
        status: 'PROPULSION COLLAPSE',
        detail: 'Motor 3 RPM drops from 18,400 to 0 RPM. Draw current surges to 45A limit.'
      },
      layer2_pcbNet: {
        affectedNets: ['PWM_CH3', 'PCA9685_OE', '+5V_SERVO'],
        traceStatus: 'Back-EMF inductive spike back-propagates through ESC driver rail.',
        affectedNeighbors: ['ESC', 'PMU']
      },
      layer3_controlLoop: {
        stage: 'Motor Mixer & Yaw Decoupler',
        impact: 'PID mixer saturates opposite motor (M1) to 100% while M2/M4 cannot counteract yaw-torque.',
        cascadeTo: 'Closed-Loop PID Control Loop'
      },
      layer4_flightPhysics: {
        consequence: 'Violent yaw-spin and diagonal roll-inversion toward Rear-Left quadrant.',
        timeToTumble: '0.28 seconds',
        severity: 'ASYMMETRIC THRUST DIVERGENCE',
        altitudeDropRate: '6.2 m/s'
      },
      recoveryStrategy: {
        available: true,
        action: 'TRICOPTER EMULATION MODE (SPINNING DESCENT)',
        confidence: '82%',
        mitigation: 'Sacrifice yaw control to maintain net positive vertical thrust for survivable hard landing.'
      }
    },
    PMU: {
      id: 'PMU',
      name: 'Power Management Unit (LD39200 3.3V LDO)',
      category: 'Power Delivery',
      physicalFailure: 'Thermal shutdown or linear pass-transistor punch-through failure.',
      layer1_component: {
        status: 'TOTAL POWER BUS BLACKOUT',
        detail: '3.3V logic rail drops to 0.0V. Brownout reset triggered across all onboard ICs.'
      },
      layer2_pcbNet: {
        affectedNets: ['+3V3_VDD', 'V_BATT_SENSE', 'PMU_PG'],
        traceStatus: 'Complete voltage collapse on primary power copper pour.',
        affectedNeighbors: ['STM32', 'IMU', 'GPS', 'Comm', 'ESC']
      },
      layer3_controlLoop: {
        stage: 'All Microcontroller Firmwares & Logic Stages',
        impact: 'Cortex-M4 stops executing instructions. All PWM outputs pull low (0V).',
        cascadeTo: 'Total Avionics Halt'
      },
      layer4_flightPhysics: {
        consequence: 'All 4 motors immediately un-arm. Drone enters ballistic free-fall.',
        timeToTumble: '0.05 seconds',
        severity: 'BALLISTIC FREE-FALL (ZERO THRUST)',
        altitudeDropRate: '9.81 m/s² acceleration'
      },
      recoveryStrategy: {
        available: false,
        action: 'NO RECOVERY POSSIBLE (SINGLE POINT OF FAILURE)',
        confidence: '0%',
        mitigation: 'Dual diode-ORed redundant LDO regulators from separate battery cells.'
      }
    },
    GPS: {
      id: 'GPS',
      name: 'u-blox M8N GPS Module',
      category: 'Navigation',
      physicalFailure: 'Antenna patch ceramic fracture or UART2 baud-rate synchronization loss.',
      layer1_component: {
        status: 'POSITION LOCK LOST',
        detail: 'HDOP spikes to 99.9. Satellite count drops from 14 to 0.'
      },
      layer2_pcbNet: {
        affectedNets: ['UART2_TX', 'UART2_RX', 'GPS_PPS'],
        traceStatus: 'UART buffer receives malformed NMEA checksums.',
        affectedNeighbors: ['STM32']
      },
      layer3_controlLoop: {
        stage: 'Position Hold & Waypoint Navigation Outer Loop',
        impact: 'Global coordinate navigation fails; attitude stabilization remains completely nominal.',
        cascadeTo: 'Navigation Guidance Layer'
      },
      layer4_flightPhysics: {
        consequence: 'Quadcopter drifts with atmospheric crosswind, but remains stably level.',
        timeToTumble: 'No tumble (Flight remains stable)',
        severity: 'POSITION DRIFT (ATTITUDE STABLE)',
        altitudeDropRate: '0.0 m/s (Altitude hold maintained by Baro)'
      },
      recoveryStrategy: {
        available: true,
        action: 'AUTONOMOUS DEGRADATION TO ALTITUDE-HOLD (ALTHOLD) & INERTIAL DEAD RECKONING',
        confidence: '95%',
        mitigation: 'Optical flow sensor or visual odometry fallback.'
      }
    },
    STM32: {
      id: 'STM32',
      name: 'Central Microcontroller (STM32F405 MCU)',
      category: 'Compute Core',
      physicalFailure: 'Firmware hard-fault watchdog freeze or clock crystal oscillation halt.',
      layer1_component: {
        status: 'CENTRAL FLIGHT COMPUTER HALT',
        detail: '168MHz ARM Cortex-M4 stops instruction execution. No watchdog heartbeat.'
      },
      layer2_pcbNet: {
        affectedNets: ['All 64 pins', 'I2C1_SCL', 'SPI1_SCK', 'UART1', 'UART2', 'PWM_BUS'],
        traceStatus: 'All GPIOs float to high-impedance state.',
        affectedNeighbors: ['IMU', 'PMU', 'ESC', 'GPS', 'Comm']
      },
      layer3_controlLoop: {
        stage: 'All Software Closed Loops',
        impact: 'Attitude control loop, telemetry, and motor mixer all freeze.',
        cascadeTo: 'Total System Disconnection'
      },
      layer4_flightPhysics: {
        consequence: 'ESCs timeout after 50ms without DShot frames and disarm. Drone falls.',
        timeToTumble: '0.12 seconds',
        severity: 'SYSTEM LOCKUP & DESCENT',
        altitudeDropRate: '9.81 m/s²'
      },
      recoveryStrategy: {
        available: false,
        action: 'HARDWARE INDEPENDENT ESC FAILSAFE TIMEOUT DISARM',
        confidence: '99%',
        mitigation: 'Hardware watchdog reset IC (e.g. TPS3823) with independent brownout supervisor.'
      }
    }
  };

  // Evaluate Cross-Layer Propagation
  window.FC.traceFaultPropagation = function(componentKey) {
    return FAULT_PROFILES[componentKey] || FAULT_PROFILES['IMU'];
  };

  window.FC.getAvailableFaultComponents = function() {
    return Object.keys(FAULT_PROFILES).map(k => ({
      id: k,
      name: FAULT_PROFILES[k].name,
      category: FAULT_PROFILES[k].category,
      severity: FAULT_PROFILES[k].layer4_flightPhysics.severity
    }));
  };

})();
