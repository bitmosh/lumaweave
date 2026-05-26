import type { CategoryDef } from './settingsPanel.types';

export const SETTINGS_PANEL_CATEGORIES: readonly CategoryDef[] = [
  {
    id: 'theme',
    label: 'Theme',
    description: 'Colors, visual style, and appearance tokens for the workspace.',
    iconPath: 'M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2a5 5 0 0 1 4.33 7.5H3.67A5 5 0 0 1 8 3zm-2.5 8a2.5 2.5 0 0 0 5 0H5.5z',
  },
  {
    id: 'typography',
    label: 'Typography',
    description: 'Font families, sizes, and text rendering options.',
    iconPath: 'M2 3h12v2H9v8H7V5H2V3zm3 5h6v2H5V8z',
  },
  {
    id: 'graph',
    label: 'Graph',
    description: 'Physics simulation, node sizing, label density, and graph view options.',
    iconPath: 'M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM5 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM5 6h6M8 5v6',
  },
  {
    id: 'inspector',
    label: 'Inspector',
    description: 'Node and edge inspector panel layout, spoke configuration, and detail depth.',
    iconPath: 'M10.5 2a4.5 4.5 0 1 0 2.12 8.48l2.2 2.2-1.06 1.06-2.2-2.2A4.5 4.5 0 0 0 10.5 2zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z',
  },
  {
    id: 'data-sources',
    label: 'Data Sources',
    description: 'Connected repositories, file watchers, and graph data ingestion settings.',
    iconPath: 'M8 2C5.24 2 3 3.12 3 4.5v7C3 12.88 5.24 14 8 14s5-1.12 5-2.5v-7C13 3.12 10.76 2 8 2zm0 2c1.93 0 3 .6 3 .5S9.93 5 8 5 5 4.4 5 4.5 6.07 4 8 4zm0 3C6.07 7 4 6.4 4 5.5v-1c.68.56 2.07.5 4 .5s3.32-.56 4 .5v1C12 6.4 9.93 7 8 7zm0 3C6.07 10 4 9.4 4 8.5v-1c.68.56 2.07 1 4 1s3.32-.44 4-1v1c0 .9-1.07 1.5-4 1.5zm0 2c-1.93 0-4-.6-4-1.5v-1c.68.56 2.07 1 4 1s3.32-.44 4-1v1c0 .9-1.07 1.5-4 1.5z',
  },
  {
    id: 'display',
    label: 'Display',
    description: 'Canvas layout, panel visibility, and workspace density preferences.',
    iconPath: 'M2 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2zm1 2h10v6H3V5zm4 8h2v1H7v-1z',
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    description: 'Motion reduction, contrast, focus indicators, and interaction preferences.',
    iconPath: 'M8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6 7l-3 1 .5 1.5 2.5-.8V12l-1.5 3h1.5l1-2 1 2H9l-1.5-3V8.7l2.5.8.5-1.5L8 7H6z',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Developer options, diagnostics, schema version, and experimental features.',
    iconPath: 'M8 1l1.5 2.5h3L10 6l1 3-3-1.5L5 9l1-3-2.5-2.5h3L8 1zm0 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-4 4h8v1H4v-1z',
  },
] as const;
