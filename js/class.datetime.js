class wqDateTime {
  #domCache = new Map();
  #root = null;
  #eventHandler = null;

  constructor(elem) {
    this.#root = (typeof elem === 'string')
      ? document.querySelector(elem)
      : (elem instanceof Element ? elem : elem[0]);

    if (!this.#root) {
      throw new Error('Invalid datetime element');
    }

    this.options = {
      calendar: [
        { value: 1, text: "西元生日" },
        { value: 0, text: "農曆生日" }
      ],
      hour: [
        { value: '00', text: "00:00~00:59 (早子)" },
        { value: '01', text: "01:00~02:59 (丑)" },
        { value: '03', text: "03:00~04:59 (寅)" },
        { value: '05', text: "05:00~06:59 (卯)" },
        { value: '07', text: "07:00~08:59 (辰)" },
        { value: '09', text: "09:00~10:59 (巳)" },
        { value: '11', text: "11:00~12:59 (午)" },
        { value: '13', text: "13:00~14:59 (未)" },
        { value: '15', text: "15:00~16:59 (申)" },
        { value: '17', text: "17:00~18:59 (酉)" },
        { value: '19', text: "19:00~20:59 (戌)" },
        { value: '21', text: "21:00~22:59 (亥)" },
        { value: '23', text: "23:00~23:59 (晚子)" }
      ],
      year: {
        min: 1901,
        max: new Date().getFullYear()
      }
    };

    this.data = {
      lunarYear: [
        0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d295, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
        0x049b0, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
        0x06566, 0x0d4a0, 0x0ea50, 0x16a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
        0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
        0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
        0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
        0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
        0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
        0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
        0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
        0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
        0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
        0x14b63
      ]
    };

    this.elem = {};
    this.#initialize();
  }

  #getElement(selector) {
    if (!this.#domCache.has(selector)) {
      const element = this.#root.querySelector(`.wq-select${selector}`);
      if (element) {
        this.#domCache.set(selector, element);
      }
    }
    return this.#domCache.get(selector);
  }

  #initialize() {
    this.elem = {
      calendar: this.#getElement('[data-type="calendar"]'),
      year: this.#getElement('[data-type="year"]'),
      month: this.#getElement('[data-type="month"]'),
      day: this.#getElement('[data-type="day"]'),
      hour: this.#getElement('[data-type="hour"]')
    };

    const initTask = () => {
      this.buildCalendarOptions();
      this.buildHourOptions();
      this.buildYearOptions();
      this.buildMonthOptions();
      this.buildDayOptions();
      this.buildLeapMonth();
      this.defaultDateTime();
      this.#bindEvents();
    };

    requestAnimationFrame(() => {
      if (window.requestIdleCallback) {
        requestIdleCallback(initTask);
      } else {
        setTimeout(initTask, 0);
      }
    });
  }

  #bindEvents() {
    this.#eventHandler = (event) => {
      const target = event.target;
      if (!target.matches('.wq-select')) return;

      const type = target.dataset.type;
      if (!type) return;

      this.#debounce(() => {
        switch (type) {
          case 'calendar':
            this.buildYearOptions();
            this.buildMonthOptions();
            this.buildDayOptions();
            this.buildLeapMonth();
            break;
          case 'year':
            this.buildMonthOptions();
            this.buildDayOptions();
            this.buildLeapMonth();
            break;
          case 'month':
            this.buildDayOptions();
            this.applyLeapMonth();
            break;
        }
      }, 100);
    };

    this.#root.addEventListener('change', this.#eventHandler);
  }

  #debounce(fn, delay) {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => fn(), delay);
  }

  destroy() {
    if (this.#eventHandler) {
      this.#root.removeEventListener('change', this.#eventHandler);
    }
    this.#domCache.clear();
    this.elem = null;
    this.#root = null;
    this.#eventHandler = null;
  }

  #updateSelectOptions(select, options, defaultValue = null) {
    if (!select) return;

    const fragment = document.createDocumentFragment();
    select.innerHTML = '';

    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      fragment.appendChild(optionElement);
    });

    select.appendChild(fragment);

    if (defaultValue !== null) {
      select.value = defaultValue;
    }
  }

  buildCalendarOptions() {
    const calendar = this.elem.calendar;
    if (!calendar) return;

    const fixed = calendar.dataset.fixed;
    const options = [];

    if (fixed) {
      const optionIndex = ['solar', 'lunar'].indexOf(fixed);
      if (optionIndex > -1) {
        options.push(this.options.calendar[optionIndex]);
      }
    } else {
      options.push(...this.options.calendar);
    }

    this.#updateSelectOptions(calendar, options);
  }

  buildYearOptions() {
    const yearSelect = this.elem.year;
    if (!yearSelect) return;

    const yearOptions = [];
    
    // 獲取年份範圍，如果沒有設置則使用默認值
    const minYear = parseInt(yearSelect.getAttribute('min'), 10) || 1901;
    const maxYear = parseInt(yearSelect.getAttribute('max'), 10) || this.getThisYear();
    
    // 生成年份選項
    for (let i = minYear; i <= maxYear; i++) {
        yearOptions.push({
            value: i,
            text: `${i}年`
        });
    }

    // 獲取默認值：優先順序為 data-value > 當前值 > min > 當前年份
    let defaultYear;
    const dataValue = yearSelect.getAttribute('data-value');
    const currentValue = yearSelect.value;
    
    if (dataValue !== null) {
        defaultYear = parseInt(dataValue, 10);
    } else if (currentValue) {
        defaultYear = parseInt(currentValue, 10);
    } else if (yearSelect.getAttribute('min')) {
        defaultYear = minYear;
    } else {
        defaultYear = this.getThisYear();
    }

    // 確保默認值在有效範圍內
    defaultYear = Math.max(minYear, Math.min(defaultYear, maxYear));

    // 更新選項並設置默認值
    this.#updateSelectOptions(yearSelect, yearOptions, defaultYear);
  }

  checkSolarLeapYear(year) {
    return (year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0));
  }

  checkLunarLeapYear(year) {
    const yinYear = this.data.lunarYear[year - 1900];
    return yinYear & 0xf;
  }

  getThisYear() {
    return new Date().getFullYear();
  }

  buildHourOptions() {
    const hourSelect = this.elem.hour;
    if (!hourSelect) return;

    const fragment = document.createDocumentFragment();
    hourSelect.innerHTML = '';

    this.options.hour.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      fragment.appendChild(optionElement);
    });

    hourSelect.appendChild(fragment);
  }

  buildDayOptions() {
    const daySelect = this.elem.day;
    if (!daySelect) return;

    const oldDayValue = daySelect.value || 1;
    const dayOptions = [];

    let totalDays = 0;
    if (this.elem.calendar.value === "0") {
      totalDays = this.calcLunarDay();
    } else if (this.elem.calendar.value === "1") {
      totalDays = this.calcSolarDay();
    }

    for (let i = 1; i <= totalDays; i++) {
      dayOptions.push({
        value: i,
        text: `${i < 10 ? '0' + i : i}日`
      });
    }

    this.#updateSelectOptions(
      daySelect,
      dayOptions,
      daySelect.querySelector(`option[value='${oldDayValue}']`) ? oldDayValue : 1
    );
  }

  calcSolarDay() {
    const days = [0, 0, -3, 0, -1, 0, -1, 0, 0, -1, 0, -1, 0];
    const thisMonth = parseInt(this.elem.month.value, 10);
    let thisDay = days[thisMonth];

    if (this.elem.calendar.value === "1" &&
      this.checkSolarLeapYear(parseInt(this.elem.year.value, 10)) &&
      thisMonth === 2) {
      thisDay++;
    }

    return thisDay + 31;
  }

  calcLunarDay() {
    const days = this.getLunarDaysForMonths(parseInt(this.elem.year.value, 10));
    let thisMonth = parseInt(this.elem.month.value, 10);
    thisMonth = (thisMonth < 0) ? 0 : thisMonth;

    const thisDay = days[thisMonth];
    return 29 + parseInt(thisDay, 10);
  }

  getLunarDaysForMonths(year) {
    const yinYear = this.data.lunarYear[year - 1900];
    let binaryStr = yinYear.toString(2);

    try {
      binaryStr = ('0'.repeat(17) + binaryStr).slice(-17);
    } catch (e) {
      while (binaryStr.length < 17) {
        binaryStr = '0' + binaryStr;
      }
    }

    if (binaryStr.length > 17) {
      binaryStr = binaryStr.slice(-17);
    }

    return binaryStr.slice(0, -4).split('');
  }

  buildMonthOptions() {
    const monthSelect = this.elem.month;
    if (!monthSelect) return;

    const oldMonthValue = monthSelect.value || 1;
    const monthOptions = [];

    for (let i = 1; i <= 12; i++) {
        monthOptions.push({
            value: i,
            text: `${i < 10 ? '0' + i : i}月`
        });
    }

    if (this.elem.calendar.value === "0") {
        const leapMonth = this.checkLunarLeapYear(parseInt(this.elem.year.value, 10));
        if (leapMonth !== 0) {
            monthOptions.splice(leapMonth, 0, {
                value: -1 * leapMonth,
                text: `${leapMonth < 10 ? '0' + leapMonth : leapMonth}(閏)月`
            });
        }
    }

    this.#updateSelectOptions(
        monthSelect,
        monthOptions,
        monthSelect.querySelector(`option[value='${oldMonthValue}']`) ? oldMonthValue : 1
    );

    this.applyLeapMonth();
  }

  buildLeapMonth() {
    const monthName = this.elem.month.getAttribute('name');
    if (!monthName) return;

    const leapMonthName = monthName.replace('iMonth', 'LeapMonth');
    
    let leapMonthInput = this.#root.querySelector(`input[name="${leapMonthName}"]`);
    
    if (!leapMonthInput) {
        leapMonthInput = document.createElement('input');
        leapMonthInput.type = 'hidden';
        leapMonthInput.name = leapMonthName;
        
        this.elem.month.insertAdjacentElement('afterend', leapMonthInput);
    }

    this.elem.leapmonth = leapMonthInput;
  }

  applyLeapMonth() {
    if (!this.elem.leapmonth) return;

    this.elem.leapmonth.value = '';
    const monthValue = parseInt(this.elem.month.value, 10);

    if (parseInt(this.elem.calendar.value, 10) === 0 && monthValue < 0) {
        this.elem.leapmonth.value = '1';
        
        const selectedOption = this.elem.month.querySelector('option:checked');
        if (selectedOption) {
            selectedOption.setAttribute('value', Math.abs(monthValue));
            selectedOption.setAttribute('data-org-value', monthValue);
        }
    }
  }

  restoreLeapMonth() {
    if (!this.elem.leapmonth) return;

    this.elem.leapmonth.value = '';
    
    const selectedOption = this.elem.month.querySelector('option:checked');
    if (selectedOption) {
        const orgValue = selectedOption.getAttribute('data-org-value');
        if (orgValue) {
            selectedOption.setAttribute('value', orgValue);
            selectedOption.removeAttribute('data-org-value');
        }
    }
  }

  defaultDateTime() {
    if (!this.elem.year || !this.elem.month || !this.elem.day || !this.elem.hour) return;

    requestAnimationFrame(() => {
        // 處理日曆類型
        if (this.elem.calendar) {
            const calendarValue = this.elem.calendar.getAttribute('data-value');
            this.elem.calendar.value = calendarValue || "1";
        }

        // 處理年份 - 使用更靈活的默認值邏輯
        if (this.elem.year) {
            const yearValue = this.elem.year.getAttribute('data-value');
            const minYear = parseInt(this.elem.year.getAttribute('min'), 10);
            const currentYear = this.getThisYear();
            
            // 優先順序：data-value > min > 當前年份
            this.elem.year.value = yearValue || 
                                 (minYear ? minYear.toString() : 
                                 currentYear.toString());
        }

        // 處理月份
        if (this.elem.month) {
            const monthValue = this.elem.month.getAttribute('data-value');
            this.elem.month.value = monthValue || "1";
            this.applyLeapMonth();
        }

        // 處理日期
        if (this.elem.day) {
            const dayValue = this.elem.day.getAttribute('data-value');
            this.elem.day.value = dayValue || "1";
        }

        // 處理小時
        if (this.elem.hour) {
            const hourValue = this.elem.hour.getAttribute('data-value');
            this.elem.hour.value = hourValue || "00";
        }
    });
  }
}
