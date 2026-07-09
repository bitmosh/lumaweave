// SPDX-License-Identifier: Apache-2.0
import type { LocaleCode } from "./types";
import { setManifest } from "./t";
import en from "./manifests/en.json" with { type: "json" };

type ManifestShape = typeof en;
const manifests: Record<LocaleCode, ManifestShape> = { en };

let _locale: LocaleCode = "en";

export function initializeLocale(locale: LocaleCode = "en"): void {
  _locale = locale;
  setManifest(manifests[locale]);
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
    document.documentElement.dir = "ltr";
  }
}

export function getLocale(): LocaleCode {
  return _locale;
}
