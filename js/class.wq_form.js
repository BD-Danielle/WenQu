class wqForm {
    constructor(elem) {
        this.form = (typeof elem === 'string') ? 
            document.querySelector(elem) : 
            (elem instanceof Element ? elem : null);

        if (!this.form) {
            throw new Error('Invalid form element');
        }

        this.dateTimeInstances = new WeakMap(); // 使用 WeakMap 存儲實例
        this.init();
    }

    init() {
        try {
            // 初始化輸入框
            const inputs = this.form.querySelectorAll('.wq-input');
            inputs.forEach(input => {
                if (!input.wqInput) {
                    input.wqInput = new wqInput(input);
                }
            });

            // 初始化日期時間選擇器
            const dateTimeGroups = this.form.querySelectorAll('.wq-group');
            dateTimeGroups.forEach(group => {
                if (!this.dateTimeInstances.has(group)) {
                    const instance = new wqDateTime(group);
                    this.dateTimeInstances.set(group, instance);
                }
            });

            // 初始化性別選擇器（如果需要）
            const sexSelects = this.form.querySelectorAll('.wq-select[data-type="sex"]');
            sexSelects.forEach(select => {
                if (!select.wqSex) {
                    select.wqSex = new wqSex(select);
                }
            });
        } catch (error) {
            console.error('Form initialization error:', error);
        }
    }

    validation() {
        let isValid = true;

        // 驗證輸入框
        this.form.querySelectorAll('.wq-input').forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
                this.showError(input, '此欄位不能為空');
            } else {
                input.classList.remove('error');
                const existingError = input.parentElement.querySelector('.error-message');
                if (existingError) existingError.remove();
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
            
            // 創建彈窗實例
            const popup = new wqPopup();
            
            // 顯示確認視窗，將跳轉邏輯移到 on_yes 回調中
            popup.confirm(formData, () => {
                const button = document.querySelector('#checkGo_free');
                const href = button?.getAttribute('data-href');
                if (href) {
                    window.location.href = href;
                }
            }, {
                pop_title: '請確認您提供的資料是否正確',
                birth_title: '你的生辰'
            });

            // 返回 false 阻止表單默認提交
            return false;
        }

        return isValid;
    }

    #collectFormData() {
        const formData = [];
        
        // 獲取所有 wq-group
        this.form.querySelectorAll('.wq-group').forEach(group => {
            const data = {
                nickname: '',
                sex: ['', ''],
                datetime: {
                    calendar: ['', ''],
                    solarString: '',
                    lunarString: '',
                    hour: [false, '']
                },
                date_format: 'both',
                custom: []
            };

            // 獲取姓名
            const input = group.querySelector('.wq-input');
            if (input) {
                data.nickname = input.value.trim();
            }

            // 獲取性別
            const sexSelect = group.querySelector('.wq-select[data-type="sex"]');
            if (sexSelect) {
                data.sex = [sexSelect.value, sexSelect.value === '0' ? '女' : '男'];
            }

            // 獲取日期時間
            const calendar = group.querySelector('.wq-select[data-type="calendar"]');
            const year = group.querySelector('.wq-select[data-type="year"]');
            const month = group.querySelector('.wq-select[data-type="month"]');
            const day = group.querySelector('.wq-select[data-type="day"]');
            const hour = group.querySelector('.wq-select[data-type="hour"]');

            if (calendar && year && month && day) {
                data.datetime.calendar = [calendar.value, calendar.value === '0' ? '農曆' : '西元'];
                const dateStr = `${year.value}年${month.value}月${day.value}日`;
                data.datetime.solarString = calendar.value === '1' ? dateStr : '';
                data.datetime.lunarString = calendar.value === '0' ? dateStr : '';
            }

            if (hour) {
                data.datetime.hour = [true, hour.options[hour.selectedIndex].text];
            }

            formData.push(data);
        });

        return formData;
    }

    showError(element, message) {
        const parent = element.parentElement;
        if (!parent) return;

        // 移除舊的錯誤示
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
        // 清理所有 DateTime 實例
        this.dateTimeInstances.forEach(instance => {
            if (instance && typeof instance.destroy === 'function') {
                instance.destroy();
            }
        });

        // 移除錯誤提示
        this.form.querySelectorAll('.error-message').forEach(msg => msg.remove());
        
        // 清理引用
        this.dateTimeInstances = null;
        this.form = null;
    }
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

