#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * Token Census Script
 * 
 * Surfaces every token across the codebase, classifies against three-tier model,
 * identifies non-compliant tokens, and produces registry documents.
 * 
 * INVERTED DATA FLOW:
 * - Phase 1: Read declared tokens from source-of-truth files (no discovery via patterns)
 * - Phase 2: Scan codebase for consumers (exact string match for each declared token)
 * - Phase 3: Find CSS custom properties and cross-reference against dot-paths
 * - Phase 4: Anomaly detection (orphan candidates that look like token paths but aren't declared)
 * - Phase 5: Naked literal detection in token files (tier violations)
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const SRC_DIR = process.argv[2] || './src';
const OUTPUT_DIR = process.argv[3] || './docs';

// Source-of-truth files
const THEME_TOKEN_PATHS_FILE = join(SRC_DIR, 'themes/themeTokenPaths.ts');
const TOKEN_PRIMITIVES_FILE = join(SRC_DIR, 'themes/tokenPrimitives.ts');
const TOKEN_SEMANTICS_FILE = join(SRC_DIR, 'themes/tokenSemantics.ts');
const TOKEN_COMPONENTS_FILE = join(SRC_DIR, 'themes/tokenComponents.ts');
const GRAPH_VISUAL_TOKENS_FILE = join(SRC_DIR, 'graph/visual/graphVisualTokens.ts');

/**
 * Read file content
 */
function readFileContent(filePath) {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.warn('Warning: Could not read ' + filePath + ': ' + error.message);
    return '';
  }
}

/**
 * Phase 1: Read declared tokens from source-of-truth files
 */

/**
 * Parse canonical token paths from ThemeTokenPath type union
 */
function parseCanonicalPaths() {
  const content = readFileContent(THEME_TOKEN_PATHS_FILE);
  const paths = [];
  
  // Match type union pattern: | "path" or |'path'
  const typeUnionMatch = content.match(/export type ThemeTokenPath =([\s\S]*?);/);
  if (typeUnionMatch) {
    const pathStrings = typeUnionMatch[1].match(/["']([a-z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+)["']/g);
    if (pathStrings) {
      paths.push(...pathStrings.map(s => s.slice(1, -1)));
    }
  }
  
  return paths;
}

/**
 * Parse planned token paths from PLANNED_THEME_TOKEN_PATHS const array
 */
function parsePlannedPaths() {
  const content = readFileContent(THEME_TOKEN_PATHS_FILE);
  const paths = [];
  
  // Match array content: ["path", "path", ...]
  const arrayMatch = content.match(/PLANNED_THEME_TOKEN_PATHS[^[]*\[([\s\S]*?)\]/);
  if (arrayMatch) {
    const pathStrings = arrayMatch[1].match(/["']([a-z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+)["']/g);
    if (pathStrings) {
      paths.push(...pathStrings.map(s => s.slice(1, -1)));
    }
  }
  
  return paths;
}

/**
 * Parse Tier 1 primitives from tokenPrimitives.ts
 */
function parseTier1Primitives() {
  const content = readFileContent(TOKEN_PRIMITIVES_FILE);
  const primitives = new Set();
  
  // Match object keys in exported interface/object
  const keyMatches = content.match(/^\s+([a-z][a-zA-Z0-9]*):/gm);
  if (keyMatches) {
    for (const match of keyMatches) {
      const key = match.trim().replace(':', '');
      primitives.add(key);
    }
  }
  
  // Also match nested paths like color.gold.500
  const pathMatches = content.match(/["']([a-z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+)["']/g);
  if (pathMatches) {
    for (const match of pathMatches) {
      primitives.add(match.slice(1, -1));
    }
  }
  
  return Array.from(primitives);
}

/**
 * Parse Tier 2 semantics from tokenSemantics.ts
 */
function parseTier2Semantics() {
  const content = readFileContent(TOKEN_SEMANTICS_FILE);
  const semantics = new Set();
  
  // Match object keys
  const keyMatches = content.match(/^\s+([a-z][a-zA-Z0-9]*):/gm);
  if (keyMatches) {
    for (const match of keyMatches) {
      const key = match.trim().replace(':', '');
      semantics.add(key);
    }
  }
  
  // Also match nested paths
  const pathMatches = content.match(/["']([a-z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+)["']/g);
  if (pathMatches) {
    for (const match of pathMatches) {
      semantics.add(match.slice(1, -1));
    }
  }
  
  return Array.from(semantics);
}

/**
 * Parse Tier 3 components from tokenComponents.ts
 */
function parseTier3Components() {
  const content = readFileContent(TOKEN_COMPONENTS_FILE);
  const components = new Set();
  
  // Match object keys
  const keyMatches = content.match(/^\s+([a-z][a-zA-Z0-9]*):/gm);
  if (keyMatches) {
    for (const match of keyMatches) {
      const key = match.trim().replace(':', '');
      components.add(key);
    }
  }
  
  // Also match nested paths
  const pathMatches = content.match(/["']([a-z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+)["']/g);
  if (pathMatches) {
    for (const match of pathMatches) {
      components.add(match.slice(1, -1));
    }
  }
  
  return Array.from(components);
}

/**
 * Parse parallel system tokens from graphVisualTokens.ts
 */
function parseParallelSystemTokens() {
  const content = readFileContent(GRAPH_VISUAL_TOKENS_FILE);
  const tokens = new Set();
  
  // Match object keys
  const keyMatches = content.match(/^\s+([a-zA-Z][a-zA-Z0-9]*):/gm);
  if (keyMatches) {
    for (const match of keyMatches) {
      const key = match.trim().replace(':', '');
      if (key && !['default', 'selected', 'hover'].includes(key)) {
        tokens.add(key);
      }
    }
  }
  
  return Array.from(tokens);
}

/**
 * Phase 2: Scan codebase for consumers (exact string match)
 */
function findConsumers(tokenPath, sourceFiles) {
  const consumers = [];
  
  for (const file of sourceFiles) {
    const content = readFileContent(file);
    const escapedPath = tokenPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp('["\']' + escapedPath + '["\']', 'g');
    
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const line = content.substring(0, match.index).split('\n').length;
      consumers.push({ file: file, line: line });
    }
  }
  
  return consumers;
}

/**
 * Phase 3: Find CSS custom properties
 */
function findCSSCustomProperties(sourceFiles) {
  const cssVars = new Map();
  const pattern = /--lw-[a-z][a-z0-9-]*/g;
  
  for (const file of sourceFiles) {
    const content = readFileContent(file);
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const key = match[0];
      const line = content.substring(0, match.index).split('\n').length;
      
      if (!cssVars.has(key)) {
        cssVars.set(key, []);
      }
      cssVars.get(key).push({ file: file, line: line });
    }
  }
  
  return cssVars;
}

/**
 * Phase 4: Anomaly detection (orphan candidates)
 */
function findOrphanCandidates(sourceFiles, declaredTokens) {
  const orphans = new Map();
  const pattern = /["'`][a-z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+["'`]/g;
  const declaredSet = new Set(declaredTokens);
  
  for (const file of sourceFiles) {
    const content = readFileContent(file);
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const candidate = match[0].slice(1, -1);
      
      // Skip if it's a declared token
      if (declaredSet.has(candidate)) {
        continue;
      }
      
      // Skip common false positives
      if (candidate.startsWith('obj.') || candidate.startsWith('data.') || 
          candidate.startsWith('event.') || candidate.startsWith('window.') ||
          candidate.startsWith('document.') || candidate.startsWith('console.')) {
        continue;
      }
      
      const line = content.substring(0, match.index).split('\n').length;
      
      if (!orphans.has(candidate)) {
        orphans.set(candidate, []);
      }
      orphans.get(candidate).push({ file: file, line: line });
    }
  }
  
  return orphans;
}

/**
 * Phase 5: Naked literal detection in token files
 */
function detectTierViolations() {
  const violations = [];
  
  // Check tokenSemantics.ts for non-reference values
  const semanticsContent = readFileContent(TOKEN_SEMANTICS_FILE);
  const semanticsViolations = semanticsContent.match(/^\s+[a-z][a-zA-Z0-9]*:\s*["']#[0-9A-Fa-f]{6}["']/gm);
  if (semanticsViolations) {
    for (const violation of semanticsViolations) {
      violations.push({ file: TOKEN_SEMANTICS_FILE, violation: violation, type: 'TIER-2-HEX-LITERAL' });
    }
  }
  
  // Check tokenComponents.ts for non-reference values
  const componentsContent = readFileContent(TOKEN_COMPONENTS_FILE);
  const componentsViolations = componentsContent.match(/^\s+[a-z][a-zA-Z0-9]*:\s*["']#[0-9A-Fa-f]{6}["']/gm);
  if (componentsViolations) {
    for (const violation of componentsViolations) {
      violations.push({ file: TOKEN_COMPONENTS_FILE, violation: violation, type: 'TIER-3-HEX-LITERAL' });
    }
  }
  
  return violations;
}

/**
 * Recursively find all files in directory
 */
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx', '.css']) {
  const files = [];
  
  function traverse(currentDir) {
    const entries = readdirSync(currentDir);
    
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (extensions.some(ext => entry.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Main census function
 */
function runCensus() {
  console.log('Starting token census (inverted flow)...');
  
  // Phase 1: Read declared tokens
  console.log('Phase 1: Reading declared tokens from source-of-truth files...');
  const canonicalPaths = parseCanonicalPaths();
  const plannedPaths = parsePlannedPaths();
  const tier1Primitives = parseTier1Primitives();
  const tier2Semantics = parseTier2Semantics();
  const tier3Components = parseTier3Components();
  const parallelSystemTokens = parseParallelSystemTokens();
  
  console.log('Found ' + canonicalPaths.length + ' canonical paths');
  console.log('Found ' + plannedPaths.length + ' planned paths');
  console.log('Found ' + tier1Primitives.length + ' Tier 1 primitives');
  console.log('Found ' + tier2Semantics.length + ' Tier 2 semantics');
  console.log('Found ' + tier3Components.length + ' Tier 3 components');
  console.log('Found ' + parallelSystemTokens.length + ' parallel system tokens');
  
  // Combine all declared tokens for consumer scanning
  const allDeclaredTokens = new Set([
    ...canonicalPaths,
    ...plannedPaths,
    ...tier1Primitives,
    ...tier2Semantics,
    ...tier3Components
  ]);
  
  // Find all source files
  const sourceFiles = findFiles(SRC_DIR);
  console.log('Found ' + sourceFiles.length + ' source files');
  
  // Phase 2: Scan for consumers
  console.log('Phase 2: Scanning codebase for consumers...');
  const registry = [];
  
  for (const token of canonicalPaths) {
    const consumers = findConsumers(token, sourceFiles);
    registry.push({
      canonicalPath: token,
      status: 'CANONICAL',
      tier: 2,
      cssVar: 'none',
      tsIdentifier: 'none',
      sources: consumers,
      consumers: Array.from(new Set(consumers.map(c => c.file))),
      notes: ''
    });
  }
  
  for (const token of plannedPaths) {
    const consumers = findConsumers(token, sourceFiles);
    registry.push({
      canonicalPath: token,
      status: 'PLANNED',
      tier: 2,
      cssVar: 'none',
      tsIdentifier: 'none',
      sources: consumers,
      consumers: Array.from(new Set(consumers.map(c => c.file))),
      notes: ''
    });
  }
  
  for (const token of parallelSystemTokens) {
    const consumers = findConsumers(token, sourceFiles);
    registry.push({
      canonicalPath: token,
      status: 'LEGACY',
      tier: 'LEGACY',
      cssVar: 'none',
      tsIdentifier: token,
      sources: consumers,
      consumers: Array.from(new Set(consumers.map(c => c.file))),
      notes: '[ACTION-NEEDED] Parallel system token - needs conversion plan'
    });
  }
  
  console.log('Scanned consumers for ' + registry.length + ' declared tokens');
  
  // Phase 3: Find CSS custom properties
  console.log('Phase 3: Finding CSS custom properties...');
  const cssVars = findCSSCustomProperties(sourceFiles);
  console.log('Found ' + cssVars.size + ' CSS custom properties');
  
  // Add CSS vars to registry
  for (const [cssVar, locations] of cssVars) {
    registry.push({
      canonicalPath: cssVar,
      status: 'LEGACY',
      tier: 'LEGACY',
      cssVar: cssVar,
      tsIdentifier: 'none',
      sources: locations,
      consumers: Array.from(new Set(locations.map(l => l.file))),
      notes: '[ACTION-NEEDED] CSS custom property - needs conversion to three-tier'
    });
  }
  
  // Phase 4: Anomaly detection
  console.log('Phase 4: Detecting orphan candidates...');
  const orphans = findOrphanCandidates(sourceFiles, Array.from(allDeclaredTokens));
  console.log('Found ' + orphans.size + ' orphan candidates');
  
  // Add orphans to registry
  for (const [orphan, locations] of orphans) {
    registry.push({
      canonicalPath: orphan,
      status: 'ORPHAN',
      tier: 'LEGACY',
      cssVar: 'none',
      tsIdentifier: 'none',
      sources: locations,
      consumers: Array.from(new Set(locations.map(l => l.file))),
      notes: '[ACTION-NEEDED] ORPHAN - not in canonical/planned arrays, investigate'
    });
  }
  
  // Phase 5: Tier violation detection
  console.log('Phase 5: Detecting tier violations...');
  const violations = detectTierViolations();
  console.log('Found ' + violations.length + ' tier violations');
  
  // Add violations to registry
  for (const violation of violations) {
    registry.push({
      canonicalPath: violation.type + ': ' + violation.violation,
      status: 'TIER-VIOLATION',
      tier: 'VIOLATION',
      cssVar: 'none',
      tsIdentifier: 'none',
      sources: [{ file: violation.file, line: 0 }],
      consumers: [violation.file],
      notes: '[ACTION-NEEDED] Tier violation - naked literal in token file'
    });
  }
  
  // Sort by canonical path
  registry.sort(function(a, b) {
    return a.canonicalPath.localeCompare(b.canonicalPath);
  });
  
  // Generate registry document
  console.log('Generating TOKEN_REGISTRY.md...');
  const registryDoc = generateRegistryDocument(registry);
  writeFileSync(join(OUTPUT_DIR, 'TOKEN_REGISTRY.md'), registryDoc);
  
  // Generate dead token recovery document
  console.log('Generating DEAD_TOKEN_RECOVERY.md...');
  const deadCandidates = registry.filter(t => t.consumers.length === 0);
  const deadTokenDoc = generateDeadTokenDocument(deadCandidates);
  writeFileSync(join(OUTPUT_DIR, 'DEAD_TOKEN_RECOVERY.md'), deadTokenDoc);
  
  // Generate conversion plan document
  console.log('Generating TOKEN_CONVERSION_PLAN.md...');
  const conversionPlanDoc = generateConversionPlanDocument(registry);
  writeFileSync(join(OUTPUT_DIR, 'TOKEN_CONVERSION_PLAN.md'), conversionPlanDoc);
  
  // Generate JSON for machine consumption
  console.log('Generating token-registry.json...');
  writeFileSync(join(OUTPUT_DIR, 'token-registry.json'), JSON.stringify(registry, null, 2));
  
  console.log('Census complete!');
  
  // Print summary
  console.log('\n=== SUMMARY ===');
  console.log('Total tokens: ' + registry.length);
  console.log('CANONICAL: ' + registry.filter(t => t.status === 'CANONICAL').length);
  console.log('PLANNED: ' + registry.filter(t => t.status === 'PLANNED').length);
  console.log('LEGACY: ' + registry.filter(t => t.status === 'LEGACY').length);
  console.log('ORPHAN: ' + registry.filter(t => t.status === 'ORPHAN').length);
  console.log('TIER-VIOLATION: ' + registry.filter(t => t.status === 'TIER-VIOLATION').length);
  console.log('DEAD candidates: ' + deadCandidates.length);
  console.log('Action needed: ' + registry.filter(t => t.notes.includes('ACTION-NEEDED')).length);
}

/**
 * Generate registry document
 */
function generateRegistryDocument(registry) {
  let doc = '# Token Registry\n\n';
  doc += 'Master registry of all tokens in the codebase, classified against the three-tier model.\n\n';
  doc += 'Generated by: scripts/token-census.mjs\n\n';
  doc += '---\n\n';
  
  // Section 1: Master alphabetical
  doc += '## Section 1: Master Alphabetical\n\n';
  doc += '| Canonical Path | CSS Var | TS Identifier | Tier | Status | Sources | Consumers | Notes |\n';
  doc += '|---|---|---|---|---|---|---|---|\n';
  
  for (const entry of registry.slice(0, 30)) {
    let sourcesStr = '';
    if (entry.sources.length > 0) {
      sourcesStr = entry.sources.slice(0, 3).map(s => s.file.split('/').pop() + ':' + s.line).join(', ');
      if (entry.sources.length > 3) {
        sourcesStr += '...';
      }
    }
    const consumersStr = entry.consumers.length.toString();
    doc += '| ' + entry.canonicalPath + ' | ' + entry.cssVar + ' | ' + entry.tsIdentifier + ' | ' + entry.tier + ' | ' + entry.status + ' | ' + sourcesStr + ' | ' + consumersStr + ' | ' + entry.notes + ' |\n';
  }
  
  doc += '\n... (' + (registry.length - 30) + ' more entries)\n\n';
  
  // Section 2: Status-grouped
  doc += '## Section 2: Status-Grouped\n\n';
  
  const byStatus = {
    CANONICAL: registry.filter(t => t.status === 'CANONICAL'),
    PLANNED: registry.filter(t => t.status === 'PLANNED'),
    LEGACY: registry.filter(t => t.status === 'LEGACY'),
    ORPHAN: registry.filter(t => t.status === 'ORPHAN'),
    TIER_VIOLATION: registry.filter(t => t.status === 'TIER-VIOLATION'),
    DEAD: registry.filter(t => t.consumers.length === 0)
  };
  
  for (const [status, tokens] of Object.entries(byStatus)) {
    doc += '### ' + status + ' (' + tokens.length + ')\n\n';
    for (const token of tokens.slice(0, 10)) {
      doc += '- ' + token.canonicalPath + ' (Tier ' + token.tier + ')\n';
    }
    if (tokens.length > 10) {
      doc += '... (' + (tokens.length - 10) + ' more)\n';
    }
    doc += '\n';
  }
  
  // Section 3: Action queue
  doc += '## Section 3: Action Queue\n\n';
  const actionNeeded = registry.filter(t => t.notes.includes('ACTION-NEEDED'));
  
  if (actionNeeded.length === 0) {
    doc += 'No actions needed.\n';
  } else {
    doc += '| Canonical Path | Tier | Status | Issue |\n';
    doc += '|---|---|---|---|\n';
    for (const entry of actionNeeded) {
      doc += '| ' + entry.canonicalPath + ' | ' + entry.tier + ' | ' + entry.status + ' | ' + entry.notes + ' |\n';
    }
  }
  
  return doc;
}

/**
 * Generate dead token recovery document
 */
function generateDeadTokenDocument(deadCandidates) {
  let doc = '# Dead Token Recovery\n\n';
  doc += 'Tokens flagged as dead candidates — declared but unreferenced, or referenced but not declared.\n\n';
  doc += 'Generated by: scripts/token-census.mjs\n\n';
  doc += '---\n\n';
  doc += 'Total dead candidates: ' + deadCandidates.length + '\n\n';
  
  for (const entry of deadCandidates) {
    doc += '### Token: ' + entry.canonicalPath + '\n\n';
    doc += '**Found in:**\n';
    for (const source of entry.sources) {
      doc += '- ' + source.file + ':' + source.line + '\n';
    }
    if (entry.sources.length === 0) {
      doc += '- No references found\n';
    }
    
    doc += '\n**Current form:**\n';
    doc += '- Dot-path: ' + entry.canonicalPath + '\n';
    doc += '- CSS var: ' + entry.cssVar + '\n';
    doc += '- TS identifier: ' + entry.tsIdentifier + '\n';
    
    doc += '\n**Last seen as live:**\n';
    doc += 'Unknown\n';
    
    doc += '\n**Apparent purpose:**\n';
    doc += 'Unable to determine from naming alone.\n';
    
    doc += '\n**Recovery recommendation:**\n';
    doc += '- UNCLEAR: Operator decision required\n';
    
    doc += '\n---\n\n';
  }
  
  return doc;
}

/**
 * Generate conversion plan document
 */
function generateConversionPlanDocument(registry) {
  let doc = '# Token Conversion Plan\n\n';
  doc += 'Conversion plan for all non-compliant tokens to three-tier model.\n\n';
  doc += 'Generated by: scripts/token-census.mjs\n\n';
  doc += '---\n\n';
  
  const nonCompliant = registry.filter(t => t.status === 'LEGACY' || t.tier === 'LEGACY');
  
  doc += 'Total conversions needed: ' + nonCompliant.length + '\n\n';
  
  // Count by target tier
  const byTier = { 1: 0, 2: 0, 3: 0 };
  for (const entry of nonCompliant) {
    if (entry.cssVar !== 'none' && entry.tsIdentifier !== 'none') {
      byTier[2]++;
    } else if (entry.tsIdentifier !== 'none') {
      byTier[3]++;
    } else {
      byTier[1]++;
    }
  }
  
  doc += 'Conversion count by tier:\n';
  doc += '- To Tier 1: ' + byTier[1] + '\n';
  doc += '- To Tier 2: ' + byTier[2] + '\n';
  doc += '- To Tier 3: ' + byTier[3] + '\n\n';
  
  // Count by risk
  const byRisk = { Low: 0, Medium: 0, High: 0 };
  for (const entry of nonCompliant) {
    const consumerCount = entry.consumers.length;
    if (consumerCount === 0) {
      byRisk['Low']++;
    } else if (consumerCount < 5) {
      byRisk['Medium']++;
    } else {
      byRisk['High']++;
    }
  }
  
  doc += 'Conversion count by risk:\n';
  doc += '- Low: ' + byRisk['Low'] + '\n';
  doc += '- Medium: ' + byRisk['Medium'] + '\n';
  doc += '- High: ' + byRisk['High'] + '\n\n';
  
  doc += '---\n\n';
  
  // Detailed conversion entries
  for (const entry of nonCompliant.slice(0, 20)) {
    doc += '### Token: ' + entry.canonicalPath + '\n\n';
    
    doc += '**Current state:**\n';
    let form;
    if (entry.cssVar !== 'none') {
      form = 'CSS var';
    } else if (entry.tsIdentifier !== 'none') {
      form = 'TS identifier';
    } else {
      form = 'dot-path';
    }
    doc += '- Form: ' + form + '\n';
    
    let locationStr;
    if (entry.sources.length > 0) {
      locationStr = entry.sources.map(s => s.file + ':' + s.line).join(', ');
    } else {
      locationStr = 'unknown';
    }
    doc += '- Location: ' + locationStr + '\n';
    doc += '- System: LEGACY\n';
    doc += '- Consumers: ' + entry.consumers.length + ' files\n';
    
    doc += '\n**Proposed three-tier landing:**\n';
    let proposedTier;
    if (entry.cssVar !== 'none' && entry.tsIdentifier !== 'none') {
      proposedTier = 2;
    } else if (entry.tsIdentifier !== 'none') {
      proposedTier = 3;
    } else {
      proposedTier = 1;
    }
    doc += '- Tier: ' + proposedTier + '\n';
    doc += '- Canonical name: ' + entry.canonicalPath + '\n';
    
    if (proposedTier === 1) {
      doc += '- Tier 1 primitive value: [to be determined]\n';
    } else if (proposedTier === 2) {
      doc += '- Tier 2 semantic reference: [to be determined]\n';
    } else {
      doc += '- Tier 3 component reference: [to be determined]\n';
    }
    
    doc += '\n**Migration risk:**\n';
    let risk;
    if (entry.consumers.length === 0) {
      risk = 'Low';
    } else if (entry.consumers.length < 5) {
      risk = 'Medium';
    } else {
      risk = 'High';
    }
    doc += '- ' + risk + '\n';
    doc += '- Reasoning: ' + entry.consumers.length + ' consumers\n';
    
    doc += '\n**Migration steps (vP-Registry-2):**\n';
    doc += '1. [To be determined after review]\n';
    
    doc += '\n---\n\n';
  }
  
  if (nonCompliant.length > 20) {
    doc += '... (' + (nonCompliant.length - 20) + ' more entries)\n';
  }
  
  return doc;
}

// Run the census
runCensus();
