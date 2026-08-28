"use client";

import { Component, type ReactNode } from "react";

/**
 * Catches any runtime/WebGL error thrown inside the 3D scene so a GPU
 * hiccup (lost context, unsupported device, failed asset) never takes the whole
 * page down — the section simply shows a graceful fallback instead.
 */
export class SceneErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn("RestaurantScene error:", error);
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
