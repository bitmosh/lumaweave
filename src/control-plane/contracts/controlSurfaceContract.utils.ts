/**
 * Control Surface Contract Utilities
 * 
 * This file provides utility functions for querying the contract registry.
 * These functions are used by tests, Mission Control debug display, or docs generation.
 */

import type { ContractSummary, ControlSurface } from "./controlSurfaceContract.types";
import { controlSurfaceContractRegistry } from "./controlSurfaceContract.registry";

/**
 * Get all active control contracts from the registry
 */
export function getActiveControlContracts() {
  return controlSurfaceContractRegistry.contracts.filter(
    (contract) => contract.status === "active"
  );
}

/**
 * Get contracts by surface (topbar, graph, missionControl, settings)
 */
export function getContractsBySurface(surface: ControlSurface) {
  return getActiveControlContracts().filter(
    (contract) => contract.surface === surface
  );
}

/**
 * Find contracts missing QA coverage
 */
export function findContractsMissingQa() {
  return getActiveControlContracts().filter(
    (contract) => !contract.qa.hasQaCoverage
  );
}

/**
 * Find contracts missing documentation
 */
export function findContractsMissingDocs() {
  return getActiveControlContracts().filter(
    (contract) => !contract.docs.hasDocs
  );
}

/**
 * Find contracts missing Playwright coverage
 */
export function findContractsMissingPlaywright() {
  return getActiveControlContracts().filter(
    (contract) => !contract.playwright.hasCoverage
  );
}

/**
 * Generate a summary of the contract registry
 */
export function generateContractSummary(): ContractSummary {
  const activeContracts = getActiveControlContracts();
  
  return {
    totalActive: activeContracts.length,
    withQaCoverage: activeContracts.filter((c) => c.qa.hasQaCoverage).length,
    withPlaywrightCoverage: activeContracts.filter((c) => c.playwright.hasCoverage).length,
    missingDocs: activeContracts.filter((c) => !c.docs.hasDocs).length,
    missingQa: activeContracts.filter((c) => !c.qa.hasQaCoverage).length,
    missingPlaywright: activeContracts.filter((c) => !c.playwright.hasCoverage).length,
    highRisk: activeContracts.filter((c) => c.risk === "high").length,
    bySurface: {
      topbar: getContractsBySurface("topbar").length,
      graph: getContractsBySurface("graph").length,
      missionControl: getContractsBySurface("missionControl").length,
      settings: getContractsBySurface("settings").length,
    },
  };
}
