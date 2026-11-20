// AEROLAB Screen 08 — Complete 28-Lecture Graph Theory Curriculum Matrix & Viva Explorer
// Maps every lecture from Unit 1 to Unit 12 to live PCB design algorithms and drone digital twin operations
function CurriculumSyllabusPage({ graphData }) {
  const nodes = (graphData && graphData.nodes) || [];
  const edges = (graphData && (graphData.functional_edges || graphData.edges)) || [];

  const [selectedLecture, setSelectedLecture] = React.useState(1);
  const [selectedUnit, setSelectedUnit] = React.useState('all');

  const lectures = [
    // UNIT 1
    {
      num: 1, unit: 1,
      title: 'Introduction to Graph Theory, Terminology & Handshaking Lemma',
      topics: 'Vertices, Edges, Degree, Handshaking Lemma (Sum(deg) = 2|E|), Regular graphs',
      complexity: 'O(V + E)',
      fn: () => window.FC && window.FC.lecture1_Terminology && window.FC.lecture1_Terminology(nodes, edges),
      pcbApplication: 'PCB Pin-Density Analysis & Netlist Validation',
      vivaTip: 'Explain that the Handshaking Lemma validates netlist extraction integrity: every bidirectional copper trace between two IC pads contributes exactly 2 to the sum of pin degrees.'
    },
    {
      num: 2, unit: 1,
      title: 'Graph Representations, Adjacency/Incidence Matrices & Bridges',
      topics: 'Adjacency Matrix A, Incidence Matrix B, Connectedness, Cut-sets, Bridges',
      complexity: 'O(V²)',
      fn: () => window.FC && window.FC.lecture2_Representations && window.FC.lecture2_Representations(nodes, edges),
      pcbApplication: 'CAD Netlist Memory Storage & Fast DRC Clearance Checking',
      vivaTip: 'Demonstrate the 6x6 Adjacency Matrix and 6x6 Incidence Matrix. Show that entry A[i][j]=1 means modules i and j share a physical copper trace.'
    },
    // UNIT 2
    {
      num: 3, unit: 2,
      title: 'DFS Algorithm, Back-Edges & Cycle Detection',
      topics: 'Depth-First Search, Discovery/Finish times, Back-edges, Cycle detection',
      complexity: 'O(V + E)',
      fn: () => window.FC && window.FC.lecture3_DFS && window.FC.lecture3_DFS(nodes, edges, 'PMU'),
      pcbApplication: 'Ground Loop Detection to Prevent EMI & Signal Jitter',
      vivaTip: 'In audio and high-frequency flight controllers, ground loops act as inductive antennas. DFS back-edge detection identifies unintended closed copper loops.'
    },
    {
      num: 4, unit: 2,
      title: 'BFS Algorithm & Level-by-Level Shortest Hops',
      topics: 'Breadth-First Search, Queue-based traversal, Hop distance, BFS vs DFS comparison',
      complexity: 'O(V + E)',
      fn: () => window.FC && window.FC.lecture4_BFS && window.FC.lecture4_BFS(nodes, edges, 'PMU'),
      pcbApplication: 'Digital Gate & Bus Buffer Propagation Delay Estimation',
      vivaTip: 'BFS explores modules in concentric hop rings from the PMU power rail, measuring minimum logic buffer stages required to reach peripherals.'
    },
    {
      num: 5, unit: 2,
      title: 'Dijkstra\'s Algorithm with Physical Trace Penalties',
      topics: 'Single-source shortest path, Greedy relaxation, Priority queue, Non-negative edge weights',
      complexity: 'O(E log V)',
      fn: () => window.FC && window.FC.computeDijkstra && window.FC.computeDijkstra(nodes, {
        PMU: [{ to: 'STM32', w: 26.5, i: 0 }],
        STM32: [{ to: 'IMU', w: 20.4, i: 1 }, { to: 'PMU', w: 26.5, i: 0 }]
      }, edges, 'PMU', 'IMU'),
      pcbApplication: 'High-Speed SPI Clock Trace Length & Latency Optimization',
      vivaTip: 'Explain our mm-equivalent routing cost formula: trace Euclidean distance plus +2.0 mm delay penalty per layer-transition via.'
    },
    {
      num: 6, unit: 2,
      title: 'Bellman-Ford Algorithm & Negative-Weight Voltage Drop Cycles',
      topics: 'Dynamic programming, Edge relaxation |V|-1 times, Negative cycle detection',
      complexity: 'O(V * E)',
      fn: () => window.FC && window.FC.lecture6_BellmanFord && window.FC.lecture6_BellmanFord(nodes, edges, 'PMU'),
      pcbApplication: 'Active Power Delivery Network (PDN) DC Resistance Drops',
      vivaTip: 'Unlike Dijkstra, Bellman-Ford can detect negative cycles. In avionics, negative resistance modeling is used in active switching power supplies and ground-bounce detection.'
    },
    {
      num: 7, unit: 2,
      title: 'Euler Paths, Euler Circuits & Hamiltonian Cycles',
      topics: 'Eulerian graphs (all even degrees), Semi-Eulerian (exactly 2 odd degrees), Hamiltonian NP-complete',
      complexity: 'O(V + E) for Euler, NP-hard for Hamiltonian',
      fn: () => window.FC && window.FC.lecture7_Euler && window.FC.lecture7_Euler(nodes, edges),
      pcbApplication: 'Automated Optical Inspection (AOI) Flying Probe Path Planning',
      vivaTip: 'An automated PCB optical inspection camera uses an Euler path to scan every single copper trace on the Hades Micro board exactly once without wasteful retracing.'
    },
    {
      num: 8, unit: 2,
      title: 'Topological Sorting & Transitive Closure in Boot DAGs',
      topics: 'Directed Acyclic Graphs (DAG), In-degree zero Kahn algorithm, Transitive reachability',
      complexity: 'O(V + E)',
      fn: () => window.FC && window.FC.lecture8_TopologicalSort && window.FC.lecture8_TopologicalSort(),
      pcbApplication: 'FreeRTOS Firmware Task & Peripheral Initialization Sequencing',
      vivaTip: 'The hardware bootloader must initialize PMU power first, then the STM32 MCU, followed by IMU sensor calibration, before arming ESC motor drivers.'
    },
    // UNIT 3
    {
      num: 9, unit: 3,
      title: 'Trees, Spanning Trees & Fundamental Cut-Sets',
      topics: 'Tree properties (|E| = |V|-1, acyclic connected), Cayley formula n^(n-2), Fundamental cycles',
      complexity: 'O(V + E)',
      fn: () => ({ nodesCount: nodes.length, treeEdgesRequired: nodes.length - 1, totalEdges: edges.length }),
      pcbApplication: 'Minimum Clock Distribution Trees & Zero-Loop Ground Routing',
      vivaTip: 'A spanning tree connects all 6 modules on the Hades Micro with exactly 5 edges, preventing ground loops while maintaining complete electrical reachability.'
    },
    {
      num: 10, unit: 3,
      title: 'Minimum Spanning Tree — Kruskal\'s Algorithm',
      topics: 'Greedy edge sorting, Disjoint Set Union (Union-Find) with path compression',
      complexity: 'O(E log E)',
      fn: () => window.FC && window.FC.computeKruskal && window.FC.computeKruskal(nodes, edges),
      pcbApplication: 'Minimum Total Copper Interconnect Wirelength Optimization',
      vivaTip: 'Kruskal sorts all physical trace costs and adds edges that do not form a cycle, guaranteeing the absolute minimum copper usage to interconnect all ICs.'
    },
    {
      num: 11, unit: 3,
      title: 'Prim\'s Algorithm & Steiner Tree Multi-Terminal Approximation',
      topics: 'Vertex-based greedy growing, Priority queue, Steiner minimal tree (NP-hard 2-approximation)',
      complexity: 'O(E log V) Prim, 2-Approx Steiner',
      fn: () => window.FC && window.FC.steinerTreeApprox && window.FC.steinerTreeApprox(nodes, edges, {}, ['PMU', 'STM32', 'ESC']),
      pcbApplication: 'Optimal Signal Bus Routing (e.g. +3V3 Power Net connecting terminal pads)',
      vivaTip: 'While Prim spans all vertices, the Steiner Tree connects only the required terminals (e.g., PMU, STM32, ESC) while using intermediate Steiner points to minimize trace area.'
    },
    // UNIT 4
    {
      num: 12, unit: 3,
      title: 'Network Reliability, Tarjan Articulation Points & Bridges',
      topics: 'Single points of failure (SPoF), DFS discovery/low values, Cut-vertices, Cut-edges',
      complexity: 'O(V + E)',
      fn: () => window.FC && window.FC.computeTarjan && window.FC.computeTarjan(nodes, edges, {}),
      pcbApplication: 'Avionics Single Point of Failure (SPoF) Risk Assessment',
      vivaTip: 'Tarjan proves that STM32 is an articulation point. If the MCU halts, the entire flight controller graph disconnects, motivating redundant dual-MCU architectures.'
    },
    {
      num: 13, unit: 4,
      title: 'Multiway Cut & Minimum K-Cut Fault Isolation',
      topics: 'Partitioning graph into K disconnected components, NP-hard multiway cut approximation',
      complexity: 'Polynomial for fixed K',
      fn: () => window.FC && window.FC.lecture13_MultiwayCut && window.FC.lecture13_MultiwayCut(nodes, edges),
      pcbApplication: 'Isolating High-Current Motor Noise from Sensitive Analog Sensors',
      vivaTip: 'Multiway cut identifies the minimum copper boundary traces to sever in order to isolate the motor power domain from the sensitive 3.3V analog IMU sensor domain.'
    },
    // UNIT 5
    {
      num: 14, unit: 5,
      title: 'Bipartite Matching & Hungarian Algorithm',
      topics: 'Bipartite graphs, Augmenting paths (Hall\'s Marriage Theorem), Hungarian matrix reduction',
      complexity: 'O(V³)',
      fn: () => window.FC && window.FC.lecture14_BipartiteMatching && window.FC.lecture14_BipartiteMatching(),
      pcbApplication: 'Hardware Timer Channel Allocation to Motor PWM ESC Lines',
      vivaTip: 'We model the 4 STM32 hardware timer channels (TIM1_CH1..4) and 4 brushless motors as a bipartite graph. Hungarian matching yields a collision-free 1-to-1 pin assignment.'
    },
    {
      num: 15, unit: 5,
      title: 'Gale-Shapley Stable Marriage & Bus Assignment',
      topics: 'Preference lists, Propose-and-reject deferred acceptance, Stable matching guarantee',
      complexity: 'O(N²)',
      fn: () => window.FC && window.FC.lecture15_StableMarriage && window.FC.lecture15_StableMarriage(),
      pcbApplication: 'Optimal Peripheral-to-Bus Pairing (SPI vs I2C vs UART)',
      vivaTip: 'Sensors rank buses by bandwidth; buses rank sensors by latency criticality. Stable matching pairs the 1kHz IMU with high-speed SPI1 and the 50Hz GPS with UART2.'
    },
    // UNIT 6
    {
      num: 16, unit: 6,
      title: 'Vertex Cover & Set Cover (2-Approximation)',
      topics: 'NP-complete vertex cover, Greedy maximal matching 2-approximation, Set cover log(n)',
      complexity: 'O(V + E) for 2-approx',
      fn: () => window.FC && window.FC.lecture16_VertexCover && window.FC.lecture16_VertexCover(nodes, edges),
      pcbApplication: 'In-Circuit Test (ICT) Probe Placement for 100% Trace Coverage',
      vivaTip: 'To verify 100% of copper traces during factory manufacturing, we find a minimum vertex cover of test-pad locations so every trace touches at least one active test probe.'
    },
    {
      num: 17, unit: 6,
      title: 'Shortest Superstring & Rectilinear Trace Geometry',
      topics: 'Manhattan L1 metric vs Euclidean L2 metric, 45-degree chamfering, Geometric routing',
      complexity: 'Heuristic approximation',
      fn: () => window.FC && window.FC.lecture17_GeometricRouting && window.FC.lecture17_GeometricRouting(nodes),
      pcbApplication: 'Auto-router Manhattan Routing Under IPC-2221 Standards',
      vivaTip: 'Physical PCB manufacturing strictly forbids arbitrary diagonal traces. Traces follow rectilinear / 45-degree Manhattan metrics to prevent acid traps in etching.'
    },
    // UNIT 7
    {
      num: 18, unit: 7,
      title: 'Graph Coloring, Chromatic Number & Layer Assignment',
      topics: 'Vertex coloring, Welsh-Powell greedy algorithm, Chromatic number Chi(G), Conflict graphs',
      complexity: 'O(V²)',
      fn: () => window.FC && window.FC.graphColoring && window.FC.graphColoring(nodes, {}),
      pcbApplication: 'Minimum Copper Layer Assignment for Zero-Crosstalk Routing',
      vivaTip: 'Modules that interfere cannot share a physical layer. The chromatic number Chi(G)=3 proves mathematically that a 4-layer PCB is sufficient for crosstalk-free layout.'
    },
    {
      num: 19, unit: 7,
      title: 'Four-Color and Five-Color Theorems in Planar Layouts',
      topics: 'Appel & Haken (1976) Four-Color Theorem, Kempe chains, Planar face coloring',
      complexity: 'O(V²)',
      fn: () => window.FC && window.FC.lecture19_FourColor && window.FC.lecture19_FourColor(),
      pcbApplication: 'Conflict-Free Surface Solder Mask Routing Guarantee',
      vivaTip: 'The Four-Color Theorem proves that any planar single-layer circuit requires at most 4 colors to label non-overlapping copper regions without boundary conflicts.'
    },
    // UNIT 8
    {
      num: 20, unit: 8,
      title: 'Planar Graphs, Kuratowski\'s Theorem & Via Lower Bounds',
      topics: 'Euler formula V - E + F = 2, Kuratowski K5/K3,3 forbidden minors, Crossing number',
      complexity: 'O(V) linear planarity test',
      fn: () => window.FC && window.FC.planarityAnalysis && window.FC.planarityAnalysis(nodes, edges),
      pcbApplication: 'Single-Layer vs Multi-Layer Routability & Via Count Prediction',
      vivaTip: 'Euler\'s formula dictates E <= 3V - 6 for planar graphs. For our 6-node board with 14 full nets, crossings are mathematically unavoidable, requiring 4-layer via transitions.'
    },
    {
      num: 21, unit: 8,
      title: 'PCB Design, Facilities Layout & Floorplan Design',
      topics: 'Force-directed layout, Half-perimeter wirelength (HPWL), Star-topology placement',
      complexity: 'O(V²)',
      fn: () => window.FC && window.FC.lecture21_FacilitiesLayout && window.FC.lecture21_FacilitiesLayout(),
      pcbApplication: 'Hades Micro 50x50mm Component Placement & DRC Verification',
      vivaTip: 'We use a star-topology centered around the STM32 MCU. High-frequency SPI IMU traces are kept under 15mm to minimize stray inductance and signal reflections.'
    },
    // UNIT 9
    {
      num: 22, unit: 9,
      title: 'Directed Graphs, Transport Networks & FreeRTOS Scheduling',
      topics: 'Directed transport networks, Rate-Monotonic Scheduling (RMS) on DAGs',
      complexity: 'O(V + E)',
      fn: () => window.FC && window.FC.lecture22_TaskScheduling && window.FC.lecture22_TaskScheduling(),
      pcbApplication: 'Deterministic 1kHz Flight Control Loop Scheduling',
      vivaTip: 'The 1kHz flight controller loop is executed as a directed topological task chain: IMU Read -> Attitude PID -> Motor Mixer -> PWM Output, ensuring zero jitter.'
    },
    {
      num: 23, unit: 9,
      title: 'Tournament Graphs, Critical Path (PERT/CPM) & PageRank',
      topics: 'Tournament complete digraphs, Longest path in DAG (Critical Path Method), Google PageRank',
      complexity: 'O(V + E) PERT, O(iter * E) PageRank',
      fn: () => window.FC && window.FC.lecture23_PageRank && window.FC.lecture23_PageRank(nodes, edges),
      pcbApplication: 'Identifying High-Traffic Critical Hubs via PageRank Centrality',
      vivaTip: 'PageRank recursively scores module importance based on net interconnectivity. STM32 scores highest (0.42), proving it must occupy the geometric center of the PCB.'
    },
    // UNIT 10
    {
      num: 24, unit: 10,
      title: 'Flow Networks, Max-Flow Min-Cut & Ford-Fulkerson',
      topics: 'Capacity constraints, Flow conservation, Augmenting paths, Max-Flow = Min-Cut theorem',
      complexity: 'O(V * E²) Edmonds-Karp',
      fn: () => window.FC && window.FC.maxFlow && window.FC.maxFlow(nodes, edges, 'PMU', 'GPS'),
      pcbApplication: 'Power Delivery Network (PDN) Current Bottleneck Detection',
      vivaTip: 'We model trace copper current limits as edge capacities. The Edmonds-Karp min-cut highlights the exact narrow copper traces that throttle power delivery to peripherals.'
    },
    {
      num: 25, unit: 10,
      title: 'Transportation & Power Rail Load Balancing',
      topics: 'Supply/demand constraints, Feasible flow distribution, Unbalanced transportation',
      complexity: 'O(V² * E)',
      fn: () => window.FC && window.FC.lecture25_LoadBalancing && window.FC.lecture25_LoadBalancing(),
      pcbApplication: 'DC-DC Buck Converter Power Headroom & Thermal Management',
      vivaTip: 'The PMU supplies 35W total power while downstream logic and sensors consume 4.65W, leaving 30.35W of thermal and current headroom for ESC motor signaling.'
    },
    // UNIT 11
    {
      num: 26, unit: 11,
      title: 'Graph Enumeration & Pólya Counting Theorem',
      topics: 'Burnside\'s Lemma, Pólya cycle index Z(G), Rotational symmetry groups C4 / D4',
      complexity: 'Combinatorial enumeration',
      fn: () => window.FC && window.FC.lecture26_PolyaEnumeration && window.FC.lecture26_PolyaEnumeration(),
      pcbApplication: 'Quadcopter Motor Spin Symmetry & Aerodynamic Yaw-Torque Cancellation',
      vivaTip: 'The quadcopter X-frame has C4 cyclic symmetry. Pólya enumeration shows there are 6 distinct 2-state motor spin configurations; alternating CW-CCW cancels aerodynamic torque.'
    },
    // UNIT 12
    {
      num: 27, unit: 12,
      title: 'Contact Network Analysis & BLDC Inverter Switching Graphs',
      topics: 'Switching algebra, Contact graphs, 6-step trapezoidal commutation cycle',
      complexity: 'State graph traversal',
      fn: () => window.FC && window.FC.lecture27_ContactNetworks && window.FC.lecture27_ContactNetworks(),
      pcbApplication: 'Electronic Speed Controller (ESC) 3-Phase MOSFET Commutation',
      vivaTip: 'A brushless motor is controlled by a 6-state switching graph on 6 power MOSFETs, continuously commutating Phase U, V, and W to generate rotating magnetic flux.'
    },
    {
      num: 28, unit: 12,
      title: 'Error Correcting Codes & Tanner Graphs in Telemetry',
      topics: 'Bipartite Tanner graphs, Parity check matrices, Hamming distance, Course review',
      complexity: 'O(N * M)',
      fn: () => window.FC && window.FC.lecture28_TannerGraph && window.FC.lecture28_TannerGraph(),
      pcbApplication: 'MAVLink 2.4GHz RF Telemetry Packet Checksums & Bit-Flip Correction',
      vivaTip: 'MAVLink telemetry packets use a bipartite Tanner parity-check graph to detect and correct single-bit transmission errors caused by motor electrical noise.'
    }
  ];

  const currentLecture = lectures.find(l => l.num === selectedLecture) || lectures[0];
  const computedData = React.useMemo(() => {
    try {
      return currentLecture.fn ? currentLecture.fn() : null;
    } catch (e) {
      return { error: e.message };
    }
  }, [currentLecture]);

  const filteredLectures = selectedUnit === 'all'
    ? lectures
    : lectures.filter(l => l.unit === parseInt(selectedUnit));

  return (
    <div className="flex flex-col xl:flex-row gap-4 h-[calc(100vh-6.5rem)] min-h-[640px] font-sans select-none">
      {/* 1. Left Column: 28-Lecture Syllabus Directory (280px) */}
      <div className="w-full xl:w-72 bg-panel border border-subtle rounded-xl flex flex-col shrink-0 overflow-hidden">
        {/* Header & Filter */}
        <div className="p-3 bg-sidebar border-b border-subtle space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-accent-cyan tracking-wider uppercase">
              GRAPH THEORY LAB SYLLABUS
            </span>
            <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-accent-cyan text-[9px] font-mono font-bold">
              SEM V (28 LECTURES)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[10px] text-muted">UNIT:</span>
            <select
              value={selectedUnit}
              onChange={e => setSelectedUnit(e.target.value)}
              className="bg-elevated border border-subtle rounded px-2 py-1 text-primary text-[11px] font-mono focus:outline-none focus:border-accent-cyan w-full"
            >
              <option value="all">All Units (Lectures 1–28)</option>
              <option value="1">Unit 1: Foundations & Reps (L1–L2)</option>
              <option value="2">Unit 2: Traversals & Paths (L3–L8)</option>
              <option value="3">Unit 3: Trees & Spanning Trees (L9–L11)</option>
              <option value="4">Unit 4: Reliability & Cuts (L12–L13)</option>
              <option value="5">Unit 5: Matching & Assignment (L14–L15)</option>
              <option value="6">Unit 6: Covers & Geometry (L16–L17)</option>
              <option value="7">Unit 7: Coloring & Theorems (L18–L19)</option>
              <option value="8">Unit 8: Planarity & PCB (L20–L21)</option>
              <option value="9">Unit 9: Directed & Networks (L22–L23)</option>
              <option value="10">Unit 10: Flow Networks (L24–L25)</option>
              <option value="11">Unit 11: Enumeration (L26)</option>
              <option value="12">Unit 12: Switching & Coding (L27–L28)</option>
            </select>
          </div>
        </div>

        {/* Lecture List Scrollable */}
        <div className="p-2 flex-1 overflow-y-auto space-y-1 text-xs font-mono">
          {filteredLectures.map(l => {
            const isSelected = selectedLecture === l.num;
            return (
              <button
                key={l.num}
                onClick={() => setSelectedLecture(l.num)}
                className={`w-full text-left p-2.5 rounded-lg border transition ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-400 text-accent-cyan shadow-[0_0_10px_rgba(85,200,232,0.15)] font-bold'
                    : 'bg-elevated hover:bg-hover border-subtle text-secondary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted">LECTURE {l.num < 10 ? `0${l.num}` : l.num}</span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-black/40 text-accent-amber font-mono">
                    {l.complexity}
                  </span>
                </div>
                <div className="text-[11px] font-sans font-semibold text-primary truncate mt-0.5">
                  {l.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Centre / Main Detail: Selected Lecture Implementation & PCB Application */}
      <div className="flex-1 bg-panel border border-subtle rounded-xl flex flex-col overflow-hidden">
        {/* Lecture Title Strip */}
        <div className="p-4 bg-sidebar border-b border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-sky-500/15 text-accent-cyan border border-sky-500/30 font-mono text-[10px] font-bold">
                UNIT {currentLecture.unit} • LECTURE {currentLecture.num}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-accent-amber border border-amber-500/30 font-mono text-[10px] font-bold">
                COMPLEXITY: {currentLecture.complexity}
              </span>
            </div>
            <h1 className="text-base md:text-lg font-bold text-primary font-sans">
              {currentLecture.title}
            </h1>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-muted uppercase font-mono block">PCB DESIGN APPLICATION</span>
            <span className="text-xs font-bold text-accent-green font-mono">{currentLecture.pcbApplication}</span>
          </div>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Card 1: Academic Concepts Covered */}
          <div className="bg-elevated border border-subtle rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-accent-cyan font-bold text-xs uppercase">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>SYLLABUS CONCEPTS COVERED</span>
            </div>
            <p className="text-xs text-secondary font-sans leading-relaxed">
              {currentLecture.topics}
            </p>
          </div>

          {/* Card 2: Live Computed Output on Hades Micro Flight Controller */}
          <div className="bg-elevated border border-subtle rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-subtle/60 pb-2">
              <span className="font-bold text-primary text-xs uppercase tracking-wide">
                LIVE COMPUTED DEMONSTRATION ON HADES MICRO PCB
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-accent-green text-[10px] font-bold">
                CALCULATED FROM GRAPH.JSON
              </span>
            </div>

            <div className="bg-black/40 border border-subtle rounded-lg p-3 overflow-x-auto text-[11px] leading-relaxed text-slate-200">
              <pre className="font-mono whitespace-pre-wrap">
                {JSON.stringify(computedData, null, 2)}
              </pre>
            </div>
          </div>

          {/* Card 3: Real-World PCB / Drone Problem Solved */}
          <div className="bg-elevated border border-subtle rounded-xl p-4 space-y-2">
            <span className="font-bold text-accent-amber text-xs uppercase tracking-wide block">
              HOW THIS GRAPH THEORY CONCEPT BUILDS A BETTER FLIGHT CONTROLLER
            </span>
            <p className="text-xs text-secondary font-sans leading-relaxed">
              {currentLecture.pcbApplication}: By formalizing this physical hardware challenge into a rigorous mathematical graph representation, AEROLAB replaces intuition with deterministic proofs and verifiable algorithms.
            </p>
          </div>

          {/* Card 4: Viva Presentation & Defense Guide */}
          <div className="bg-sky-950/20 border border-sky-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-accent-cyan font-bold text-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>VIVA DEFENSE TALKING POINT FOR EVALUATORS</span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              "{currentLecture.vivaTip}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.CurriculumSyllabusPage = CurriculumSyllabusPage;
}
