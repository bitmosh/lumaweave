// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect } from "react";

interface CollapsiblePanelProps {
  title: string;
  collapsedLabel: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

export function CollapsiblePanel({
  title,
  collapsedLabel,
  defaultExpanded = true,
  expanded: controlledExpanded,
  onExpandedChange,
  children,
  className = "",
}: CollapsiblePanelProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  // Use controlled state if provided, otherwise use internal uncontrolled state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  // Update internal state when defaultExpanded changes (for uncontrolled mode)
  useEffect(() => {
    if (controlledExpanded === undefined) {
      setInternalExpanded(defaultExpanded);
    }
  }, [defaultExpanded, controlledExpanded]);

  const handleToggle = () => {
    const newValue = !isExpanded;
    if (onExpandedChange) {
      onExpandedChange(newValue);
    } else {
      setInternalExpanded(newValue);
    }
  };

  return (
    <div className={className}>
      <div className="rounded-lg border border-cyan-400/20 bg-slate-900/80 shadow-xl backdrop-blur-sm">
        <button
          onClick={handleToggle}
          className="flex w-full items-center justify-between px-3 py-2 text-start transition-colors hover:bg-slate-800/50"
        >
          <span className="text-sm font-semibold text-cyan-200">
            {isExpanded ? title : collapsedLabel}
          </span>
          <svg
            className={`h-4 w-4 transform transition-transform text-cyan-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isExpanded && (
          <div className="min-h-0 overflow-y-auto max-h-[500px] p-3 border-t border-cyan-400/10">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
