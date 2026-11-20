// Hardware Failure Cascading Simulation & Reachability Analysis
function simulateModuleFailure(failedChip, nodes, adj) {
  let cut = [];
  let diagnosis = '';
  let severity = 'DEGRADED';

  if (failedChip === 'PMU') {
    cut = nodes.map(n => n.id).filter(id => id !== failedChip);
    diagnosis = 'POWER SYSTEM COLLAPSE: PMU 3.3V LDO regulator failed. All onboard microelectronics lose VDD power rails.';
    severity = 'CATASTROPHIC';
  } else if (failedChip === 'STM32') {
    cut = nodes.map(n => n.id).filter(id => id !== failedChip && id !== 'PMU');
    diagnosis = 'CENTRAL FLIGHT COMPUTER HALT: Cortex-M4 locked. Attitude loop frozen. ESCs lose PWM command signals.';
    severity = 'CATASTROPHIC';
  } else {
    const seen = new Set(['PMU']);
    const q = ['PMU'];
    while (q.length) {
      const u = q.shift();
      for (const { to } of (adj[u] || [])) {
        if (to !== failedChip && !seen.has(to)) {
          seen.add(to);
          q.push(to);
        }
      }
    }
    cut = nodes.map(n => n.id).filter(id => id !== failedChip && !seen.has(id));
    diagnosis = `PERIPHERAL MODULE FAULT: ${failedChip} disabled. Surviving flight controller avionics maintain communication.`;
    severity = 'FAILSAFE_ACTIVE';
  }

  return {
    failedChip,
    isolatedChips: cut,
    diagnosis,
    severity,
    survivingChips: nodes.map(n => n.id).filter(id => id !== failedChip && !cut.includes(id)),
    summary: `Fault Simulation on [${failedChip}]: Severity ${severity}. ${cut.length} modules isolated.`
  };
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.simulateModuleFailure = simulateModuleFailure;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { simulateModuleFailure };
}
