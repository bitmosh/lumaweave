export interface CommandEntry {
  id: string;
  label: string;
  category: string;
  execute: () => void;
  featureFlag?: string;
}
