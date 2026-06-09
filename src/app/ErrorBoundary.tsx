import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Best-effort logging; do not throw from this method
    console.error("[LumaWeave] Uncaught error in React tree:", error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleResetSettings = (): void => {
    try {
      localStorage.removeItem("lumaweave-settings");
    } catch (err) {
      console.error("[LumaWeave] Reset failed:", err);
    }
    window.location.reload();
  };

  private handleCopyError = async (): Promise<void> => {
    const { error, errorInfo } = this.state;
    const text = [
      error?.message ?? "Unknown error",
      "",
      error?.stack ?? "(no stack trace)",
      "",
      errorInfo?.componentStack ?? "(no component stack)",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("[LumaWeave] Copy to clipboard failed:", err);
    }
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="lw-error-boundary" data-testid="error-boundary-recovery">
        <div className="lw-error-boundary-card">
          <div className="lw-error-boundary-icon" aria-hidden>⚠</div>
          <h1 className="lw-error-boundary-title">Something went wrong</h1>
          <p className="lw-error-boundary-body">
            LumaWeave encountered an unexpected error.
          </p>
          <div className="lw-error-boundary-actions">
            <button
              type="button"
              data-testid="error-boundary-reload"
              onClick={this.handleReload}
              className="lw-error-boundary-button lw-error-boundary-button-primary"
            >
              Reload App
            </button>
            <button
              type="button"
              data-testid="error-boundary-reset"
              onClick={this.handleResetSettings}
              className="lw-error-boundary-button"
            >
              Reset Settings
            </button>
            <button
              type="button"
              data-testid="error-boundary-copy"
              onClick={this.handleCopyError}
              className="lw-error-boundary-button-text"
            >
              Copy error details
            </button>
          </div>
        </div>
      </div>
    );
  }
}
