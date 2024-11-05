class wqPopup {
    constructor() {
        this.guid = null;
        this.popupAlert = null;
        this.popupConfirm = null;
        this.btn_close = null;
        this.btn_cancel = null;
        this.btn_confirm = null;
        this.close_btn = null;
    }

    generateGuid() {
        const s4 = () => Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        
        return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    }

    closeAlert(guid) {
        const alert = document.querySelector(`.popup__modal.alert-${guid}`);
        if (alert) {
            alert.remove();
        }
    }

    alert(msg) {
        const self = this;
        this.guid = this.generateGuid();

        this.btn_close = document.createElement('a');
        this.btn_close.textContent = '確定';
        this.btn_close.addEventListener('click', () => self.closeAlert(self.guid));

        this.popupAlert = document.createElement('div');
        this.popupAlert.className = `popup__modal alert-${this.guid}`;
        this.popupAlert.innerHTML = `
                <div class="popup">
                    <div class="popup__header">
                    <span class="popup__close-btn"></span>
                </div>
                <div class="popup__content">${msg}</div>
                <div class="popup__actions">
                    <div class="popup__alert-btn"></div>
                </div>
                </div>
        `;

        this.popupAlert.querySelector('.popup__alert-btn').appendChild(this.btn_close);
        document.body.appendChild(this.popupAlert);
    }

    closeConfirm() {
        const confirm = document.querySelector('.popup__modal');
        if (confirm) {
            confirm.remove();
        }
    }

    confirm(form_data, submit, options) {
        const self = this;
        const num = form_data.length;

        this.btn_cancel = document.createElement('a');
        this.btn_cancel.className = 'popup__button';
        this.btn_cancel.textContent = '取消';
        this.btn_cancel.addEventListener('click', () => self.closeConfirm());

        this.close_btn = document.createElement('span');
        this.close_btn.className = 'popup__close-btn';
        this.close_btn.addEventListener('click', (e) => {
            e.preventDefault();
            self.closeConfirm();
        });

        this.btn_confirm = document.createElement('a');
        this.btn_confirm.className = 'popup__button';
        this.btn_confirm.textContent = '確定';
        this.btn_confirm.addEventListener('click', () => {
            submit();
            self.closeConfirm();
        });

        const pop_title = options.pop_title || '請確認您提供的資料是否正確';
        const name_title = options.name_title || '姓名';
        const sex_title = options.sex_title || '性別';
        const birth_title = options.birth_title || '生辰';
        const hour_title = options.hour_title || '時辰';

        this.popupConfirm = document.createElement('div');
        this.popupConfirm.className = 'popup__modal';
        this.popupConfirm.innerHTML = `
            <div class="popup">
                <div class="popup__header">
                    <span class="popup__close-btn"></span>
                </div>
                <div class="popup__content--header">${pop_title}：</div>
                <div class="popup__content"></div>
                <div class="popup__actions">
                    <div class="popup__confirm-btn"></div>
                    <div class="popup__cancel-btn"></div>
                </div>
            </div>
        `;

        const clonePopupConfirm = (i) => {
            const dateString = [];
            if (form_data[i-1].date_format === 'both') {
                dateString.push(form_data[i-1].datetime.solarString + 
                    (form_data[i-1].datetime.hour[0] === false ? '' : ' ' + form_data[i-1].datetime.hour[1]));
                dateString.push(form_data[i-1].datetime.lunarString + 
                    (form_data[i-1].datetime.hour[0] === false ? '' : ' ' + form_data[i-1].datetime.hour[1]));
            } else {
                dateString.push(form_data[i-1].datetime.calendar[0] == 1 ? 
                    form_data[i-1].datetime.solarString : form_data[i-1].datetime.lunarString);
                dateString.push((form_data[i-1].datetime.hour[0] === false ? '' : 
                    form_data[i-1].datetime.hour[1]));
            }

            return `
                <div class="popup__item">
                    <span class="popup__label">${name_title}：</span>
                    <span class="popup__value">${form_data[i-1].nickname}</span>
                </div>
                <div class="popup__item">
                    <span class="popup__label">${sex_title}：</span>
                    <span class="popup__value">${form_data[i-1].sex[1]}</span>
                </div>
                <div class="popup__item">
                    <span class="popup__label">${birth_title}：</span>
                    <span class="popup__value">${dateString[0]}</span>
                </div>
                <div class="popup__item">
                    <span class="popup__label">${hour_title}：</span>
                    <span class="popup__value">${dateString[1]}</span>
                </div>
                ${this.#generateCustomFields(form_data[i-1].custom)}
            `;
        };

        const clone = [];
        for (let i = 1; i <= num; i++) {
            if (i > 1) {
                clone.push('<div class="popup__border-line"></div>');
            }
            clone.push(clonePopupConfirm(i));
        }

        this.popupConfirm.querySelector('.popup__confirm-btn').appendChild(this.btn_confirm);
        this.popupConfirm.querySelector('.popup__cancel-btn').appendChild(this.btn_cancel);
        this.popupConfirm.querySelector('.popup__close-btn').appendChild(this.close_btn);
        this.popupConfirm.querySelector('.popup__content')
            .insertAdjacentHTML('beforeend', clone.join(''));

        document.body.appendChild(this.popupConfirm);
    }

    #generateCustomFields(custom) {
        if (!custom || !custom.length) return '';
        
        return Object.entries(custom).map(([_, value]) => 
            `<div class="popup__item">
                <span class="popup__label">${value[2]}：</span>
                <span class="popup__value">${value[1]}</span>
            </div>
            `
        ).join('');
    }

    confirmCustom(confirmMsgElements, options, ...beforeAndAfterSubmit) {
        const self = this;
        const num = confirmMsgElements.length;

        this.btn_cancel = document.createElement('a');
        this.btn_cancel.textContent = '取消';
        this.btn_cancel.className = 'popup__button popup__cancel';
        this.btn_cancel.addEventListener('click', () => self.closeConfirm());

        this.close_btn = document.createElement('span');
        this.close_btn.className = 'popup__close-btn';
        this.close_btn.addEventListener('click', (e) => {
            e.preventDefault();
            self.closeConfirm();
        });

        this.btn_confirm = document.createElement('a');
        this.btn_confirm.textContent = '確定';
        this.btn_confirm.className = 'popup__button';
        this.btn_confirm.addEventListener('click', () => {
            if (beforeAndAfterSubmit.length > 0 && typeof beforeAndAfterSubmit[0] === 'function') {
                beforeAndAfterSubmit[0]();
            }

            const form = document.getElementById(options.form_id);
            if (form) {
                form.action = options.valid_action;
                form.submit();
            }

            if (beforeAndAfterSubmit.length > 1 && typeof beforeAndAfterSubmit[1] === 'function') {
                beforeAndAfterSubmit[1]();
            }
            self.closeConfirm();
        });

        const pop_title = options.pop_title || '請確認您提供的資料是否正確';

        this.popupConfirm = document.createElement('div');
        this.popupConfirm.className = 'popup__modal';
        this.popupConfirm.innerHTML = `
            <div class="popup">
                <div class="popup__header">
                    <span class="popup__close-btn"></span>
                </div>
                <div class="popup__content--header">${pop_title}：</div>
                <div class="popup__content"></div>
                <div class="popup__actions">
                    <div class="popup__confirm-btn"></div>
                    <div class="popup__cancel-btn"></div>
                </div>
            </div>
        `;

        const clone = [];
        for (let i = 1; i <= num; i++) {
            if (i > 1) {
                clone.push('<div class="popup__border-line"></div>');
            }
            clone.push(this.#generateConfirmContent(confirmMsgElements[i-1]));
        }

        this.popupConfirm.querySelector('.popup__confirm-btn').appendChild(this.btn_confirm);
        this.popupConfirm.querySelector('.popup__cancel-btn').appendChild(this.btn_cancel);
        this.popupConfirm.querySelector('.popup__close-btn').appendChild(this.close_btn);
        this.popupConfirm.querySelector('.popup__content')
            .insertAdjacentHTML('beforeend', clone.join(''));

        document.body.appendChild(this.popupConfirm);
    }

    #generateConfirmContent(msgElems) {
        return msgElems.map(elem => 
            `<div class="popup__item">
                <span class="popup__label">${elem.title}：</span>
                <span class="popup__value">${elem.value}</span>
            </div>
            `
        ).join('');
    }
}

window.wqPopup = wqPopup;
