import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled React UI Error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#0d0b14",
          color: "#f2effb",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "24px",
          textAlign: "center",
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "40px 32px",
            maxWidth: "480px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "#ffffff" }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: "14px", color: "#a5a3b5", lineHeight: 1.6, marginBottom: "24px" }}>
              An unexpected error occurred in the application view. Please reload the page to restore your session.
            </p>
            {this.state.error?.message && (
              <pre style={{
                background: "rgba(0, 0, 0, 0.4)",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#ff6c6c",
                textAlign: "left",
                overflowX: "auto",
                marginBottom: "24px",
                maxHeight: "120px",
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              style={{
                background: "linear-gradient(135deg, #5b6cff, #7c5cf6)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1.0")}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
