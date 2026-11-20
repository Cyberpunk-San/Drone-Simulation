// AEROLAB Production Readiness & Build Verification Test Suite
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

console.log('==============================================================');
console.log(' AEROLAB PRODUCTION READINESS VERIFICATION TEST SUITE');
console.log('==============================================================\n');

let passCount = 0;
let totalTests = 0;

function assert(condition, testName, details) {
  totalTests++;
  if (condition) {
    passCount++;
    console.log(`  [PASS ${totalTests}] ${testName}`);
    if (details) console.log(`         ${details}`);
  } else {
    console.error(`  [FAIL ${totalTests}] ${testName}`);
    if (details) console.error(`         ${details}`);
  }
}

// 1. Verify dist directory exists
assert(fs.existsSync(DIST_DIR), 'Production dist/ directory exists', `Path: ${DIST_DIR}`);

// 2. Verify dist/index.html
const prodHtmlPath = path.join(DIST_DIR, 'index.html');
assert(fs.existsSync(prodHtmlPath), 'Production dist/index.html exists');

const prodHtml = fs.readFileSync(prodHtmlPath, 'utf8');
assert(!prodHtml.includes('@babel/standalone'), 'dist/index.html has ZERO in-browser Babel transpile script');
assert(!prodHtml.includes('type="text/babel"'), 'dist/index.html has ZERO text/babel scripts');
assert(!prodHtml.includes('cdn.tailwindcss.com'), 'dist/index.html has ZERO cdn.tailwindcss.com runtime warnings');
assert(prodHtml.includes('app.css'), 'dist/index.html links to static compiled app.css');
assert(prodHtml.includes('aerolab.bundle.min.js'), 'dist/index.html links to precompiled production bundle');

// 3. Verify static compiled app.css
const cssPath = path.join(DIST_DIR, 'app.css');
assert(fs.existsSync(cssPath), 'Production dist/app.css exists');
const cssContent = fs.readFileSync(cssPath, 'utf8');
assert(cssContent.length > 5000, 'Compiled CSS contains full Tailwind utility set', `${(cssContent.length / 1024).toFixed(1)} KB`);

// 4. Verify offline vendor assets
['react.production.min.js', 'react-dom.production.min.js', 'three.min.js', 'leaflet.js', 'leaflet.css'].forEach(vf => {
  const vp = path.join(DIST_DIR, 'vendor', vf);
  assert(fs.existsSync(vp) && fs.statSync(vp).size > 1000, `Vendor dependency packaged offline: ${vf}`, `${(fs.statSync(vp).size / 1024).toFixed(1)} KB`);
});

// 5. Verify static assets
['pcb.svg', 'graph.json'].forEach(asset => {
  const ap = path.join(DIST_DIR, asset);
  assert(fs.existsSync(ap), `Static asset packaged: ${asset}`);
});

// 6. Verify precompiled bundle syntax & window.FC registration
const bundlePath = path.join(DIST_DIR, 'aerolab.bundle.min.js');
assert(fs.existsSync(bundlePath), 'Production bundle dist/aerolab.bundle.min.js exists');

const bundleCode = fs.readFileSync(bundlePath, 'utf8');
assert(bundleCode.length > 50000, 'Production bundle is populated', `${(bundleCode.length / 1024).toFixed(1)} KB`);

// Simulate Node browser environment to test bundle mounting
function createMockElement() {
  return {
    style: {},
    setAttribute: () => {},
    getAttribute: () => null,
    appendChild: () => {},
    removeChild: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    childNodes: [],
    tagName: 'DIV',
    nodeType: 1
  };
}

const mockWindow = {
  FC: {},
  addEventListener: () => {},
  removeEventListener: () => {},
  document: {
    getElementById: () => createMockElement(),
    createElement: () => createMockElement(),
    createElementNS: () => createMockElement(),
    createTextNode: () => ({ nodeType: 3 }),
    documentElement: createMockElement(),
    body: createMockElement(),
    readyState: 'complete'
  },
  navigator: { userAgent: 'NodeTest' },
  console: { log: () => {}, error: () => {}, warn: () => {} }
};
mockWindow.window = mockWindow;
mockWindow.self = mockWindow;
mockWindow.global = mockWindow;

const context = vm.createContext(mockWindow);

try {
  // Load the actual production vendor scripts into VM context
  const reactCode = fs.readFileSync(path.join(DIST_DIR, 'vendor', 'react.production.min.js'), 'utf8');
  const reactDomCode = fs.readFileSync(path.join(DIST_DIR, 'vendor', 'react-dom.production.min.js'), 'utf8');
  const threeCode = fs.readFileSync(path.join(DIST_DIR, 'vendor', 'three.min.js'), 'utf8');

  vm.runInContext(reactCode, context);
  vm.runInContext(reactDomCode, context);
  vm.runInContext(threeCode, context);

  // Execute the precompiled production bundle
  vm.runInContext(bundleCode, context);

  const registeredFC = mockWindow.FC;
  assert(typeof registeredFC.App === 'function', 'Root App component registered on window.FC in production bundle');
  assert(typeof registeredFC.Sidebar === 'function', 'Sidebar registered on window.FC');
  assert(typeof registeredFC.Topbar === 'function', 'Topbar registered on window.FC');
  assert(typeof registeredFC.ErrorBoundary === 'function', 'ErrorBoundary registered on window.FC');
  assert(typeof registeredFC.HardwareHarnessPage === 'function', 'HardwareHarnessPage registered on window.FC');
  assert(typeof registeredFC.TwinVsRealityPage === 'function', 'TwinVsRealityPage registered on window.FC');
  assert(typeof registeredFC.WhatIfLabPage === 'function', 'WhatIfLabPage registered on window.FC');
  assert(typeof registeredFC.CurriculumSyllabusPage === 'function', 'CurriculumSyllabusPage registered on window.FC');
  assert(typeof registeredFC.traceFaultPropagation === 'function', 'Fault propagation engine registered on window.FC');
} catch (err) {
  assert(false, 'Bundle execution in VM context', err.message);
}

console.log('\n==============================================================');
if (passCount === totalTests) {
  console.log(` >>> ALL ${passCount}/${totalTests} PRODUCTION TESTS PASSED WITH 100% SUCCESS! <<<`);
  console.log(' AEROLAB IS CERTIFIED PRODUCTION READY.');
  console.log('==============================================================\n');
  process.exit(0);
} else {
  console.error(` >>> PRODUCTION VERIFICATION FAILED: ${passCount}/${totalTests} passed.`);
  console.log('==============================================================\n');
  process.exit(1);
}
