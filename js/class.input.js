// 確保 WQ 命名空間存在
if (typeof WQ === 'undefined') {
  window.WQ = {
    ValidationRules: {
      // 保持原有的默認規則不變
      chi: {
        pattern: /^[\u4e00-\u9fa5\u3400-\u4db5]+$/,
        message: '格式錯誤，僅可輸入中文字'
      },
      chi_eng: {
        pattern: /^[a-zA-Z\u4e00-\u9fa5\u3400-\u4db5]+$/,
        message: '格式錯誤，僅可輸入中文或英文'
      },
      num: {
        pattern: /^\d+[.]?\d*$/,
        message: '格式錯誤，僅可輸入數字'
      }
    }
  };
}

class wqInput {
  // 私有屬性聲明
  #input = null;
  #iconX = null;
  #fadeTimer = null;
  #eventHandlers = new Map();

  // 私有方法聲明
  #appendIconX;
  #bindEvents;
  #triggerEvent;
  #handleEmptyValue;
  #validateCustomPattern;
  #validateFormat;
  #clearErrorState;

  constructor(elem, options = {}) {
    // 初始化私有方法
    this.#appendIconX = () => {
      // 原有的 appendIconX 邏輯
      const existingIconX = this.#input.nextElementSibling?.matches('.wq-iconx');
      if (existingIconX) {
        this.#iconX = this.#input.nextElementSibling;
      } else {
        this.#iconX = document.createElement('span');
        this.#iconX.className = 'wq-iconx';
        this.#iconX.textContent = '';

        this.#iconX.style.display = 'none';
        this.#iconX.style.opacity = '0';

        this.#input.insertAdjacentElement('afterend', this.#iconX);

        this.#iconX.addEventListener('click', (event) => {
          event.preventDefault();
          this.hideIconX();
          this.#input.value = '';
          this.#input.focus();
        });
      }
    };

    this.#bindEvents = () => {
      // 原有的 bindEvents 邏輯
      this.#input.addEventListener('focus', () => {
        this.#input.classList.remove('error');
        if (this.#input.value.length > 0) {
          this.showIconX();
        }
      });

      this.#input.addEventListener('click', () => {
        this.#input.classList.remove('error');
        if (this.#input.value.length > 0) {
          this.showIconX();
        }
      });

      this.#input.addEventListener('blur', () => {
        this.hideIconX();
        if (this.#input.value.length === 0) {
          this.#input.classList.add('error');
        }
      });

      this.#input.addEventListener('input', () => {
        if (this.#input.value.length > 0) {
          this.showIconX();
        } else {
          this.hideIconX();
        }
      });

      this.#input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          return false;
        }
      });
    };

    this.#triggerEvent = (eventName, data) => {
      if (this.#eventHandlers.has(eventName)) {
        this.#eventHandlers.get(eventName).forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            console.error(`Error in ${eventName} handler:`, error);
          }
        });
      }
    };

    this.#handleEmptyValue = (result) => {
      result.valid = false;
      result.errMsg = '';
      this.#input.value = '';
      this.#input.classList.add('error');
      return result;
    };

    this.#validateCustomPattern = (value, pattern, message, result) => {
      try {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          result.valid = false;
          result.errMsg = message || '格式錯誤';
          this.#input.classList.add('error');
          this.showError(result.errMsg);
        } else {
          this.#clearErrorState();
        }
      } catch (e) {
        console.error('Invalid regular expression:', e);
      }
      return result;
    };

    this.#validateFormat = (value, format, result) => {
      const rule = WQ.ValidationRules[format];
      if (rule) {
        if (!rule.pattern.test(value)) {
          result.valid = false;
          result.errMsg = rule.message;
          this.#input.classList.add('error');
          this.showError(result.errMsg);
        } else {
          this.#clearErrorState();
        }
      }
      return result;
    };

    this.#clearErrorState = () => {
      this.#input.classList.remove('error');
      this.hideError();
    };

    // 構造函數原有邏輯
    this.#input = (typeof elem === 'string') ?
      document.querySelector(elem) :
      (elem instanceof Element ? elem : null);

    if (!this.#input) {
      throw new Error('Invalid input element');
    }

    this.options = {
      showClearButton: true,
      validateOnBlur: true,
      ...options
    };

    this.#appendIconX();
    this.#bindEvents();
    this.defaultName();
  }

  // 添加回原有的公共方法
  defaultName() {
    const defaultValue = this.#input.dataset.value;
    if (defaultValue) {
      this.#input.value = defaultValue;
    }
  }

  showIconX() {
    if (this.#fadeTimer) {
      clearTimeout(this.#fadeTimer);
      this.#fadeTimer = null;
    }

    this.#iconX.style.display = 'inline-block';

    requestAnimationFrame(() => {
      this.#iconX.style.transition = 'opacity 100ms ease-in';
      this.#iconX.style.opacity = '1';
    });
  }

  hideIconX() {
    this.#iconX.style.transition = 'opacity 500ms ease-out';
    this.#iconX.style.opacity = '0';

    this.#fadeTimer = setTimeout(() => {
      this.#iconX.style.display = 'none';
      this.#fadeTimer = null;
    }, 500);
  }

  showError(message) {
    this.hideError();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    this.#input.parentElement.appendChild(errorDiv);
  }

  hideError() {
    const errorMessage = this.#input.parentElement.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  // 新增：事件監聽方法，不影響原有功能
  on(eventName, handler) {
    if (!this.#eventHandlers.has(eventName)) {
      this.#eventHandlers.set(eventName, new Set());
    }
    this.#eventHandlers.get(eventName).add(handler);
    return this; // 支持鏈式調用
  }

  // ��改：在驗證方法中添加事件觸發，但保持原有邏輯
  validation() {
    try {
      let result = {
        valid: true,
        errMsg: ''
      };

      const value = this.#input.value.trim();
      const format = this.#input.dataset.format;
      const customPattern = this.#input.dataset.pattern;
      const customMessage = this.#input.dataset.message;

      // 觸發驗證開始事件
      this.#triggerEvent('validationStart', { value });

      // 空值檢查
      if (!value) {
        result = this.#handleEmptyValue(result);
        this.#triggerEvent('validationComplete', result);
        return result;
      }

      // 自定義正則表達式檢查
      if (customPattern) {
        result = this.#validateCustomPattern(value, customPattern, customMessage, result);
        this.#triggerEvent('validationComplete', result);
        return result;
      }

      // 預設格式檢查
      if (format) {
        result = this.#validateFormat(value, format, result);
        this.#triggerEvent('validationComplete', result);
        return result;
      }

      this.#triggerEvent('validationComplete', result);
      return result;
    } catch (error) {
      console.error('Validation error:', error);
      const errorResult = {
        valid: false,
        errMsg: '驗證過程發生錯誤',
        error
      };
      this.#triggerEvent('validationError', errorResult);
      return errorResult;
    }
  }

  // 新增：值設置方法
  setValue(value, validate = true) {
    this.#input.value = value;
    if (this.options.showClearButton && value) {
      this.showIconX();
    }
    if (validate) {
      return this.validation();
    }
  }

  // 新增：重置方法
  reset() {
    this.#input.value = '';
    this.#clearErrorState();
    this.hideIconX();
    this.#triggerEvent('reset');
    return this;
  }

  // 新增：獲取當前值的方法
  getValue() {
    return this.#input.value;
  }

  // 其餘原有方法保持不變...

  // 修改：銷毀方法增加事件清理
  destroy() {
    // 原有的清理邏輯
    this.#input.replaceWith(this.#input.cloneNode(true));
    if (this.#iconX) {
      this.#iconX.remove();
    }
    if (this.#fadeTimer) {
      clearTimeout(this.#fadeTimer);
    }

    // 新增：清理事件處理器
    this.#eventHandlers.clear();

    // 清理引用
    this.#input = null;
    this.#iconX = null;
    this.#fadeTimer = null;
  }
}

// 保持原有的初始化邏輯
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.wq-input').forEach(input => {
    if (!input.wqInput) {
      input.wqInput = new wqInput(input);
    }
  });
});
