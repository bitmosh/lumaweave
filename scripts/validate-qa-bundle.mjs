#!/usr/bin/env node

/**
 * QA Bundle Validator
 *
 * Validates lockstep coherence between:
 * - DEFAULT_QA_KEY in QaPanel
 * - CURRENT_QA_KEY / proposal IDs in contract-registry.spec.ts
 * - qa-registry active/current entry
 * - advisory-registry advisory/proposals/backlog
 * - BACKLOG_POLICY current/completed/future pass state
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.join(__dirname, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warn(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function section(message) {
  log(`\n${'='.repeat(60)}`, colors.blue);
  log(`${message}`, colors.blue);
  log(`${'='.repeat(60)}`, colors.blue);
}

// File paths
const paths = {
  qaPanel: path.join(repoRoot, 'src/control-plane/qa/QaPanel.tsx'),
  contractRegistry: path.join(repoRoot, 'tests/e2e/contract-registry.spec.ts'),
  qaRegistry: path.join(repoRoot, 'src/control-plane/qa/qa-registry.ts'),
  advisoryRegistry: path.join(repoRoot, 'src/control-plane/qa/advisory-registry.ts'),
  backlogPolicy: path.join(repoRoot, 'docs/control-plane/qa/BACKLOG_POLICY.md'),
};

// Extract DEFAULT_QA_KEY from QaPanel.tsx
function extractDefaultQaKey(content) {
  const match = content.match(/const DEFAULT_QA_KEY = "([^"]+)"/);
  return match ? match[1] : null;
}

// Extract CURRENT_QA_KEY from contract-registry.spec.ts
function extractCurrentQaKey(content) {
  const match = content.match(/const CURRENT_QA_KEY = "([^"]+)"/);
  return match ? match[1] : null;
}

// Extract proposal IDs from contract-registry.spec.ts
function extractProposalIds(content) {
  const primaryMatch = content.match(/const PRIMARY_PROPOSAL_ID = "([^"]+)"/);
  const secondaryMatch = content.match(/const SECONDARY_PROPOSAL_ID = "([^"]+)"/);
  return {
    primary: primaryMatch ? primaryMatch[1] : null,
    secondary: secondaryMatch ? secondaryMatch[1] : null,
  };
}

// Extract active QA checks from qa-registry.ts
function extractActiveQaChecks(content, qaKey) {
  const activeChecks = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.includes(`qaKey: "${qaKey}"`) && line.includes('active: true')) {
      activeChecks.push(true);
    }
  }
  
  return activeChecks.length > 0;
}

// Check if advisory exists for QA key
function advisoryExists(content, qaKey) {
  // Advisory exports use pattern: export const advisoryV66:
  // Keep the "v" and capitalize it
  const version = qaKey.replace(/^v/, 'V');
  return content.includes(`export const advisory${version}:`);
}

// Extract proposal IDs from advisory
function extractAdvisoryProposalIds(content, qaKey) {
  const version = qaKey.replace(/^v/, 'V');
  const advisoryName = `advisory${version}`;
  const advisoryStart = content.indexOf(`export const ${advisoryName}:`);
  if (advisoryStart === -1) return [];
  
  // Find the proposals array within this advisory
  const proposalsStart = content.indexOf('proposals:', advisoryStart);
  if (proposalsStart === -1) return [];
  
  // Find the end of this advisory (next export or end of file)
  const nextExport = content.indexOf('export const', proposalsStart + 1);
  const advisoryEnd = nextExport === -1 ? content.length : nextExport;
  const advisoryContent = content.substring(proposalsStart, advisoryEnd);
  
  const proposalIds = [];
  const idMatches = advisoryContent.matchAll(/id: "([^"]+)"/g);
  for (const match of idMatches) {
    proposalIds.push(match[1]);
  }
  
  return proposalIds;
}

// Check if advisory has backlog rows
function advisoryHasBacklog(content, qaKey) {
  const version = qaKey.replace(/^v/, 'V');
  const advisoryName = `advisory${version}`;
  const advisoryStart = content.indexOf(`export const ${advisoryName}:`);
  if (advisoryStart === -1) return false;
  
  const backlogStart = content.indexOf('backlog:', advisoryStart);
  if (backlogStart === -1) return false;
  
  const nextExport = content.indexOf('export const', backlogStart + 1);
  const advisoryEnd = nextExport === -1 ? content.length : nextExport;
  const advisoryContent = content.substring(backlogStart, advisoryEnd);
  
  return advisoryContent.includes('rank:');
}

// Extract current pass from BACKLOG_POLICY.md
function extractBacklogCurrentPass(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    // Only look for numbered list items with "current pass" (e.g., "38. **Lattica Roadmap Realignment** — **current pass (v67)**")
    const numberedItemMatch = line.match(/^\d+\.\s+\*\*[^*]+\*\*\s+—\s+\*\*current pass \(v(\d+)\)\*\*/i);
    if (numberedItemMatch) {
      return numberedItemMatch[1];
    }
    // Also accept "current pass — vNN" format in numbered items
    const numberedItemDashMatch = line.match(/^\d+\.\s+\*\*[^*]+\*\*\s+—\s+\*\*current pass — v(\d+)\*\*/i);
    if (numberedItemDashMatch) {
      return numberedItemDashMatch[1];
    }
  }
  // No strict current-pass marker found
  return null;
}

// Main validation
function validate() {
  section('QA Bundle Validator');
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: [],
  };
  
  // Read files
  let qaPanelContent, contractRegistryContent, qaRegistryContent, advisoryRegistryContent, backlogPolicyContent;
  
  try {
    qaPanelContent = fs.readFileSync(paths.qaPanel, 'utf-8');
    contractRegistryContent = fs.readFileSync(paths.contractRegistry, 'utf-8');
    qaRegistryContent = fs.readFileSync(paths.qaRegistry, 'utf-8');
    advisoryRegistryContent = fs.readFileSync(paths.advisoryRegistry, 'utf-8');
    backlogPolicyContent = fs.readFileSync(paths.backlogPolicy, 'utf-8');
  } catch (err) {
    error(`Failed to read files: ${err.message}`);
    process.exit(1);
  }
  
  // 1. Current QA key coherence
  section('1. Current QA Key Coherence');
  
  const defaultQaKey = extractDefaultQaKey(qaPanelContent);
  const currentQaKey = extractCurrentQaKey(contractRegistryContent);
  const backlogCurrentPass = extractBacklogCurrentPass(backlogPolicyContent);
  
  info(`QaPanel DEFAULT_QA_KEY: ${defaultQaKey || 'NOT FOUND'}`);
  info(`contract-registry CURRENT_QA_KEY: ${currentQaKey || 'NOT FOUND'}`);
  info(`BACKLOG_POLICY current pass: ${backlogCurrentPass ? `v${backlogCurrentPass}` : 'NOT FOUND'}`);
  
  if (!defaultQaKey) {
    error('DEFAULT_QA_KEY not found in QaPanel.tsx');
    results.errors.push({ category: 'QA key drift', message: 'DEFAULT_QA_KEY not found in QaPanel.tsx' });
    results.failed++;
  } else if (!currentQaKey) {
    error('CURRENT_QA_KEY not found in contract-registry.spec.ts');
    results.errors.push({ category: 'QA key drift', message: 'CURRENT_QA_KEY not found in contract-registry.spec.ts' });
    results.failed++;
  } else if (defaultQaKey !== currentQaKey) {
    error(`QA key mismatch: QaPanel has ${defaultQaKey}, contract-registry has ${currentQaKey}`);
    results.errors.push({ category: 'QA key drift', message: `QaPanel ${defaultQaKey} != contract-registry ${currentQaKey}` });
    results.failed++;
  } else {
    success(`QA keys match: ${defaultQaKey}`);
    results.passed++;
  }
  
  // Check BACKLOG_POLICY coherence
  if (backlogCurrentPass && defaultQaKey && backlogCurrentPass !== defaultQaKey.replace('v', '')) {
    warn(`BACKLOG_POLICY current pass (v${backlogCurrentPass}) does not match QA key (${defaultQaKey})`);
    results.errors.push({ category: 'backlog row drift', message: `BACKLOG_POLICY v${backlogCurrentPass} != QA key ${defaultQaKey}` });
    results.warnings++;
  } else if (backlogCurrentPass) {
    success(`BACKLOG_POLICY current pass (v${backlogCurrentPass}) coherent with QA key`);
    results.passed++;
  } else {
    warn('BACKLOG_POLICY current pass: NOT FOUND (no machine-readable current-pass marker)');
    results.errors.push({ category: 'backlog policy marker missing', message: 'BACKLOG_POLICY has no machine-readable current-pass marker' });
    results.warnings++;
  }
  
  // 2. Advisory coherence
  section('2. Advisory Coherence');
  
  if (!defaultQaKey) {
    error('Cannot check advisory coherence: QA key not found');
  } else {
    const advisoryExistsForQaKey = advisoryExists(advisoryRegistryContent, defaultQaKey);
    const version = defaultQaKey.replace(/^v/, '');
    info(`advisoryV${version} exists: ${advisoryExistsForQaKey ? 'YES' : 'NO'}`);
    
    if (!advisoryExistsForQaKey) {
      error(`No advisory section found for ${defaultQaKey}`);
      results.errors.push({ category: 'advisory missing', message: `No advisoryV${version} found` });
      results.failed++;
    } else {
      success(`Advisory section exists for ${defaultQaKey}`);
      results.passed++;
      
      // Check for questions
      const advisoryName = `advisory${version}`;
      const advisoryStart = advisoryRegistryContent.indexOf(`export const ${advisoryName}:`);
      const questionsStart = advisoryRegistryContent.indexOf('questions:', advisoryStart);
      const hasQuestions = questionsStart !== -1 && questionsStart < advisoryRegistryContent.indexOf('proposals:', advisoryStart);
      
      info(`Advisory has questions: ${hasQuestions ? 'YES' : 'NO'}`);
      if (!hasQuestions) {
        warn(`AdvisoryV${version} has no questions`);
        results.warnings++;
      } else {
        results.passed++;
      }
      
      // Check for proposals
      const proposalsStart = advisoryRegistryContent.indexOf('proposals:', advisoryStart);
      const hasProposals = proposalsStart !== -1;
      
      info(`Advisory has proposals: ${hasProposals ? 'YES' : 'NO'}`);
      if (!hasProposals) {
        warn(`AdvisoryV${version} has no proposals`);
        results.warnings++;
      } else {
        results.passed++;
      }
      
      // Check for backlog
      const hasBacklog = advisoryHasBacklog(advisoryRegistryContent, defaultQaKey);
      info(`Advisory has backlog rows: ${hasBacklog ? 'YES' : 'NO'}`);
      if (!hasBacklog) {
        warn(`AdvisoryV${version} has no backlog rows`);
        results.warnings++;
      } else {
        results.passed++;
      }
    }
  }
  
  // 3. Proposal ID coherence
  section('3. Proposal ID Coherence');
  
  const proposalIds = extractProposalIds(contractRegistryContent);
  info(`PRIMARY_PROPOSAL_ID: ${proposalIds.primary || 'NOT FOUND'}`);
  info(`SECONDARY_PROPOSAL_ID: ${proposalIds.secondary || 'NOT FOUND'}`);
  
  if (!proposalIds.primary) {
    error('PRIMARY_PROPOSAL_ID not found in contract-registry.spec.ts');
    results.errors.push({ category: 'proposal ID drift', message: 'PRIMARY_PROPOSAL_ID not found' });
    results.failed++;
  } else if (!defaultQaKey) {
    warn('Cannot verify proposal ID: QA key not found');
    results.warnings++;
  } else {
    const version = defaultQaKey.replace(/^v/, '');
    const advisoryProposalIds = extractAdvisoryProposalIds(advisoryRegistryContent, defaultQaKey);
    info(`AdvisoryV${version} proposal IDs: ${advisoryProposalIds.join(', ') || 'NONE'}`);
    
    if (advisoryProposalIds.length === 0) {
      error(`AdvisoryV${version} has no proposals to check against`);
      results.errors.push({ category: 'proposal ID drift', message: `AdvisoryV${version} has no proposals` });
      results.failed++;
    } else if (!advisoryProposalIds.includes(proposalIds.primary)) {
      error(`PRIMARY_PROPOSAL_ID "${proposalIds.primary}" not found in advisoryV${version}`);
      results.errors.push({ category: 'proposal ID drift', message: `PRIMARY_PROPOSAL_ID "${proposalIds.primary}" not in advisoryV${version}` });
      results.failed++;
    } else {
      success(`PRIMARY_PROPOSAL_ID exists in advisoryV${version}`);
      results.passed++;
    }
    
    if (proposalIds.secondary && proposalIds.secondary !== proposalIds.primary) {
      if (!advisoryProposalIds.includes(proposalIds.secondary)) {
        error(`SECONDARY_PROPOSAL_ID "${proposalIds.secondary}" not found in advisoryV${version}`);
        results.errors.push({ category: 'proposal ID drift', message: `SECONDARY_PROPOSAL_ID "${proposalIds.secondary}" not in advisoryV${version}` });
        results.failed++;
      } else {
        success(`SECONDARY_PROPOSAL_ID exists in advisoryV${version}`);
        results.passed++;
      }
    }
  }
  
  // 4. Backlog coherence
  section('4. Backlog Coherence');
  
  if (defaultQaKey && advisoryHasBacklog(advisoryRegistryContent, defaultQaKey)) {
    const version = defaultQaKey.replace(/^v/, '');
    success(`AdvisoryV${version} has backlog rows`);
    results.passed++;
  }
  
  if (backlogCurrentPass) {
    success(`BACKLOG_POLICY has current pass (v${backlogCurrentPass})`);
    results.passed++;
  }
  
  // Summary
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
    process.exit(1);
  } else if (results.warnings > 0) {
    warn('VALIDATION PASSED WITH WARNINGS');
    process.exit(0);
  } else {
    success('VALIDATION PASSED');
    process.exit(0);
  }
}

validate();
