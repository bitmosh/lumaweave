export type CommandContext = {
    openSettings: () => void;
    fitGraph: () => void;
    resetView: () => void;
  };
  
  export type StarmapCommand = {
    id: string;
    title: string;
    category: string;
    shortcut?: string;
    featureFlag?: string;
    run: (ctx: CommandContext) => void;
  };