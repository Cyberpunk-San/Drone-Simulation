// AEROLAB Persistent Sidebar Component — Professional Aerospace GCS Navigation
function Sidebar({ activePage, setActivePage, isCollapsed, setIsCollapsed, onStartGuidedDemo }) {
  const navSections = [
    {
      title: 'FLIGHT & DIGITAL TWIN',
      items: [
        {
          id: 'digital-twin',
          label: 'Digital Twin Studio',
          badge: '3D TWIN',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          )
        },
        {
          id: 'flight-simulator',
          label: 'Flight Simulation',
          badge: '6-DOF GCS',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="2.5" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              <circle cx="4" cy="4" r="2" />
              <circle cx="20" cy="4" r="2" />
              <circle cx="4" cy="20" r="2" />
              <circle cx="20" cy="20" r="2" />
              <line x1="5.5" y1="5.5" x2="10.5" y2="10.5" />
              <line x1="18.5" y1="5.5" x2="13.5" y2="10.5" />
              <line x1="5.5" y1="18.5" x2="10.5" y2="13.5" />
              <line x1="18.5" y1="18.5" x2="13.5" y2="13.5" />
            </svg>
          )
        },
        {
          id: 'live-telemetry',
          label: 'Live Telemetry',
          badge: 'MAVLINK',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'GRAPH INTELLIGENCE',
      items: [
        {
          id: 'fault-propagation',
          label: 'Fault Propagation',
          badge: 'DIFF 01',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="6" height="6" rx="1" />
              <rect x="16" y="3" width="6" height="6" rx="1" />
              <rect x="9" y="15" width="6" height="6" rx="1" />
              <path d="M5 9v3a2 2 0 0 0 2 2h5M19 9v3a2 2 0 0 1-2 2h-5" />
              <line x1="12" y1="14" x2="12" y2="15" />
            </svg>
          )
        },
        {
          id: 'twin-vs-reality',
          label: 'Twin vs Reality',
          badge: 'DIFF 02',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
              <line x1="2" y1="20" x2="22" y2="20" />
            </svg>
          )
        },
        {
          id: 'what-if-lab',
          label: 'What-If Flight Lab',
          badge: 'DIFF 03',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2v7.31L4.1 19.46A2 2 0 0 0 5.8 22h12.4a2 2 0 0 0 1.7-2.54L14 9.31V2" />
              <path d="M8.5 2h7" />
              <path d="M7 16h10" />
            </svg>
          )
        },
        {
          id: 'research-lab',
          label: 'Flight Intelligence',
          badge: 'GRAPH AI',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'PCB HARDWARE & SYSTEM',
      items: [
        {
          id: 'pcb-explorer',
          label: 'PCB Representation',
          badge: 'KiCad 8.0',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="9" width="6" height="6" />
              <line x1="9" y1="1" x2="9" y2="4" />
              <line x1="15" y1="1" x2="15" y2="4" />
              <line x1="9" y1="20" x2="9" y2="23" />
              <line x1="15" y1="20" x2="15" y2="23" />
              <line x1="20" y1="9" x2="23" y2="9" />
              <line x1="20" y1="14" x2="23" y2="14" />
              <line x1="1" y1="9" x2="4" y2="9" />
              <line x1="1" y1="14" x2="4" y2="14" />
            </svg>
          )
        },
        {
          id: 'hardware-harness',
          label: 'Real Drone Wiring & AI',
          badge: 'Coral 4TOPS',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="13" rx="2" />
              <path d="M16 2v5" />
              <path d="M8 2v5" />
              <path d="M12 11v5" />
              <path d="M9 13.5h6" />
            </svg>
          )
        },
        {
          id: 'failure-analysis',
          label: 'Failure & Reliability',
          badge: 'SPoF',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )
        },
        {
          id: 'board-reports',
          label: 'Board Reports',
          badge: 'ERC/DRC',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          )
        },
        {
          id: 'overview',
          label: 'Executive Overview',
          badge: 'Summary',
          icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
          )
        }
      ]
    }
  ];

  return (
    <aside
      className={`bg-sidebar border-r border-subtle flex flex-col justify-between transition-all duration-200 z-40 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{ minHeight: '100vh' }}
    >
      {/* Brand Header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="h-14 px-4 border-b border-subtle flex items-center justify-between shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/40 flex items-center justify-center font-mono font-bold text-xs text-accent-cyan shadow-[0_0_12px_rgba(85,200,232,0.25)]">
                AL
              </div>
              <div>
                <div className="font-sans font-bold text-sm tracking-wide text-primary flex items-center gap-1.5">
                  <span>AEROLAB</span>
                  <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-sky-500/20 text-accent-cyan border border-sky-400/30">v2.0</span>
                </div>
                <div className="font-mono text-[9px] text-muted tracking-wider">DRONE DIGITAL TWIN</div>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/40 flex items-center justify-center font-mono font-bold text-xs text-accent-cyan">
              AL
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted hover:text-primary p-1.5 rounded-lg hover:bg-hover transition cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isCollapsed ? (
                <polyline points="9 18 15 12 9 6" />
              ) : (
                <polyline points="15 18 9 12 15 6" />
              )}
            </svg>
          </button>
        </div>

        {/* Categorized Navigation List */}
        <nav className="p-2 space-y-3 overflow-y-auto flex-1">
          {navSections.map((sec, secIdx) => (
            <div key={sec.title || secIdx} className="space-y-0.5">
              {!isCollapsed && (
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted/80 px-2.5 pt-2 pb-1 font-semibold flex items-center justify-between">
                  <span>{sec.title}</span>
                </div>
              )}
              {sec.items.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer relative ${
                      isActive
                        ? 'bg-sky-500/15 text-accent-cyan font-semibold border border-sky-400/30 shadow-[0_0_12px_rgba(85,200,232,0.15)]'
                        : 'text-secondary hover:text-primary hover:bg-hover border border-transparent'
                    }`}
                    title={item.label}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-accent-cyan rounded-r shadow-[0_0_8px_#55C8E8]"></span>
                    )}
                    <span className={`${isActive ? 'text-accent-cyan' : 'text-muted'}`}>{item.icon}</span>
                    {!isCollapsed && (
                      <span className="flex-1 text-left flex items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                            item.badge.includes('DIFF')
                              ? 'bg-amber-500/15 text-accent-amber border-amber-500/30 font-semibold'
                              : isActive
                              ? 'bg-sky-500/25 text-accent-cyan border-sky-400/40 font-bold'
                              : 'bg-elevated text-muted border-subtle'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-subtle space-y-2.5 shrink-0">
        {!isCollapsed && (
          <>
            <div className="p-2.5 rounded-xl bg-panel/80 border border-subtle font-mono text-[11px] space-y-1">
              <div className="text-muted flex justify-between items-center text-[9.5px]">
                <span>FLIGHT HARDWARE</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#36C98F]"></span>
              </div>
              <div className="font-semibold text-primary truncate">STM32F7 • Coral TPU</div>
              <div className="text-muted text-[9.5px]">Bharati Kshetrā Interlock</div>
            </div>

            <button
              onClick={onStartGuidedDemo}
              className="w-full py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-accent-cyan border border-sky-400/40 text-xs font-mono font-medium flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" fillOpacity="0.3" />
              </svg>
              <span>RUN GUIDED DEMO</span>
            </button>
          </>
        )}

        {isCollapsed && (
          <button
            onClick={onStartGuidedDemo}
            className="mx-auto w-10 h-10 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-accent-cyan border border-sky-400/40 flex items-center justify-center transition cursor-pointer"
            title="Run Guided Demo"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" fillOpacity="0.3" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.Sidebar = Sidebar;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Sidebar };
}
