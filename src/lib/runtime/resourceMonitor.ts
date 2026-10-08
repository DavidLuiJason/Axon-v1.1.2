export type ResourcePressureLevel = 'elevated' | 'nominal' | 'throttled';

export interface ResourceState {
  baseConcurrency: number;
  currentConcurrencyLimit: number;
  isUserInteracting: boolean;
  isAppVisible: boolean;
  pressureLevel: ResourcePressureLevel;
}

export class ResourceMonitor {
  private listeners: Set<(state: ResourceState) => void> = new Set();
  private state: ResourceState = {
    baseConcurrency: 2,
    currentConcurrencyLimit: 2,
    isUserInteracting: false,
    isAppVisible: true,
    pressureLevel: 'nominal',
  };

  public subscribe(listener: (state: ResourceState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): ResourceState {
    return { ...this.state };
  }

  public setPressure(level: ResourcePressureLevel): void {
    this.state.pressureLevel = level;
    if (level === 'throttled') {
      this.state.currentConcurrencyLimit = 1;
    } else {
      this.state.currentConcurrencyLimit = this.state.baseConcurrency;
    }
    this.notify();
  }

  public destroy(): void {
    this.listeners.clear();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.getState());
      } catch {
        // Ignore subscriber errors
      }
    }
  }
}
