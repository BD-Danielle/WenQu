class wqForm {
  constructor(elem, options = {}) {
    this.form = (typeof elem === 'string') ?
      document.querySelector(elem) :
      (elem instanceof Element ? elem : null);

    if (!this.form) {
      throw new Error('Invalid form element');
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
    this.init();
  }

  init() {
    // 初始化所有輸入框
    this.form.querySelectorAll('.wq-input').forEach(input => {
      if (!input.wqInput) {
        input.wqInput = new wqInput(input);
      }
    });

    // 初始化所有日期時間選擇器
    this.form.querySelectorAll('.wq-group').forEach(group => {
      if (!this.dateTimeInstances.has(group)) {
        const instance = new wqDateTime(group);
        this.dateTimeInstances.set(group, instance);
      }
    });
  }

  validation(options = {}) {
    // 合併驗證時的選項
    const validationOptions = {
      ...this.options,  // 使用構造函數中的默認選項
      ...options  // 允許在驗證時覆蓋選項
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

      // 收集所有 wq-input 輸入框的數據
      group.querySelectorAll('.wq-input').forEach(input => {
        const type = input.getAttribute('data-type');
        const value = input.value.trim();

        if (type === 'nickname') {
          data.nickname = value;
        } else {
          // 使用配置中的標籤或回退到預設值
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

      // 獲取性別
      const sexSelect = group.querySelector('.wq-select[data-type="sex"]');
      if (sexSelect) {
        data.sex = [sexSelect.value, sexSelect.value === '0' ? '女' : '男'];
      }

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

  destroy() {
    // 清理所有實例
    this.dateTimeInstances.forEach((instance, group) => {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
    this.dateTimeInstances = new WeakMap();

    // 移除所有錯誤提示
    this.form.querySelectorAll('.error-message').forEach(msg => msg.remove());

    // 清理引用
    this.form = null;
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

