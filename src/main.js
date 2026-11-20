// Root mounting script for FC Graph Lab
(function() {
  function initApp() {
    const rootEl = document.getElementById('root');
    if (!rootEl) return;

    if (!window.FC || !window.FC.App) {
      // If Babel hasn't finished transforming App.js yet, poll briefly
      setTimeout(initApp, 30);
      return;
    }

    try {
      const root = ReactDOM.createRoot(rootEl);
      const AppElement = React.createElement(window.FC.App);
      const ErrorBoundary = window.FC.ErrorBoundary;
      
      if (ErrorBoundary) {
        root.render(React.createElement(ErrorBoundary, null, AppElement));
      } else {
        root.render(AppElement);
      }
      console.log("[FC-GRAPH-LAB] Application successfully mounted with React 18 & Fail-safe Error Boundary.");
    } catch (err) {
      console.error("[FC-GRAPH-LAB] Failed to mount application:", err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
