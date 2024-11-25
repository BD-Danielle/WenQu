class wqRadio {
    #root = null;
    #label = null;
    #styleSheet = null;
    #options = null;

    constructor(elem, options = null) {
        this.#root = (typeof elem === 'string')
            ? document.querySelector(elem)
            : (elem instanceof Element ? elem : elem[0]);

        if (!this.#root) {
            throw new Error('Invalid radio element');
        }

        try {
            this.#options = options || (this.#root.dataset.options ? 
                JSON.parse(this.#root.dataset.options) : null);
        } catch (e) {
            console.warn('Failed to parse radio options:', e);
        }

        if (this.#root.getAttribute('wq-init') !== '1' && 
            !document.querySelector(`label[for="${this.#root.id}"]`)) {
            this.#setup();
            this.#buildLabel();
        }
    }

    #setup() {
        // 生成唯一 ID（如果沒有）
        if (!this.#root.id) {
            const radios = Array.from(document.querySelectorAll('.wq-radio'));
            const index = radios.indexOf(this.#root);
            this.#root.id = `wq-radio-${index}`;
        }

        // 設置屬性
        if (this.#root.dataset.type) {
            this.#root.type = this.#root.dataset.type;
        }

        const name = this.#root.dataset.name || this.#options?.name;
        const value = this.#root.dataset.value || this.#options?.value;
        const checked = this.#root.dataset.checked === '1' || this.#options?.checked;

        if (name) this.#root.name = name;
        if (value) this.#root.value = value;
        if (checked) this.#root.checked = true;

        this.#root.setAttribute('wq-init', '1');
    }

    #buildLabel() {
        // 創建標籤元素
        this.#label = document.createElement('label');
        this.#label.setAttribute('for', this.#root.id);
        this.#label.textContent = this.#root.dataset.title || '';

        // 插入標籤
        this.#root.insertAdjacentElement('afterend', this.#label);

        // 處理背景顏色
        this.#handleBackgroundColor();

        // 處理文字顏色
        this.#handleTextColor();
    }

    #handleBackgroundColor() {
        const bgColor = this.#root.dataset.bgcolor;
        if (!bgColor) return;

        if (this.#isValidColor(bgColor)) {
            this.#addStyle(`
                #${this.#root.id}:checked + label {
                    background-color: ${bgColor};
                }
            `);
        }
    }

    #handleTextColor() {
        const color = this.#root.dataset.color;
        if (!color) return;

        if (this.#isValidColor(color)) {
            this.#addStyle(`
                #${this.#root.id} + label {
                    color: ${color};
                }
                #${this.#root.id} + label::before {
                    color: ${color};
                }
                #${this.#root.id} + label {
                    border: 1px solid ${color};
                }
            `);
        }
    }

    #isValidColor(color) {
        return /^#[0-9A-F]{3}$/i.test(color) || /^#[0-9A-F]{6}$/i.test(color);
    }

    #addStyle(cssText) {
        if (!this.#styleSheet) {
            const style = document.createElement('style');
            document.head.appendChild(style);
            this.#styleSheet = style.sheet;
        }

        try {
            if (this.#styleSheet.insertRule) {
                this.#styleSheet.insertRule(cssText, 0);
            } else if (this.#styleSheet.addRule) {
                // IE 兼容性支持
                cssText.split('}').forEach(rule => {
                    if (rule.trim()) {
                        const [selector, styles] = rule.split('{');
                        this.#styleSheet.addRule(selector, styles);
                    }
                });
            }
        } catch (e) {
            console.warn('Failed to add style rule:', e);
        }
    }

    // 資源清理
    destroy() {
        if (this.#label) {
            this.#label.remove();
        }
        if (this.#styleSheet) {
            const styleElement = this.#styleSheet.ownerNode;
            if (styleElement) {
                styleElement.remove();
            }
        }
        this.#root.removeAttribute('wq-init');
    }
}

// 添加靜態方法來創建選項組
wqRadio.createGroup = function(container, options) {
    if (!container || !options?.items) return;

    const fragment = document.createDocumentFragment();
    const groupDiv = document.createElement('div');
    groupDiv.className = 'radio-group';
    groupDiv.setAttribute('data-type', options.type || 'custom');

    // 添加標題（如果有）
    if (options.title) {
        const title = document.createElement('h3');
        title.textContent = options.title;
        groupDiv.appendChild(title);
    }

    // 創建選項
    options.items.forEach((item, index) => {
        const input = document.createElement('input');
        input.className = 'wq-radio';
        input.type = 'radio';
        input.id = `${options.type}-${index}`;
        input.name = options.type;
        input.value = item.value;
        input.setAttribute('data-title', item.text);
        input.setAttribute('data-type', 'radio');
        
        const label = document.createElement('label');
        label.setAttribute('for', input.id);
        label.textContent = item.text;

        groupDiv.appendChild(input);
        groupDiv.appendChild(label);
    });

    fragment.appendChild(groupDiv);
    container.appendChild(fragment);

    // 初始化所有新創建的 radio 按鈕
    groupDiv.querySelectorAll('.wq-radio').forEach(radio => {
        new wqRadio(radio);
    });

    return groupDiv;
};
