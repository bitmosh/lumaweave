#!/usr/bin/env node
// scripts/normalize-frontmatter.mjs
//
// Normalizes YAML frontmatter across docs/ according to schemas in
// scripts/frontmatter-rules.yaml. Designed for safe, repeatable
// per-cluster runs with --dry-run preview.
//
// Usage:
//   node scripts/normalize-frontmatter.mjs --dry-run
//   node scripts/normalize-frontmatter.mjs --dry-run --scope agent/brain
//   node scripts/normalize-frontmatter.mjs --scope agent/brain
//   node scripts/normalize-frontmatter.mjs --scope agent/brain --verbose
//   node scripts/normalize-frontmatter.mjs --validate-only
//   node scripts/normalize-frontmatter.mjs --validate-only --scope theme --strict
//
// Flags:
//   --dry-run         Preview changes without writing to disk
//   --scope <path>    Limit processing to a subdirectory of docs/
//                     (path is relative to docs/, e.g. "agent/brain")
//   --verbose         Show per-file decisions even when no changes
//   --validate-only   Validate against schema without applying any changes.
//                     Useful for checking newly-drafted docs.
//   --strict          Exit non-zero on any validation warning. Intended
//                     for pre-commit hooks.
//   --help            Show this help
//
// Exit codes:
//   0  Success — no errors, no warnings (or warnings allowed in non-strict)
//   1  At least one file failed to parse or write
//   2  Configuration error (missing rules file, invalid YAML, etc)
//   3  Validation warnings present in --strict mode
//
// Dependencies:
//   - yaml (npm package, for round-trip-friendly YAML parsing)
//   Install: npm install --save-dev yaml

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const DOCS_DIR = resolve(process.cwd(), 'docs');
const RULES_FILE = resolve(process.cwd(), 'scripts', 'frontmatter-rules.yaml');
const FRONTMATTER_DELIM = '---';

// ────────────────────────────────────────────────────────────
// CLI argument parsing
// ────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    dryRun: false,
    scope: null,
    verbose: false,
    validateOnly: false,
    strict: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--verbose') args.verbose = true;
    else if (arg === '--validate-only') args.validateOnly = true;
    else if (arg === '--strict') args.strict = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--scope') {
      args.scope = argv[++i];
      if (!args.scope) {
        die('--scope flag requires a path argument', 2);
      }
    } else {
      die(`Unknown argument: ${arg}`, 2);
    }
  }
  // --validate-only implies dry-run (we never write in validation mode)
  if (args.validateOnly) {
    args.dryRun = true;
  }
  return args;
}

function showHelp() {
  console.log(`Usage: node scripts/normalize-frontmatter.mjs [flags]

Normalizes YAML frontmatter across docs/ per scripts/frontmatter-rules.yaml.

Flags:
  --dry-run         Preview changes without writing to disk
  --scope <path>    Limit to a subdirectory of docs/ (e.g. "agent/brain")
  --verbose         Show per-file decisions even when no changes
  --validate-only   Validate against schema without applying any changes
  --strict          Exit non-zero on any validation warning
  --help            Show this help

Common workflows:
  Preview changes:    --dry-run --scope <subdir>
  Apply changes:      --scope <subdir>
  Check new doc:      --validate-only --scope <subdir>
  CI/pre-commit:      --validate-only --strict
`);
}

// ────────────────────────────────────────────────────────────
// Filesystem helpers
// ────────────────────────────────────────────────────────────

async function walkMarkdownFiles(rootDir) {
  const out = [];
  async function recurse(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (err) {
      console.error(`Failed to read directory ${dir}: ${err.message}`);
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await recurse(full);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        out.push(full);
      }
    }
  }
  await recurse(rootDir);
  return out.sort();
}

// ────────────────────────────────────────────────────────────
// Frontmatter parsing
// ────────────────────────────────────────────────────────────

function parseDocument(content) {
  const usesCrlf = content.includes('\r\n');
  const normalized = usesCrlf ? content.replace(/\r\n/g, '\n') : content;

  if (!normalized.startsWith(FRONTMATTER_DELIM + '\n')) {
    return {
      frontmatter: null,
      body: content,
      hadFrontmatter: false,
      usesCrlf,
    };
  }

  const lines = normalized.split('\n');
  let closeIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === FRONTMATTER_DELIM) {
      closeIdx = i;
      break;
    }
  }

  if (closeIdx === -1) {
    return {
      frontmatter: null,
      body: content,
      hadFrontmatter: false,
      malformed: true,
      usesCrlf,
    };
  }

  const frontmatterText = lines.slice(1, closeIdx).join('\n');
  const bodyLines = lines.slice(closeIdx + 1);
  const body = bodyLines.join('\n');

  let frontmatter;
  try {
    frontmatter = parseYaml(frontmatterText) || {};
  } catch (err) {
    throw new Error(`YAML parse error: ${err.message}`);
  }

  if (typeof frontmatter !== 'object' || Array.isArray(frontmatter)) {
    throw new Error('Frontmatter must be a YAML mapping (object)');
  }

  return {
    frontmatter,
    body,
    hadFrontmatter: true,
    usesCrlf,
  };
}

function serializeDocument(parsed) {
  if (!parsed.hadFrontmatter) {
    return parsed.body;
  }
  const yamlText = stringifyYaml(parsed.frontmatter, {
    lineWidth: 0,
    minContentWidth: 0,
  });
  let out = `${FRONTMATTER_DELIM}\n${yamlText}${FRONTMATTER_DELIM}\n${parsed.body}`;
  if (parsed.usesCrlf) {
    out = out.replace(/\n/g, '\r\n');
  }
  return out;
}

// ────────────────────────────────────────────────────────────
// Schema matching
// ────────────────────────────────────────────────────────────

function loadRules() {
  let raw;
  try {
    raw = readFileSync(RULES_FILE, 'utf8');
  } catch (err) {
    die(`Failed to read rules file ${RULES_FILE}: ${err.message}`, 2);
  }
  let rules;
  try {
    rules = parseYaml(raw);
  } catch (err) {
    die(`Failed to parse rules YAML: ${err.message}`, 2);
  }
  if (!rules || !rules.schemas) {
    die('Rules file missing required "schemas" section', 2);
  }
  if (rules.version !== 1) {
    die(`Rules file has version ${rules.version}; expected 1`, 2);
  }
  return rules;
}

function matchSchema(relPath, rules) {
  const path = relPath.split(sep).join('/');
  for (const [name, schema] of Object.entries(rules.schemas)) {
    if (!schema.path_match) continue;
    let regex;
    try {
      regex = new RegExp(schema.path_match);
    } catch (err) {
      console.error(`Invalid path_match regex in schema "${name}": ${err.message}`);
      continue;
    }
    if (regex.test(path)) {
      return { name, schema };
    }
  }
  return null;
}

// ────────────────────────────────────────────────────────────
// Normalization
// ────────────────────────────────────────────────────────────

function todayIso() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Apply schema rules to frontmatter. Returns a NEW frontmatter object
 * with changes applied, plus a list of human-readable change strings.
 *
 * Application order:
 *   1. field_renames (oldKey → newKey, value preserved)
 *   2. field_removals (delete fields entirely)
 *   3. field_remaps (within-field value remapping, e.g. status: active → current)
 *   4. field_defaults (set IF AND ONLY IF absent)
 *   5. field_overrides (always set, takes precedence)
 *   6. last_updated_today (set last_updated to today's ISO date)
 *
 * Order rationale:
 *   - Renames first so subsequent rules see the canonical key names
 *   - Removals next so later rules don't operate on doomed fields
 *   - Remaps before defaults/overrides so vocabulary cleanup happens on
 *     existing values; defaults/overrides then have final say
 *   - Defaults before overrides so overrides always win
 *   - last_updated last because it's the most volatile field
 */
function normalizeFrontmatter(fm, schema, defaults) {
  const result = { ...fm };
  const changes = [];

  const fieldRenames = {
    ...(defaults?.field_renames || {}),
    ...(schema.field_renames || {}),
  };
  const fieldRemovals = new Set([
    ...(defaults?.field_removals || []),
    ...(schema.field_removals || []),
  ]);
  const fieldRemaps = mergeFieldRemaps(
    defaults?.field_remaps || {},
    schema.field_remaps || {}
  );
  const fieldDefaults = {
    ...(defaults?.field_defaults || {}),
    ...(schema.field_defaults || {}),
  };
  const fieldOverrides = {
    ...(defaults?.field_overrides || {}),
    ...(schema.field_overrides || {}),
  };
  const lastUpdatedToday =
    schema.last_updated_today ?? defaults?.last_updated_today ?? false;

  // 1. Field renames: oldKey → newKey
  for (const [oldKey, newKey] of Object.entries(fieldRenames)) {
    if (oldKey in result) {
      if (newKey in result) {
        delete result[oldKey];
        changes.push(`renamed ${oldKey} → ${newKey} (kept existing ${newKey})`);
      } else {
        result[newKey] = result[oldKey];
        delete result[oldKey];
        changes.push(`renamed ${oldKey} → ${newKey}`);
      }
    }
  }

  // 2. Field removals
  for (const key of fieldRemovals) {
    if (key in result) {
      delete result[key];
      changes.push(`removed ${key}`);
    }
  }

  // 3. Field remaps: transform values within a field
  // Schema shape:
  //   field_remaps:
  //     status:
  //       active: current
  //       historical: archived
  for (const [fieldName, valueMap] of Object.entries(fieldRemaps)) {
    if (fieldName in result) {
      const oldValue = result[fieldName];
      // Only remap if oldValue is a primitive that has a mapping.
      // Don't try to remap arrays or objects (those aren't sensible
      // targets for value-level remapping).
      if (
        oldValue !== null &&
        typeof oldValue !== 'object' &&
        oldValue in valueMap
      ) {
        const newValue = valueMap[oldValue];
        result[fieldName] = newValue;
        changes.push(
          `remap ${fieldName}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`
        );
      }
    }
  }

  // 4. Field defaults (only set if absent)
  for (const [key, value] of Object.entries(fieldDefaults)) {
    if (!(key in result)) {
      result[key] = value;
      changes.push(`set default ${key}=${JSON.stringify(value)}`);
    }
  }

  // 5. Field overrides (always set, regardless of existing value)
  for (const [key, value] of Object.entries(fieldOverrides)) {
    if (result[key] !== value) {
      const prev = key in result ? JSON.stringify(result[key]) : '<absent>';
      result[key] = value;
      changes.push(`override ${key}: ${prev} → ${JSON.stringify(value)}`);
    }
  }

  // 6. last_updated to today
  if (lastUpdatedToday) {
    const today = todayIso();
    if (result.last_updated !== today) {
      const prev = 'last_updated' in result
        ? JSON.stringify(result.last_updated)
        : '<absent>';
      result.last_updated = today;
      changes.push(`set last_updated: ${prev} → ${JSON.stringify(today)}`);
    }
  }

  return { result, changes };
}

/**
 * Merge two field_remaps configs. Schema-level remaps override defaults
 * at the (field, value) level — not at the field level — so a schema
 * can extend defaults' remaps for the same field rather than replacing.
 *
 * Example:
 *   defaults:
 *     field_remaps:
 *       status: { foo: bar }
 *   schema:
 *     field_remaps:
 *       status: { baz: qux }
 *   → merged:
 *     status: { foo: bar, baz: qux }
 */
function mergeFieldRemaps(defaults, schema) {
  const result = {};
  const allFields = new Set([
    ...Object.keys(defaults || {}),
    ...Object.keys(schema || {}),
  ]);
  for (const field of allFields) {
    result[field] = {
      ...(defaults?.[field] || {}),
      ...(schema?.[field] || {}),
    };
  }
  return result;
}

/**
 * Validate frontmatter against schema's required_fields and
 * status_options. Returns array of warning strings (empty = clean).
 */
function validate(fm, schema) {
  const warnings = [];
  const required = schema.required_fields || [];
  for (const field of required) {
    if (!(field in fm)) {
      warnings.push(`missing required field: ${field}`);
    }
  }
  const statusOptions = schema.status_options;
  if (statusOptions && fm.status && !statusOptions.includes(fm.status)) {
    warnings.push(
      `status="${fm.status}" not in allowed values [${statusOptions.join(', ')}]`
    );
  }
  return warnings;
}

// ────────────────────────────────────────────────────────────
// Per-file processing
// ────────────────────────────────────────────────────────────

function processFile(absPath, relPath, rules, options) {
  const log = (msg, level = 'info') => {
    const prefix =
      level === 'error' ? '✗' : level === 'warn' ? '⚠' : level === 'change' ? '→' : ' ';
    console.log(`${prefix} ${relPath}: ${msg}`);
  };

  let content;
  try {
    content = readFileSync(absPath, 'utf8');
  } catch (err) {
    log(`failed to read: ${err.message}`, 'error');
    return { ok: false, changed: false, warnings: 0 };
  }

  let parsed;
  try {
    parsed = parseDocument(content);
  } catch (err) {
    log(`parse error: ${err.message}`, 'error');
    return { ok: false, changed: false, warnings: 0 };
  }

  if (parsed.malformed) {
    log('frontmatter delimiters unclosed; skipping', 'warn');
    return { ok: true, changed: false, warnings: 1 };
  }

  const match = matchSchema(relPath, rules);
  if (!match) {
    if (options.verbose) {
      log('no matching schema; skipping', 'info');
    }
    return { ok: true, changed: false, warnings: 0 };
  }

  if (!parsed.hadFrontmatter) {
    log(`matched schema "${match.name}" but file has no frontmatter; skipping`, 'warn');
    return { ok: true, changed: false, warnings: 1 };
  }

  // Validate-only mode: skip normalization, just report warnings
  if (options.validateOnly) {
    const warnings = validate(parsed.frontmatter, match.schema);
    if (warnings.length > 0) {
      log(`schema "${match.name}" — ${warnings.length} warning(s):`, 'warn');
      for (const w of warnings) {
        console.log(`    ⚠ ${w}`);
      }
    } else if (options.verbose) {
      log(`schema "${match.name}" — clean`, 'info');
    }
    return { ok: true, changed: false, warnings: warnings.length };
  }

  // Normalize
  const { result, changes } = normalizeFrontmatter(
    parsed.frontmatter,
    match.schema,
    rules.defaults
  );

  if (changes.length === 0) {
    if (options.verbose) {
      log(`schema "${match.name}" matched; no changes needed`, 'info');
    }
    return { ok: true, changed: false, warnings: 0 };
  }

  const updated = { ...parsed, frontmatter: result };
  const newContent = serializeDocument(updated);
  const warnings = validate(result, match.schema);

  log(`schema "${match.name}" — ${changes.length} change(s):`, 'change');
  for (const change of changes) {
    console.log(`    ${change}`);
  }
  for (const w of warnings) {
    console.log(`    ⚠ ${w}`);
  }

  if (!options.dryRun) {
    try {
      writeFileSync(absPath, newContent, 'utf8');
    } catch (err) {
      log(`failed to write: ${err.message}`, 'error');
      return { ok: false, changed: true, warnings: warnings.length };
    }
  }

  return { ok: true, changed: true, warnings: warnings.length };
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

function die(msg, exitCode) {
  console.error(`Error: ${msg}`);
  process.exit(exitCode);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  try {
    const stat = statSync(DOCS_DIR);
    if (!stat.isDirectory()) {
      die(`${DOCS_DIR} is not a directory`, 2);
    }
  } catch (err) {
    die(`docs/ directory not found at ${DOCS_DIR}: ${err.message}`, 2);
  }

  const rules = loadRules();

  let scopeRoot = DOCS_DIR;
  let scopePrefix = '';
  if (args.scope) {
    const normScope = args.scope.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
    scopeRoot = resolve(DOCS_DIR, normScope);
    scopePrefix = normScope + '/';
    try {
      const stat = statSync(scopeRoot);
      if (!stat.isDirectory()) {
        die(`Scope path is not a directory: ${scopeRoot}`, 2);
      }
    } catch (err) {
      die(`Scope path not found: ${scopeRoot}`, 2);
    }
  }

  // Mode banner
  let mode;
  if (args.validateOnly) {
    mode = `VALIDATE-ONLY${args.strict ? ' (STRICT)' : ''}`;
  } else if (args.dryRun) {
    mode = 'DRY RUN (no writes)';
  } else {
    mode = 'WRITE';
  }
  console.log(`Mode: ${mode}`);
  console.log(`Docs root: ${DOCS_DIR}`);
  if (args.scope) {
    console.log(`Scope: docs/${scopePrefix}`);
  }
  console.log(`Rules: ${RULES_FILE}`);
  console.log('');

  const files = await walkMarkdownFiles(scopeRoot);
  console.log(`Found ${files.length} markdown file(s)`);
  console.log('');

  let processed = 0;
  let changed = 0;
  let errors = 0;
  let warnings = 0;

  for (const absPath of files) {
    const relPath = relative(DOCS_DIR, absPath);
    const result = processFile(absPath, relPath, rules, args);
    processed++;
    if (!result.ok) errors++;
    if (result.changed) changed++;
    if (result.warnings) warnings += result.warnings;
  }

  console.log('');
  console.log('─'.repeat(60));
  console.log(`Processed: ${processed}`);
  if (!args.validateOnly) console.log(`Changed:   ${changed}`);
  console.log(`Warnings:  ${warnings}`);
  console.log(`Errors:    ${errors}`);

  if (args.validateOnly) {
    console.log('');
    if (warnings === 0 && errors === 0) {
      console.log('✓ Validation passed — no warnings or errors.');
    } else {
      console.log('Validation complete. See per-file output above.');
    }
  } else if (args.dryRun) {
    console.log('');
    console.log('Dry run complete. No files were modified.');
    console.log('Re-run without --dry-run to apply changes.');
  }

  // Exit code logic
  if (errors > 0) process.exit(1);
  if (args.strict && warnings > 0) process.exit(3);
  process.exit(0);
}

main().catch((err) => {
  console.error(`Unhandled error: ${err.stack || err.message}`);
  process.exit(1);
});
