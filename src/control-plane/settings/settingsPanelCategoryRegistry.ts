// SPDX-License-Identifier: Apache-2.0
import type { CategoryDef } from './settingsPanel.types';
import {
  Palette,
  Type,
  Share2,
  SearchCode,
  Database,
  Monitor,
  Accessibility,
  Settings2,
  Bot,
} from 'lucide-react';
import { CategoryTheme } from './categories/CategoryTheme';
import { CategoryTypography } from './categories/CategoryTypography';
import { CategoryGraph } from './categories/CategoryGraph';
import { CategoryInspector } from './categories/CategoryInspector';
import { CategoryDataSources } from './categories/CategoryDataSources';
import { CategoryDisplay } from './categories/CategoryDisplay';
import { CategoryAccessibility } from './categories/CategoryAccessibility';
import { CategoryAgents } from './categories/CategoryAgents';
import { CategoryAdvanced } from './categories/CategoryAdvanced';

export const SETTINGS_PANEL_CATEGORIES: readonly CategoryDef[] = [
  {
    id: 'theme',
    label: 'Theme',
    description: 'Colors, visual style, and appearance tokens for the workspace.',
    icon: Palette,
    content: CategoryTheme,
    richContent: true,
  },
  {
    id: 'typography',
    label: 'Typography',
    description: 'Font families, sizes, and text rendering options.',
    icon: Type,
    content: CategoryTypography,
  },
  {
    id: 'graph',
    label: 'Graph',
    description: 'Physics simulation, node sizing, label density, and graph view options.',
    icon: Share2,
    content: CategoryGraph,
  },
  {
    id: 'inspector',
    label: 'Inspector',
    description: 'Node and edge inspector panel layout, spoke configuration, and detail depth.',
    icon: SearchCode,
    content: CategoryInspector,
  },
  {
    id: 'data-sources',
    label: 'Data Sources',
    description: 'Connected repositories, file watchers, and graph data ingestion settings.',
    icon: Database,
    content: CategoryDataSources,
  },
  {
    id: 'display',
    label: 'Display',
    description: 'Canvas layout, panel visibility, and workspace density preferences.',
    icon: Monitor,
    content: CategoryDisplay,
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    description: 'Motion reduction, contrast, focus indicators, and interaction preferences.',
    icon: Accessibility,
    content: CategoryAccessibility,
  },
  {
    id: 'agents',
    label: 'Agents',
    description: 'Configure the inference backend for the agent chat tile.',
    icon: Bot,
    content: CategoryAgents,
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Developer options, diagnostics, schema version, and experimental features.',
    icon: Settings2,
    content: CategoryAdvanced,
  },
] as const;
