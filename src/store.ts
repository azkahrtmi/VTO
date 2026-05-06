type Style = 'classic' | 'round' | 'visor' | 'custom';

class Store {
  private style: Style = 'classic';
  private listeners: Set<(style: Style) => void> = new Set();

  getStyle() {
    return this.style;
  }

  setStyle(style: Style) {
    this.style = style;
    this.listeners.forEach((l) => l(style));
  }

  subscribe(listener: (style: Style) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const appStore = new Store();
