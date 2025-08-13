/**
 * wqPopup 彈窗處理類別（現代私有化重構版）
 * 提供 alert 和 confirm 兩種彈窗功能
 */
export class wqPopup {
  #currentPopup = null;

  // 私有：生成彈窗內容
  #generateContent(data, titles) {
    if (!Array.isArray(data)) return '';
    return data.map((item, index) => {
      let html = '';
      if (index > 0) html += '<div class="popup__border-line"></div>';
      if (this.#isFormData(item)) {
        html += this.#generateFormDataHTML(item, titles);
      } else if (this.#isCustomData(item)) {
        html += this.#generateCustomDataHTML(item);
      }
      return html;
    }).join('');
  }

  // 私有：判斷是否為表單數據格式
  #isFormData(item) {
    return item && typeof item === 'object' &&
      (item.nickname !== undefined || item.sex !== undefined || item.datetime !== undefined);
  }

  // 私有：判斷是否為自定義數據格式
  #isCustomData(item) {
    return Array.isArray(item) && item.length > 0 &&
      item.every(field => field && field.title && field.value);
  }

  // 私有：生成表單數據 HTML
  #generateFormDataHTML(data, titles) {
    let html = '';
    if (data.nickname) {
      html += `
        <div class="popup__item">
          <span class="popup__label">${titles.name_title}：</span>
          <span class="popup__value">${data.nickname}</span>
        </div>
      `;
    }
    if (data.sex && data.sex[1]) {
      html += `
        <div class="popup__item">
          <span class="popup__label">${titles.sex_title}：</span>
          <span class="popup__value">${data.sex[1]}</span>
        </div>
      `;
    }
    if (data.datetime) {
      const dateString = data.datetime.calendar[0] == 1 ?
        `西元${data.datetime.solarString}` :
        `農曆${data.datetime.lunarString}`;
      html += `
        <div class="popup__item">
          <span class="popup__label">${titles.birth_title}：</span>
          <span class="popup__value">${dateString}</span>
        </div>
      `;
      if (data.datetime.hour[0] && data.datetime.hour[1]) {
        html += `
          <div class="popup__item">
            <span class="popup__label">${titles.hour_title ? `${titles.hour_title}：` : ''}</span>
            <span class="popup__value">${data.datetime.hour[1]}</span>
          </div>
        `;
      }
    }
    if (data.custom && Array.isArray(data.custom)) {
      data.custom.forEach(field => {
        if (field && Array.isArray(field) && field.length >= 3) {
          html += `
            <div class="popup__item">
              <span class="popup__label">${field[2]}：</span>
              <span class="popup__value">${field[1]}</span>
            </div>
          `;
        }
      });
    }
    return html;
  }

  // 私有：生成自定義數據 HTML
  #generateCustomDataHTML(customFields) {
    return customFields.map(field => `
      <div class="popup__item">
        <span class="popup__label">${field.title}：</span>
        <span class="popup__value">${field.value}</span>
      </div>
    `).join('');
  }

  // 私有：綁定關閉事件（alert 用）
  #bindCloseEvents() {
    if (!this.#currentPopup) return;
    this.#currentPopup.addEventListener('click', (e) => {
      if (e.target.matches('.popup__close-btn') ||
        e.target.closest('.popup__alert-btn') ||
        e.target === this.#currentPopup) {
        this.closePopup();
      }
    });
  }

  // 私有：綁定確認事件（confirm 用）
  #bindConfirmEvents(onConfirm) {
    if (!this.#currentPopup) return;
    this.#currentPopup.addEventListener('click', (e) => {
      if (e.target.matches('.popup__close-btn') ||
        e.target.closest('.popup__cancel-btn') ||
        e.target === this.#currentPopup) {
        this.closePopup();
      } else if (e.target.closest('.popup__confirm-btn')) {
        if (typeof onConfirm === 'function') {
          onConfirm();
        }
        this.closePopup();
      }
    });
  }
  // ----------------- 對外公開 API -----------------
  /**
   * 顯示警告彈窗
   */
  alert(message) {
    this.closePopup();

    this.#currentPopup = document.createElement('div');
    this.#currentPopup.className = 'popup__modal popup__alert';
    this.#currentPopup.innerHTML = `
      <div class="popup">
        <div class="popup__header">
          <span class="popup__close-btn"></span>
        </div>
        <div class="popup__content">${message}</div>
        <div class="popup__actions">
          <div class="popup__alert-btn">
            <a class="popup__button">確定</a>
          </div>
        </div>
      </div>
    `;

    document.body.style.overflow = 'hidden';
    document.body.appendChild(this.#currentPopup);

    this.#bindCloseEvents();
  }

  /**
   * 顯示確認彈窗（支援表單數據和自定義數據）
   */
  confirm(data, onConfirm, options = {}) {
    console.log(data);
    this.closePopup();

    const {
      pop_title = options.popup_title || '請確認您提供的資料是否正確',
      name_title = options.name_title || '姓名',
      sex_title = options.sex_title || '性別',
      birth_title = options.birth_title || '生辰',
      hour_title = options.hour_title || '時辰'
    } = options;

    this.#currentPopup = document.createElement('div');
    this.#currentPopup.className = 'popup__modal popup__confirm';
    this.#currentPopup.innerHTML = `
      <div class="popup">
        <div class="popup__header">
          <span class="popup__close-btn"></span>
        </div>
        <div class="popup__content--header">${pop_title}：</div>
        <div class="popup__content"></div>
        <div class="popup__actions">
          <div class="popup__confirm-btn">
            <a class="popup__button">確定</a>
          </div>
          <div class="popup__cancel-btn">
            <a class="popup__button">取消</a>
          </div>
        </div>
      </div>
    `;

    const contentHTML = this.#generateContent(data, { name_title, sex_title, birth_title, hour_title });
    this.#currentPopup.querySelector('.popup__content').innerHTML = contentHTML;

    document.body.style.overflow = 'hidden';
    document.body.appendChild(this.#currentPopup);

    this.#bindConfirmEvents(onConfirm);
  }
  /**
   * 關閉彈窗（統一方法）
   */
  closePopup() {
    if (this.#currentPopup && this.#currentPopup.parentNode) {
      this.#currentPopup.remove();
      this.#currentPopup = null;
    }
    document.body.style.overflow = '';
  }

  /**
   * 銷毀組件
   */
  destroy() {
    this.closePopup();
  }
}

// 全域掛載
if (typeof window !== 'undefined') {
  window.wqPopup = wqPopup;
}