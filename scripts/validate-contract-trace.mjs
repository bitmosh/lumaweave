#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRACE_MATRIX_PATH = path.join(__dirname, 'data/CONTRACT_TO_CODE_TRACE_MATRIX.md');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(message, colors.green);
}

function warn(message) {
  log(message, colors.yellow);
}

function error(message) {
  log(message, colors.red);
}

function info(message) {
  log(message, colors.cyan);
}

function section(title) {
  log('\n' + '='.repeat(60));
  log(title);
  log('='.repeat(60));
}

// Required systems that must be in the trace matrix
const REQUIRED_SYSTEMS = [
  'Command Deck / Hotkey Registry',
  'Perspective System',
  'Graph View Element Registry',
  'Graph Visual Inventory',
  'Graph Runtime Boundary / Probe',
  'Graph Theme Mapping Registry',
  'Theme Token Path Map',
  'Motion Safety / Epilepsy Guard',
  'Synthetic Audio Signal Preview',
  'Music Reactive Mapping Registry',
  'Audio Source Registry',
  'Graph Control Plane Navigation Contract',
  'QA Bundle Validator',
  'Theme Workshop Security Packet',
  'Visual Grammar Engine',
];

// Required column/label patterns
const REQUIRED_LABELS = [
  'Contract',
  'Doc Path',
  'Source',
  'Runtime',
  'Registry',
  'QA',
  'Pass',
  'Playwright',
  'Evidence',
  'Forbidden',
  'Boundaries',
  'Status',
  'Known Gaps',
  'Future Validation',
];

function validate() {
  section('Contract Trace Validator v0');
  
  const results = {
    passed: 0,
    warnings: 0,
    failed: 0,
    errors: [],
  };
  
  // 1. Check file exists
  info('Checking trace matrix file...');
  if (!fs.existsSync(TRACE_MATRIX_PATH)) {
    error(`Trace matrix file not found: ${TRACE_MATRIX_PATH}`);
    results.errors.push({ category: 'file missing', message: `Trace matrix file not found` });
    results.failed++;
    printSummary(results);
    process.exit(1);
  }
  success(`File exists: ${TRACE_MATRIX_PATH}`);
  results.passed++;
  
  // Read file content
  let content;
  try {
    content = fs.readFileSync(TRACE_MATRIX_PATH, 'utf-8');
  } catch (err) {
    error(`Failed to read trace matrix file: ${err.message}`);
    results.errors.push({ category: 'file read error', message: err.message });
    results.failed++;
    printSummary(results);
    process.exit(1);
  }
  
  // 2. Check required sections/headers
  section('Required Sections');
  
  const requiredHeaders = [
    '# Contract-to-Code Trace Matrix',
    '## Overview',
    '## Trace Matrix',
    '## QA Key to Contract Mapping',
    '## Forbidden Boundaries Summary',
  ];
  
  let missingHeaders = [];
  for (const header of requiredHeaders) {
    if (!content.includes(header)) {
      missingHeaders.push(header);
    }
  }
  
  if (missingHeaders.length > 0) {
    error(`Missing required sections: ${missingHeaders.join(', ')}`);
    results.errors.push({ category: 'missing sections', message: `Missing: ${missingHeaders.join(', ')}` });
    results.failed++;
  } else {
    success('All required sections present');
    results.passed++;
  }
  
  // 3. Check required labels/columns
  section('Required Labels/Columns');
  
  let missingLabels = [];
  for (const label of REQUIRED_LABELS) {
    // Check if label appears in the matrix table header
    if (!content.includes(label)) {
      missingLabels.push(label);
    }
  }
  
  if (missingLabels.length > 0) {
    warn(`Missing or unclear labels: ${missingLabels.join(', ')}`);
    results.errors.push({ category: 'missing labels', message: `Missing: ${missingLabels.join(', ')}` });
    results.warnings++;
  } else {
    success('All required labels present');
    results.passed++;
  }
  
  // 4. Check required systems/rows
  section('Required System Rows');
  
  let missingSystems = [];
  let weakRows = [];
  
  const lines = content.split('\n');
  
  for (const system of REQUIRED_SYSTEMS) {
    // Find the line containing the system name
    const systemLine = lines.find(line => line.includes(system));
    
    if (!systemLine) {
      missingSystems.push(system);
    } else {
      // Check if the line has at least one file/path reference
      // Look for file paths (src/, tests/, docs/, scripts/, .ts, .tsx, .md, .mjs)
      const hasPathReference = systemLine.match(/src\/|tests\/|docs\/|scripts\/|\.ts|\.tsx|\.md|\.mjs/);
      
      if (!hasPathReference && system !== 'Visual Grammar Engine') {
        // Visual Grammar Engine is future/docs-only, may not have src/ references
        weakRows.push(system);
      }
    }
  }
  
  if (missingSystems.length > 0) {
    error(`Missing required systems: ${missingSystems.join(', ')}`);
    results.errors.push({ category: 'missing systems', message: `Missing: ${missingSystems.join(', ')}` });
    results.failed++;
  } else {
    success('All required systems present');
    results.passed++;
  }
  
  if (weakRows.length > 0) {
    warn(`Rows with weak/no file references: ${weakRows.join(', ')}`);
    results.errors.push({ category: 'weak rows', message: `Weak: ${weakRows.join(', ')}` });
    results.warnings++;
  }
  
  // 5. Check Visual Grammar Engine marked future/docs-only
  section('Visual Grammar Engine Marker');
  
  const vgeIndex = content.indexOf('Visual Grammar Engine');
  if (vgeIndex === -1) {
    error('Visual Grammar Engine row not found');
    results.errors.push({ category: 'missing VGE', message: 'Visual Grammar Engine row not found' });
    results.failed++;
  } else {
    const vgeSection = content.substring(vgeIndex, vgeIndex + 500);
    const hasFutureMarker = vgeSection.includes('future') || vgeSection.includes('docs-only') || vgeSection.includes('DO NOT IMPLEMENT');
    
    if (hasFutureMarker) {
      success('Visual Grammar Engine marked as future/docs-only');
      results.passed++;
    } else {
      warn('Visual Grammar Engine row may not be clearly marked as future/docs-only');
      results.errors.push({ category: 'VGE marker', message: 'Visual Grammar Engine future/docs-only marker unclear' });
      results.warnings++;
    }
  }
  
  // 6. Check v69 marked paused/future if mentioned
  section('v69 Status Marker');
  
  if (content.includes('v69')) {
    const v69Index = content.indexOf('v69');
    const v69Section = content.substring(v69Index, v69Index + 300);
    const hasPausedMarker = v69Section.includes('paused') || v69Section.includes('future') || v69Section.includes('deferred');
    
    if (hasPausedMarker) {
      success('v69 marked as paused/future/deferred');
      results.passed++;
    } else {
      warn('v69 mentioned but may not be clearly marked as paused/future');
      results.errors.push({ category: 'v69 marker', message: 'v69 paused/future marker unclear' });
      results.warnings++;
    }
  } else {
    info('v69 not mentioned in trace matrix');
    results.passed++;
  }
  
  printSummary(results);
  
  // Exit code based on results
  if (results.failed > 0) {
    process.exit(1);
  } else if (results.warnings > 0) {
    process.exit(0);
  } else {
    process.exit(0);
  }
}

function printSummary(results) {
  section('Summary');
  
  log(`\nTotal checks: ${results.passed + results.failed}`);
  success(`Passed: ${results.passed}`);
  if (results.warnings > 0) {
    warn(`Warnings: ${results.warnings}`);
  }
  if (results.failed > 0) {
    error(`Failed: ${results.failed}`);
  }
  
  if (results.errors.length > 0) {
    log('\nError Details:', colors.yellow);
    for (const err of results.errors) {
      log(`  [${err.category}] ${err.message}`, colors.red);
    }
  }
  
  log('\n');
  
  if (results.failed > 0) {
    error('VALIDATION FAILED');
  } else if (results.warnings > 0) {
    warn('VALIDATION PASSED WITH WARNINGS');
  } else {
    success('VALIDATION PASSED');
  }
}

validate();
