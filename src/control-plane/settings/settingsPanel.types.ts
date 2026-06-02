export type CategoryId =
  | 'theme'
  | 'typography'
  | 'graph'
  | 'inspector'
  | 'data-sources'
  | 'display'
  | 'accessibility'
  | 'advanced';

export type PanelPosition =
  | 'floating'
  | 'docked-left'
  | 'docked-right'
  | 'minimized';

export interface CategoryContentProps {
  onDrillIn?: () => void;
  onDrillOut?: () => void;
}

export interface CategoryDef {
  id: CategoryId;
  label: string;
  description: string;
  icon: import('lucide-react').LucideIcon;
  content: React.ComponentType<CategoryContentProps>;
  richContent?: boolean;
}

export interface SettingsPanelGeometry {
  left: number;
  top: number;
  width: number;
  height: number;
  minimized?: boolean;
  position?: PanelPosition;
}

export interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  initialRect?: SettingsPanelGeometry;
  onPositionChange?: (p: PanelPosition) => void;
  opacity: number;
  headerSlot?: React.ReactNode;
  sidebarSlot: React.ReactNode;
  contentSlot: React.ReactNode;
  statusBarSlot: React.ReactNode;
}
