class wqForm {
    #groups = [];
    #domCache = new Map();
    #root = null;

    constructor(elem) {
        // 初始化根元素
        this.#root = (typeof elem === 'string')
            ? document.querySelector(elem)
            : (elem instanceof Element ? elem : elem[0]); // 支援從 jQuery 物件轉換

        if (!this.#root) {
            throw new Error('Invalid form element');
        }

        this.#initialize();
    }

    #initialize() {
        this.#detectGroups();
        this.popup = new wqPopup();
    }

    // 私有方法：獲取緩存元素
    #getElements(selector, context = this.#root) {
        const cacheKey = `${context.id || 'root'}-${selector}`;
        
        if (!this.#domCache.has(cacheKey)) {
            const elements = Array.from(context.querySelectorAll(selector));
            this.#domCache.set(cacheKey, elements);
        }
        
        return this.#domCache.get(cacheKey);
    }

    #detectGroups() {
        this.#groups = [];
        const groupElements = this.#getElements('.wq-group');

        groupElements.forEach(groupElem => {
            this.#groups.push({
                nickname: new wqInput(groupElem.querySelector('.wq-input')),
                sex: new wqSex(groupElem.querySelector('.wq-select[data-type="sex"]')),
                datetime: new wqDateTime(groupElem),
                custom: []
            });
        });
    }

    alert(msg) {
        this.popup.alert(msg);
    }

    confirm(msg, options) {
        this.popup.confirm(msg, () => {
            this.submit(options);
        }, options);
    }

    submit(options) {
        requestAnimationFrame(() => {
            // 批量處理閏月應用
            this.#groups.forEach(group => {
                group.datetime?.applyLeapMonth();
            });

            this.#root.setAttribute('action', options.valid_action);
            this.#root.submit();

            // 批量處理閏月恢復
            this.#groups.forEach(group => {
                group.datetime?.restoreLeapMonth();
            });
        });
    }

    addCustomInput(custom_input) {
        const groupElement = custom_input.elem.closest('.wq-group');
        if (!groupElement) return;

        const groupElements = this.#getElements('.wq-group');
        const groupIndex = groupElements.indexOf(groupElement);
        
        if (groupIndex !== -1) {
            this.#groups[groupIndex].custom.push(custom_input);
        }
    }

    validation(options = {}) {
        let valid = true;
        let showConfirm = !options.ignore_confirm;
        const errorMessages = [];

        // 批量處理驗證
        this.#groups.forEach(group => {
            // 暱稱驗證
            const nicknameResult = group.nickname.validation();
            if (!nicknameResult.valid) {
                valid = false;
                if (nicknameResult.errMsg) {
                    errorMessages.push(nicknameResult.errMsg);
                }
            }

            // 性別驗證
            if (!group.sex.validation()) {
                valid = false;
                errorMessages.push("性別欄有誤!");
            }

            // 日期時間驗證
            if (!group.datetime.validation()) {
                valid = false;
                errorMessages.push("您輸入的出生日期有誤！");
            }

            // 自定義輸入驗證
            if (group.custom.length > 0) {
                group.custom.forEach(customInput => {
                    if (!customInput.validation.check()) {
                        valid = false;
                        if (customInput.validation.error) {
                            errorMessages.push(customInput.validation.error);
                        }
                    }
                });
            }
        });

        if (valid) {
            const formData = this.#groups.map(group => this.#buildGroupData(group, options));
            
            if (showConfirm) {
                this.confirm(formData, options);
            }
        } else if (errorMessages.length > 0) {
            this.alert(errorMessages.join("<br />"));
        }

        return valid;
    }

    // 私有方法：構建群組數據
    #buildGroupData(group, options) {
        const hourData = group.datetime.elem.hour === false ? [false, false] : [
            group.datetime.elem.hour.value,
            group.datetime.elem.hour.querySelector('option:checked')?.textContent || ''
        ];

        return {
            nickname: group.nickname.elem.value,
            sex: [
                group.datetime.elem.calendar.value,
                group.datetime.elem.calendar.querySelector('option:checked')?.textContent || ''
            ],
            datetime: {
                calendar: [
                    group.datetime.elem.calendar.value,
                    group.datetime.elem.calendar.querySelector('option:checked')?.textContent || ''
                ],
                year: [
                    group.datetime.elem.year.value,
                    group.datetime.elem.year.querySelector('option:checked')?.textContent || ''
                ],
                month: [
                    group.datetime.elem.month.value,
                    group.datetime.elem.month.querySelector('option:checked')?.textContent || ''
                ],
                day: [
                    group.datetime.elem.day.value,
                    group.datetime.elem.day.querySelector('option:checked')?.textContent || ''
                ],
                hour: hourData,
                solarString: group.datetime.toSolarString(),
                lunarString: group.datetime.toLunarString()
            },
            date_format: options.date_format || false,
            custom: group.custom.map(item => this.#buildCustomElement(item))
        };
    }

    // 私有方法：構建自定義元素數據
    #buildCustomElement(item) {
        const elem = item.elem;
        const tagName = elem.tagName.toUpperCase();
        const type = elem.type?.toUpperCase();

        switch(tagName) {
            case 'SELECT':
                return [
                    elem.value,
                    elem.querySelector('option:checked')?.textContent || '',
                    item.name
                ];
            case 'INPUT':
                switch(type) {
                    case 'RADIO': {
                        const checked = elem.querySelector(':checked');
                        return [
                            checked?.value || '',
                            checked?.closest('label')?.textContent.trim() || '',
                            item.name
                        ];
                    }
                    case 'CHECKBOX': {
                        const checked = Array.from(elem.querySelectorAll(':checked'));
                        return [
                            checked.map(el => el.value),
                            checked.map(el => el.closest('label')?.textContent.trim() || '').join('、'),
                            item.name
                        ];
                    }
                    case 'TEXT':
                        return [elem.value, elem.value, item.name];
                }
        }
        return ['', '', item.name];
    }

    // 資源清理
    destroy() {
        this.#groups.forEach(group => {
            group.nickname?.destroy();
            group.sex?.destroy();
            group.datetime?.destroy();
            group.custom.forEach(custom => custom?.destroy());
        });
        this.#groups = [];
        this.#domCache.clear();
        this.popup?.destroy();
    }
}
