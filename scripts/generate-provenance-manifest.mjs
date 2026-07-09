#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * Generate Provenance Manifest
 *
 * Walks src/**\/*.tsx, finds JSX elements with data-lw-theme-target string
 * literal attributes, and writes source location + snippet to
 * src/themes/provenance-manifest.json.
 *
 * Run: npm run generate-provenance
 */

import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

const TARGET_ATTR = "data-lw-theme-target";
const SNIPPET_LINES_BEFORE = 3;
const SNIPPET_LINES_AFTER = 3;

async function main() {
  const tsxFiles = await glob("src/**/*.tsx", { cwd: process.cwd() });
  const manifest = {};
  const skipped = [];

  for (const filePath of tsxFiles) {
    const source = fs.readFileSync(filePath, "utf-8");
    const sourceFile = ts.createSourceFile(
      filePath,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    visit(sourceFile, source, filePath, manifest, skipped);
  }

  const outputPath = "src/themes/provenance-manifest.json";
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + "\n");

  console.log(`Wrote ${Object.keys(manifest).length} entries to ${outputPath}`);
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} dynamic/non-string attributes:`);
    for (const s of skipped) console.log(`  ${s}`);
  }
}

function visit(node, source, filePath, manifest, skipped) {
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
    const result = extractTargetAttr(node, filePath, skipped);
    if (result) {
      // For JsxElement, use the opening tag's range only — the full element
      // may span the entire component (e.g., app.shell wraps all of AppShell).
      const anchorNode = ts.isJsxElement(node) ? node.openingElement : node;
      const { startLine, endLine } = getLineRange(anchorNode, source);
      const snippet = extractSnippet(source, startLine, endLine);
      manifest[result] = {
        filePath: path.relative(process.cwd(), filePath).replace(/\\/g, "/"),
        startLine,
        endLine,
        snippet,
      };
    }
  }
  ts.forEachChild(node, (child) => visit(child, source, filePath, manifest, skipped));
}

function extractTargetAttr(node, filePath, skipped) {
  const attrs = ts.isJsxSelfClosingElement(node)
    ? node.attributes.properties
    : node.openingElement.attributes.properties;

  for (const attr of attrs) {
    if (ts.isJsxAttribute(attr) && attr.name.getText() === TARGET_ATTR) {
      if (attr.initializer && ts.isStringLiteral(attr.initializer)) {
        return attr.initializer.text;
      } else if (attr.initializer) {
        // Dynamic attribute — skip and flag
        const pos = attr.getStart();
        skipped.push(`${filePath}:${pos} (dynamic value)`);
      }
    }
  }
  return null;
}

function getLineRange(node, source) {
  const startPos = node.getStart();
  const endPos = node.getEnd();
  const lines = source.split("\n");
  let startLine = 1;
  let endLine = 1;
  let pos = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1;
    if (pos <= startPos && startPos < pos + lineLength) startLine = i + 1;
    if (pos <= endPos && endPos < pos + lineLength) {
      endLine = i + 1;
      break;
    }
    pos += lineLength;
  }
  return { startLine, endLine };
}

function extractSnippet(source, startLine, endLine) {
  const lines = source.split("\n");
  const snippetStart = Math.max(0, startLine - 1 - SNIPPET_LINES_BEFORE);
  const snippetEnd = Math.min(lines.length, endLine + SNIPPET_LINES_AFTER);
  return lines.slice(snippetStart, snippetEnd).join("\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
