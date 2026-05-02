/**
 * Handleset Utilities
 * 
 * Utility functions for querying the handleset registry.
 */

import type { HandlesetEntry, HandleStatus, HandleCategory } from "./handleset.types";
import { handlesetRegistry } from "./handleset.registry";

/**
 * Get handles by status
 */
export function getHandlesByStatus(status: HandleStatus): HandlesetEntry[] {
  return handlesetRegistry.entries.filter((entry) => entry.status === status);
}

/**
 * Get handles by category
 */
export function getHandlesByCategory(category: HandleCategory): HandlesetEntry[] {
  return handlesetRegistry.entries.filter((entry) => entry.category === category);
}

/**
 * Get all active handles
 */
export function getActiveHandles(): HandlesetEntry[] {
  return getHandlesByStatus("active");
}

/**
 * Get all partial handles
 */
export function getPartialHandles(): HandlesetEntry[] {
  return getHandlesByStatus("partial");
}

/**
 * Get all planned handles
 */
export function getPlannedHandles(): HandlesetEntry[] {
  return getHandlesByStatus("planned");
}

/**
 * Find a handle by its handle path
 */
export function findHandle(handle: string): HandlesetEntry | undefined {
  return handlesetRegistry.entries.find((entry) => entry.handle === handle);
}

/**
 * Get all handles (alias for registry.entries)
 */
export function getAllHandles(): HandlesetEntry[] {
  return handlesetRegistry.entries;
}
