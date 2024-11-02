class wqPopup {
    constructor() {
        this.guid = null;
        this.popalert = null;
        this.popconfirm = null;
        this.btn_close = null;
        this.btn_no = null;
        this.btn_yes = null;
        this.btn_xx = null;
    }

    generateGuid() {
        const s4 = () => Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        
        return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    }

    closeAlert(guid) {
        const alert = document.querySelector(`.wq-pop.cover.alert-${guid}`);
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

        this.popalert = document.createElement('div');
        this.popalert.className = `wq-pop cover alert-${this.guid}`;
        this.popalert.innerHTML = `
            <div style="display:block">
                <div class="wqPOP" style="display:block">
                    <div class="TBAR"></div>
                    <div class="COM">
                        <p class="pop_t01">${msg}</p>
                        <div class="BT01">
                            <ul>
                                <li class="btn-alert"></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.popalert.querySelector('.btn-alert').appendChild(this.btn_close);
        document.body.appendChild(this.popalert);
    }

    closeConfirm() {
        const confirm = document.querySelector('.wq-pop.cover');
        if (confirm) {
            confirm.remove();
        }
    }

    confirm(form_data, on_yes, options) {
        const self = this;
        const num = form_data.length;

        this.btn_no = document.createElement('a');
        this.btn_no.textContent = '取消';
        this.btn_no.addEventListener('click', () => self.closeConfirm());

        this.btn_xx = document.createElement('a');
        this.btn_xx.href = '#';
        this.btn_xx.style.backgroundImage = 'url(//imgs.click108.com.tw/wenqu/images/pop_x_icon.png)';
        this.btn_xx.addEventListener('click', (e) => {
            e.preventDefault();
            self.closeConfirm();
        });

        this.btn_yes = document.createElement('a');
        this.btn_yes.textContent = '確定';
        this.btn_yes.addEventListener('click', () => {
            on_yes();
            self.closeConfirm();
        });

        const pop_title = options.pop_title || '請確認您提供的資料是否正確';
        const birth_title = options.birth_title || '生辰';

        this.popconfirm = document.createElement('div');
        this.popconfirm.className = 'wq-pop cover confirm';
        this.popconfirm.innerHTML = `
            <div style="display:block">
                <div class="wqPOP">
                    <div class="TBAR">
                        <div class="XX"></div>
                    </div>
                    <div class="COM">
                        <p class="pop_t01 pop-data-container">${pop_title}：</p>
                        <div class="BT02">
                            <ul>
                                <li class="btn-yes"></li>
                                <li class="btn-no"></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const clonePopconfirm = (i) => {
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
                <p class="pop_t01">姓名：<span class="pop_t03">${form_data[i-1].nickname}</span></p>
                <p class="pop_t01">性別：<span class="pop_t03">${form_data[i-1].sex[1]}</span></p>
                <p class="pop_t01" id="dateFormat">${birth_title}：<span class="pop_t03">${dateString[0]}</span></p>
                <p class="pop_t03" style="margin-left:3em;">${dateString[1]}</p>
                ${this.#generateCustomFields(form_data[i-1].custom)}
            `;
        };

        const clone = [];
        for (let i = 1; i <= num; i++) {
            if (i > 1) {
                clone.push('<div class="POP_LINE"></div>');
            }
            clone.push(clonePopconfirm(i));
        }

        this.popconfirm.querySelector('.btn-yes').appendChild(this.btn_yes);
        this.popconfirm.querySelector('.btn-no').appendChild(this.btn_no);
        this.popconfirm.querySelector('.XX').appendChild(this.btn_xx);
        this.popconfirm.querySelector('.pop-data-container')
            .insertAdjacentHTML('afterend', clone.join(''));

        document.body.appendChild(this.popconfirm);
    }

    #generateCustomFields(custom) {
        if (!custom || !custom.length) return '';
        
        return Object.entries(custom).map(([_, value]) => 
            `<p class="pop_t01">${value[2]}：<span class="pop_t03">${value[1]}</span></p>`
        ).join('');
    }

    confirmCustom(confirmMsgElements, options, ...beforeAndAfterSubmit) {
        const self = this;
        const num = confirmMsgElements.length;

        this.btn_no = document.createElement('a');
        this.btn_no.textContent = '取消';
        this.btn_no.addEventListener('click', () => self.closeConfirm());

        this.btn_xx = document.createElement('a');
        this.btn_xx.href = '#';
        this.btn_xx.style.backgroundImage = 'url(//imgs.click108.com.tw/wenqu/images/pop_x_icon.png)';
        this.btn_xx.addEventListener('click', (e) => {
            e.preventDefault();
            self.closeConfirm();
        });

        this.btn_yes = document.createElement('a');
        this.btn_yes.textContent = '確定';
        this.btn_yes.addEventListener('click', () => {
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

        this.popconfirm = document.createElement('div');
        this.popconfirm.className = 'wq-pop cover confirm';
        this.popconfirm.innerHTML = `
            <div style="display:block">
                <div class="wqPOP">
                    <div class="TBAR">
                        <div class="XX"></div>
                    </div>
                    <div class="COM">
                        <p class="pop_t01 pop-data-container">${pop_title}：</p>
                        <div class="BT02">
                            <ul>
                                <li class="btn-yes"></li>
                                <li class="btn-no"></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const clone = [];
        for (let i = 1; i <= num; i++) {
            if (i > 1) {
                clone.push('<div class="POP_LINE"></div>');
            }
            clone.push(this.#generateConfirmContent(confirmMsgElements[i-1]));
        }

        this.popconfirm.querySelector('.btn-yes').appendChild(this.btn_yes);
        this.popconfirm.querySelector('.btn-no').appendChild(this.btn_no);
        this.popconfirm.querySelector('.XX').appendChild(this.btn_xx);
        this.popconfirm.querySelector('.pop-data-container')
            .insertAdjacentHTML('afterend', clone.join(''));

        document.body.appendChild(this.popconfirm);
    }

    #generateConfirmContent(msgElems) {
        return msgElems.map(elem => 
            `<p class="pop_t01">${elem.title}：<span class="pop_t03">${elem.value}</span></p>`
        ).join('');
    }
}

window.wqPopup = wqPopup;
