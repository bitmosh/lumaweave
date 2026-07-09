// SPDX-License-Identifier: Apache-2.0
export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce((cursor: unknown, key) => {
    if (cursor !== null && typeof cursor === "object") {
      return (cursor as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
