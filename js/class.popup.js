export class wqPopup {
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
    const guid = this.generateGuid();

    this.popupAlert = document.createElement('div');
    this.popupAlert.className = `popup__modal alert-${guid}`;
    this.popupAlert.innerHTML = `
         <div class="popup">
            <div class="popup__header">
              <span class="popup__close-btn"></span>
            </div>
            <div class="popup__content">${msg}</div>
            <div class="popup__actions">
              <div class="popup__alert-btn">
                <a class="popup__button">確定</a>
              </div>
            </div>
          </div>
        `;

    // 添加事件監聽器到確定按鈕
    this.popupAlert.querySelector('.popup__alert-btn .popup__button').addEventListener('click', () => this.closeAlert(guid));

    // 為關閉按鈕添加事件監聽器
    this.popupAlert.querySelector('.popup__close-btn').addEventListener('click', () => this.closeAlert(guid));

    // 將彈窗添加到頁面
    document.body.appendChild(this.popupAlert);
  }

  closeConfirm() {
    const confirm = document.querySelector('.popup__modal');
    if (confirm) {
      confirm.remove();
    }
  }

  confirm(form_data, submit, options) {
    const num = form_data.length;
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
					<div class="popup__confirm-btn"><a class="popup__button">確定</a></div>
					<div class="popup__cancel-btn"><a class="popup__button">取消</a></div>
				</div>
			</div>
		`;
    // 添加事件監聽器到關閉按鈕
    this.popupConfirm.querySelector('.popup__close-btn').addEventListener('click', () => this.closeConfirm());
    // 添加事件監聽器到確定按鈕
    this.popupConfirm.querySelector('.popup__confirm-btn .popup__button').addEventListener('click', () => {
      submit();
      this.closeConfirm();
    });
    this.popupConfirm.querySelector('.popup__cancel-btn .popup__button').addEventListener('click', () => this.closeConfirm());


    const clonePopupConfirm = (i) => {
      const dateString = [];
      dateString.push(form_data[i - 1].datetime.calendar[0] == 1 ?
        `西元${form_data[i - 1].datetime.solarString}` : `農曆${form_data[i - 1].datetime.lunarString}`);
      dateString.push((form_data[i - 1].datetime.hour[0] === false ? '' :
        form_data[i - 1].datetime.hour[1]));
      let html = `
				<div class="popup__item">
					<span class="popup__label">${name_title}：</span>
					<span class="popup__value">${form_data[i - 1].nickname}</span>
				</div>
				<div class="popup__item">
					<span class="popup__label">${sex_title}：</span>
					<span class="popup__value">${form_data[i - 1].sex[1]}</span>
				</div>
				<div class="popup__item">
					<span class="popup__label">${birth_title}：</span>
					<span class="popup__value">${dateString[0]}</span>
				</div>`;

      if (dateString[1]) {
        html += `
				<div class="popup__item">
					<span class="popup__label" style="color: #fff;">${hour_title}：</span>
					<span class="popup__value">${dateString[1]}</span>
				</div>`;
      }

      if (form_data[i - 1].custom && form_data[i - 1].custom.length > 0) {
        html += this.#generateCustomFields(form_data[i - 1].custom);
      }

      return html;
    };

    const clone = [];
    for (let i = 1; i <= num; i++) {
      if (i > 1) {
        clone.push('<div class="popup__border-line"></div>');
      }
      clone.push(clonePopupConfirm(i));
    }

    this.popupConfirm.querySelector('.popup__content')
      .insertAdjacentHTML('beforeend', clone.join(''));

    document.body.appendChild(this.popupConfirm);
  }

  #generateCustomFields(custom) {
    if (!custom || !Array.isArray(custom)) return '';

    return custom.map(field => {
      if (!field || !Array.isArray(field) || field.length < 3) return '';

      return `
				<div class="popup__item">
					<span class="popup__label">${field[2]}：</span>
					<span class="popup__value">${field[1]}</span>
				</div>
			`;
    }).join('');
  }

  confirmCustom(confirmMsgElements, options, ...beforeAndAfterSubmit) {
    const num = confirmMsgElements.length;

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
        <div class="popup__confirm-btn"><a class="popup__button">確定</a></div>
        <div class="popup__cancel-btn"><a class="popup__button">取消</a></div>
      </div>
    </div>
  `;

    const clone = [];
    for (let i = 1; i <= num; i++) {
      if (i > 1) {
        clone.push('<div class="popup__border-line"></div>');
      }
      clone.push(this.#generateConfirmContent(confirmMsgElements[i - 1]));
    }


    this.popupConfirm.querySelector('.popup__content')
      .insertAdjacentHTML('beforeend', clone.join(''));

    document.body.appendChild(this.popupConfirm);

    // 使用事件委託綁定所有關閉相關的事件
    this.popupConfirm.addEventListener('click', (e) => {
      // 使用 closest 來檢查點擊的是否是按鈕或其容器
      if (e.target.matches('.popup__close-btn') ||
        e.target.closest('.popup__cancel-btn')) {
        this.closeConfirm();
      } else if (e.target.closest('.popup__confirm-btn')) {
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
        this.closeConfirm();
      }
    });
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

// 為了向後相容，也可以掛載到 window 對象
if (typeof window !== 'undefined') {
  window.wqPopup = wqPopup;
}
