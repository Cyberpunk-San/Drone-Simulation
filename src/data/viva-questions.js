// Comprehensive viva questions and model answers for examiners
const VIVA_QUESTIONS = [
  {
    id: "q1",
    question: "Why model a physical PCB as a mathematical graph?",
    answer: "On a printed circuit board, electronic modules (microcontrollers, sensors, power stages) act as discrete vertices (V), while shared copper nets act as edges (E). This abstracts physical electrical traces into rigorous graph theory problems solvable with established algorithms like BFS, Dijkstra, and Prim."
  },
  {
    id: "q2",
    question: "Why is the Ground (GND) net excluded from the graph?",
    answer: "Ground is a universal reference plane touching every component and capacitor. Including GND creates a trivial complete graph (clique) that obscures functional signal buses, communication paths, and single points of failure."
  },
  {
    id: "q3",
    question: "Where do the graph edge weights come from?",
    answer: "Weights are extracted directly from our KiCad PCB layout tracks using KiCad's Python scripting API. The formula is: Weight = Track Length (mm) + (2.0 mm × Via Count). Each via introduces parasitic impedance and manufacturing cost equivalent to ~2mm of copper trace."
  },
  {
    id: "q4",
    question: "Why is Dijkstra's algorithm mathematically valid for PCB routing?",
    answer: "Dijkstra requires non-negative edge weights. Because physical trace lengths in millimeters and via counts can never be negative (weight ≥ 0), the non-negativity constraint holds unconditionally."
  },
  {
    id: "q5",
    question: "What does an articulation point represent on a flight controller?",
    answer: "An articulation point is a vertex whose removal increases the number of connected components. Tarjan's algorithm proves the STM32 is an articulation point: if it fails, the communication between IMU (Sense) and ESC (Act) is severed, resulting in an unrecoverable crash."
  },
  {
    id: "q6",
    question: "How does graph planarity connect to multi-layer PCB routing?",
    answer: "Kuratowski's theorem states a graph is planar iff it contains no subgraph homeomorphic to K5 or K3,3. On a 1-layer PCB, crossing copper tracks causes catastrophic short circuits. Every via on our board is an unavoidable bridge between F.Cu and B.Cu to bypass planar crossings."
  },
  {
    id: "q7",
    question: "What does the chromatic number mean for PCB signal architecture?",
    answer: "The chromatic number χ(G) is the minimum number of colors needed so no two adjacent vertices share a color. On our PCB, it represents the minimum number of independent bus arbitration channels needed so adjacent chips never create signal contention."
  },
  {
    id: "q8",
    question: "Does this simulation website prove the drone flies? (The Honest Claim)",
    answer: "No. The website is an interactive simulator and visualizer of graph concepts on top of our real PCB design. Real physical proof comes exclusively from Stage 4 bench supply bring-up, sensor telemetry calibration, and tethered flight testing."
  }
];

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.VIVA_QUESTIONS = VIVA_QUESTIONS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VIVA_QUESTIONS };
}
