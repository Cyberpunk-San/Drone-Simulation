# AEROLAB — Digital Twin & Flight Intelligence Platform
## Complete UI/UX Architecture & Technical Specification (Rev 2.1)
**Context:** Drone Flight Controller Digital Twin — KiCad PCB + 6-DOF Physics + Graph Intelligence  
**Academic Context:** Graph Theory Lab & Avionics Systems, Semester V (2026–27)  
**Product Classification:** Digital Twin & Flight Intelligence Workstation (Virtual Prototyping, Telemetry Ingestion, Graph EDA)  
**Design Direction:** Premium aerospace instrumentation, technical, restrained, precision engineering console  

---

## 1. Product Vision & Multi-Layer Digital Twin Architecture

### 1.1 The Cyber-Physical Digital Twin Paradigm
AEROLAB transitions beyond standard dashboards and isolated 3D models into a **complete cyber-physical digital twin** representing the Hades Micro quadcopter across four interconnected layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PHYSICAL DRONE LAYER                            │
│   • Hades Micro 50x50mm FC (STM32F405, BMI088 IMU, LD39200 PMU)       │
│   • 4x 2306 2450KV Brushless Motors + PCA9685 PWM Driver / 4-in-1 ESC │
│   • 4S 1500mAh 14.8V LiPo Battery + u-blox M8N GPS Module              │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Real-time Telemetry & Ingestion
                                    │ (MAVLink / USB-UART VCP / Serial)
┌───────────────────────────────────▼────────────────────────────────────┐
│                    DATA & SYNCHRONISATION LAYER                        │
│   • Packet Parser (ATTITUDE, SCALED_IMU, BATTERY_STATUS, GPS_RAW_INT)  │
│   • Sensor Calibration & Extended Kalman Filter (EKF) State Estimator   │
│   • Digital Discrepancy Monitor & 2σ Confidence Bounds Tracking        │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Dynamic Model Synchronization
┌───────────────────────────────────▼────────────────────────────────────┐
│                       VIRTUAL DRONE LAYER                              │
│   • Photorealistic 3D Quadcopter Twin (Three.js WebGL Engine)          │
│   • 6-DOF Rigid Body Equations of Motion (Euler Angles & Quaternions)  │
│   • Aerodynamic Motor Thrust Vectors, Rotor Dynamics, Wind Drag        │
│   • Interactive Exploded Assembly, Component Isolation & Standoff View │
│   • Counterfactual Simulation & "What-If" Mission Scenarios            │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Cross-Layer Blast Radius & EDA
┌───────────────────────────────────▼────────────────────────────────────┐
│                   INTELLIGENCE & EDA GRAPH ENGINE                      │
│   • Physical-to-Graph Topology Mapping (Netlist extraction from KiCad) │
│   • 4-Layer Causal Fault Propagation (Component → PCB → Control → Phys)│
│   • Graph Coloring (Copper Layer Optimization & Crosstalk Elimination) │
│   • Kuratowski Planarity & Via Transition Lower Bounds                 │
│   • Max-Flow / Min-Cut Power Bottleneck Detection                      │
│   • Spectral Graph Analysis (Laplacian Fiedler Value Robustness)       │
│   • Complete 28-Lecture University Syllabus Implementation & Viva      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The Three Standout Differentiator Features

### Differentiator 01: Cross-Layer Fault Propagation Engine
- **Core Concept**: Standard simulators show what a drone does; AEROLAB explains *why* it fails by tracing hardware breakdown across 4 distinct layers:
  1. *Physical Component Layer*: Silicon junction breakdown, MEMS fracture, winding short.
  2. *PCB Netlist Layer*: Affected electrical traces (e.g. SPI1 clock timeouts, PWM gate bias drops, ground-bounce).
  3. *Control Loop Dependency Layer*: Attitude state estimator divergence, Kalman covariance runaway, PID saturation.
  4. *3D Flight Dynamics Consequence*: Aerodynamic tumbling rate, loss of thrust axis, and time-to-ground-impact.
- **Autonomous Recovery Recommendation**: Recommends mitigation strategies (tri-rotor yaw de-rotation, accelerometer leveling fallback, redundant bus failover).

### Differentiator 02: Twin vs Reality (Digital Discrepancy Monitor)
- **Core Concept**: Continuously tracks residual innovation ($\nu_k = y_k - \hat{y}_k$) between the 6-DOF dynamic model and live hardware telemetry.
- **Multi-Channel Oscilloscope with $2\sigma$ Uncertainty Envelope**:
  - Traces Predicted ($x̂$), Measured ($y$), and statistical $\pm 2\sigma$ (95.45%) Gaussian confidence bounds.
  - Anomaly flags triggered when physical vibration or sensor drift breaches the $2\sigma$ envelope.
- **Virtual Twin Calibration Sliders**:
  - Gyroscope zero-rate bias compensation ($b_{gyro}$).
  - Battery internal resistance equivalent ($R_{int}$).
  - Motor thrust gain factor ($K_T$).
- **Physical Root Cause Intelligence**: Explains why real hardware deviates from theory (copper parasitics $L \cdot di/dt$, MEMS silicon thermal gradients, and aerodynamic ground effect vortex recirculation).

### Differentiator 03: What-If Flight Laboratory (Counterfactual Simulation)
- **Core Concept**: Parallel trajectory evaluation comparing a baseline nominal flight against hypothetical hardware degradations and environmental perturbations.
- **Interactive Stress Injections**:
  - Motor 3 thrust loss slider (0% to 100%).
  - IMU pitch bias drift (-10° to +10°).
  - Environmental crosswind shear (0 to 15 m/s).
  - Battery transient voltage sag (0 to -3.0V).
  - GPS multipath glitch toggle & I2C copper trace delamination.
- **Side-by-Side Dual Telemetry Metrics**:
  - Settling time ($t_{settle}$), peak attitude divergence ($\Delta \theta_{max}$), ESC headroom effort (%), and overall hull survivability score.
- **Visual Trajectory Comparison & Motor Mixer Redistribution**: Shows nominal vs perturbed flight paths and real-time motor thrust rebalancing.

---

## 3. Complete 28-Lecture Graph Theory Curriculum & Viva Voce Matrix

AEROLAB maps every single lecture of the university syllabus to live PCB design algorithms and drone digital twin operations:

| Unit | Lecture # | Theoretical Topic | PCB EDA / Drone Application | Mathematical Formula / Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Unit 1** | **L01** | Handshaking Lemma & Terminology | Pin-density analysis & bidirectional net extraction | $\sum \deg(v) = 2\|E\|$, $\mathcal{O}(V+E)$ |
| | **L02** | Adjacency & Incidence Matrices | Netlist memory footprint & fast clearance check | $A \in \{0,1\}^{V \times V}, B \in \{-1,0,1\}^{V \times E}$ |
| **Unit 2** | **L03** | DFS Algorithm & Cycle Detection | Ground loop detection to prevent EMI & RF hum | Discovery/Finish times, $\mathcal{O}(V+E)$ |
| | **L04** | BFS Algorithm & Shortest Hops | Logic buffer propagation delay estimation | FIFO Queue, $\mathcal{O}(V+E)$ |
| | **L05** | Dijkstra Shortest Path | High-speed SPI clock trace impedance & length | $d(v) = \min(d(v), d(u) + w(u,v))$, $\mathcal{O}(E \log V)$ |
| | **L06** | Bellman-Ford Algorithm | Active PDN negative-resistance voltage cycles | Relaxation $\times (V-1)$, $\mathcal{O}(V \cdot E)$ |
| | **L07** | Euler Path & Hamiltonian Cycles | Automated Optical Inspection (AOI) probe path | Eulerian: all even degrees, $\mathcal{O}(V+E)$ |
| | **L08** | Topological Sort in Boot DAGs | FreeRTOS firmware startup & peripheral sequencing | Kahn's in-degree 0 algorithm, $\mathcal{O}(V+E)$ |
| **Unit 3** | **L09** | Trees & Fundamental Cut-Sets | Clock distribution trees & zero-loop ground layout | $\|E\| = \|V\| - 1$, Cayley $n^{n-2}$ |
| | **L10** | Kruskal's Minimum Spanning Tree | Absolute minimum total copper interconnect length | Disjoint-set union (DSU), $\mathcal{O}(E \log E)$ |
| | **L11** | Prim & Steiner Tree Multi-Terminal | Power rail terminal distribution tree approximation | 2-approximation Steiner heuristic, $\mathcal{O}(E \log V)$ |
| **Unit 4** | **L12** | Network Reliability & Cut-Vertices | Single Point of Failure (SPoF) risk assessment | Tarjan Low-link discovery, $\mathcal{O}(V+E)$ |
| | **L13** | Multiway Cut & Minimum K-Cut | Isolating high-current motor noise from IMU sensor | Partitioning into $K$ disconnected domains |
| **Unit 5** | **L14** | Bipartite Matching & Hungarian | STM32 Timer channels to motor PWM line allocation | Augmenting paths, Kuhn-Munkres $\mathcal{O}(V^3)$ |
| | **L15** | Stable Marriage (Gale-Shapley) | Optimal sensor-to-bus pairing (SPI vs I2C vs UART) | Deferred acceptance, $\mathcal{O}(N^2)$ |
| **Unit 6** | **L16** | Vertex Cover & Set Cover | In-Circuit Test (ICT) bed-of-nails probe placement | Maximal matching 2-approximation, $\mathcal{O}(V+E)$ |
| | **L17** | Shortest Superstring & Rectilinear | Manhattan 45° chamfering under IPC-2221 standards | $L_1 = \|x_1-x_2\| + \|y_1-y_2\|$ metric |
| **Unit 7** | **L18** | Graph Coloring & Chromatic Number | Minimum copper layer allocation for zero crosstalk | Welsh-Powell greedy coloring, $\mathcal{O}(V^2)$ |
| | **L19** | Four-Color & Five-Color Theorems | Planar face routing & solder mask integrity | Appel-Haken theorem, Kempe chains |
| **Unit 8** | **L20** | Planar Graphs & Kuratowski | Via count lower-bounds & multi-layer routability | Euler $E \le 3V - 6$, Kuratowski $K_5, K_{3,3}$ |
| | **L21** | Facilities Layout & Floorplanning | Hades Micro 50x50mm component placement | Half-perimeter wirelength (HPWL) minimization |
| **Unit 9** | **L22** | Directed Digraphs & Job Sequencing | Deterministic 1kHz Rate-Monotonic Control Loop | Dependency DAG: Sensor $\to$ Estimator $\to$ PID $\to$ PWM |
| | **L23** | PageRank & Tournament Graphs | Module interconnect centrality & critical hub rating | $P(u) = \frac{1-d}{N} + d \sum \frac{P(v)}{L(v)}$ |
| **Unit 10**| **L24** | Max-Flow Min-Cut (Ford-Fulkerson) | Power Delivery Network (PDN) current bottlenecks | Edmonds-Karp augmenting paths, $\mathcal{O}(V \cdot E^2)$ |
| | **L25** | Transportation & Power Balancing | DC-DC buck converter thermal headroom & margin | Supply vs demand feasibility flow |
| **Unit 11**| **L26** | Graph Enumeration & Pólya Counting | Motor rotation CW/CCW torque symmetry enumeration | Cyclic Group $C_4$ cycle index: $Z(C_4)$ |
| **Unit 12**| **L27** | Contact Networks & Inverter Graphs | 3-Phase MOSFET BLDC motor bridge switching states | High-side / Low-side switching graph paths |
| | **L28** | Tanner Graphs & Parity Check Codes | Telemetry MAVLink packet error detection (LDPC/CRC)| Bipartite Tanner graph (Variable $\leftrightarrow$ Check nodes) |

---

## 4. Platform Navigation & Screen Overview

| Screen ID | Screen Label | Primary Purpose | Key Interactive Elements |
| :--- | :--- | :--- | :--- |
| `digital-twin` | **Digital Twin Studio** | 3D Quadcopter Virtual Prototyping | 360° OrbitControls, Exploded Assembly slider, Component Isolation |
| `flight-simulator` | **Flight Simulation** | 6-DOF Aerodynamic Physics | Attitude horizon, PID tuners, 3D trajectory ribbons, wind disturbance |
| `live-telemetry` | **Live Telemetry** | MAVLink & Sensor Ingestion | 9-DOF IMU, Battery discharge, 4x Motor RPM gauges, GPS satellite radar |
| `fault-propagation`| **Fault Propagation** | Cross-Layer Causality Engine | 4-layer cascading blast radius cards, automated cascade animation |
| `twin-vs-reality` | **Twin vs Reality** | Digital Discrepancy Monitor | Live multi-channel oscilloscope, $2\sigma$ uncertainty band, calibration sliders |
| `what-if-lab` | **What-If Flight Lab** | Counterfactual Mission Explorer | Degradation sliders (Motor, IMU, Wind), baseline vs perturbed comparison |
| `curriculum` | **28-Lecture Syllabus** | Curriculum & Viva Voce Matrix | Unit filters (1–12), mathematical equations, live `graph.json` outputs |
| `pcb-explorer` | **PCB Representation** | KiCad PCB & Netlist Explorer | Interactive `pcb.svg` overlay, netlist routing costs, component pin inspection |
| `hardware-harness`| **Real Drone Wiring & AI** | Heterogeneous AI & Drone Harness | Bézier wire harness plug-and-play, STM32F7, Coral TPU 4 TOPS, Bharati Kshetrā |
| `failure-analysis` | **Failure & Reliability** | Topological Reachability & SPoF | BFS reachability waterfall, cut-vertices, cascading blackout simulator |
| `research-lab` | **Flight Intelligence** | Graph AI in PCB EDA | Coloring, Kuratowski planarity, Max-flow, Spectral Fiedler, Steiner trees |
| `board-reports` | **Board Reports** | DRC/ERC Compliance Evidence | Design rule verification, netlist extraction provenance, clearance logs |
| `overview` | **Executive Overview** | System Summary & Status | Sense-Decide-Act triad, hardware specs, quick demo launcher |

---

## 5. Design Tokens & Engineering Theme

```css
:root {
  --bg-app: #080D14;         /* Aerospace Deep Black */
  --bg-sidebar: #0B121B;     /* Navigation Sidebar */
  --bg-panel: #101A26;       /* Elevated Instrumentation Panel */
  --bg-elevated: #152231;    /* Interactive Controls */
  --bg-hover: #19283A;       /* Focused / Hover State */
  --border-subtle: #223244;  /* Dividers & Grid */
  --border-strong: #33485E;  /* Active Elements */
  --text-primary: #E6EDF3;   /* High Contrast Telemetry Data */
  --text-secondary: #94A3B8; /* Technical Labels */
  --text-muted: #62748C;     /* Metadata & Scale Markers */
  --accent-cyan: #55C8E8;    /* Primary Telemetry & Target Vector */
  --accent-amber: #F2B45B;   /* Active Disturbance & Motors */
  --accent-green: #36C98F;   /* Verified Health & Accepted Path */
  --accent-red: #F06B70;     /* Fault Injection & Critical Cut */
}
```

---

## 6. Verification & Quality Checklist
- [x] Three standout differentiator screens fully integrated into UI navigation.
- [x] All 28 syllabus lectures backed by executable algorithms with live output on Hades Micro board data.
- [x] Zero unescaped HTML entities across all JSX files (Babel standalone compliant).
- [x] `npm test` passes all 12 test suites with 100% success.
- [x] Dark aerospace instrumentation styling strictly enforced across every screen.
- [x] Zero emojis used in UI text; clean vector SVG iconography only.
