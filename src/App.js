// AEROLAB Main Application Shell Orchestrator (Spec Section 3 & 4)
function App() {
  const { useState, useEffect, useCallback } = React;
  const FC = window.FC || {};

  // Components from window.FC
  const Sidebar = FC.Sidebar;
  const Topbar = FC.Topbar;
  const OverviewPage = FC.OverviewPage;
  const DigitalTwinStudioPage = FC.DigitalTwinStudioPage;
  const LiveTelemetryPage = FC.LiveTelemetryPage;
  const FaultPropagationPage = FC.FaultPropagationPage;
  const TwinVsRealityPage = FC.TwinVsRealityPage;
  const WhatIfLabPage = FC.WhatIfLabPage;
  const CurriculumSyllabusPage = FC.CurriculumSyllabusPage;
  const HardwareHarnessPage = FC.HardwareHarnessPage;
  const PcbExplorerPage = FC.PcbExplorerPage;
  const GraphAnalysisPage = FC.GraphAnalysisPage;
  const FailureAnalysisPage = FC.FailureAnalysisPage;
  const FlightSimulatorPage = FC.FlightSimulatorPage;
  const BoardReportsPage = FC.BoardReportsPage;
  const ResearchLabPage = FC.ResearchLabPage;
  const GuidedDemoModal = FC.GuidedDemoModal;

  // Active Screen Navigation State — Default to Digital Twin Studio
  const [activePage, setActivePage] = useState('digital-twin');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // PCB Selection State
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  // Failure Simulation Shared State
  const [initialFailedNode, setInitialFailedNode] = useState(null);

  // Audio & Voice Telemetry
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Guided Demo Modal
  const [isGuidedDemoOpen, setIsGuidedDemoOpen] = useState(false);

  // Graph Data
  const [graphData, setGraphData] = useState(() => {
    return (FC.GRAPH_DATA) ? FC.GRAPH_DATA : null;
  });

  // Sound Trigger Helper
  const playSfx = useCallback((type = 'click') => {
    if (!soundEnabled || !FC.sound) return;
    try {
      if (type === 'click' && FC.sound.click) FC.sound.click();
      else if (type === 'beep' && FC.sound.beep) FC.sound.beep();
      else if (type === 'error' && FC.sound.error) FC.sound.error();
      else if (type === 'telemetry' && FC.sound.telemetry) FC.sound.telemetry();
    } catch (e) {
      // AudioContext policy fallback
    }
  }, [soundEnabled, FC.sound]);

  // Navigate to Failure Analysis with specific node
  const handleSimulateFailure = useCallback((nodeId) => {
    setInitialFailedNode(nodeId);
    setActivePage('failure-analysis');
    playSfx('error');
  }, [playSfx]);

  // Page Switch Handler
  const handleNavigate = useCallback((pageId) => {
    setActivePage(pageId);
    playSfx('click');
  }, [playSfx]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-app text-primary font-sans antialiased select-none">
      {/* 1. Persistent 228px Navigation Sidebar */}
      {Sidebar && (
        <Sidebar
          activePage={activePage}
          setActivePage={handleNavigate}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onStartGuidedDemo={() => setIsGuidedDemoOpen(true)}
        />
      )}

      {/* 2. Main Work Area (Topbar + Content Viewport) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-app">
        {/* Persistent 56px Topbar */}
        {Topbar && (
          <Topbar
            activePage={activePage}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            isGuidedDemo={isGuidedDemoOpen}
            onStartGuidedDemo={() => setIsGuidedDemoOpen(true)}
          />
        )}

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-app">
          {activePage === 'digital-twin' && DigitalTwinStudioPage && (
            <DigitalTwinStudioPage />
          )}

          {activePage === 'live-telemetry' && LiveTelemetryPage && (
            <LiveTelemetryPage />
          )}

          {activePage === 'fault-propagation' && FaultPropagationPage && (
            <FaultPropagationPage graphData={graphData} />
          )}

          {activePage === 'twin-vs-reality' && TwinVsRealityPage && (
            <TwinVsRealityPage graphData={graphData} />
          )}

          {activePage === 'what-if-lab' && WhatIfLabPage && (
            <WhatIfLabPage graphData={graphData} />
          )}

          {activePage === 'hardware-harness' && HardwareHarnessPage && (
            <HardwareHarnessPage graphData={graphData} />
          )}

          {activePage === 'overview' && OverviewPage && (
            <OverviewPage
              graphData={graphData}
              onNavigate={handleNavigate}
              onStartGuidedDemo={() => setIsGuidedDemoOpen(true)}
            />
          )}

          {activePage === 'pcb-explorer' && PcbExplorerPage && (
            <PcbExplorerPage
              graphData={graphData}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              selectedEdge={selectedEdge}
              setSelectedEdge={setSelectedEdge}
              onSimulateFailure={handleSimulateFailure}
            />
          )}

          {activePage === 'graph-analysis' && GraphAnalysisPage && (
            <GraphAnalysisPage
              graphData={graphData}
              onAudioTrigger={playSfx}
            />
          )}

          {activePage === 'failure-analysis' && FailureAnalysisPage && (
            <FailureAnalysisPage
              graphData={graphData}
              initialFailedNode={initialFailedNode}
            />
          )}

          {activePage === 'flight-simulator' && FlightSimulatorPage && (
            <FlightSimulatorPage
              graphData={graphData}
              onAudioTrigger={playSfx}
            />
          )}

          {activePage === 'board-reports' && BoardReportsPage && (
            <BoardReportsPage
              graphData={graphData}
            />
          )}

          {activePage === 'research-lab' && ResearchLabPage && (
            <ResearchLabPage
              graphData={graphData}
            />
          )}
        </main>
      </div>

      {/* 3. Guided Demo Modal Walkthrough (Spec Section 11) */}
      {GuidedDemoModal && (
        <GuidedDemoModal
          isOpen={isGuidedDemoOpen}
          onClose={() => setIsGuidedDemoOpen(false)}
          onNavigate={handleNavigate}
          voiceEnabled={voiceEnabled}
          soundEnabled={soundEnabled}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.App = App;
}
