#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * Settings Panel Validator — OoO Step 4
 * Verifies the settingsPanelCategoryRegistry and settings.registry
 * match the contract requirements in settings.panel.contract.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

const VALID_CATEGORY_IDS = [
  'theme',
  'typography',
  'graph',
  'inspector',
  'data-sources',
  'display',
  'accessibility',
  'advanced',
];

const EXPECTED_ORDER = [...VALID_CATEGORY_IDS];

let passed = 0;
let failed = 0;

function ok(msg)   { console.log(`✅ ${msg}`); passed++; }
function fail(msg) { console.error(`❌ ${msg}`); failed++; }
function info(msg) { console.log(`ℹ️  ${msg}`); }

// ── Registry checks ─────────────────────────────────────────────────────────

const registryPath = path.join(repoRoot, 'src/control-plane/settings/settingsPanelCategoryRegistry.ts');

if (!fs.existsSync(registryPath)) {
  fail('settingsPanelCategoryRegistry.ts does not exist at expected path');
  process.exit(1);
}

const registryContent = fs.readFileSync(registryPath, 'utf-8');

// Extract all entries: { id: '...', label: '...', description: '...', iconPath: '...' }
const entryPattern = /\{\s*id:\s*'([^']+)'[\s\S]*?label:\s*'([^']+)'[\s\S]*?description:\s*'([^']+)'[\s\S]*?iconPath:\s*'([^']+)'[\s\S]*?\}/g;
const entries = [];
let match;
while ((match = entryPattern.exec(registryContent)) !== null) {
  entries.push({ id: match[1], label: match[2], description: match[3], iconPath: match[4] });
}

info(`Found ${entries.length} entries in SETTINGS_PANEL_CATEGORIES`);

// Exactly 8 entries
if (entries.length === 8) {
  ok('Registry has exactly 8 entries');
} else {
  fail(`Registry has ${entries.length} entries — expected exactly 8`);
}

// Correct order
const actualOrder = entries.map(e => e.id);
const orderMatches = actualOrder.every((id, i) => id === EXPECTED_ORDER[i]);
if (orderMatches) {
  ok(`Category order matches contract: ${actualOrder.join(', ')}`);
} else {
  fail(`Category order mismatch.\n  Expected: ${EXPECTED_ORDER.join(', ')}\n  Actual:   ${actualOrder.join(', ')}`);
}

// All ids are valid CategoryIds
for (const entry of entries) {
  if (VALID_CATEGORY_IDS.includes(entry.id)) {
    ok(`Valid CategoryId: '${entry.id}'`);
  } else {
    fail(`Invalid CategoryId: '${entry.id}'`);
  }
}

// All required fields present and non-empty
for (const entry of entries) {
  const missingFields = [];
  if (!entry.label?.trim())       missingFields.push('label');
  if (!entry.description?.trim()) missingFields.push('description');
  if (!entry.iconPath?.trim())    missingFields.push('iconPath');

  if (missingFields.length === 0) {
    ok(`All required fields non-empty for '${entry.id}'`);
  } else {
    fail(`Entry '${entry.id}' is missing or has empty fields: ${missingFields.join(', ')}`);
  }
}

// ── Settings registry category checks ───────────────────────────────────────

const settingsRegistryPath = path.join(repoRoot, 'src/control-plane/settings/settings.registry.ts');

if (!fs.existsSync(settingsRegistryPath)) {
  fail('settings.registry.ts does not exist at expected path');
} else {
  const settingsContent = fs.readFileSync(settingsRegistryPath, 'utf-8');

  // Find all category: '...' or category: "..." values
  const categoryPattern = /category:\s*['"]([^'"]+)['"]/g;
  const invalidCategories = [];
  let catMatch;

  while ((catMatch = categoryPattern.exec(settingsContent)) !== null) {
    const cat = catMatch[1];
    if (!VALID_CATEGORY_IDS.includes(cat)) {
      invalidCategories.push(cat);
    }
  }

  if (invalidCategories.length === 0) {
    ok('All category values in settings.registry.ts are valid CategoryIds');
  } else {
    // This becomes a hard failure after OoO Step 5 (settings registry migration).
    // Reported as a warning pre-migration so the validator exits 0 at Step 4.
    const unique = [...new Set(invalidCategories)];
    console.warn(`⚠️  settings.registry.ts has pre-migration category values (fix in OoO Step 5): ${unique.join(', ')}`);
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} checks — ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.error('\nVALIDATION FAILED');
  process.exit(1);
} else {
  console.log('\nVALIDATION PASSED');
  process.exit(0);
}
