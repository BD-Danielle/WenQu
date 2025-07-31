/**
 * wqForm 表單驗證與處理類別（現代私有化重構版）
 */
export class wqForm {
  #form;
  #options;
  #popupHandler;
  #inputInstances = new Map();
  #dateTimeInstances = new WeakMap();

  constructor(elem, options = {}) {
    try {
      this.#form = (typeof elem === 'string')
        ? document.querySelector(elem)
        : (elem instanceof Element ? elem : null);

      if (!this.#form) throw new Error('Invalid form element');

      if (typeof window.wqInput !== 'function') {
        throw new Error('wqInput is required. Please load class.input.js first.');
      }

      this.#options = {
        submit_button: '#checkGo_free',
        popup_title: '請確認您提供的資料是否正確',
        birth_title: '生辰',
        errorDisplay: 'popup',
        customFieldLabels: {},
        errorMessages: {},
        ...options
      };

      this.#popupHandler = (typeof options.popupHandler === 'object')
        ? options.popupHandler
        : new (window.wqPopup || window.wqpopup)();

      this.#init();
    } catch (error) {
      console.error('wqForm constructor error:', error);
    }
  }

  // 私有：初始化表單組件
  #init() {
    try {
      // 初始化輸入框
      this.#form.querySelectorAll('.wq-input').forEach(input => {
        if (!input.wqInput) {
          const inputInstance = new window.wqInput(input, this.#options);
          input.wqInput = inputInstance;
          this.#inputInstances.set(input, inputInstance);
        }
      });

      // 初始化日期時間選擇器
      this.#form.querySelectorAll('.wq-group').forEach(group => {
        if (!this.#dateTimeInstances.has(group)) {
          if (typeof window.wqDateTime !== 'undefined') {
            const instance = new window.wqDateTime(group);
            this.#dateTimeInstances.set(group, instance);
          }
        }
      });

      // 初始化事件監聽
      this.#initEventDelegation();
    } catch (error) {
      console.error('wqForm init error:', error);
    }
  }

  // 私有：初始化事件委派
  #initEventDelegation() {
    // 綁定時需保存參考，方便移除
    this.#handleInputBound = this.#handleInput.bind(this);
    this.#handleSelectBound = this.#handleSelect.bind(this);

    this.#form.addEventListener('input', this.#handleInputBound);
    this.#form.addEventListener('change', this.#handleSelectBound);
  }

  // 私有：處理輸入框事件
  #handleInput(event) {
    const input = event.target;
    if (input.classList.contains('wq-input')) {
      const cachedInput = this.#inputInstances.get(input);
      if (cachedInput) cachedInput.validation();
    }
  }

  // 私有：處理選擇框事件
  #handleSelect(event) {
    const select = event.target;
    if (select.classList.contains('wq-select')) {
      const isValid = select.value !== '';
      select.classList.toggle('error', !isValid);
    }
  }

  // 私有：設置單選按鈕組錯誤狀態
  #setRadioError(group, errorMessage) {
    if (this.#options.errorDisplay === 'inline') {
      group.classList.add('error');
    }
    group.setAttribute('data-error', errorMessage);
  }

  // 私有：清除單選按鈕組錯誤狀態
  #clearRadioError(group) {
    if (this.#options.errorDisplay === 'inline') {
      group.classList.remove('error');
    }
    group.removeAttribute('data-error');
  }

  // 私有：驗證單選按鈕組
  #validateRadio(group, format) {
    const rule = window.WQ.ValidationRules?.[format];
    if (rule?.validate && typeof rule?.validate === 'function') {
      try {
        const result = rule?.validate(group);
        return {
          isValid: result?.valid !== false,
          errMsg: result?.errMsg || result?.message || rule.errMsg || '驗證失敗'
        };
      } catch (error) {
        console.error(`${format} 驗證函數執行錯誤:`, error);
        return {
          isValid: false,
          errMsg: rule.errMsg || '驗證過程發生錯誤'
        };
      }
    }
    return { isValid: true, errMsg: '' };
  }

  // 私有：收集表單資料
  #collectFormData() {
    const formData = [];

    this.#form.querySelectorAll('.wq-group').forEach(group => {
      const data = {
        nickname: '',
        sex: ['', ''],
        datetime: {
          calendar: ['', ''],
          solarString: '',
          lunarString: '',
          hour: [false, '']
        },
        date_format: '',
        custom: []
      };

      // 收集性別資料
      const sexRadioGroup = group.querySelector('.radio-group[data-type="sex"]');
      if (sexRadioGroup) {
        const checkedRadio = sexRadioGroup.querySelector('input[type="radio"]:checked');
        if (checkedRadio) {
          data.sex = [checkedRadio.value, checkedRadio.value === '0' ? '女' : '男'];
        }
      } else {
        const sexSelect = group.querySelector('.wq-select[data-type="sex"]');
        if (sexSelect && sexSelect.value !== '') {
          data.sex = [sexSelect.value, sexSelect.value === '0' ? '女' : '男'];
        }
      }

      // 收集輸入框資料
      group.querySelectorAll('.wq-input').forEach(input => {
        const type = input.dataset.type;
        const value = input.value.trim();

        if (type === 'nickname') {
          data.nickname = value;
        } else {
          const label = this.#options.customFieldLabels?.[type] || input.placeholder || type;
          data.custom.push([type, value, label]);
        }
      });

      // 收集其他單選按鈕組資料
      group.querySelectorAll('.radio-group[data-type]:not([data-type="sex"])').forEach(radioGroup => {
        const type = radioGroup.dataset.type;
        const checkedRadio = radioGroup.querySelector('input[type="radio"]:checked');

        if (checkedRadio) {
          data.custom.push([
            type,
            checkedRadio.value,
            window.WQ.ValidationRules?.[type]?.title || checkedRadio.dataset.title
          ]);
        }
      });

      // 收集日期時間資料
      const dateTimeInstance = this.#dateTimeInstances.get(group);
      if (dateTimeInstance && typeof dateTimeInstance.getFormattedDate === 'function') {
        const dateTimeData = dateTimeInstance.getFormattedDate();
        if (dateTimeData) {
          data.datetime = dateTimeData;
        }
      }

      formData.push(data);
    });

    return formData;
  }

  // ----------------- 對外公開 API -----------------

  /**
   * 表單驗證主方法
   */
  validation(options = {}) {
    try {
      const formOptions = {
        ...this.#options,
        ...options
      };

      let isValid = true;
      const errorMessages = [];

      // 驗證輸入框
      this.#form.querySelectorAll('.wq-input').forEach(input => {
        if (input.wqInput) {
          const result = input.wqInput.validation();
          if (!result.valid) {
            isValid = false;
            if (this.#options.errorDisplay === 'popup' && result.errMsg) {
              errorMessages.push(result.errMsg);
            }
          }
        }
      });

      // 驗證選擇框
      this.#form.querySelectorAll('.wq-select').forEach(select => {
        if (!select.value) {
          isValid = false;
          select.classList.add('error');
          if (this.#options.errorDisplay === 'popup') {
            errorMessages.push('請選擇選項');
          }
        } else {
          select.classList.remove('error');
        }
      });

      // 驗證單選按鈕組
      this.#form.querySelectorAll('.radio-group[data-type]').forEach(group => {
        const type = group.dataset.type;
        const validationResult = this.#validateRadio(group, type);
        if (!validationResult.isValid) {
          isValid = false;
          this.#setRadioError(group, validationResult.errMsg);

          if (this.#options.errorDisplay === 'popup' && validationResult.errMsg) {
            errorMessages.push(validationResult.errMsg);
          }
        } else {
          this.#clearRadioError(group);
        }
      });

      // 處理驗證結果
      if (isValid) {
        const formData = this.#collectFormData();
        this.#popupHandler.confirm(formData, () => {
          const button = document.querySelector(formOptions.submit_button);
          if (button) {
            const href = button.dataset.href;
            if (href) window.location.href = href;
          }
        }, formOptions);
      } else {
        const errorMsg = errorMessages.length > 0
          ? errorMessages.map(msg => `<p class="error-message">${msg}</p>`).join('')
          : (this.#options.msg || '');

        if (errorMsg) this.#popupHandler.alert(errorMsg);
      }

      return isValid;
    } catch (error) {
      console.error('wqForm validation error:', error);
      return false;
    }
  }

  /**
   * 收集表單資料
   */
  collectFormData() {
    return this.#collectFormData();
  }

  /**
   * 取得指定 group 的 wqDateTime 實例
   */
  getDateTimeInstance(groupElem) {
    return this.#dateTimeInstances.get(groupElem);
  }

  /**
   * 清理資源
   */
  destroy() {
    // 移除事件監聽器
    if (this.#form) {
      this.#form.removeEventListener('input', this.#handleInputBound);
      this.#form.removeEventListener('change', this.#handleSelectBound);
    }

    // 清理 input 實例
    this.#inputInstances.forEach((instance, input) => {
      if (input.wqInput) {
        delete input.wqInput;
      }
    });
    this.#inputInstances.clear();

    // 清理 dateTime 實例
    this.#dateTimeInstances = new WeakMap();

    // 清理 DOM 參考
    this.#form = null;
  }
}

// 全域掛載
// if (typeof window !== 'undefined') {
//   window.wqForm = wqForm;
// }
// 全域初始化
if (typeof window !== 'undefined') {
  window.wqForm = wqForm; // 確保 wqForm 被正確導出到全局
  window.wq_form = window.wq_form || {}; // 只在全局範圍創建一次實例
  // document.addEventListener('DOMContentLoaded', () => { // 在 DOMContentLoaded 時初始化
  //   if (window.wq_form.form) window.wq_form.form.destroy();
  //   window.wq_form.form = new wqForm('.wq-form');
  // }, { once: true }); // 使用 once 選項確保事件監聽器只執行一次
}