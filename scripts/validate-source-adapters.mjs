#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_ADAPTER_REGISTRY_PATH = path.join(__dirname, '../src/source-adapter/sourceAdapterRegistry.ts');

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
  'getAllSourceAdapterEntries',
  'getSourceAdapterEntryById',
  'getSourceAdapterEntriesByType',
  'getSourceAdapterEntriesByStatus',
  'getSourceAdapterEntriesByContractVersion',
];

// Required adapter entry IDs
const REQUIRED_ADAPTER_IDS = [
  'self-graph-yaml-frontmatter',
  'git-codebase',
  'website-url',
  'markdown-vault',
  'openapi-spec',
  'database-schema',
  'package-dependency',
  'cloud-infrastructure',
  'issue-tracker',
];

// Required adapter types
const REQUIRED_ADAPTER_TYPES = [
  'self-graph',
  'git-codebase',
  'website-url',
  'markdown-vault',
  'openapi-spec',
  'database-schema',
  'package-dependency',
  'cloud-infrastructure',
  'issue-tracker',
];

// Required confidence types
const REQUIRED_CONFIDENCE_TYPES = ['observed', 'inferred', 'ai-inferred'];

// Required adapter statuses
const REQUIRED_STATUSES = ['candidate', 'registered', 'validated', 'accepted', 'active'];

// Contract version
const REQUIRED_CONTRACT_VERSION = 'v74a';

// Forbidden behavior keywords (must not appear in adapter entries)
const FORBIDDEN_BEHAVIORS = [
  'execution',
  'network',
  'write',
  'modify',
  'secret',
  'credential',
  'auto-exec',
  'auto-ingest',
];

// Helper function to find entry end by counting braces
function findEntryEnd(content, startIndex) {
  // Find the opening brace before startIndex
  let openBracePos = startIndex;
  while (openBracePos >= 0 && content[openBracePos] !== '{') {
    openBracePos--;
  }
  
  if (openBracePos === -1) {
    return content.length; // Fallback if no opening brace found
  }
  
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  
  for (let i = openBracePos; i < content.length; i++) {
    const char = content[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          return i + 1; // Return position after closing brace
        }
      }
    }
  }
  
  return content.length; // Fallback
}

function validate() {
  section('Source Adapter Registry Validator v0');
  
  const results = {
    passed: 0,
    warnings: 0,
    failed: 0,
    errors: [],
  };
  
  // 1. Check file exists
  info('Checking source adapter registry file...');
  if (!fs.existsSync(SOURCE_ADAPTER_REGISTRY_PATH)) {
    error(`Source adapter registry file not found: ${SOURCE_ADAPTER_REGISTRY_PATH}`);
    results.errors.push({ category: 'file missing', message: `Source adapter registry file not found` });
    results.failed++;
    printSummary(results);
    process.exit(1);
  }
  success(`File exists: ${SOURCE_ADAPTER_REGISTRY_PATH}`);
  results.passed++;
  
  // Read file content
  let content;
  try {
    content = fs.readFileSync(SOURCE_ADAPTER_REGISTRY_PATH, 'utf-8');
  } catch (err) {
    error(`Failed to read source adapter registry file: ${err.message}`);
    results.errors.push({ category: 'file read error', message: err.message });
    results.failed++;
    printSummary(results);
    process.exit(1);
  }
  
  // 2. Check required exported helper functions
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
  
  // 3. Check required adapter entry IDs
  section('Required Adapter Entry IDs');
  
  let missingAdapterIds = [];
  for (const adapterId of REQUIRED_ADAPTER_IDS) {
    if (!content.includes(`adapterId: "${adapterId}"`)) {
      missingAdapterIds.push(adapterId);
    }
  }
  
  if (missingAdapterIds.length > 0) {
    error(`Missing required adapter IDs: ${missingAdapterIds.join(', ')}`);
    results.errors.push({ category: 'missing adapters', message: `Missing: ${missingAdapterIds.join(', ')}` });
    results.failed++;
  } else {
    success('All required adapter entry IDs present');
    results.passed++;
  }
  
  // 4. Check required adapter types
  section('Required Adapter Types');
  
  let missingAdapterTypes = [];
  for (const adapterType of REQUIRED_ADAPTER_TYPES) {
    if (!content.includes(`"${adapterType}"`)) {
      missingAdapterTypes.push(adapterType);
    }
  }
  
  if (missingAdapterTypes.length > 0) {
    error(`Missing required adapter types: ${missingAdapterTypes.join(', ')}`);
    results.errors.push({ category: 'missing types', message: `Missing: ${missingAdapterTypes.join(', ')}` });
    results.failed++;
  } else {
    success('All required adapter types present');
    results.passed++;
  }
  
  // 5. Check required confidence types
  section('Required Confidence Types');
  
  let missingConfidenceTypes = [];
  for (const confidenceType of REQUIRED_CONFIDENCE_TYPES) {
    if (!content.includes(`"${confidenceType}"`)) {
      missingConfidenceTypes.push(confidenceType);
    }
  }
  
  if (missingConfidenceTypes.length > 0) {
    error(`Missing required confidence types: ${missingConfidenceTypes.join(', ')}`);
    results.errors.push({ category: 'missing confidence types', message: `Missing: ${missingConfidenceTypes.join(', ')}` });
    results.failed++;
  } else {
    success('All required confidence types present');
    results.passed++;
  }
  
  // 6. Check required adapter statuses
  section('Required Adapter Statuses');
  
  let missingStatuses = [];
  for (const status of REQUIRED_STATUSES) {
    if (!content.includes(`"${status}"`)) {
      missingStatuses.push(status);
    }
  }
  
  if (missingStatuses.length > 0) {
    error(`Missing required adapter statuses: ${missingStatuses.join(', ')}`);
    results.errors.push({ category: 'missing statuses', message: `Missing: ${missingStatuses.join(', ')}` });
    results.failed++;
  } else {
    success('All required adapter statuses present');
    results.passed++;
  }
  
  // 7. Check contract version
  section('Contract Version Check');
  
  if (!content.includes(`contractVersion: "${REQUIRED_CONTRACT_VERSION}"`)) {
    error(`Contract version must be "${REQUIRED_CONTRACT_VERSION}"`);
    results.errors.push({ category: 'contract version', message: `Contract version must be ${REQUIRED_CONTRACT_VERSION}` });
    results.failed++;
  } else {
    success(`Contract version is "${REQUIRED_CONTRACT_VERSION}"`);
    results.passed++;
  }
  
  // 8. Check safety limits are present in entries
  section('Safety Limits Check');
  
  let entriesWithoutLimits = [];
  for (const adapterId of REQUIRED_ADAPTER_IDS) {
    const entryStart = content.indexOf(`adapterId: "${adapterId}"`);
    if (entryStart === -1) {
      continue;
    }
    const entryEnd = findEntryEnd(content, entryStart);
    const entryContent = content.substring(entryStart, entryEnd);
    
    if (!entryContent.includes('limits:')) {
      entriesWithoutLimits.push(adapterId);
    }
  }
  
  if (entriesWithoutLimits.length > 0) {
    error(`Entries without safety limits: ${entriesWithoutLimits.join(', ')}`);
    results.errors.push({ category: 'missing limits', message: `Missing limits: ${entriesWithoutLimits.join(', ')}` });
    results.failed++;
  } else {
    success('All entries have safety limits');
    results.passed++;
  }
  
  // 9. Check translation sets are present
  section('Translation Set Check');
  
  let entriesWithoutTranslationSet = [];
  for (const adapterId of REQUIRED_ADAPTER_IDS) {
    const entryStart = content.indexOf(`adapterId: "${adapterId}"`);
    if (entryStart === -1) {
      continue;
    }
    const entryEnd = findEntryEnd(content, entryStart);
    const entryContent = content.substring(entryStart, entryEnd);
    
    if (!entryContent.includes('translationSet:')) {
      entriesWithoutTranslationSet.push(adapterId);
    }
  }
  
  if (entriesWithoutTranslationSet.length > 0) {
    error(`Entries without translation sets: ${entriesWithoutTranslationSet.join(', ')}`);
    results.errors.push({ category: 'missing translation sets', message: `Missing translation sets: ${entriesWithoutTranslationSet.join(', ')}` });
    results.failed++;
  } else {
    success('All entries have translation sets');
    results.passed++;
  }
  
  // 10. Check QA report format is present
  section('QA Report Format Check');
  
  let entriesWithoutQAFormat = [];
  for (const adapterId of REQUIRED_ADAPTER_IDS) {
    const entryStart = content.indexOf(`adapterId: "${adapterId}"`);
    if (entryStart === -1) {
      continue;
    }
    const entryEnd = findEntryEnd(content, entryStart);
    const entryContent = content.substring(entryStart, entryEnd);
    
    if (!entryContent.includes('qaReportFormat:')) {
      entriesWithoutQAFormat.push(adapterId);
    }
  }
  
  if (entriesWithoutQAFormat.length > 0) {
    error(`Entries without QA report format: ${entriesWithoutQAFormat.join(', ')}`);
    results.errors.push({ category: 'missing QA format', message: `Missing QA format: ${entriesWithoutQAFormat.join(', ')}` });
    results.failed++;
  } else {
    success('All entries have QA report format');
    results.passed++;
  }
  
  // 11. Check input patterns are present
  section('Input Pattern Check');
  
  let entriesWithoutInputPattern = [];
  for (const adapterId of REQUIRED_ADAPTER_IDS) {
    const entryStart = content.indexOf(`adapterId: "${adapterId}"`);
    if (entryStart === -1) {
      continue;
    }
    const entryEnd = findEntryEnd(content, entryStart);
    const entryContent = content.substring(entryStart, entryEnd);
    
    if (!entryContent.includes('inputPattern:')) {
      entriesWithoutInputPattern.push(adapterId);
    }
  }
  
  if (entriesWithoutInputPattern.length > 0) {
    error(`Entries without input patterns: ${entriesWithoutInputPattern.join(', ')}`);
    results.errors.push({ category: 'missing input patterns', message: `Missing input patterns: ${entriesWithoutInputPattern.join(', ')}` });
    results.failed++;
  } else {
    success('All entries have input patterns');
    results.passed++;
  }
  
  // 12. Check self-graph entry is registered (not candidate)
  section('Self-Graph Entry Status Check');
  
  const selfGraphStart = content.indexOf('adapterId: "self-graph-yaml-frontmatter"');
  if (selfGraphStart !== -1) {
    const selfGraphEnd = findEntryEnd(content, selfGraphStart);
    const selfGraphContent = content.substring(selfGraphStart, selfGraphEnd);
    
    const isRegistered = selfGraphContent.includes('status: "registered"');
    
    if (!isRegistered) {
      error('self-graph-yaml-frontmatter should be registered status');
      results.errors.push({ category: 'self-graph status', message: 'self-graph-yaml-frontmatter should be registered' });
      results.failed++;
    } else {
      success('self-graph-yaml-frontmatter is registered');
      results.passed++;
    }
  } else {
    error('self-graph-yaml-frontmatter entry not found');
    results.errors.push({ category: 'self-graph missing', message: 'self-graph-yaml-frontmatter entry not found' });
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
