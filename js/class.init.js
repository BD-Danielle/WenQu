class WenQuInitializer {
  static #instance = null;
  #formInstances = null;
  #observer = null;

  constructor() {
    if (WenQuInitializer.#instance) {
      return WenQuInitializer.#instance;
    }
    this.#formInstances = new WeakMap();
    WenQuInitializer.#instance = this;
    this.#init();
  }

  #init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.#waitForWQForm();
      });
    } else {
      this.#waitForWQForm();
    }
  }

  #waitForWQForm() {
    if (window.wq_form?.form) {
      this.#initializeComponents();
    } else {
      setTimeout(() => this.#waitForWQForm(), 100);
    }
  }

  #initializeComponents() {
    try {
      if (this.#observer) {
        this.#observer.disconnect();
      }

      this.#observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const form = entry.target;
            if (!this.#formInstances.has(form)) {
              if (!form.hasAttribute('data-initialized')) {
                form.setAttribute('data-initialized', 'true');
                this.#formInstances.set(form, true);
              }
            }
            this.#observer.unobserve(form);
          }
        });
      });

      document.querySelectorAll('.wq-form:not([data-initialized])').forEach(form => {
        this.#observer.observe(form);
      });
    } catch (error) {
      console.error('Component initialization error:', error);
    }
  }

  destroy() {
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }
    this.#formInstances = new WeakMap();
  }
}

// 創建單例實例
const wenQuInit = new WenQuInitializer();
