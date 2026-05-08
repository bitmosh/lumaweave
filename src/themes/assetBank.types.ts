/**
 * Asset Bank Schema
 * 
 * Defines the shape of the asset registry and asset entries.
 * This schema is forward-compatible for v88 Workshop features.
 */

export type AssetType =
  | "texture"
  | "shader"
  | "animation"
  | "sound-pack"
  | "font-pack"
  | "icon-pack"
  | "particle-system";

export type AssetFamily = string; // theme id or "shared"

export interface AssetEntry {
  /** Unique asset identifier */
  id: string;
  /** Asset type category */
  type: AssetType;
  /** Theme family (theme id or "shared" for cross-theme assets) */
  family: AssetFamily;
  /** Tags for search and categorization */
  tags: string[];
  /** URL to the media file */
  mediaUrl: string;
  /** Optional thumbnail URL */
  thumbnail?: string;
  /** Theme id where this asset originated */
  sourceTheme: string;
  /** If this is a remix, the original asset id */
  remixOf?: string;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
  /** License information */
  license?: string;
  /** Human-readable description */
  description?: string;
}

export interface AssetRegistry {
  /** List all assets in the bank */
  list(): AssetEntry[];
  
  /** Get a single asset by ID */
  getById(id: string): AssetEntry | undefined;
  
  /** Filter assets by category criteria */
  filterByCategory(query: { type?: AssetType; family?: AssetFamily; tags?: string[] }): AssetEntry[];
  
  /** Validate that an entry matches the expected shape */
  validateShape(entry: unknown): { valid: boolean; errors?: string[] };
  
  /** Register a new asset */
  register(entry: AssetEntry): void;
}
