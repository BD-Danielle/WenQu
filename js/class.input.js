/**
 * wqInput 輸入框驗證與處理類別
 * 提供輸入框驗證、清除按鈕、錯誤顯示等核心功能
 */

// 確保 WQ 命名空間存在
if (typeof window.WQ === 'undefined') {
  window.WQ = {
    ValidationRules: {
      // 預設規則
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
  constructor(elem, options = {}) {
    // 核心：獲取輸入框元素
    this.input = (typeof elem === 'string') ?
      document.querySelector(elem) :
      (elem instanceof Element ? elem : null);

    if (!this.input) {
      throw new Error('Invalid input element');
    }

    // 核心：初始化配置
    this.options = {
      showClearButton: true,
      validateOnBlur: true,
      errorDisplay: 'inline', // 'popup' | 'inline'
      ...options
    };

    // 核心：初始化組件
    this.iconX = null;
    this.fadeTimer = null;

    this.init();
  }

  /**
   * 初始化組件
   */
  init() {
    // this.appendIconX();
    this.bindEvents();
    this.setDefaultValue();
  }

  /**
   * 創建清除按鈕
   */
  appendIconX() {
    if (!this.options.showClearButton) return;

    // 檢查是否已存在清除按鈕
    const existingIconX = this.input.nextElementSibling?.matches?.('.wq-iconx');
    if (existingIconX) {
      this.iconX = this.input.nextElementSibling;
      return;
    }

    // 創建清除按鈕
    this.iconX = document.createElement('span');
    this.iconX.className = 'wq-iconx';
    this.iconX.textContent = '';
    this.iconX.style.display = 'none';
    this.iconX.style.cursor = 'pointer';
    this.iconX.style.opacity = '0';

    // 插入到輸入框後面
    this.input.insertAdjacentElement('afterend', this.iconX);

    // 綁定清除功能
    this.iconX.addEventListener('click', (event) => {
      event.preventDefault();
      this.input.value = '';
      this.hideIconX();
      this.input.focus();
    });
  }

  /**
   * 綁定事件
   */
  bindEvents() {
    let isComposing = false;

    // 輸入法處理
    this.input.addEventListener('compositionstart', () => {
      isComposing = true;
    });

    this.input.addEventListener('compositionend', () => {
      isComposing = false;
      this.handleInputChange();
    });

    // 輸入事件
    ['input', 'keyup'].forEach(event => {
      this.input.addEventListener(event, () => {
        if (!isComposing) {
          this.handleInputChange();
        }
      });
    });

    // 焦點事件
    this.input.addEventListener('focus', () => {
      this.input.classList.remove('error');
      if (this.input.value.length > 0) {
        this.showIconX();
      }
    });

    this.input.addEventListener('blur', () => {
      this.hideIconX();

      // 空值時添加錯誤樣式
      if (this.input.value.length === 0) {
        this.input.classList.add('error');
      }

      if (this.options.validateOnBlur) {
        const result = this.validation();
        if (!result.valid && this.options.errorDisplay !== 'popup') {
          this.showError(result.errMsg);
        }
      }
    });

    // 防止 Enter 鍵提交
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
  }

  /**
   * 處理輸入變化
   */
  handleInputChange() {
    // 移除空白字符
    this.input.value = this.input.value.replace(/\s+/g, '');

    // 顯示/隱藏清除按鈕
    if (this.input.value.length > 0) {
      this.showIconX();
    } else {
      this.hideIconX();
    }

    // 即時驗證（僅在非 popup 模式）
    if (this.options.errorDisplay !== 'popup') {
      const result = this.validation();
      if (!result.valid) {
        this.showError(result.errMsg);
      } else {
        this.hideError();
      }
    }
  }

  /**
   * 設置預設值
   */
  setDefaultValue() {
    const defaultValue = this.input.dataset.value;
    if (defaultValue) {
      this.input.value = defaultValue;
    }
  }

  /**
   * 核心驗證方法
   */
  validation() {
    try {
      let result = {
        valid: true,
        errMsg: ''
      };

      const value = this.input.value.trim();
      const format = this.input.dataset.format;

      // 空值檢查
      if (!value) {
        return this.handleEmptyValue(result, format);
      }

      // 格式驗證
      if (format) {
        return this.validateFormat(result, format, value);
      }

      return result;
    } catch (error) {
      console.error('Validation error:', error);
      return {
        valid: false,
        errMsg: '驗證過程發生錯誤'
      };
    }
  }

  /**
   * 處理空值驗證
   */
  handleEmptyValue(result, format) {
    const rule = window.WQ.ValidationRules?.[format];
    // 使用自定義驗證函數
    if (rule?.validate && typeof rule?.validate === 'function') {
      try {
        const customResult = rule.validate(this.input, '', rule);
        result.valid = customResult?.valid ?? false;
        result.errMsg = customResult?.message || customResult?.errMsg || rule.errMsg || '此欄位為必填';
      } catch (error) {
        result.valid = false;
        result.errMsg = rule.errMsg || '驗證函數執行錯誤';
      }
    } else {
      // 檢查是否為必填
      const isRequired = rule?.required === true || this.input.hasAttribute('required') ||
        this.input.dataset.validation === 'required';

      if (isRequired) {
        result.valid = false;
        result.errMsg = rule?.message || '此欄位為必填';
      }
    }

    return result;
  }

  /**
   * 格式驗證
   */
  validateFormat(result, format, value) {
    const rule = window.WQ.ValidationRules?.[format];

    if (!rule) {
      return result;
    }
    // 使用自定義驗證函數
    if (rule?.validate && typeof rule?.validate === 'function') {
      try {
        const customResult = rule.validate(this.input, value, rule);
        if (customResult && customResult.valid === false) {
          result.valid = false;
          result.errMsg = customResult.message || customResult.errMsg || rule.errMsg || `${format}驗證失敗`;
          this.input.classList.add('error');
        } else {
          this.clearErrorState();
        }
      } catch (error) {
        console.error('驗證函數執行錯誤:', error);
        result.valid = false;
        result.errMsg = rule.errMsg || '驗證函數執行錯誤';
        this.input.classList.add('error');
      }
    }
    // 使用正則表達式驗證
    else if (rule.pattern) {
      try {
        const regex = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
        if (!regex.test(value)) {
          result.valid = false;
          result.errMsg = rule.message || rule.errMsg || `${format}格式錯誤`;
          this.input.classList.add('error');
        } else {
          this.clearErrorState();
        }
      } catch (error) {
        console.error('正則表達式錯誤:', error);
        result.valid = false;
        result.errMsg = '格式驗證錯誤';
      }
    }

    return result;
  }

  /**
   * 顯示清除按鈕
   */
  showIconX() {
    if (!this.options.showClearButton) return;

    // 如果還沒創建清除按鈕，則創建它
    if (!this.iconX) {
      this.appendIconX();
    }

    if (!this.iconX) return;
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }

    this.iconX.style.display = 'inline-block';
    this.iconX.style.opacity = '1';
  }

  /**
   * 隱藏清除按鈕
   */
  hideIconX() {
    if (!this.iconX) return;

    this.iconX.style.opacity = '0';
    this.fadeTimer = setTimeout(() => {
      if (this.iconX) {
        this.iconX.style.display = 'none';
      }
      this.fadeTimer = null;
    }, 300);
  }

  /**
   * 顯示錯誤訊息
   */
  showError(message) {
    if (this.options.errorDisplay === 'popup') return;

    this.hideError();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '4px';

    this.input.parentElement.appendChild(errorDiv);
  }

  /**
   * 隱藏錯誤訊息
   */
  hideError() {
    const errorMessage = this.input.parentElement.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  /**
   * 清除錯誤狀態
   */
  clearErrorState() {
    this.input.classList.remove('error');
    this.hideError();
  }

  /**
   * 設置值
   */
  setValue(value, validate = true) {
    this.input.value = value;
    if (this.options.showClearButton && value) {
      this.showIconX();
    } else {
      this.hideIconX();
    }

    if (validate) {
      return this.validation();
    }
  }

  /**
   * 獲取值
   */
  getValue() {
    return this.input.value;
  }

  /**
   * 重置
   */
  reset() {
    this.input.value = '';
    this.clearErrorState();
    this.hideIconX();
    return this;
  }

  /**
   * 銷毀組件
   */
  destroy() {
    // 清理定時器
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
    }

    // 移除清除按鈕
    if (this.iconX) {
      this.iconX.remove();
    }

    // 清理引用
    this.input = null;
    this.iconX = null;
    this.fadeTimer = null;
  }
}

// 全域掛載
if (typeof window !== 'undefined') {
  window.wqInput = wqInput;
}