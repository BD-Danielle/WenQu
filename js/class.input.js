/**
 * wqInput 輸入框驗證與處理類別（現代私有化重構版）
 */

if (typeof window.WQ === 'undefined') {
  window.WQ = {
    ValidationRules: {
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
  #input;
  #options;
  #iconX = null;
  #fadeTimer = null;

  constructor(elem, options = {}) {
    this.#input = (typeof elem === 'string')
      ? document.querySelector(elem)
      : (elem instanceof Element ? elem : null);

    if (!this.#input) throw new Error('Invalid input element');

    this.#options = {
      showClearButton: true,
      validateOnBlur: true,
      errorDisplay: 'inline',
      ...options
    };

    this.#init();
  }

  // 私有：初始化
  #init() {
    this.#bindEvents();
    this.#setDefaultValue();
  }

  // 私有：創建清除按鈕
  #appendIconX() {
    if (!this.#options.showClearButton) return;

    const existingIconX = this.#input.nextElementSibling?.matches?.('.wq-iconx');
    if (existingIconX) {
      this.#iconX = this.#input.nextElementSibling;
      return;
    }

    this.#iconX = document.createElement('span');
    this.#iconX.className = 'wq-iconx';
    this.#iconX.textContent = '';
    this.#iconX.style.display = 'none';
    this.#iconX.style.cursor = 'pointer';
    this.#iconX.style.opacity = '0';

    this.#input.insertAdjacentElement('afterend', this.#iconX);

    this.#iconX.addEventListener('click', (event) => {
      event.preventDefault();
      this.#input.value = '';
      this.#hideIconX();
      this.#input.focus();
    });
  }

  // 私有：綁定事件
  #bindEvents() {
    let isComposing = false;

    this.#input.addEventListener('compositionstart', () => { isComposing = true; });
    this.#input.addEventListener('compositionend', () => {
      isComposing = false;
      this.#handleInputChange();
    });

    ['input', 'keyup'].forEach(event => {
      this.#input.addEventListener(event, () => {
        if (!isComposing) this.#handleInputChange();
      });
    });

    this.#input.addEventListener('focus', () => {
      this.#input.classList.remove('error');
      if (this.#input.value.length > 0) this.#showIconX();
    });

    this.#input.addEventListener('blur', () => {
      this.#hideIconX();
      if (this.#input.value.length === 0) this.#input.classList.add('error');
      if (this.#options.validateOnBlur) {
        const result = this.validation();
        if (!result.valid && this.#options.errorDisplay !== 'popup') {
          this.#showError(result.errMsg);
        }
      }
    });

    this.#input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') e.preventDefault();
    });
  }

  // 私有：處理輸入變化
  #handleInputChange() {
    this.#input.value = this.#input.value.replace(/\s+/g, '');
    if (this.#input.value.length > 0) {
      this.#showIconX();
    } else {
      this.#hideIconX();
    }
    if (this.#options.errorDisplay !== 'popup') {
      const result = this.validation();
      if (!result.valid) {
        this.#showError(result.errMsg);
      } else {
        this.#hideError();
      }
    }
  }

  // 私有：設置預設值
  #setDefaultValue() {
    const defaultValue = this.#input.dataset.value;
    if (defaultValue) this.#input.value = defaultValue;
  }

  // 私有：顯示清除按鈕
  #showIconX() {
    if (!this.#options.showClearButton) return;
    if (!this.#iconX) this.#appendIconX();
    if (!this.#iconX) return;
    if (this.#fadeTimer) {
      clearTimeout(this.#fadeTimer);
      this.#fadeTimer = null;
    }
    this.#iconX.style.display = 'inline-block';
    this.#iconX.style.opacity = '1';
  }

  // 私有：隱藏清除按鈕
  #hideIconX() {
    if (!this.#iconX) return;
    this.#iconX.style.opacity = '0';
    this.#fadeTimer = setTimeout(() => {
      if (this.#iconX) this.#iconX.style.display = 'none';
      this.#fadeTimer = null;
    }, 300);
  }

  // 私有：顯示錯誤訊息
  #showError(message) {
    if (this.#options.errorDisplay === 'popup') return;
    this.#hideError();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '4px';
    this.#input.parentElement.appendChild(errorDiv);
  }

  // 私有：隱藏錯誤訊息
  #hideError() {
    const errorMessage = this.#input.parentElement.querySelector('.error-message');
    if (errorMessage) errorMessage.remove();
  }

  // 私有：清除錯誤狀態
  #clearErrorState() {
    this.#input.classList.remove('error');
    this.#hideError();
  }

  // 私有：空值驗證
  #handleEmptyValue(format) {
    const rule = window.WQ.ValidationRules?.[format];
    const isRequired = rule?.required === true ||
      this.#input.hasAttribute('required') ||
      this.#input.dataset.validation === 'required';

    if (isRequired) {
      return {
        valid: false,
        errMsg: rule?.message || '此欄位為必填'
      };
    }
    return {
      valid: true,
      errMsg: ''
    };
  }

  // 私有：格式驗證
  #validateFormat(format, value) {
    const rule = window.WQ.ValidationRules?.[format];
    const result = { valid: true, errMsg: '' };

    if (!rule) return result;

    if (rule?.validate && typeof rule?.validate === 'function') {
      try {
        const customResult = rule.validate(this.#input, value, rule);
        if (customResult && customResult.valid === false) {
          result.valid = false;
          result.errMsg = customResult.message || customResult.errMsg || rule.errMsg || `${format}驗證失敗`;
          this.#input.classList.add('error');
        } else {
          this.#clearErrorState();
        }
      } catch (error) {
        console.error('驗證函數執行錯誤:', error);
        result.valid = false;
        result.errMsg = rule.errMsg || '驗證函數執行錯誤';
        this.#input.classList.add('error');
      }
    } else if (rule.pattern) {
      try {
        const regex = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
        if (!regex.test(value)) {
          result.valid = false;
          result.errMsg = rule.message || rule.errMsg || `${format}格式錯誤`;
          this.#input.classList.add('error');
        } else {
          this.#clearErrorState();
        }
      } catch (error) {
        console.error('正則表達式錯誤:', error);
        result.valid = false;
        result.errMsg = '格式驗證錯誤';
      }
    }
    return result;
  }

  // ----------------- 對外公開 API -----------------

  /**
   * 驗證輸入值
   */
  validation() {
    try {
      const value = this.#input.value.trim();
      const format = this.#input.dataset.format;

      let result;
      if (!value) {
        result = this.#handleEmptyValue(format);
      } else if (format) {
        result = this.#validateFormat(format, value);
      } else {
        result = { valid: true, errMsg: '' };
      }

      // ✅ 統一處理視覺回饋
      if (!result.valid) {
        this.#input.classList.add('error');
      } else {
        this.#input.classList.remove('error');
      }

      return result;
    } catch (error) {
      console.error('Validation error:', error);
      this.#input.classList.add('error'); // ✅ 錯誤時也加上 error 類別
      return { valid: false, errMsg: '驗證過程發生錯誤' };
    }
  }

  /**
   * 設置值
   */
  setValue(value, validate = true) {
    this.#input.value = value;
    if (this.#options.showClearButton && value) {
      this.#showIconX();
    } else {
      this.#hideIconX();
    }
    if (validate) return this.validation();
  }

  /**
   * 取得值
   */
  getValue() {
    return this.#input.value;
  }

  /**
   * 重置
   */
  reset() {
    this.#input.value = '';
    this.#clearErrorState();
    this.#hideIconX();
    return this;
  }

  /**
   * 銷毀組件
   */
  destroy() {
    if (this.#fadeTimer) clearTimeout(this.#fadeTimer);
    if (this.#iconX) this.#iconX.remove();
    this.#input = null;
    this.#iconX = null;
    this.#fadeTimer = null;
  }
}

// 全域掛載
if (typeof window !== 'undefined') {
  window.wqInput = wqInput;
}