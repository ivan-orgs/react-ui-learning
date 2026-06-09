import { Component, type ErrorInfo, type ReactNode } from "react";
import { Surface } from "../ui/Surface";

interface ErrorBoundaryState {
  error?: Error;
}

// Concept: class component ErrorBoundary.
// What it means: React error boundaries must be class components today.
// Seen in app: App wraps route content so component crashes show a fallback card.
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  // Concept: getDerivedStateFromError.
  // What it means: convert a thrown render error into state so fallback UI can render.
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Component error boundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <Surface title="Component failed">
          <p role="alert">{this.state.error.message}</p>
        </Surface>
      );
    }

    return this.props.children;
  }
}


