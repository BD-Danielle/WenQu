export class EventManager {
  constructor() {
    this.events = new Map();
  }

  // 註冊事件
  on(eventName, handler, context = null) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push({ handler, context });
  }

  // 觸發事件
  emit(eventName, data) {
    if (!this.events.has(eventName)) return;

    this.events.get(eventName).forEach(({ handler, context }) => {
      handler.call(context, data);
    });
  }

  // 移除事件
  off(eventName, handler) {
    if (!this.events.has(eventName)) return;

    if (handler) {
      const handlers = this.events.get(eventName);
      this.events.set(eventName,
        handlers.filter(h => h.handler !== handler)
      );
    } else {
      this.events.delete(eventName);
    }
  }

  // 清理所有事件
  clear() {
    this.events.clear();
  }
}

// 為了向後相容，也可以掛載到 window 對象
if (typeof window !== 'undefined') {
  window.EventManager = EventManager;
}