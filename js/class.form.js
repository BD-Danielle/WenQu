export class wqForm {
  constructor(elem, options = {}) {
    try {
      this.form = (typeof elem === 'string') ?
        document.querySelector(elem) :
        (elem instanceof Element ? elem : null);

      if (!this.form) {
        throw new Error('Invalid form element');
      }

      // 檢查必要的依賴
      if (typeof window.wqInput !== 'function') {
        throw new Error('wqInput is not defined. Please make sure class.input.js is loaded.');
      }
      this.popupHandler = options.popupHandler || new wqPopup();
      // 設置默認選項
      this.options = {
        submit_button: '#checkGo_free',  // 提交按鈕選擇器
        popup_title: '請確認您提供的資料是否正確',  // 彈窗標題
        birth_title: '生辰',  // 生辰標題
        customFieldLabels: {
          // id: '身分證字號',
          // textarea: '備註內容',
        },
        errorMessages: {
          sex: '請選擇性別',
          relationship: '請選擇感情狀態',
          default: '請選擇選項',
          ...options.errorMessages // 允許覆蓋默認錯誤訊息
        },
        ...options  // 允許覆蓋默認選項
      };
      this.dateTimeInstances = new WeakMap();
      this.eventManager = new EventManager();
      this.domCache = new Map(); // 添加 DOM 緩存

      // 註冊表單事件
      this.registerEvents();

      this.init();
    } catch (error) {
      console.log(error, 'wqForm.constructor');
      throw error; // 重新拋出錯誤，阻止後續操作
    }
  }

  init() {
    // 使用 DocumentFragment 優化 DOM 操作
    const fragment = document.createDocumentFragment();

    // 批量處理 DOM 操作
    this.batchInitialize(fragment);

    // 只進行一次 DOM 插入
    this.form.appendChild(fragment);

    // 初始化事件委派
    this.initEventDelegation();
  }

  batchInitialize(fragment) {
    try {
      // 使用緩存存儲查詢結果
      const inputs = this.form.querySelectorAll('.wq-input');
      const groups = this.form.querySelectorAll('.wq-group');

      // 批量初始化輸入框
      inputs.forEach(input => {
        if (!input.wqInput) {  // 直接檢查 DOM 元素屬性
          const inputInstance = new window.wqInput(input, this.options);
          input.wqInput = inputInstance;  // 掛載到 DOM 元素
          this.domCache.set(input, inputInstance);  // 同時緩存
        }
      });
      // 批量初始化日期時間選擇器
      groups.forEach(group => {
        if (!this.dateTimeInstances.has(group)) {
          const instance = new wqDateTime(group);
          this.dateTimeInstances.set(group, instance);
        }
      });
    } catch (error) {
      console.log(error, 'wqForm.batchInitialize');
    }
  }

  initEventDelegation() {
    // 使用事件委派優化事件監聽
    this.form.addEventListener('input', (event) => {
      const target = event.target;
      if (target.classList.contains('wq-input')) {
        this.handleInput(target);
      }
    });

    this.form.addEventListener('change', (event) => {
      const target = event.target;
      if (target.classList.contains('wq-select')) {
        this.handleSelect(target);
      }
    });
  }

  handleInput(input) {
    const cachedInput = this.domCache.get(input);
    if (cachedInput) {
      const result = cachedInput.validation();
      this.eventManager.emit('form:inputChange', { input, result });
    }
  }

  handleSelect(select) {
    const isValid = select.value !== '';
    select.classList.toggle('error', !isValid);
    this.eventManager.emit('form:selectChange', { select, isValid });
  }

  // 添加性能監控
  measurePerformance(operation) {
    const start = performance.now();
    operation();
    const end = performance.now();
    console.log(`Operation took ${end - start}ms`);
  }

  // 清理資源
  destroy() {
    this.domCache.clear();
    this.dateTimeInstances = new WeakMap();
    this.eventManager.clear();
    this.form = null;
  }

  validation(options = {}) {
    try {
      const validationOptions = {
        ...this.options,
        ...options
      };

      let isValid = true;
      let errorMessages = []; // 用於收集錯誤訊息
      // 驗證輸入框
      this.form.querySelectorAll('.wq-input').forEach(input => {
        if (input.wqInput) {
          const result = input.wqInput.validation();
          if (!result.valid) {
            isValid = false;
            // 收集錯誤訊息
            if (result.errMsg) {
              errorMessages.push(result.errMsg);
            }
          }
        }
      });

      // 驗證選擇框
      this.form.querySelectorAll('.wq-select').forEach(select => {
        if (!select.value) {
          isValid = false;
          select.classList.add('error');
        } else {
          select.classList.remove('error');
        }
      });

      // 驗證單選按鈕組
      // 🔥 簡化後的 radio 驗證邏輯
      this.form.querySelectorAll('.radio-group[data-type]').forEach(group => {
        const type = group.getAttribute('data-type');
        const checkedRadio = group.querySelector('input[type="radio"]:checked');

        // console.log(`處理 ${type} radio group`);

        // 🔥 統一的驗證結果獲取
        const validationResult = this.#getRadioValidationResult(group, type, checkedRadio);

        // 🔥 統一的結果處理
        this.#handleRadioValidationResult(group, type, validationResult, errorMessages);

        // 更新總體驗證狀態
        if (!validationResult.isValid) {
          isValid = false;
        }
      });

      if (isValid) {
        const formData = this.#collectFormData();
        this.popupHandler.confirm(formData, () => {
          const button = document.querySelector(validationOptions.submit_button);
          if (button) {
            const href = button.getAttribute('data-href');
            if (href) window.location.href = href;
          }
        }, {
          pop_title: validationOptions.popup_title || '請確認您提供的資料是否正確',
          birth_title: validationOptions.birth_title || '生日'
        });
      } else {
        // 使用收集到的錯誤訊息
        const errorMsg = errorMessages.length > 0
          ? errorMessages.map(msg => `<p class="error-message">${msg}</p>`).join('') // 將每個錯誤訊息用 <p> 標籤包裹
          : (this.options.msg || '表單驗證失敗');

        this.popupHandler.alert(errorMsg);
      }

      return isValid;
    } catch (error) {
      console.log(error, 'wqForm.validation');
      return false;
    }
  }
  // 🔥 提取方法：獲取驗證結果
  #getRadioValidationResult(group, type, checkedRadio) {
    const rule = window.WQ?.ValidationRules?.[type];

    // 使用 ValidationRules callback 驗證
    if (rule?.validate) {
      return this.#executeCallbackValidation(rule, group, type, checkedRadio);
    }

    // 使用基本驗證
    return this.#executeBasicValidation(group, type, checkedRadio);
  }

  // 🔥 執行 callback 驗證
  #executeCallbackValidation(rule, group, type, checkedRadio) {
    // 驗證函數不存在的情況
    if (typeof window[rule.validate] !== 'function') {
      return this.#getBasicValidationResult(group, checkedRadio, rule.errorMsg || '請選擇選項');
    }

    // 執行驗證函數
    try {
      const result = window[rule.validate](group);

      const isValid = result?.valid !== false;
      const errorMessage = isValid ? '' : (result?.errMsg || result?.message || rule.errorMsg || '請選擇選項');

      return { isValid, errorMessage };
    } catch (error) {
      console.error(`${type} 驗證函數執行錯誤:`, error);
      return { isValid: false, errorMessage: rule.errorMsg || '驗證過程發生錯誤' };
    }
  }

  // 🔥 執行基本驗證
  #executeBasicValidation(group, type, checkedRadio) {
    const fallbackErrorMessages = {
      ...this.options.errorMessages,
      sex: '請選擇性別',
      relationship: '請選擇感情狀態',
      default: '請選擇選項'
    };

    const errorMessage = fallbackErrorMessages[type] || fallbackErrorMessages.default;
    return this.#getBasicValidationResult(group, checkedRadio, errorMessage);
  }

  // 🔥 獲取基本驗證結果
  #getBasicValidationResult(group, checkedRadio, errorMessage) {
    const hasRequiredField = group.querySelector('input[data-validation="required"]');
    const isValid = !!checkedRadio || !hasRequiredField;

    return {
      isValid,
      errorMessage: isValid ? '' : errorMessage
    };
  }

  // 🔥 處理驗證結果
  #handleRadioValidationResult(group, type, validationResult, errorMessages) {
    const { isValid, errorMessage } = validationResult;

    if (isValid) {
      this.#clearRadioError(group);
      return;
    }

    // 驗證失敗的處理
    this.#setRadioError(group, errorMessage);

    // 只在 popup 模式下收集錯誤訊息
    if (this.options.errorDisplay === 'popup' && errorMessage) {
      errorMessages.push(errorMessage);
    }
  }

  // 🔥 清除錯誤狀態
  #clearRadioError(group) {
    if (this.options.errorDisplay === 'inline') {
      group.classList.remove('error');
    }
    group.removeAttribute('data-error');
  }

  // 🔥 設置錯誤狀態
  #setRadioError(group, errorMessage) {
    if (this.options.errorDisplay === 'inline') {
      group.classList.add('error');
    }
    group.setAttribute('data-error', errorMessage);
  }
  #collectFormData() {
    const formData = [];

    this.form.querySelectorAll('.wq-group').forEach(group => {
      const dateTimeInstance = this.dateTimeInstances.get(group);

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

      // 先檢查是否有 radio 類型的性別選擇
      const sexRadioGroup = group.querySelector('.radio-group[data-type="sex"]');
      if (sexRadioGroup) {
        const checkedRadio = sexRadioGroup.querySelector('input[type="radio"]:checked');
        if (checkedRadio) {
          data.sex = [checkedRadio.value, checkedRadio.value === '0' ? '女' : '男'];
        }
      } else {
        // 如果沒有 radio，則檢查下拉選單
        const sexSelect = group.querySelector('.wq-select[data-type="sex"]');
        if (sexSelect && sexSelect.value !== '') {
          data.sex = [sexSelect.value, sexSelect.value === '0' ? '女' : '男'];
        }
      }

      // 收集所有 wq-input 輸入框的數據
      group.querySelectorAll('.wq-input').forEach(input => {
        const type = input.getAttribute('data-type');
        const value = input.value.trim();

        if (type === 'nickname') {
          data.nickname = value;
        } else {
          const label = this.options.customFieldLabels[type] ||
            input.placeholder ||
            type;

          data.custom.push([
            type,
            value,
            label
          ]);
        }
      });

      // 收集其他 radio 組的數據
      group.querySelectorAll('.radio-group[data-type]:not([data-type="sex"])').forEach(radioGroup => {
        const type = radioGroup.getAttribute('data-type');
        const checkedRadio = radioGroup.querySelector('input[type="radio"]:checked');

        if (checkedRadio) {
          data.custom.push([
            type,
            checkedRadio.value,
            checkedRadio.getAttribute('data-title') || checkedRadio.dataset.title || type
          ]);
        }
      });

      // 獲取日期時間
      if (dateTimeInstance) {
        const dateTimeData = dateTimeInstance.getFormattedDate();
        if (dateTimeData) {
          data.datetime = dateTimeData;
        }
      }

      formData.push(data);
    });

    console.log('Collected Form Data:', formData);
    return formData;
  }

  showError(input, message) {
    const parent = input.parentElement;
    if (!parent) return;

    // 移除已存在的錯誤提示
    const existingError = parent.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    // 創建新的錯誤提示
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    parent.appendChild(errorDiv);
  }

  registerEvents() {
    // 表單驗證事件
    this.eventManager.on('form:validate', (data) => {
      const isValid = this.validation(data);
      this.eventManager.emit('form:validateComplete', { isValid });
    });

    // 表單數據變更事件
    this.eventManager.on('form:change', (data) => {
      this.handleFormChange(data);
    });

    // 表單提交事件
    this.eventManager.on('form:submit', (data) => {
      this.handleFormSubmit(data);
    });
  }

  handleFormChange(data) {
    // 處理表單變更
    this.eventManager.emit('form:changed', data);
  }

  handleFormSubmit(data) {
    // 處理表單提交
    if (this.validation()) {
      this.eventManager.emit('form:submitSuccess', data);
    } else {
      this.eventManager.emit('form:submitError', data);
    }
  }
}

// 確保 wqForm 被正確導出到全局
if (typeof window !== 'undefined') {
  window.wqForm = wqForm;
}

// 只在全局範圍創建一次實例
if (!window.wq_form) {
  window.wq_form = {
    form: null
  };
}

// 在 DOMContentLoaded 時初始化
document.addEventListener('DOMContentLoaded', () => {
  if (!window.wq_form.form) {
    window.wq_form.form = new wqForm('.wq-form');
  }
}, { once: true }); // 使用 once 選項確保事件監聽器只執行一次

