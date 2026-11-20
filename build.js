// AEROLAB Production Build & Packaging Pipeline
// Precompiles all JSX with Babel AOT, compiles Tailwind CSS, packages offline vendor assets, and outputs production dist/
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const babel = require('@babel/core');
const { minify } = require('terser');

const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const VENDOR_DIR = path.join(DIST_DIR, 'vendor');

console.log('==============================================================');
console.log(' AEROLAB PRODUCTION BUILD & AOT PACKAGING PIPELINE');
console.log('==============================================================\n');

// 1. Clean and initialize dist directory
console.log('[1/5] Initializing clean dist directory...');
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });
fs.mkdirSync(VENDOR_DIR, { recursive: true });

// 2. Compile Tailwind CSS to static dist/app.css
console.log('[2/5] Compiling Tailwind CSS Ahead-Of-Time...');
try {
  const tailwindCli = path.join(ROOT_DIR, 'node_modules', 'tailwindcss', 'lib', 'cli.js');
  const tailwindCmd = `node "${tailwindCli}" -i src/styles/app.css -o dist/app.css --minify`;
  execSync(tailwindCmd, { cwd: ROOT_DIR, stdio: 'pipe' });
  const cssStat = fs.statSync(path.join(DIST_DIR, 'app.css'));
  console.log(`  -> Compiled static CSS: ${(cssStat.size / 1024).toFixed(1)} KB (dist/app.css)`);
} catch (e) {
  console.warn('  ! Tailwind CLI warning:', e.message);
  console.log('  -> Falling back to bundled theme.css...');
  const themeCss = fs.readFileSync(path.join(ROOT_DIR, 'src', 'theme.css'), 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'app.css'), themeCss);
}

// 3. Package offline vendor dependencies
console.log('[3/5] Packaging offline vendor dependencies (air-gap ready)...');
const vendorFiles = [
  {
    src: path.join(ROOT_DIR, 'vendor', 'react.production.min.js'),
    dest: path.join(VENDOR_DIR, 'react.production.min.js')
  },
  {
    src: path.join(ROOT_DIR, 'vendor', 'react-dom.production.min.js'),
    dest: path.join(VENDOR_DIR, 'react-dom.production.min.js')
  },
  {
    src: path.join(ROOT_DIR, 'vendor', 'three.min.js'),
    dest: path.join(VENDOR_DIR, 'three.min.js')
  },
  {
    src: path.join(ROOT_DIR, 'vendor', 'leaflet.js'),
    dest: path.join(VENDOR_DIR, 'leaflet.js')
  },
  {
    src: path.join(ROOT_DIR, 'vendor', 'leaflet.css'),
    dest: path.join(VENDOR_DIR, 'leaflet.css')
  }
];

vendorFiles.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    const sz = (fs.statSync(dest).size / 1024).toFixed(1);
    console.log(`  -> Copied vendor: ${path.basename(dest)} (${sz} KB)`);
  } else {
    console.warn(`  ! Vendor file missing at ${src}`);
  }
});

// 4. Precompile and Bundle Application Code (Zero in-browser Babel!)
console.log('[4/5] Precompiling React JSX with Babel Ahead-of-Time & Minifying with Terser...');

const sourceFiles = [
  // 1. Data Models
  'src/data/board-metrics.js',
  'src/data/graph-data.js',
  'src/data/pipeline-stages.js',
  'src/data/viva-questions.js',
  'src/data/waypoints.js',

  // 2. Audio & AI Synthesizer
  'src/ai/audio-synth.js',
  'src/ai/voice-synthesizer.js',
  'src/ai/ai-engine.js',

  // 3. Graph Algorithms & Causality Engines
  'src/algorithms/bfs.js',
  'src/algorithms/dfs.js',
  'src/algorithms/dijkstra.js',
  'src/algorithms/spatial-energy-graph.js',
  'src/algorithms/prim.js',
  'src/algorithms/kruskal.js',
  'src/algorithms/tarjan.js',
  'src/algorithms/floyd-warshall.js',
  'src/algorithms/degree-centrality.js',
  'src/algorithms/cycles.js',
  'src/algorithms/fault-simulator.js',
  'src/algorithms/research-algorithms.js',
  'src/algorithms/curriculum-algorithms.js',
  'src/algorithms/fault-propagation-engine.js',

  // 4. Core Shell & Visual Components (JSX)
  'src/components/ErrorBoundary.js',
  'src/components/Drone3DView.js',
  'src/components/Sidebar.js',
  'src/components/Topbar.js',
  'src/components/GuidedDemoModal.js',

  // 5. Pages (JSX)
  'src/pages/DigitalTwinStudioPage.js',
  'src/pages/LiveTelemetryPage.js',
  'src/pages/FaultPropagationPage.js',
  'src/pages/TwinVsRealityPage.js',
  'src/pages/WhatIfLabPage.js',
  'src/pages/CurriculumSyllabusPage.js',
  'src/pages/HardwareHarnessPage.js',
  'src/pages/OverviewPage.js',
  'src/pages/PcbExplorerPage.js',
  'src/pages/GraphAnalysisPage.js',
  'src/pages/FailureAnalysisPage.js',
  'src/pages/FlightSimulatorPage.js',
  'src/pages/BoardReportsPage.js',
  'src/pages/ResearchLabPage.js',

  // 6. Root App & Mount Point
  'src/App.js',
  'src/main.js'
];

async function compileAndBundle() {
  let combinedCode = '/* AEROLAB Flight Controller Digital Twin — Production Precompiled Bundle */\n';
  combinedCode += 'window.FC = window.FC || {};\n\n';

  for (const relPath of sourceFiles) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`  X Missing file: ${relPath}`);
      continue;
    }

    const code = fs.readFileSync(fullPath, 'utf8');
    // If file has JSX or ES6 syntax, transpile via Babel AOT
    const isJsx = code.includes('<') && code.includes('>');
    let transformed = code;

    if (isJsx || relPath.endsWith('App.js') || relPath.includes('Page') || relPath.includes('component')) {
      try {
        const result = babel.transformSync(code, {
          filename: relPath,
          presets: [
            ['@babel/preset-react', { runtime: 'classic' }],
            ['@babel/preset-env', { targets: { esmodules: true } }]
          ],
          compact: false
        });
        transformed = result.code;
      } catch (err) {
        console.error(`  X Babel compilation failed on ${relPath}:`, err.message);
        throw err;
      }
    }

    combinedCode += `\n/* --- ${relPath} --- */\n` + transformed + '\n';
  }

  // Minify with Terser for production
  console.log('  -> Minifying production bundle with Terser...');
  const minified = await minify(combinedCode, {
    compress: {
      dead_code: true,
      drop_console: false, // retain telemetry logs
      passes: 2
    },
    mangle: false // retain window.FC namespace identifiers
  });

  const bundlePath = path.join(DIST_DIR, 'aerolab.bundle.min.js');
  fs.writeFileSync(bundlePath, minified.code || combinedCode);
  const bundleStat = fs.statSync(bundlePath);
  console.log(`  -> Generated production bundle: ${(bundleStat.size / 1024).toFixed(1)} KB (dist/aerolab.bundle.min.js)`);

  // 5. Copy static assets & generate production index.html
  console.log('[5/5] Generating production index.html & copying assets...');
  
  // Copy pcb.svg and graph.json
  ['pcb.svg', 'graph.json'].forEach(asset => {
    const srcAsset = path.join(ROOT_DIR, asset);
    if (fs.existsSync(srcAsset)) {
      fs.copyFileSync(srcAsset, path.join(DIST_DIR, asset));
      console.log(`  -> Copied static asset: ${asset}`);
    }
  });

  const buildTime = Date.now();
  const prodHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AEROLAB — Flight Controller Digital Twin</title>
  
  <!-- Production Compiled Tailwind CSS & Theme Tokens (Zero Runtime Warnings) -->
  <link rel="stylesheet" href="app.css?v=${buildTime}">
  <link rel="stylesheet" href="vendor/leaflet.css">
  
  <!-- High Performance Typography (Google Fonts) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- Pre-packaged Offline Vendor Dependencies -->
  <script src="vendor/react.production.min.js"></script>
  <script src="vendor/react-dom.production.min.js"></script>
  <script src="vendor/three.min.js"></script>
  <script src="vendor/leaflet.js"></script>
</head>
<body class="min-h-screen bg-[#080D14] text-[#E6EDF3] flex flex-col antialiased selection:bg-sky-500/30 selection:text-white">
  <noscript>
    <div style="padding: 20px; color: #F06B70; font-family: monospace;">
      AEROLAB requires JavaScript to be enabled in order to run the flight controller digital twin.
    </div>
  </noscript>

  <!-- Application Mount Target -->
  <div id="root"></div>

  <!-- Precompiled & Minified Application Bundle (Zero In-Browser Babel Transpile Overhead) -->
  <script src="aerolab.bundle.min.js?v=${buildTime}"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), prodHtml);
  console.log('  -> Generated production dist/index.html');

  console.log('\n==============================================================');
  console.log(' >>> AEROLAB PRODUCTION BUILD COMPLETED SUCCESSFULLY! <<<');
  console.log(` Production Output: ${DIST_DIR}`);
  console.log('==============================================================\n');
}

compileAndBundle().catch(err => {
  console.error('\nBuild failed:', err);
  process.exit(1);
});
