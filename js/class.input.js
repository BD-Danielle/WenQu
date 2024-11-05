class wqInput {
    #input = null;
    #iconX = null;
    #fadeTimer = null;

    constructor(elem) {
        this.#input = (typeof elem === 'string') ? 
            document.querySelector(elem) : 
            (elem instanceof Element ? elem : null);

        if (!this.#input) {
            throw new Error('Invalid input element');
        }

        this.#appendIconX();
        this.#bindEvents();
        this.defaultName();
    }

    #appendIconX() {
        // 檢查是否已存在 iconX
        const existingIconX = this.#input.nextElementSibling?.matches('.wq-iconx');
        if (existingIconX) {
            this.#iconX = this.#input.nextElementSibling;
        } else {
            // 創建新的 iconX
            this.#iconX = document.createElement('span');
            this.#iconX.className = 'wq-iconx';
            this.#iconX.textContent = '';
            
            // 設置樣式
            this.#iconX.style.display = 'none';
            this.#iconX.style.opacity = '0';
            
            // 插入到 input 後面
            this.#input.insertAdjacentElement('afterend', this.#iconX);

            // 綁定點擊事件
            this.#iconX.addEventListener('click', (event) => {
                event.preventDefault();
                this.hideIconX();
                this.#input.value = '';
                this.#input.focus();
            });
        }
    }

    showIconX() {
        // 取消之前的淡出動畫
        if (this.#fadeTimer) {
            clearTimeout(this.#fadeTimer);
            this.#fadeTimer = null;
        }

        this.#iconX.style.display = 'inline-block';
        
        // 使用 requestAnimationFrame 實現平滑過渡
        requestAnimationFrame(() => {
            this.#iconX.style.transition = 'opacity 100ms ease-in';
            this.#iconX.style.opacity = '1';
        });
    }

    hideIconX() {
        this.#iconX.style.transition = 'opacity 500ms ease-out';
        this.#iconX.style.opacity = '0';
        
        // 等待過渡完成後隱藏元素
        this.#fadeTimer = setTimeout(() => {
            this.#iconX.style.display = 'none';
            this.#fadeTimer = null;
        }, 500);
    }

    #bindEvents() {
        // 聚焦和點擊事件
        this.#input.addEventListener('focus', () => {
            this.#input.classList.remove('error');
            if (this.#input.value.length > 0) {
                this.showIconX();
            }
        });

        this.#input.addEventListener('click', () => {
            this.#input.classList.remove('error');
            if (this.#input.value.length > 0) {
                this.showIconX();
            }
        });

        // 失焦事件
        this.#input.addEventListener('blur', () => {
            this.hideIconX();
            if (this.#input.value.length === 0) {
                this.#input.classList.add('error');
            }
        });

        // 輸入事件
        this.#input.addEventListener('input', () => {
            if (this.#input.value.length > 0) {
                this.showIconX();
            } else {
                this.hideIconX();
            }
        });

        // 阻止回車事件
        this.#input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                return false;
            }
        });
    }

    defaultName() {
        const defaultValue = this.#input.dataset.value;
        if (defaultValue) {
            this.#input.value = defaultValue;
        }
    }

    validation() {
        let result = {
            valid: true,
            errMsg: ''
        };

        const value = this.#input.value.trim();
        const format = this.#input.dataset.format;
        let maxLength = 0;
        
        // 檢查是否為空
        if (!value) {
            result.valid = false;
            result.errMsg = '';
            this.#input.value = '';
            this.#input.classList.add('error');
            return result;
        }

        // 如果有指定格式，進行格式驗證
        if (format) {
            // 處理中文字數限制格式 (例如: chi2, chi3)
            if (/^chi(\d*)$/.test(format)) {
                const match = format.match(/^chi(\d*)$/);
                if (match[1]) {
                    maxLength = parseInt(match[1], 10);
                }
            }

            // 根據格式進行驗證
            switch (format) {
                case 'chi':
                    if (!/^[\u4e00-\u9fa5\u3400-\u4db5]+$/.test(value) || /\s/.test(value)) {
                        result.valid = false;
                        result.errMsg = '格式錯誤，僅可輸入中文字';
                    } else if (maxLength > 0 && value.length > maxLength) {
                        result.valid = false;
                        result.errMsg = `格式錯誤，最多可輸入${maxLength}個中文字`;
                    }
                    break;

                case 'chi_eng':
                    if (!/^[a-zA-Z\u4e00-\u9fa5\u3400-\u4db5]+$/.test(value)) {
                        result.valid = false;
                        result.errMsg = '格式錯誤，僅可輸入中文或英文';
                    }
                    break;

                case 'num':
                    if (!/^\d+[.]?\d*$/.test(value)) {
                        result.valid = false;
                        result.errMsg = '格式錯誤，僅可輸入數字';
                    }
                    break;

                default:
                    // 處理其他 chi{n} 格式
                    if (/^chi\d+$/.test(format)) {
                        if (!/^[\u4e00-\u9fa5\u3400-\u4db5]+$/.test(value) || /\s/.test(value)) {
                            result.valid = false;
                            result.errMsg = '格式錯誤，僅可輸入中文字';
                        } else if (maxLength > 0 && value.length > maxLength) {
                            result.valid = false;
                            result.errMsg = `格式錯誤，最多可輸入${maxLength}個中文字`;
                        }
                    }
                    break;
            }
        }

        // 根據驗證結果設置錯誤狀態
        if (!result.valid) {
            this.#input.classList.add('error');
            if (result.errMsg) {
                this.showError(result.errMsg);
            }
        } else {
            this.#input.classList.remove('error');
            this.hideError();
        }

        return result;
    }

    showError(message) {
        // 移除舊的錯誤提示
        this.hideError();

        // 創建新的錯誤提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.#input.parentElement.appendChild(errorDiv);
    }

    hideError() {
        const errorMessage = this.#input.parentElement.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // 清理方法
    destroy() {
        // 移除所有事件監聽器
        this.#input.replaceWith(this.#input.cloneNode(true));
        
        // 移除 iconX
        if (this.#iconX) {
            this.#iconX.remove();
        }

        // 清理計時器
        if (this.#fadeTimer) {
            clearTimeout(this.#fadeTimer);
        }

        // 清理引用
        this.#input = null;
        this.#iconX = null;
        this.#fadeTimer = null;
    }
}

// 在 DOMContentLoaded 時初始化所有輸入框
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.wq-input').forEach(input => {
        if (!input.wqInput) {
            input.wqInput = new wqInput(input);
        }
    });
});
