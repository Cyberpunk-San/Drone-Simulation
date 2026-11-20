// AERO-AI Autonomous Viva Presentation Engine and Reasoning Assistant
class AiEngine {
  constructor(handlers) {
    this.handlers = handlers;
    this.isRunning = false;
    this.stepIndex = 0;
  }

  async runPresentation(onStepChange) {
    if (this.isRunning) return;
    this.isRunning = true;

    const sound = (typeof window !== 'undefined' && window.FC && window.FC.sound);
    const speakText = (typeof window !== 'undefined' && window.FC && window.FC.speakText) || function(){};

    const script = [
      {
        phase: "Phase 1: Architecture Overview",
        speech: "Welcome to our Graph Theory Lab demonstration. We model a quadcopter flight controller printed circuit board as a mathematical graph. Integrated circuits are vertices, and shared copper nets are edges.",
        action: () => {
          this.handlers.setActiveTab('sim');
          sound && sound.playLaser();
        },
        duration: 7500
      },
      {
        phase: "Phase 2: Connectivity via BFS",
        speech: "First, Breadth-First Search initiates from the STM32 microcontroller. Visiting all vertices proves that no integrated circuit pin is left floating or unrouted on the board.",
        action: () => this.handlers.runBFS(),
        duration: 6500
      },
      {
        phase: "Phase 3: Dijkstra Shortest Path",
        speech: "Next, Dijkstra's algorithm determines the lowest physical impedance path from the power regulator to the inertial measurement unit, penalizing vias by two millimeters each.",
        action: () => this.handlers.runDijkstra(),
        duration: 6500
      },
      {
        phase: "Phase 4: Prim's Minimum Spanning Tree",
        speech: "Prim's algorithm extracts the bare-minimum copper infrastructure required to keep every module interconnected. The remaining edges provide critical redundant backup paths.",
        action: () => this.handlers.runPrim(),
        duration: 6500
      },
      {
        phase: "Phase 5: Tarjan's Single Point of Failure",
        speech: "Tarjan's algorithm exposes critical bridges and articulation points, mathematically proving that the STM32 is the single point of failure on the flight controller.",
        action: () => this.handlers.showCritical(),
        duration: 7000
      },
      {
        phase: "Phase 6: Hardware Failure Injection",
        speech: "Observe what occurs when the power management unit fails. All downstream microelectronics lose VDD logic voltage immediately.",
        action: () => this.handlers.failModule('PMU'),
        duration: 6500
      },
      {
        phase: "Phase 7: Closed-Loop Flight Dynamics",
        speech: "Switching to the flight simulator. The closed-loop control system senses attitude via IMU, decides PID torque via STM32, and commands motor thrust via ESCs.",
        action: () => {
          this.handlers.setActiveTab('drone');
          this.handlers.pushDrone(18);
        },
        duration: 7000
      },
      {
        phase: "Phase 8: Viva Ready",
        speech: "This concludes our automated graph analysis on the KiCad flight controller board. We are ready for examiner questions!",
        action: () => {
          this.handlers.setActiveTab('viva');
          sound && sound.playLaser();
        },
        duration: 6000
      }
    ];

    for (let i = 0; i < script.length; i++) {
      if (!this.isRunning) break;
      this.stepIndex = i + 1;
      if (onStepChange) onStepChange(this.stepIndex, script.length);
      
      const item = script[i];
      item.action();
      this.handlers.setAiMessage(`${item.phase}: ${item.speech}`);
      speakText(item.speech);
      
      await new Promise(r => setTimeout(r, item.duration));
    }

    this.isRunning = false;
    this.stepIndex = 0;
    if (onStepChange) onStepChange(0, script.length);
  }

  stop() {
    this.isRunning = false;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.AiEngine = AiEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AiEngine };
}
