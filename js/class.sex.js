class wqSex {
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
        const defaultValue = this.#select.getAttribute('data-value');
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
        if (this.#options.some(opt => opt.value === parseInt(value, 10))) {
            this.#select.value = value;
        }
    }

    // 驗證
    validation() {
        const value = this.#select.value;
        return {
            valid: value !== null && value !== undefined && value !== '',
            errMsg: value === '' ? '請選擇性別' : ''
        };
    }

    // 清理方法
    destroy() {
        this.#select = null;
    }
}

// 在 DOMContentLoaded 時初始化所有性別選擇器
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.wq-select[data-type="sex"]').forEach(select => {
        if (!select.wqSex) {
            select.wqSex = new wqSex(select);
        }
    });
});
