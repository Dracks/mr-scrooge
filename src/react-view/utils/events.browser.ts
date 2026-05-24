// Browser-compatible EventEmitter implementation
export interface EventMap {
  [key: string]: any;
}

export interface EventEmitter {
  on<E extends keyof EventMap>(event: E, listener: (data: EventMap[E]) => void): this;
  once<E extends keyof EventMap>(event: E, listener: (data: EventMap[E]) => void): this;
  off<E extends keyof EventMap>(event: E, listener: (data: EventMap[E]) => void): this;
  emit<E extends keyof EventMap>(event: E, data: EventMap[E]): boolean;
  removeAllListeners(event?: string): this;
}

export class EventEmitterClass {
  private events: Map<string, Array<(data: any) => void>> = new Map();

  on(event: string, listener: (data: any) => void): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
    return this;
  }

  once(event: string, listener: (data: any) => void): this {
    const onceWrapper = (data: any) => {
      listener(data);
      this.off(event, onceWrapper);
    };
    return this.on(event, onceWrapper);
  }

  off(event: string, listener: (data: any) => void): this {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }

  emit(event: string, data: any): boolean {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
      return true;
    }
    return false;
  }

  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }
}