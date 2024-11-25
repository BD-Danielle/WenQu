class wqRadio {
    #root = null;
    #label = null;
    #styleSheet = null;

    constructor(elem) {
        // 初始化根元素，支援三種傳入方式：
        // 1. CSS 選擇器字符串
        // 2. DOM 元素
        // 3. jQuery 物件
        this.#root = (typeof elem === 'string')
            ? document.querySelector(elem)
            : (elem instanceof Element ? elem : elem[0]);

        if (!this.#root) {
            throw new Error('Invalid radio element');
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
        try {
            if (this.#root.dataset.type) {
                this.#root.type = this.#root.dataset.type;
            }
        } catch(e) { }

        if (this.#root.dataset.name) {
            this.#root.name = this.#root.dataset.name;
        }

        if (this.#root.dataset.value) {
            this.#root.value = this.#root.dataset.value;
        }

        if (this.#root.dataset.checked === '1') {
            this.#root.checked = true;
        }

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
