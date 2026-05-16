#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GWELLS_DIR = path.join(__dirname, '../src/physics/gwells');
const WELL_TYPES_PATH = path.join(GWELLS_DIR, 'wellTypes.ts');
const INTERACTIONS_PATH = path.join(GWELLS_DIR, 'interactions.ts');
const SEED_FUNCTIONS_PATH = path.join(GWELLS_DIR, 'seedFunctions.ts');
const DIALECTS_PATH = path.join(GWELLS_DIR, 'dialects.ts');
const TYPES_PATH = path.join(GWELLS_DIR, 'types.ts');

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

// Required helper functions per registry
const REQUIRED_HELPERS = {
  wellTypes: ['getWellTypeById', 'listWellTypes', 'listWellTypesByStatus', 'listPinnedWellTypes'],
  interactions: ['getInteractionById', 'listInteractions', 'listInteractionsBySource', 'listInteractionsByTarget', 'listInteractionsByKind'],
  seedFunctions: ['getSeedFunctionById', 'listSeedFunctions', 'listSeedFunctionsByStatus'],
  dialects: ['getDialectById', 'listDialects', 'listDialectsByStatus', 'getDefaultDialect'],
};

// Required types in types.ts
const REQUIRED_TYPES = [
  'GWStatus',
  'GWForceKind',
  'GWWellTypeDefaults',
  'GWWellTypeEntry',
  'GWInteractionEntry',
  'GWSeedFunctionContext',
  'GWSeedFunctionEntry',
  'GWWellAssignmentFn',
  'GWWellAssignment',
  'GWDialectConfig',
  'GWDialectEntry',
  'GWNodeState',
  'GWPhysicsState',
  'GWEngineConfig',
  'GWApplyDialectOptions',
  'GWController',
];

const REQUIRED_TYPES_EXPORTS = [
  'GW_ENGINE_DEFAULTS',
];

// Valid status values
const VALID_STATUSES = ['active', 'partial', 'planned', 'experimental'];

// Valid force kinds
const VALID_FORCE_KINDS = ['attraction', 'repulsion', 'spring', 'linear-alignment', 'perpendicular'];

// Helper function to find entry end by counting braces
function findEntryEnd(content, startIndex) {
  let openBracePos = startIndex;
  while (openBracePos >= 0 && content[openBracePos] !== '{') {
    openBracePos--;
  }
  
  if (openBracePos === -1) {
    return content.length;
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
          return i + 1;
        }
      }
    }
  }
  
  return content.length;
}

// Helper to extract array entries from registry content
function extractRegistryEntries(content, registryName) {
  const entries = [];
  const registryMatch = content.match(new RegExp(`export const (GW_${registryName.toUpperCase()}_REGISTRY|GW_SEED_FUNCTION_REGISTRY):\\s*readonly\\s+\\w+\\[\\]`));
  
  if (!registryMatch) {
    return entries;
  }
  
  const arrayStart = content.indexOf('[', registryMatch.index);
  if (arrayStart === -1) {
    return entries;
  }
  
  // Find the closing bracket of the array
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  let arrayEnd = -1;
  
  for (let i = arrayStart; i < content.length; i++) {
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
      if (char === '[') {
        braceCount++;
      } else if (char === ']') {
        braceCount--;
        if (braceCount === 0) {
          arrayEnd = i;
          break;
        }
      }
    }
  }
  
  if (arrayEnd === -1) {
    return entries;
  }
  
  // Extract entries from within the array
  const arrayContent = content.substring(arrayStart + 1, arrayEnd);
  
  // Now find object entries within the array content
  braceCount = 0;
  inString = false;
  escapeNext = false;
  let entryStart = -1;
  
  for (let i = 0; i < arrayContent.length; i++) {
    const char = arrayContent[i];
    
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
        if (braceCount === 0) {
          entryStart = i;
        }
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && entryStart !== -1) {
          entries.push(arrayContent.substring(entryStart, i + 1));
          entryStart = -1;
        }
      }
    }
  }
  
  return entries;
}

// Helper to extract field value from entry content
function extractFieldValue(entry, fieldName) {
  const patterns = [
    new RegExp(`${fieldName}:\\s*"([^"]+)"`),
    new RegExp(`${fieldName}:\\s*([\\d.-]+)`),
    new RegExp(`${fieldName}:\\s*(true|false)`),
  ];
  
  for (const pattern of patterns) {
    const match = entry.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// Helper to extract all TypeScript files in a directory recursively
function getTsFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getTsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function validate() {
  section('Gwells Registry Validator v0');
  
  const results = {
    passed: 0,
    warnings: 0,
    failed: 0,
    errors: [],
  };
  
  // Check 1: All five files exist
  section('Check 1: File Existence');
  
  const requiredFiles = {
    'wellTypes.ts': WELL_TYPES_PATH,
    'interactions.ts': INTERACTIONS_PATH,
    'seedFunctions.ts': SEED_FUNCTIONS_PATH,
    'dialects.ts': DIALECTS_PATH,
    'types.ts': TYPES_PATH,
  };
  
  let allFilesExist = true;
  for (const [name, path] of Object.entries(requiredFiles)) {
    if (!fs.existsSync(path)) {
      error(`Missing file: ${name} at ${path}`);
      results.errors.push({ category: 'file missing', message: `Missing ${name}` });
      results.failed++;
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    success('All five required files exist');
    results.passed++;
  } else {
    printSummary(results);
    process.exit(1);
  }
  
  // Read file contents
  let wellTypesContent, interactionsContent, seedFunctionsContent, dialectsContent, typesContent;
  
  try {
    wellTypesContent = fs.readFileSync(WELL_TYPES_PATH, 'utf-8');
    interactionsContent = fs.readFileSync(INTERACTIONS_PATH, 'utf-8');
    seedFunctionsContent = fs.readFileSync(SEED_FUNCTIONS_PATH, 'utf-8');
    dialectsContent = fs.readFileSync(DIALECTS_PATH, 'utf-8');
    typesContent = fs.readFileSync(TYPES_PATH, 'utf-8');
  } catch (err) {
    error(`Failed to read files: ${err.message}`);
    results.errors.push({ category: 'file read error', message: err.message });
    results.failed++;
    printSummary(results);
    process.exit(1);
  }
  
  // Check 2: Required helper functions exported
  section('Check 2: Required Helper Functions');
  
  let helperErrors = [];
  
  for (const [file, helpers] of Object.entries(REQUIRED_HELPERS)) {
    const content = {
      wellTypes: wellTypesContent,
      interactions: interactionsContent,
      seedFunctions: seedFunctionsContent,
      dialects: dialectsContent,
    }[file];
    
    for (const helper of helpers) {
      if (!content.includes(`export function ${helper}`)) {
        helperErrors.push(`${file}: ${helper}`);
      }
    }
  }
  
  if (helperErrors.length > 0) {
    error(`Missing required helper functions:\n  ${helperErrors.join('\n  ')}`);
    results.errors.push({ category: 'missing helpers', message: helperErrors.join(', ') });
    results.failed++;
  } else {
    success('All required helper functions present');
    results.passed++;
  }
  
  // Check 3: Required types exported in types.ts
  section('Check 3: Required Types Exports');
  
  let typeErrors = [];
  
  for (const type of REQUIRED_TYPES) {
    const patterns = [
      new RegExp(`export (type|interface) ${type}`),
      new RegExp(`export type ${type} =`),
    ];
    const found = patterns.some(p => p.test(typesContent));
    if (!found) {
      typeErrors.push(type);
    }
  }
  
  for (const constExport of REQUIRED_TYPES_EXPORTS) {
    if (!typesContent.includes(`export const ${constExport}`)) {
      typeErrors.push(constExport);
    }
  }
  
  if (typeErrors.length > 0) {
    error(`Missing required type exports: ${typeErrors.join(', ')}`);
    results.errors.push({ category: 'missing types', message: typeErrors.join(', ') });
    results.failed++;
  } else {
    success('All required types present');
    results.passed++;
  }
  
  // Check 4: Standalone import discipline
  section('Check 4: Standalone Import Discipline');
  
  const tsFiles = getTsFiles(GWELLS_DIR);
  let importViolations = [];
  
  for (const file of tsFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Check for @/ imports (LumaWeave path alias)
      if (line.includes('from "@/')) {
        importViolations.push({ file, line: line.trim() });
      }
      
      // Check for imports from outside the module (not graphology, not relative)
      const importMatch = line.match(/from ['"]([^'"]+)['"]/);
      if (importMatch) {
        const importSource = importMatch[1];
        const isRelative = importSource.startsWith('./') || importSource.startsWith('../');
        const isGraphology = importSource.startsWith('graphology');
        
        if (!isRelative && !isGraphology) {
          importViolations.push({ file, line: line.trim() });
        }
      }
    }
  }
  
  if (importViolations.length > 0) {
    error(`Import discipline violations:\n  ${importViolations.map(v => `${v.file}: ${v.line}`).join('\n  ')}`);
    results.errors.push({ category: 'import violations', message: `${importViolations.length} violations` });
    results.failed++;
  } else {
    success('No import violations (module is standalone)');
    results.passed++;
  }
  
  // Extract registry entries
  const wellTypeEntries = extractRegistryEntries(wellTypesContent, 'wellTypes');
  const interactionEntries = extractRegistryEntries(interactionsContent, 'interactions');
  const seedFunctionEntries = extractRegistryEntries(seedFunctionsContent, 'seedFunctions');
  const dialectEntries = extractRegistryEntries(dialectsContent, 'dialects');
  
  // Check 5: Entry shape validation (well types)
  section('Check 5: Well Type Entry Shape');
  
  if (wellTypeEntries.length === 0) {
    info('Skeleton mode: 0 well types registered');
    results.passed++;
  } else {
    let shapeErrors = [];
    
    for (const entry of wellTypeEntries) {
      const id = extractFieldValue(entry, 'id');
      if (!id || !id.startsWith('gwells.well.')) {
        shapeErrors.push(`Missing or invalid id in well type entry`);
      }
      
      if (!extractFieldValue(entry, 'label')) {
        shapeErrors.push(`Missing label in well type entry`);
      }
      
      if (!extractFieldValue(entry, 'description')) {
        shapeErrors.push(`Missing description in well type entry`);
      }
      
      const status = extractFieldValue(entry, 'status');
      if (!status || !VALID_STATUSES.includes(status)) {
        shapeErrors.push(`Missing or invalid status in well type entry`);
      }
      
      if (extractFieldValue(entry, 'pinned') === null) {
        shapeErrors.push(`Missing pinned in well type entry`);
      }
      
      // Check defaults sub-object
      if (!entry.includes('defaults:')) {
        shapeErrors.push(`Missing defaults in well type entry`);
      } else {
        const defaultsStart = entry.indexOf('defaults:');
        const defaultsEnd = findEntryEnd(entry, defaultsStart);
        const defaultsContent = entry.substring(defaultsStart, defaultsEnd);
        
        const requiredDefaults = ['attractionStrength', 'siblingRepulsion', 'springStiffness', 'damping', 'idealDistance'];
        for (const field of requiredDefaults) {
          if (!defaultsContent.includes(field)) {
            shapeErrors.push(`Missing defaults.${field} in well type entry`);
          }
        }
        
        // Check damping and springStiffness are in [0, 1]
        const dampingMatch = defaultsContent.match(/damping:\s*([\d.]+)/);
        if (dampingMatch) {
          const damping = parseFloat(dampingMatch[1]);
          if (damping < 0 || damping > 1) {
            shapeErrors.push(`damping value ${damping} out of range [0, 1]`);
          }
        }
        
        const stiffnessMatch = defaultsContent.match(/springStiffness:\s*([\d.]+)/);
        if (stiffnessMatch) {
          const stiffness = parseFloat(stiffnessMatch[1]);
          if (stiffness < 0 || stiffness > 1) {
            shapeErrors.push(`springStiffness value ${stiffness} out of range [0, 1]`);
          }
        }
      }
    }
    
    if (shapeErrors.length > 0) {
      error(`Well type shape errors:\n  ${shapeErrors.join('\n  ')}`);
      results.errors.push({ category: 'well type shape', message: shapeErrors.join(', ') });
      results.failed++;
    } else {
      success(`All ${wellTypeEntries.length} well type entries have valid shape`);
      results.passed++;
    }
  }
  
  // Check 6: Entry shape validation (interactions)
  section('Check 6: Interaction Entry Shape');
  
  if (interactionEntries.length === 0) {
    info('Skeleton mode: 0 interactions registered');
    results.passed++;
  } else {
    let shapeErrors = [];
    
    for (const entry of interactionEntries) {
      const id = extractFieldValue(entry, 'id');
      if (!id) {
        shapeErrors.push(`Missing id in interaction entry`);
      }
      
      const source = extractFieldValue(entry, 'source');
      if (!source || !source.startsWith('gwells.well.')) {
        shapeErrors.push(`Missing or invalid source in interaction entry`);
      }
      
      const target = extractFieldValue(entry, 'target');
      if (!target || !target.startsWith('gwells.well.')) {
        shapeErrors.push(`Missing or invalid target in interaction entry`);
      }
      
      const kind = extractFieldValue(entry, 'kind');
      if (!kind || !VALID_FORCE_KINDS.includes(kind)) {
        shapeErrors.push(`Missing or invalid kind in interaction entry`);
      }
      
      if (extractFieldValue(entry, 'strength') === null) {
        shapeErrors.push(`Missing strength in interaction entry`);
      }
      
      const status = extractFieldValue(entry, 'status');
      if (!status || !VALID_STATUSES.includes(status)) {
        shapeErrors.push(`Missing or invalid status in interaction entry`);
      }
      
      if (!extractFieldValue(entry, 'description')) {
        shapeErrors.push(`Missing description in interaction entry`);
      }
    }
    
    if (shapeErrors.length > 0) {
      error(`Interaction shape errors:\n  ${shapeErrors.join('\n  ')}`);
      results.errors.push({ category: 'interaction shape', message: shapeErrors.join(', ') });
      results.failed++;
    } else {
      success(`All ${interactionEntries.length} interaction entries have valid shape`);
      results.passed++;
    }
  }
  
  // Check 7: Entry shape validation (seed functions)
  section('Check 7: Seed Function Entry Shape');
  
  if (seedFunctionEntries.length === 0) {
    info('Skeleton mode: 0 seed functions registered');
    results.passed++;
  } else {
    let shapeErrors = [];
    
    for (const entry of seedFunctionEntries) {
      const id = extractFieldValue(entry, 'id');
      if (!id || !id.startsWith('gwells.seed.')) {
        shapeErrors.push(`Missing or invalid id in seed function entry`);
      }
      
      if (!extractFieldValue(entry, 'label')) {
        shapeErrors.push(`Missing label in seed function entry`);
      }
      
      if (!extractFieldValue(entry, 'description')) {
        shapeErrors.push(`Missing description in seed function entry`);
      }
      
      const status = extractFieldValue(entry, 'status');
      if (!status || !VALID_STATUSES.includes(status)) {
        shapeErrors.push(`Missing or invalid status in seed function entry`);
      }
      
      // Check for seed function (either function declaration or reference)
      if (!entry.includes('seed:')) {
        shapeErrors.push(`Missing seed in seed function entry`);
      } else {
        const seedStart = entry.indexOf('seed:');
        const seedLine = entry.substring(seedStart, seedStart + 100);
        if (!seedLine.includes('(') && !seedLine.includes('async') && !seedLine.includes('=>')) {
          shapeErrors.push(`seed field does not appear to be a function`);
        }
      }
    }
    
    if (shapeErrors.length > 0) {
      error(`Seed function shape errors:\n  ${shapeErrors.join('\n  ')}`);
      results.errors.push({ category: 'seed function shape', message: shapeErrors.join(', ') });
      results.failed++;
    } else {
      success(`All ${seedFunctionEntries.length} seed function entries have valid shape`);
      results.passed++;
    }
  }
  
  // Check 8: Entry shape validation (dialects)
  section('Check 8: Dialect Entry Shape');
  
  if (dialectEntries.length === 0) {
    info('Skeleton mode: 0 dialects registered');
    results.passed++;
  } else {
    let shapeErrors = [];
    
    for (const entry of dialectEntries) {
      const id = extractFieldValue(entry, 'id');
      if (!id || !id.startsWith('gwells.dialect.')) {
        shapeErrors.push(`Missing or invalid id in dialect entry`);
      }
      
      if (!extractFieldValue(entry, 'label')) {
        shapeErrors.push(`Missing label in dialect entry`);
      }
      
      if (!extractFieldValue(entry, 'description')) {
        shapeErrors.push(`Missing description in dialect entry`);
      }
      
      const status = extractFieldValue(entry, 'status');
      if (!status || !VALID_STATUSES.includes(status)) {
        shapeErrors.push(`Missing or invalid status in dialect entry`);
      }
      
      if (extractFieldValue(entry, 'isDefault') === null) {
        shapeErrors.push(`Missing isDefault in dialect entry`);
      }
      
      const seedFunctionId = extractFieldValue(entry, 'seedFunctionId');
      if (!seedFunctionId || !seedFunctionId.startsWith('gwells.seed.')) {
        shapeErrors.push(`Missing or invalid seedFunctionId in dialect entry`);
      }
      
      if (!entry.includes('wellAssignment:')) {
        shapeErrors.push(`Missing wellAssignment in dialect entry`);
      } else {
        const assignmentStart = entry.indexOf('wellAssignment:');
        const assignmentEnd = findEntryEnd(entry, assignmentStart);
        const assignmentContent = entry.substring(assignmentStart, assignmentEnd);
        
        if (!assignmentContent.includes('assign:')) {
          shapeErrors.push(`Missing assign function in wellAssignment`);
        }
      }
      
      if (!entry.includes('activeInteractions:')) {
        shapeErrors.push(`Missing activeInteractions in dialect entry`);
      }
      
      if (!entry.includes('config:')) {
        shapeErrors.push(`Missing config in dialect entry`);
      }
    }
    
    if (shapeErrors.length > 0) {
      error(`Dialect shape errors:\n  ${shapeErrors.join('\n  ')}`);
      results.errors.push({ category: 'dialect shape', message: shapeErrors.join(', ') });
      results.failed++;
    } else {
      success(`All ${dialectEntries.length} dialect entries have valid shape`);
      results.passed++;
    }
  }
  
  // Check 9: Exactly one default dialect
  section('Check 9: Exactly One Default Dialect');
  
  if (dialectEntries.length === 0) {
    info('Skeleton mode: 0 dialects (default check skipped)');
    results.passed++;
  } else {
    const defaultDialects = [];
    for (const entry of dialectEntries) {
      const isDefault = extractFieldValue(entry, 'isDefault');
      if (isDefault === 'true') {
        const id = extractFieldValue(entry, 'id');
        defaultDialects.push(id);
      }
    }
    
    if (defaultDialects.length === 0) {
      error('No default dialect found. Exactly one dialect entry must carry isDefault: true.');
      results.errors.push({ category: 'default dialect', message: 'No default dialect' });
      results.failed++;
    } else if (defaultDialects.length > 1) {
      error(`Multiple default dialects: ${defaultDialects.join(', ')}. Exactly one dialect entry must carry isDefault: true.`);
      results.errors.push({ category: 'default dialect', message: `Multiple defaults: ${defaultDialects.join(', ')}` });
      results.failed++;
    } else {
      success(`Exactly one default dialect: ${defaultDialects[0]}`);
      results.passed++;
    }
  }
  
  // Build ID maps for cross-reference checks
  const wellTypeIds = new Set();
  for (const entry of wellTypeEntries) {
    const id = extractFieldValue(entry, 'id');
    if (id) wellTypeIds.add(id);
  }
  
  const interactionIds = new Set();
  for (const entry of interactionEntries) {
    const id = extractFieldValue(entry, 'id');
    if (id) interactionIds.add(id);
  }
  
  const seedFunctionIds = new Set();
  for (const entry of seedFunctionEntries) {
    const id = extractFieldValue(entry, 'id');
    if (id) seedFunctionIds.add(id);
  }
  
  const dialectIds = new Set();
  const dialectStatuses = new Map();
  for (const entry of dialectEntries) {
    const id = extractFieldValue(entry, 'id');
    const status = extractFieldValue(entry, 'status');
    if (id) {
      dialectIds.add(id);
      dialectStatuses.set(id, status);
    }
  }
  
  // Build status maps
  const wellTypeStatuses = new Map();
  for (const entry of wellTypeEntries) {
    const id = extractFieldValue(entry, 'id');
    const status = extractFieldValue(entry, 'status');
    if (id) wellTypeStatuses.set(id, status);
  }
  
  const interactionStatuses = new Map();
  for (const entry of interactionEntries) {
    const id = extractFieldValue(entry, 'id');
    const status = extractFieldValue(entry, 'status');
    if (id) interactionStatuses.set(id, status);
  }
  
  const seedFunctionStatuses = new Map();
  for (const entry of seedFunctionEntries) {
    const id = extractFieldValue(entry, 'id');
    const status = extractFieldValue(entry, 'status');
    if (id) seedFunctionStatuses.set(id, status);
  }
  
  // Check 10: Cross-reference integrity
  section('Check 10: Cross-Reference Integrity');
  
  let xrefErrors = [];
  
  // Skip if source registries are empty (skeleton mode)
  if (wellTypeEntries.length > 0 && interactionEntries.length > 0) {
    for (const entry of interactionEntries) {
      const id = extractFieldValue(entry, 'id');
      const source = extractFieldValue(entry, 'source');
      const target = extractFieldValue(entry, 'target');
      
      if (source && !wellTypeIds.has(source)) {
        xrefErrors.push(`Interaction ${id} references missing well type source: ${source}`);
      }
      
      if (target && !wellTypeIds.has(target)) {
        xrefErrors.push(`Interaction ${id} references missing well type target: ${target}`);
      }
    }
  }
  
  if (dialectEntries.length > 0) {
    for (const entry of dialectEntries) {
      const id = extractFieldValue(entry, 'id');
      const seedFunctionId = extractFieldValue(entry, 'seedFunctionId');
      
      if (seedFunctionId && !seedFunctionIds.has(seedFunctionId)) {
        xrefErrors.push(`Dialect ${id} references missing seed function: ${seedFunctionId}`);
      }
      
      // Extract activeInteractions array
      const activeInteractionsMatch = entry.match(/activeInteractions:\s*\[([^\]]+)\]/);
      if (activeInteractionsMatch) {
        const interactionsList = activeInteractionsMatch[1];
        const interactionIdMatches = interactionsList.matchAll(/"([^"]+)"/g);
        
        for (const match of interactionIdMatches) {
          const interactionId = match[1];
          if (!interactionIds.has(interactionId)) {
            xrefErrors.push(`Dialect ${id} references missing interaction: ${interactionId}`);
          }
        }
      }
    }
  }
  
  if (xrefErrors.length > 0) {
    error(`Cross-reference errors:\n  ${xrefErrors.join('\n  ')}`);
    results.errors.push({ category: 'cross-reference', message: xrefErrors.join(', ') });
    results.failed++;
  } else {
    if (wellTypeEntries.length === 0 || interactionEntries.length === 0 || dialectEntries.length === 0) {
      info('Skeleton mode: cross-reference checks pass trivially (empty source registries)');
    }
    success('Cross-reference integrity maintained');
    results.passed++;
  }
  
  // Check 11: Status reference rule
  section('Check 11: Status Reference Rule');
  
  let statusErrors = [];
  
  for (const entry of dialectEntries) {
    const id = extractFieldValue(entry, 'id');
    const status = extractFieldValue(entry, 'status');
    
    if (status === 'active') {
      // Check seed function status
      const seedFunctionId = extractFieldValue(entry, 'seedFunctionId');
      if (seedFunctionId && seedFunctionStatuses.has(seedFunctionId)) {
        const seedStatus = seedFunctionStatuses.get(seedFunctionId);
        if (seedStatus === 'experimental') {
          statusErrors.push(`Active dialect ${id} references experimental seed function ${seedFunctionId}`);
        }
      }
      
      // Check interaction statuses
      const interactionsMatch = entry.match(/activeInteractions:\s*\[([^\]]+)\]/);
      if (interactionsMatch) {
        const interactionsList = interactionsMatch[1];
        const interactionIdMatches = interactionsList.matchAll(/"([^"]+)"/g);
        
        for (const match of interactionIdMatches) {
          const interactionId = match[1];
          if (interactionStatuses.has(interactionId)) {
            const interactionStatus = interactionStatuses.get(interactionId);
            if (interactionStatus === 'experimental') {
              statusErrors.push(`Active dialect ${id} references experimental interaction ${interactionId}`);
            }
          }
        }
      }
      
      // Check well type statuses referenced by interactions
      const activeInteractionsMatch = entry.match(/activeInteractions:\s*\[([^\]]+)\]/);
      if (activeInteractionsMatch) {
        const interactionsList = activeInteractionsMatch[1];
        const interactionIdMatches = interactionsList.matchAll(/"([^"]+)"/g);
        
        for (const match of interactionIdMatches) {
          const interactionId = match[1];
          const interactionEntry = interactionEntries.find(e => extractFieldValue(e, 'id') === interactionId);
          if (interactionEntry) {
            const source = extractFieldValue(interactionEntry, 'source');
            const target = extractFieldValue(interactionEntry, 'target');
            
            if (source && wellTypeStatuses.has(source) && wellTypeStatuses.get(source) === 'experimental') {
              statusErrors.push(`Active dialect ${id} references experimental well type ${source} via interaction ${interactionId}`);
            }
            
            if (target && wellTypeStatuses.has(target) && wellTypeStatuses.get(target) === 'experimental') {
              statusErrors.push(`Active dialect ${id} references experimental well type ${target} via interaction ${interactionId}`);
            }
          }
        }
      }
      
      // Well assignment predicate check is best-effort (skip for v0)
      // Predicate functions are too complex to parse statically without a full parser
    }
  }
  
  if (statusErrors.length > 0) {
    error(`Status reference rule violations:\n  ${statusErrors.join('\n  ')}`);
    results.errors.push({ category: 'status reference', message: statusErrors.join(', ') });
    results.failed++;
  } else {
    if (dialectEntries.length === 0) {
      info('Skeleton mode: no active dialects to check');
    }
    success('Status reference rule satisfied');
    results.passed++;
  }
  
  // Check 12: Standalone typecheck
  section('Check 12: Standalone Typecheck');
  
  try {
    execSync('npx tsc --noEmit', {
      cwd: GWELLS_DIR,
      stdio: 'pipe',
    });
    success('Standalone typecheck passed');
    results.passed++;
  } catch (err) {
    error('Standalone typecheck FAILED');
    error(err.stdout?.toString() || err.message);
    results.errors.push({ category: 'typecheck', message: 'Standalone typecheck failed' });
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
