/**
 * Source Adapter Registry
 * 
 * A searchable registry of source adapters that translate external data sources
 * into the normalized LumaWeave graph format.
 * 
 * Contract: docs/source-adapter/SOURCE_ADAPTER_OS_CONTRACT.md
 */

// Adapter Types
export type SourceAdapterType =
  | "self-graph"
  | "git-codebase"
  | "website-url"
  | "markdown-vault"
  | "openapi-spec"
  | "database-schema"
  | "package-dependency"
  | "cloud-infrastructure"
  | "issue-tracker";

// Input Pattern Types
export type InputPatternType = "url" | "path" | "manifest" | "schema";

// Confidence Types
export type ConfidenceType = "observed" | "inferred" | "ai-inferred";

// Adapter Status
export type AdapterStatus = "candidate" | "registered" | "validated" | "accepted" | "active";

// Input Pattern
export interface InputPattern {
  type: InputPatternType;
  pattern: string;
  examples: string[];
}

// Translation Set
export interface TranslationSet {
  nodeMappings: Record<string, string>;
  edgeMappings: Record<string, string>;
  defaultConfidence: ConfidenceType;
}

// Safety Limits
export interface SafetyLimits {
  maxNodes?: number;
  maxEdges?: number;
  maxDepth?: number;
  maxFileSize?: number;
  timeoutMs?: number;
}

// QA Report Format
export interface QAReportFormat {
  requiredFields: string[];
}

// Source Adapter Entry (matches v74a contract schema)
export interface SourceAdapterEntry {
  // Identity
  adapterId: string;
  adapterType: SourceAdapterType;
  adapterVersion: string;
  
  // Source detection
  inputPattern: InputPattern;
  
  // Translation set
  translationSet: TranslationSet;
  
  // Safety limits
  limits: SafetyLimits;
  
  // QA report format
  qaReportFormat: QAReportFormat;
  
  // Status
  status: AdapterStatus;
  
  // Governance
  contractVersion: string;
  lastUpdated: string;
}

// Static entries (synthetic/planned adapters from catalog)
const SOURCE_ADAPTER_ENTRIES: readonly SourceAdapterEntry[] = [
  {
    adapterId: "self-graph-yaml-frontmatter",
    adapterType: "self-graph",
    adapterVersion: "0.1.0",
    inputPattern: {
      type: "path",
      pattern: "**/*.md",
      examples: ["docs/overview/DOCS_INDEX.md", "docs/agent/brain/23_BANDIT_CURRENT_TITLE.md"],
    },
    translationSet: {
      nodeMappings: {
        "markdown-file": "doc.contract",
        "yaml-frontmatter": "doc.metadata",
      },
      edgeMappings: {
        "depends_on": "governs",
        "implements": "implements",
        "tested_by": "tested_by",
      },
      defaultConfidence: "observed",
    },
    limits: {
      maxNodes: 500,
      maxEdges: 2000,
      maxDepth: 3,
      maxFileSize: 10485760, // 10MB
      timeoutMs: 30000,
    },
    qaReportFormat: {
      requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"],
    },
    status: "registered",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
  },
  {
    adapterId: "git-codebase",
    adapterType: "git-codebase",
    adapterVersion: "0.1.0",
    inputPattern: {
      type: "path",
      pattern: ".git",
      examples: ["/home/user/project/.git"],
    },
    translationSet: {
      nodeMappings: {
        "file": "code.file",
        "function": "code.function",
        "class": "code.symbol",
        "commit": "code.commit",
      },
      edgeMappings: {
        "import": "imports",
        "call": "calls",
        "define": "defines",
        "export": "exports",
      },
      defaultConfidence: "observed",
    },
    limits: {
      maxNodes: 10000,
      maxEdges: 50000,
      maxDepth: 5,
      maxFileSize: 104857600, // 100MB
      timeoutMs: 60000,
    },
    qaReportFormat: {
      requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"],
    },
    status: "candidate",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
  },
  {
    adapterId: "website-url",
    adapterType: "website-url",
    adapterVersion: "0.1.0",
    inputPattern: {
      type: "url",
      pattern: "^https?://",
      examples: ["https://example.com", "https://docs.example.com/api"],
    },
    translationSet: {
      nodeMappings: {
        "html-page": "website.page",
        "heading": "website.heading",
        "link": "website.asset",
      },
      edgeMappings: {
        "href": "links_to",
        "canonical": "canonicalizes_to",
      },
      defaultConfidence: "observed",
    },
    limits: {
      maxNodes: 1000,
      maxEdges: 5000,
      maxDepth: 3,
      maxFileSize: 5242880, // 5MB
      timeoutMs: 30000,
    },
    qaReportFormat: {
      requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"],
    },
    status: "candidate",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
  },
  {
    adapterId: "markdown-vault",
    adapterType: "markdown-vault",
    adapterVersion: "0.1.0",
    inputPattern: {
      type: "path",
      pattern: "**/*.md",
      examples: ["vault/Note.md", "docs/README.md"],
    },
    translationSet: {
      nodeMappings: {
        "note": "markdown.note",
        "heading": "markdown.heading",
        "tag": "markdown.tag",
      },
      edgeMappings: {
        "wiki-link": "links_to",
        "tag": "tagged_as",
        "mention": "mentions",
      },
      defaultConfidence: "observed",
    },
    limits: {
      maxNodes: 2000,
      maxEdges: 10000,
      maxDepth: 4,
      maxFileSize: 52428800, // 50MB
      timeoutMs: 45000,
    },
    qaReportFormat: {
      requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"],
    },
    status: "candidate",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
  },
  {
    adapterId: "openapi-spec",
    adapterType: "openapi-spec",
    adapterVersion: "0.1.0",
    inputPattern: {
      type: "schema",
      pattern: "**/*.{json,yaml,yml}",
      examples: ["openapi.json", "api-spec.yaml"],
    },
    translationSet: {
      nodeMappings: {
        "endpoint": "api.endpoint",
        "schema": "api.schema",
        "method": "api.method",
      },
      edgeMappings: {
        "response-schema": "returns_schema",
        "request-schema": "uses_schema",
        "security": "requires_auth",
      },
      defaultConfidence: "observed",
    },
    limits: {
      maxNodes: 500,
      maxEdges: 2000,
      maxDepth: 3,
      maxFileSize: 1048576, // 1MB
      timeoutMs: 15000,
    },
    qaReportFormat: {
      requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"],
    },
    status: "candidate",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
  },
  {
    adapterId: "database-schema",
    adapterType: "database-schema",
    adapterVersion: "0.1.0",
    inputPattern: {
      type: "schema",
      pattern: "**/*.{sql,prisma}",
      examples: ["schema.sql", "schema.prisma"],
    },
    translationSet: {
      nodeMappings: {
        "table": "db.table",
        "column": "db.column",
        "index": "db.index",
        "constraint": "db.constraint",
      },
      edgeMappings: {
        "foreign-key": "foreign_key_to",
        "index": "indexed_by",
      },
      defaultConfidence: "observed",
    },
    limits: {
      maxNodes: 1000,
      maxEdges: 5000,
      maxDepth: 3,
      maxFileSize: 10485760, // 10MB
      timeoutMs: 30000,
    },
    qaReportFormat: {
      requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"],
    },
    status: "candidate",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
  },
  {
    adapterId: "package-dependency",
    adapterType: "package-dependency",
    adapterVersion: "0.1.0",
    inputPattern: {
      type: "manifest",
      pattern: "**/{package.json,Cargo.toml,pyproject.toml,go.mod}",
      examples: ["package.json", "Cargo.toml"],
    },
    translationSet: {
      nodeMappings: {
        "package": "code.package",
        "version": "code.version",
        "license": "code.license",
      },
      edgeMappings: {
        "dependency": "depends_on",
        "dev-dependency": "dev_depends_on",
        "peer-dependency": "transitive_depends_on",
      },
      defaultConfidence: "observed",
    },
    limits: {
      maxNodes: 500,
      maxEdges: 2000,
      maxDepth: 5,
      maxFileSize: 1048576, // 1MB
      timeoutMs: 15000,
    },
    qaReportFormat: {
      requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"],
    },
    status: "candidate",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
  },
  {
    adapterId: "cloud-infrastructure",
    adapterType: "cloud-infrastructure",
    adapterVersion: "0.1.0",
    inputPattern: {
      type: "manifest",
      pattern: "**/*.{tf,yaml,yml}",
      examples: ["main.tf", "infrastructure.yaml"],
    },
    translationSet: {
      nodeMappings: {
        "service": "infra.service",
        "container": "infra.container",
        "bucket": "infra.storage",
        "role": "infra.role",
      },
      edgeMappings: {
        "depends": "depends_on",
        "connects": "connects_to",
        "assumes": "assumes_role",
      },
      defaultConfidence: "observed",
    },
    limits: {
      maxNodes: 2000,
      maxEdges: 10000,
      maxDepth: 4,
      maxFileSize: 5242880, // 5MB
      timeoutMs: 45000,
    },
    qaReportFormat: {
      requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"],
    },
    status: "candidate",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
  },
  {
    adapterId: "issue-tracker",
    adapterType: "issue-tracker",
    adapterVersion: "0.1.0",
    inputPattern: {
      type: "url",
      pattern: "^https?://(github|linear|jira)\\.",
      examples: ["https://github.com/org/repo/issues", "https://linear.app/team/issues"],
    },
    translationSet: {
      nodeMappings: {
        "issue": "issue.tracker.issue",
        "epic": "issue.tracker.epic",
        "milestone": "issue.tracker.milestone",
        "owner": "issue.tracker.owner",
      },
      edgeMappings: {
        "blocks": "blocks",
        "duplicate": "duplicates",
        "assignee": "assigned_to",
      },
      defaultConfidence: "observed",
    },
    limits: {
      maxNodes: 1000,
      maxEdges: 5000,
      maxDepth: 3,
      maxFileSize: 1048576, // 1MB
      timeoutMs: 30000,
    },
    qaReportFormat: {
      requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"],
    },
    status: "candidate",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
  },
] as const;

// Helper functions
export function getAllSourceAdapterEntries(): readonly SourceAdapterEntry[] {
  return SOURCE_ADAPTER_ENTRIES;
}

export function getSourceAdapterEntryById(adapterId: string): SourceAdapterEntry | undefined {
  return SOURCE_ADAPTER_ENTRIES.find((entry) => entry.adapterId === adapterId);
}

export function getSourceAdapterEntriesByType(adapterType: SourceAdapterType): SourceAdapterEntry[] {
  return SOURCE_ADAPTER_ENTRIES.filter((entry) => entry.adapterType === adapterType);
}

export function getSourceAdapterEntriesByStatus(status: AdapterStatus): SourceAdapterEntry[] {
  return SOURCE_ADAPTER_ENTRIES.filter((entry) => entry.status === status);
}

export function getSourceAdapterEntriesByContractVersion(contractVersion: string): SourceAdapterEntry[] {
  return SOURCE_ADAPTER_ENTRIES.filter((entry) => entry.contractVersion === contractVersion);
}
