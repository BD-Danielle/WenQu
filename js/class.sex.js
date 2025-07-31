/**
 * wqSex 性別選擇器類別（現代私有化重構版）
 * 提供性別選擇的初始化、驗證和操作功能
 */
export class wqSex {
  #select;

  constructor(elem) {
    // 初始化選擇器
    this.#select = (typeof elem === 'string')
      ? document.querySelector(elem)
      : (elem instanceof Element ? elem : null);

    if (!this.#select) {
      throw new Error('Invalid sex select element');
    }

    this.#initialize();
  }

  // 私有：初始化選項和默認值
  #initialize() {
    this.#buildOptions();
    this.#setDefaultValue();
  }

  // 私有：創建選項
  #buildOptions() {
    const options = [
      { value: '0', text: '女' },
      { value: '1', text: '男' }
    ];
    this.#select.innerHTML = options.map(option =>
      `<option value="${option.value}">${option.text}</option>`
    ).join('');
  }

  // 私有：設置默認值
  #setDefaultValue() {
    const defaultValue = this.#select.dataset.value ?? '0'; // 默認值為 "0"（女）
    this.#select.value = defaultValue;
  }

  /**
   * 獲取當前值
   */
  getValue() {
    return this.#select.value;
  }

  /**
   * 設置值
   */
  setValue(value) {
    const validValues = ['0', '1'];
    if (!validValues.includes(value)) {
      throw new Error('Invalid sex value');
    }
    this.#select.value = value;
  }

  /**
   * 驗證
   */
  validation() {
    const value = this.#select.value;
    return {
      valid: ['0', '1'].includes(value),
      errMsg: value === '' ? '請選擇性別' : ''
    };
  }

  /**
   * 銷毀選擇器
   */
  destroy() {
    if (this.#select) {
      this.#select.innerHTML = '';
      this.#select = null;
    }
  }
}

// 為了向後相容，也可以掛載到 window 對象
if (typeof window !== 'undefined') {
  window.wqSex = wqSex;
}