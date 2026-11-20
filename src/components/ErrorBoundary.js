// AEROLAB Production Error Boundary Component
// Prevents total application unmounting on unhandled errors & provides nominal subsystem recovery
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[AEROLAB AVIONICS RECOVERY] Unhandled component exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080D14] text-[#E6EDF3] flex items-center justify-center p-6 font-mono select-none">
          <div className="max-w-2xl w-full bg-[#101A26] border border-[#223244] rounded-2xl p-6 shadow-2xl space-y-4">
            {/* Header Status */}
            <div className="flex items-center justify-between border-b border-[#223244] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-xs font-bold text-rose-400 tracking-wider uppercase">
                  AVIONICS SUBSYSTEM EXCEPTION CAUGHT
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                FAIL-SAFE ISOLATED
              </span>
            </div>

            {/* Error Message */}
            <div>
              <h2 className="text-lg font-bold font-sans text-primary">
                Subsystem Runtime Divergence
              </h2>
              <p className="text-xs text-secondary font-sans mt-1 leading-relaxed">
                A localized runtime error occurred inside an active viewport or WebGL context. The AEROLAB fail-safe boundary isolated the exception to preserve the flight controller state.
              </p>
            </div>

            {/* Stack Diagnostics Box */}
            <div className="bg-[#080D14] border border-[#223244] rounded-lg p-3 font-mono text-[11px] text-rose-300 overflow-x-auto max-h-48">
              <div className="font-bold text-rose-400 mb-1">
                {this.state.error ? this.state.error.toString() : 'Unknown Error'}
              </div>
              <pre className="text-[10px] text-muted whitespace-pre-wrap leading-tight">
                {this.state.errorInfo ? this.state.errorInfo.componentStack : 'No component stack available.'}
              </pre>
            </div>

            {/* Recovery Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-lg bg-[#152231] hover:bg-[#19283A] text-secondary hover:text-primary border border-[#223244] text-xs font-semibold transition"
              >
                RELOAD STATION
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-accent-cyan border border-sky-400/40 text-xs font-bold transition flex items-center gap-2 shadow-[0_0_12px_rgba(85,200,232,0.2)]"
              >
                <span>RECOVER NOMINAL STATE</span>
                <span className="text-[10px] font-sans">→</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.ErrorBoundary = ErrorBoundary;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ErrorBoundary };
}
