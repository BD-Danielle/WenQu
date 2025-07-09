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

export class wqInput {
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
      // 添加標記變量，用於追踪是否正在進行輸入法輸入
      let isComposing = false;

      // 輸入法事件處理
      this.#input.addEventListener('compositionstart', () => {
        isComposing = true;
      });

      this.#input.addEventListener('compositionend', () => {
        isComposing = false;
        // 在輸入法結束後再處理空白字符
        this.#input.value = this.#input.value.replace(/\s+/g, '');
        this.#input.value.length > 0 ? this.showIconX() : this.hideIconX();
      });

      // 其他事件保持不變
      ['focus', 'click'].forEach(event => {
        this.#input.addEventListener(event, () => {
          this.#input.classList.remove('error');
          this.#input.value.length > 0 ? this.showIconX() : this.hideIconX();
        });
      });

      this.#input.addEventListener('blur', () => {
        this.hideIconX();
        this.#input.value.length === 0 && this.#input.classList.add('error');
      });

      // 修改 input 事件，考慮輸入法狀態
      this.#input.addEventListener('input', () => {
        // 只有在非輸入法輸入狀態才處理空白字符
        if (!isComposing) {
          this.#input.value = this.#input.value.replace(/\s+/g, '');
          this.#input.value.length > 0 ? this.showIconX() : this.hideIconX();
        }
      });

      // keyup 事件也需要考慮輸入法狀態
      this.#input.addEventListener('keyup', () => {
        // 只有在非輸入法輸入狀態才處理
        if (!isComposing) {
          this.#input.value = this.#input.value.replace(/\s+/g, '');
          this.#input.value.length > 0 ? this.showIconX() : this.hideIconX();
        }
      });

      // 簡化 keydown 事件處理
      this.#input.addEventListener('keydown', (e) => {
        e.key === 'Enter' && (e.preventDefault(), false);
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
      result.valid = false;  // 確保設為 false
      // 獲取輸入框的格式和類型
      const format = this.#input.dataset.format;

      // 嘗試從驗證規則中獲取錯誤訊息
      if (format && WQ.ValidationRules[format]) {
        const ruleMessage = WQ.ValidationRules[format].message;
        if (ruleMessage) {
          result.errMsg = ruleMessage;
        }
      }
      return result;
    };

    this.#validateCustomPattern = (value, pattern, message, result) => {
      try {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          result.valid = false;
          result.errMsg = message || '格式錯誤';
          this.#input.classList.add('error');

          // if (this.options.errorDisplay === 'popup') return;
          // this.showError(result.errMsg);
        } else {
          this.#clearErrorState();
        }
      } catch (e) {
        console.error('Invalid regular expression:', e);
      }
      return result;
    };

    // 在 class.input.js 中修改 #validateFormat 方法
    this.#validateFormat = (value, format, result) => {
      const rule = window.WQ?.ValidationRules?.[format];
      if (!rule) {
        return result;
      }

      // 🔥 處理對象格式的規則（包含 validate 屬性）
      if (typeof rule === 'object' && rule.validate) {

        // 查找驗證函數
        if (typeof window[rule.validate] === 'function') {
          try {

            const customResult = window[rule.validate](this.#input, value);

            // 🔥 統一處理返回值格式
            if (customResult && customResult.valid === false) {
              result.valid = false;
              result.errMsg = customResult.message || customResult.errMsg || rule.errorMsg || `${format}驗證失敗`;
              this.#input.classList.add('error');

            } else {

              this.#clearErrorState();
            }
          } catch (error) {
            console.error('❌ Callback 執行錯誤:', error);
            result.valid = false;
            result.errMsg = rule.errorMsg || '驗證函數執行錯誤';
            this.#input.classList.add('error');
          }
        } else {
          console.error('❌ 找不到驗證函數:', rule.validate);
          result.valid = false;
          result.errMsg = rule.errorMsg || `驗證函數 ${rule.validate} 未定義`;
          this.#input.classList.add('error');
        }
      }
      // 🔥 處理包含 pattern 屬性的對象格式規則
      else if (typeof rule === 'object' && rule.pattern) {
        if (rule.pattern instanceof RegExp) {
          if (!rule.pattern.test(value)) {
            result.valid = false;
            result.errMsg = rule.message || rule.errorMsg || `${format}格式錯誤`;
            this.#input.classList.add('error');

          } else {

            this.#clearErrorState();
          }
        }
      }
      // 🔥 處理直接的正則表達式規則
      else if (rule instanceof RegExp) {
        if (!rule.test(value)) {
          result.valid = false;
          result.errMsg = `${format}格式錯誤`;
          this.#input.classList.add('error');
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

  // 改：在驗證方法中添加事件觸發，但保持原有邏輯
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
        const format = this.#input.dataset.format;
        // 如果有格式且有 callback 驗證，則呼叫 callback
        const rule = window.WQ?.ValidationRules?.[format];
        if (rule && typeof rule.validate === 'string' && typeof window[rule.validate] === 'function') {
          const customResult = window[rule.validate](this.#input, value, rule);
          result.valid = customResult?.valid ?? false;
          result.errMsg = customResult?.message || customResult?.errMsg || rule.errorMsg || '此欄位為必填';
        } else {
          result = this.#handleEmptyValue(result);
        }
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

// 為了向後相容，也可以掛載到 window 對象
if (typeof window !== 'undefined') {
  window.wqInput = wqInput;
}
