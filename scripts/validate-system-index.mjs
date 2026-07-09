#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INDEX_PATH = path.join(__dirname, '../src/control-plane/system-index/systemIndexRegistry.ts');

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

// Required helper functions
const REQUIRED_HELPERS = [
  'getAllSystemIndexEntries',
  'getSystemIndexEntryById',
  'getSystemIndexEntriesByCategory',
  'getSystemIndexEntriesByKind',
  'getSystemIndexEntriesByStatus',
  'getSystemIndexEntriesByTag',
  'getRelatedSystemIndexEntries',
];

// Required entry IDs
const REQUIRED_ENTRY_IDS = [
  'qa.bundle.validator',
  'contract.trace.matrix',
  'contract.trace.validator',
  'system.index.registry.contract',
  'graph.visual.inventory',
  'graph.runtime.boundary',
  'graph.theme.mapping.registry',
  'theme.token.path-map',
  'motion-safety.epilepsy-guard',
  'audio.synthetic-signal-preview',
  'audio.music-reactive-mapping.registry',
  'audio.source.registry',
  'visual-grammar.engine',
  'signal-loom.routing',
  'lumaweave-arena.concept',
  'self-graph.fixture',
];

// Required taxonomy labels
const REQUIRED_CATEGORIES = [
  'QA / Governance',
  'Graph / Sigma Boundary',
  'Theme / Token System',
  'Motion Safety',
  'Audio / Signal Systems',
  'Source Adapter / Future Architecture',
  'Visual Grammar / Customization',
  'Arena / Simulation Future Concepts',
  'Evidence / Traceability',
  'Developer Tooling',
];

// Future docs-only entries
const FUTURE_DOCS_ONLY_ENTRIES = [
  'visual-grammar.engine',
  'signal-loom.routing',
  'lumaweave-arena.concept',
];

// Graph/Sigma entries that need forbidden boundaries
const GRAPH_SIGMA_ENTRIES = [
  'graph.visual.inventory',
  'graph.runtime.boundary',
  'graph.theme.mapping.registry',
];

// Audio entries that need forbidden boundaries
const AUDIO_ENTRIES = [
  'audio.synthetic-signal-preview',
  'audio.music-reactive-mapping.registry',
  'audio.source.registry',
];

// Visual Grammar entries that need forbidden boundaries
const VISUAL_GRAMMAR_ENTRIES = [
  'visual-grammar.engine',
  'signal-loom.routing',
];

// Arena entry that needs forbidden boundaries
const ARENA_ENTRY = 'lumaweave-arena.concept';

function validate() {
  section('System Index Validator v0');
  
  const results = {
    passed: 0,
    warnings: 0,
    failed: 0,
    errors: [],
  };
  
  // 1. Check file exists
  info('Checking system index registry file...');
  if (!fs.existsSync(SYSTEM_INDEX_PATH)) {
    error(`System index registry file not found: ${SYSTEM_INDEX_PATH}`);
    results.errors.push({ category: 'file missing', message: `System index registry file not found` });
    results.failed++;
    printSummary(results);
    process.exit(1);
  }
  success(`File exists: ${SYSTEM_INDEX_PATH}`);
  results.passed++;
  
  // Read file content
  let content;
  try {
    content = fs.readFileSync(SYSTEM_INDEX_PATH, 'utf-8');
  } catch (err) {
    error(`Failed to read system index registry file: ${err.message}`);
    results.errors.push({ category: 'file read error', message: err.message });
    results.failed++;
    printSummary(results);
    process.exit(1);
  }
  
  // 2. Check required exported helpers
  section('Required Helper Functions');
  
  let missingHelpers = [];
  for (const helper of REQUIRED_HELPERS) {
    if (!content.includes(`export function ${helper}`)) {
      missingHelpers.push(helper);
    }
  }
  
  if (missingHelpers.length > 0) {
    error(`Missing required helper functions: ${missingHelpers.join(', ')}`);
    results.errors.push({ category: 'missing helpers', message: `Missing: ${missingHelpers.join(', ')}` });
    results.failed++;
  } else {
    success('All required helper functions present');
    results.passed++;
  }
  
  // 3. Check required entry IDs
  section('Required Entry IDs');
  
  let missingEntryIds = [];
  for (const entryId of REQUIRED_ENTRY_IDS) {
    if (!content.includes(`id: "${entryId}"`)) {
      missingEntryIds.push(entryId);
    }
  }
  
  if (missingEntryIds.length > 0) {
    error(`Missing required entry IDs: ${missingEntryIds.join(', ')}`);
    results.errors.push({ category: 'missing entries', message: `Missing: ${missingEntryIds.join(', ')}` });
    results.failed++;
  } else {
    success('All required entry IDs present');
    results.passed++;
  }
  
  // 4. Check required taxonomy labels (categories)
  section('Required Taxonomy Labels');
  
  let missingCategories = [];
  for (const category of REQUIRED_CATEGORIES) {
    if (!content.includes(`"${category}"`)) {
      missingCategories.push(category);
    }
  }
  
  if (missingCategories.length > 0) {
    error(`Missing required category labels: ${missingCategories.join(', ')}`);
    results.errors.push({ category: 'missing categories', message: `Missing: ${missingCategories.join(', ')}` });
    results.failed++;
  } else {
    success('All required category labels present');
    results.passed++;
  }
  
  // 5. Check future docs-only entries are marked correctly
  section('Future Docs-Only Entries');
  
  let weakFutureEntries = [];
  for (const entryId of FUTURE_DOCS_ONLY_ENTRIES) {
    const entryStart = content.indexOf(`id: "${entryId}"`);
    if (entryStart === -1) {
      continue;
    }
    const entryEnd = content.indexOf('},', entryStart);
    const entryContent = content.substring(entryStart, entryEnd);
    
    // Check for docs-only or future-architecture/future-concept
    const hasDocsOnly = entryContent.includes('docs-only') || entryContent.includes('future-architecture') || entryContent.includes('future-concept');
    const hasForbiddenBoundary = entryContent.includes('no implementation authorization');
    
    if (!hasDocsOnly || !hasForbiddenBoundary) {
      weakFutureEntries.push(entryId);
    }
  }
  
  if (weakFutureEntries.length > 0) {
    warn(`Future docs-only entries not clearly marked: ${weakFutureEntries.join(', ')}`);
    results.errors.push({ category: 'weak future entries', message: `Weak: ${weakFutureEntries.join(', ')}` });
    results.warnings++;
  } else {
    success('Future docs-only entries marked correctly');
    results.passed++;
  }
  
  // 6. Check forbidden boundaries for specific entry types
  section('Forbidden Boundaries Check');
  
  let missingForbiddenBoundaries = [];
  
  // Graph/Sigma entries
  for (const entryId of GRAPH_SIGMA_ENTRIES) {
    const entryStart = content.indexOf(`id: "${entryId}"`);
    if (entryStart === -1) {
      continue;
    }
    const entryEnd = content.indexOf('},', entryStart);
    const entryContent = content.substring(entryStart, entryEnd);
    
    const hasForbiddenBoundary = entryContent.includes('forbiddenBoundaries') && entryContent.includes('no graph');
    if (!hasForbiddenBoundary) {
      missingForbiddenBoundaries.push(`${entryId} (graph/Sigma)`);
    }
  }
  
  // Audio entries
  for (const entryId of AUDIO_ENTRIES) {
    const entryStart = content.indexOf(`id: "${entryId}"`);
    if (entryStart === -1) {
      continue;
    }
    const entryEnd = content.indexOf('},', entryStart);
    const entryContent = content.substring(entryStart, entryEnd);
    
    const hasForbiddenBoundary = entryContent.includes('forbiddenBoundaries') && entryContent.includes('no audio');
    if (!hasForbiddenBoundary) {
      missingForbiddenBoundaries.push(`${entryId} (audio)`);
    }
  }
  
  // Visual Grammar entries
  for (const entryId of VISUAL_GRAMMAR_ENTRIES) {
    const entryStart = content.indexOf(`id: "${entryId}"`);
    if (entryStart === -1) {
      continue;
    }
    const entryEnd = content.indexOf('},', entryStart);
    const entryContent = content.substring(entryStart, entryEnd);
    
    const hasForbiddenBoundary = entryContent.includes('forbiddenBoundaries') && entryContent.includes('no implementation');
    if (!hasForbiddenBoundary) {
      missingForbiddenBoundaries.push(`${entryId} (visual grammar)`);
    }
  }
  
  // Arena entry
  const arenaStart = content.indexOf(`id: "${ARENA_ENTRY}"`);
  if (arenaStart !== -1) {
    const arenaEnd = content.indexOf('},', arenaStart);
    const arenaContent = content.substring(arenaStart, arenaEnd);
    
    const hasForbiddenBoundary = arenaContent.includes('forbiddenBoundaries') && arenaContent.includes('no implementation');
    if (!hasForbiddenBoundary) {
      missingForbiddenBoundaries.push(`${ARENA_ENTRY} (arena)`);
    }
  }
  
  if (missingForbiddenBoundaries.length > 0) {
    warn(`Missing forbidden boundaries: ${missingForbiddenBoundaries.join(', ')}`);
    results.errors.push({ category: 'missing forbidden boundaries', message: `Missing: ${missingForbiddenBoundaries.join(', ')}` });
    results.warnings++;
  } else {
    success('Forbidden boundaries present for required entries');
    results.passed++;
  }
  
  // 7. Check self-graph.fixture is future/planned/candidate, not accepted/current
  section('Self-Graph Fixture Status Check');
  
  const selfGraphStart = content.indexOf('id: "self-graph.fixture"');
  if (selfGraphStart !== -1) {
    const selfGraphEnd = content.indexOf('},', selfGraphStart);
    const selfGraphContent = content.substring(selfGraphStart, selfGraphEnd);
    
    const hasAcceptedOrCurrent = selfGraphContent.includes('status: "accepted"') || selfGraphContent.includes('status: "current"');
    
    if (hasAcceptedOrCurrent) {
      error('self-graph.fixture should not be accepted/current, should be future/planned/candidate');
      results.errors.push({ category: 'self-graph status', message: 'self-graph.fixture should not be accepted/current' });
      results.failed++;
    } else {
      success('self-graph.fixture is not accepted/current');
      results.passed++;
    }
  } else {
    error('self-graph.fixture entry not found');
    results.errors.push({ category: 'self-graph missing', message: 'self-graph.fixture entry not found' });
    results.failed++;
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
  
  log(`\nTotal checks: ${results.passed + results.failed + results.warnings}`);
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
