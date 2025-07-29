export class wqSex {
  #select = null;
  #options = [
    { value: 0, text: "女" },
    { value: 1, text: "男" }
  ];

  constructor(elem) {
    this.#select = (typeof elem === 'string') ?
      document.querySelector(elem) :
      (elem instanceof Element ? elem : null);

    if (!this.#select) {
      throw new Error('Invalid sex select element');
    }

    this.#initialize();
  }

  #initialize() {
    // 創建選項
    this.#buildOptions();

    // 設置默認值
    this.#setDefaultValue();
  }

  #buildOptions() {
    const fragment = document.createDocumentFragment();
    this.#select.innerHTML = '';

    this.#options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      fragment.appendChild(optionElement);
    });

    this.#select.appendChild(fragment);
  }

  #setDefaultValue() {
    const defaultValue = this.#select.dataset.value;
    if (defaultValue !== null) {
      this.#select.value = defaultValue;
    }
  }

  // 獲取當前值
  getValue() {
    return this.#select.value;
  }

  // 設置值
  setValue(value) {
    if (value === null || value === undefined) {
      throw new Error('性別值不能為空');
    }
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || !this.#options.some(opt => opt.value === numValue)) {
      throw new Error('無效的性別值');
    }
    this.#select.value = value;
  }

  // 驗證
  validation() {
    const value = this.#select.value;
    const numValue = parseInt(value, 10);
    return {
      valid: value !== null && value !== undefined && value !== '' &&
        !isNaN(numValue) && this.#options.some(opt => opt.value === numValue),
      errMsg: value === '' ? '請選擇性別' :
        !this.#options.some(opt => opt.value === numValue) ? '無效的性別選項' : ''
    };
  }

  // 清理方法
  destroy() {
    if (this.#select) {
      // 清理所有可能的事件監聽器
      this.#select.innerHTML = '';
      // 移除實例引用
      delete this.#select.wqSex;
      this.#select = null;
    }
  }
}

// 在 DOMContentLoaded 時初始化所有性別選擇器
document.addEventListener('DOMContentLoaded', () => {
  try {
    document.querySelectorAll('.wq-select[data-type="sex"]').forEach(select => {
      if (!select.wqSex) {
        select.wqSex = new wqSex(select);
      }
    });
  } catch (error) {
    // 使用錯誤處理器處理初始化錯誤
    if (window.ErrorHandler) {
      window.ErrorHandler.handle(error, 'wqSex Initialization');
    } else {
      console.error('性別選擇器初始化失敗:', error);
    }
  }
});

// 為了向後相容，也可以掛載到 window 對象
if (typeof window !== 'undefined') {
  window.wqSex = wqSex;
}