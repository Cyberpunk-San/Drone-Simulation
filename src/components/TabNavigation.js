// Tab Navigation with Clean Avionics Vector Icons (No Emojis)
function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    {
      id: 'sim',
      num: '01',
      label: 'PCB GRAPH SIMULATION',
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
      id: 'advanced',
      num: '02',
      label: 'ADVANCED GRAPH THEORY',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      )
    },
    {
      id: 'drone',
      num: '03',
      label: 'DRONE FLIGHT & CONTROL GRAPH',
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
      id: 'pipeline',
      num: '04',
      label: 'KICAD ERC/DRC & PIPELINE',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      )
    },
    {
      id: 'viva',
      num: '05',
      label: 'VIVA ORACLE & ARCHITECTURE',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="9" y1="7" x2="15" y2="7" />
          <line x1="9" y1="11" x2="13" y2="11" />
        </svg>
      )
    }
  ];

  return (
    <nav className="bg-slate-950/80 border-b border-slate-800/80 px-6 backdrop-blur-md">
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-3.5 px-4 text-xs font-mono font-medium transition-all flex items-center gap-2.5 border-b-2 ${
                isActive
                  ? 'border-sky-400 text-sky-400 bg-sky-500/10 shadow-[inset_0_-8px_16px_rgba(56,189,248,0.1)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <span className={`transition-colors ${isActive ? 'text-sky-400' : 'text-slate-500'}`}>
                {tab.icon}
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-tighter">[{tab.num}]</span>
              <span className="tracking-wider uppercase font-semibold">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-400 shadow-[0_0_10px_#38bdf8]"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.TabNavigation = TabNavigation;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TabNavigation };
}
