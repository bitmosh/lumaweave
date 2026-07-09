// SPDX-License-Identifier: Apache-2.0
export type LocaleCode = "en";

export type NestedStringRecord = {
  [key: string]: string | NestedStringRecord;
};

export type TranslationManifest = NestedStringRecord;
