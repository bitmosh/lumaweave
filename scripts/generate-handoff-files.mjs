import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SRC_DIR = process.argv[2] || './src';
const OUTPUT_DIR = process.argv[3] || './docs';

const JSON_FILE = join(OUTPUT_DIR, 'token-registry.json');

function readFileContent(filePath) {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.warn('Warning: Could not read ' + filePath + ': ' + error.message);
    return '';
  }
}

// Read the registry
const registry = JSON.parse(readFileContent(JSON_FILE));

// Split by status
const canonical = registry.filter(t => t.status === 'CANONICAL').sort((a, b) => a.canonicalPath.localeCompare(b.canonicalPath));
const legacy = registry.filter(t => t.status === 'LEGACY').sort((a, b) => a.canonicalPath.localeCompare(b.canonicalPath));
const dead = registry.filter(t => t.consumers.length === 0).sort((a, b) => a.canonicalPath.localeCompare(b.canonicalPath));
const orphans = registry.filter(t => t.status === 'ORPHAN').sort((a, b) => a.canonicalPath.localeCompare(b.canonicalPath));

// Generate CANONICAL file
let canonicalDoc = '# Token Census: CANONICAL\n\n';
canonicalDoc += 'Canonical tokens declared in themeTokenPaths.ts.\n\n';
canonicalDoc += '| Canonical Path | Source Files | Consumer Files |\n';
canonicalDoc += '|---|---|---|\n';

for (const token of canonical) {
  const sources = token.sources.map(s => s.file + ':' + s.line).join(', ');
  const consumers = token.consumers.map(c => c).join(', ');
  canonicalDoc += '| ' + token.canonicalPath + ' | ' + (sources || 'none') + ' | ' + (consumers || 'none') + ' |\n';
}

writeFileSync(join(OUTPUT_DIR, 'TOKEN_CENSUS_CANONICAL.md'), canonicalDoc);
console.log('Generated TOKEN_CENSUS_CANONICAL.md (' + canonical.length + ' tokens)');

// Generate LEGACY file
let legacyDoc = '# Token Census: LEGACY\n\n';
legacyDoc += 'Legacy tokens (CSS custom properties + parallel system tokens).\n\n';
legacyDoc += '| Token Name | Source Files | Consumer Files | System |\n';
legacyDoc += '|---|---|---|---|\n';

for (const token of legacy) {
  const sources = token.sources.map(s => s.file + ':' + s.line).join(', ');
  const consumers = token.consumers.map(c => c).join(', ');
  let system = 'unknown';
  if (token.cssVar !== 'none' && token.cssVar.startsWith('--lw-')) {
    system = 'CSS var';
  } else if (token.tsIdentifier !== 'none') {
    system = 'graphVisualTokens.ts';
  }
  legacyDoc += '| ' + token.canonicalPath + ' | ' + (sources || 'none') + ' | ' + (consumers || 'none') + ' | ' + system + ' |\n';
}

writeFileSync(join(OUTPUT_DIR, 'TOKEN_CENSUS_LEGACY.md'), legacyDoc);
console.log('Generated TOKEN_CENSUS_LEGACY.md (' + legacy.length + ' tokens)');

// Generate DEAD CANDIDATES file
let deadDoc = '# Token Census: DEAD CANDIDATES\n\n';
deadDoc += 'Tokens with no consumers.\n\n';
deadDoc += '| Token Name | Location | Reason |\n';
deadDoc += '|---|---|---|\n';

for (const token of dead) {
  const locations = token.sources.map(s => s.file + ':' + s.line).join(', ');
  let reason = 'no consumers';
  if (token.sources.length === 0) {
    reason = 'no declaration or consumers';
  }
  deadDoc += '| ' + token.canonicalPath + ' | ' + (locations || 'none') + ' | ' + reason + ' |\n';
}

writeFileSync(join(OUTPUT_DIR, 'TOKEN_CENSUS_DEAD_CANDIDATES.md'), deadDoc);
console.log('Generated TOKEN_CENSUS_DEAD_CANDIDATES.md (' + dead.length + ' tokens)');

// Generate ORPHANS file with context
let orphanDoc = '# Token Census: ORPHANS\n\n';
orphanDoc += 'Patterns that look like token paths but are not declared.\n\n';
orphanDoc += '| Pattern | Location | Context |\n';
orphanDoc += '|---|---|---|\n';

for (const token of orphans) {
  const locations = token.sources.map(s => s.file + ':' + s.line).join(', ');
  // Read the actual line context for each location
  let contexts = [];
  for (const source of token.sources) {
    const content = readFileContent(source.file);
    const lines = content.split('\n');
    if (lines[source.line - 1]) {
      contexts.push(lines[source.line - 1].trim());
    }
  }
  const contextStr = contexts.join('; ');
  orphanDoc += '| ' + token.canonicalPath + ' | ' + locations + ' | ' + contextStr + ' |\n';
}

writeFileSync(join(OUTPUT_DIR, 'TOKEN_CENSUS_ORPHANS.md'), orphanDoc);
console.log('Generated TOKEN_CENSUS_ORPHANS.md (' + orphans.length + ' tokens)');

console.log('\n=== SUMMARY ===');
console.log('CANONICAL: ' + canonical.length);
console.log('LEGACY: ' + legacy.length);
console.log('DEAD: ' + dead.length);
console.log('ORPHANS: ' + orphans.length);
