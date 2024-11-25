class wqForm {
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

      // 設置默認選項
      this.options = {
        submit_button: '#checkGo_free',  // 提交按鈕選擇器
        popup_title: '請確認您提供的資料是否正確',  // 彈窗標題
        birth_title: '生辰',  // 生辰標題
        customFieldLabels: {
          // id: '身分證字號',
          // textarea: '備註內容',
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
      ErrorHandler.handle(error, 'wqForm.constructor');
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
        if (!this.domCache.has(input)) {
          // 使用 window.wqInput 而不是直接使用 wqInput
          const inputInstance = new window.wqInput(input);
          this.domCache.set(input, inputInstance);
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
      ErrorHandler.handle(error, 'wqForm.batchInitialize');
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
      // 合併驗證時的選項
      const validationOptions = {
        ...this.options,  // 使用構造函數中的默認選項
        ...options  // 允許��驗證時覆蓋選項
      };

      // 添加详细的日志输出
      // console.group('ValidationOptions Details:');
      // console.log('Default options:', this.options);
      // console.log('Incoming options:', options);
      // console.log('Merged options:', validationOptions);
      // console.log('Submit button selector:', validationOptions.submit_button);
      // console.dir(document.querySelector(validationOptions.submit_button));
      // console.groupEnd();

      let isValid = true;

      // 使用 class.input.js 的驗證功能
      this.form.querySelectorAll('.wq-input').forEach(input => {
        if (input.wqInput) {
          const result = input.wqInput.validation();
          if (!result.valid) {
            isValid = false;
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

      if (isValid) {
        // 收集表單數據
        const formData = this.#collectFormData();

        // 檢查 wqPopup 是否存在
        if (typeof window.wqPopup !== 'function') {
          console.error('wqPopup is not defined. Please make sure class.popup.js is loaded.');
          return false;
        }

        try {
          // 創建彈窗實例
          const popup = new window.wqPopup();
          // 顯示確認視窗
          popup.confirm(formData, () => {
            const button = document.querySelector(validationOptions.submit_button);
            console.log('button', button);
            if (!button) {
              console.error(`Submit button not found: ${validationOptions.submit_button}`);
              return;
            }
            const href = button.getAttribute('data-href');
            if (href) {
              window.location.href = href;
            }
          }, {
            pop_title: validationOptions.popup_title,
            birth_title: validationOptions.birth_title,
            ...validationOptions.popupOptions  // 允許添加其他彈窗選項
          });
        } catch (error) {
          console.error('Error creating popup:', error);
          return false;
        }

        return false;
      }

      return isValid;
    } catch (error) {
      ErrorHandler.handle(error, 'wqForm.validation');
      return false;
    }
  }

  #collectFormData() {
    const formData = [];

    this.form.querySelectorAll('.wq-group').forEach(group => {
      const dateTimeInstance = this.dateTimeInstances.get(group);  // 從 WeakMap 中獲取實例

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

      // 收集所有 radio 組的數據
      group.querySelectorAll('.radio-group[data-type]').forEach(radioGroup => {
        const type = radioGroup.getAttribute('data-type');
        const checkedRadio = radioGroup.querySelector('input[type="radio"]:checked');
        
        if (checkedRadio) {
          // 對於性別特殊處理
          if (type === 'sex') {
            data.sex = [checkedRadio.value, checkedRadio.value === '0' ? '女' : '男'];
          } else {
            // 其他 radio 組添加到 custom 數組
            data.custom.push([
              type,
              checkedRadio.value,
              checkedRadio.getAttribute('data-title') || checkedRadio.dataset.title || type
            ]);
          }
        }
      });

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

      // 獲取日期時間
      if (dateTimeInstance) {
        const dateTimeData = dateTimeInstance.getFormattedDate();
        if (dateTimeData) {
          data.datetime = dateTimeData;
        }
      }

      formData.push(data);
    });

    // 調試用
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
window.wqForm = wqForm;

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

