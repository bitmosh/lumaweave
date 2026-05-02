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

  const initialSummary: ContractSummary = {
    totalActive: activeContracts.length,
    withHandleId: 0,
    missingHandleId: 0,
    withSettingsKey: 0,
    settingsKeyNull: 0,
    missingSettingsKey: 0,
    withRuntimeBinding: 0,
    missingRuntimeBinding: 0,
    withQaCoverage: 0,
    withPlaywrightCoverage: 0,
    missingDocs: 0,
    missingQa: 0,
    missingPlaywright: 0,
    missingPlaywrightBySurface: {
      topbar: [],
      graph: [],
      missionControl: [],
      settings: [],
    },
    highRisk: 0,
    bySurface: {
      topbar: 0,
      graph: 0,
      missionControl: 0,
      settings: 0,
    },
  };

  return activeContracts.reduce<ContractSummary>((acc, contract) => {
    acc.bySurface[contract.surface] += 1;

    if (contract.id) {
      acc.withHandleId += 1;
    } else {
      acc.missingHandleId += 1;
    }

    if (contract.settingsKey === null) {
      acc.settingsKeyNull += 1;
    } else if (typeof contract.settingsKey === "string" && contract.settingsKey.trim().length > 0) {
      acc.withSettingsKey += 1;
    } else {
      acc.missingSettingsKey += 1;
    }

    if (contract.runtimeBinding?.sourceFile && contract.runtimeBinding?.targetComponent) {
      acc.withRuntimeBinding += 1;
    } else {
      acc.missingRuntimeBinding += 1;
    }

    if (contract.qa.hasQaCoverage) {
      acc.withQaCoverage += 1;
    } else {
      acc.missingQa += 1;
    }

    if (contract.playwright.hasCoverage) {
      acc.withPlaywrightCoverage += 1;
    } else {
      acc.missingPlaywright += 1;
      acc.missingPlaywrightBySurface[contract.surface].push(contract);
    }

    if (!contract.docs.hasDocs) {
      acc.missingDocs += 1;
    }

    if (contract.risk === "high") {
      acc.highRisk += 1;
    }

    return acc;
  }, initialSummary);
}
