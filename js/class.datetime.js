/**
 * wqDateTime 日期時間選擇器類
 * 提供農曆和西元日期時間選擇功能
 */
export class wqDateTime {
  #domCache = new Map();
  root = null;

  constructor(elem, userOptions = {}) {
    // 初始化根元素
    this.root = (typeof elem === 'string') ?
      document.querySelector(elem) :
      (elem instanceof Element ? elem : null);

    if (!this.root) {
      throw new Error('Invalid datetime element');
    }

    const defaultOptions = {
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
    // ✅ 合併預設與使用者自定義選項
    this.options = {
      ...defaultOptions,
      ...userOptions
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
  // ✅ 公開方法：設定整包 options
  setOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions
    };
    // 自動重建所有相關 UI（可自行選擇是否立即更新）
    this.buildCalendarOptions();
    this.buildHourOptions();
    this.buildYearOptions();
  }

  /**
 * 添加選項到指定類型和索引位置
 * @param {string} type - 選項類型（'calendar', 'hour' 等）
 * @param {object} option - 選項對象（包含 value 和 text）
 * @param {number} index - 插入位置（如果為 null，則添加到末尾）
 */
  addOptionByIndex(type, option, index = null) {
    if (!this.options[type] || !Array.isArray(this.options[type])) {
      console.warn(`Invalid option type: ${type}`);
      return;
    }

    if (index === null || index >= this.options[type].length) {
      this.options[type].push(option);
    } else {
      this.options[type].splice(index, 0, option);
    }

    this.#rebuildOptions(type);
  }

  /**
   * 從指定類型中移除指定索引的選項
   * @param {string} type - 選項類型（'calendar', 'hour' 等）
   * @param {number} index - 要移除的選項索引
   */
  removeOptionByIndex(type, index) {
    if (!this.options[type] || !Array.isArray(this.options[type])) {
      console.warn(`Invalid option type: ${type}`);
      return;
    }

    if (index < 0 || index >= this.options[type].length) {
      console.warn(`Invalid option index: ${index}`);
      return;
    }

    this.options[type].splice(index, 1);
    this.#rebuildOptions(type);
  }

  /**
   * 重建指定類型的選項
   * @param {string} type - 選項類型（'calendar', 'hour' 等）
   */
  #rebuildOptions(type) {
    switch (type) {
      case 'calendar': this.buildCalendarOptions(); break;
      case 'hour': this.buildHourOptions(); break;
      case 'year': this.buildYearOptions(); break;
      // month/day 是由年份及日曆推導的，不建議直接從 options 控制
      default:
        console.warn(`Unsupported option type for rebuild: ${type}`);
    }
  }

  #getElement(selector, prefix = '.wq-select') {
    try {
      const fullSelector = prefix + selector;
      if (!this.#domCache.has(fullSelector)) {
        const element = this.root.querySelector(fullSelector);
        if (element) {
          this.#domCache.set(fullSelector, element);
        }
      }
      return this.#domCache.get(fullSelector);
    } catch (error) {
      console.log(error, 'wqDateTime.getElement');
      return null;
    }
  }

  #initialize() {
    this.elem = {
      calendar: this.#getElement('[data-type="calendar"]'),
      year: this.#getElement('[data-type="year"]'),
      month: this.#getElement('[data-type="month"]'),
      day: this.#getElement('[data-type="day"]'),
      hour: this.#getElement('[data-type="hour"]')
    };

    // 使用單一異步調用
    requestAnimationFrame(() => {
      const initMethods = [
        this.buildCalendarOptions,
        this.buildHourOptions,
        this.buildYearOptions,
        this.buildMonthOptions,
        this.buildDayOptions,
        this.buildLeapMonth,
        this.defaultDateTime,
        this.#bindEvents
      ];

      const runInit = () => {
        initMethods.forEach(method => method.call(this));
      };

      if (window.requestIdleCallback) {
        requestIdleCallback(runInit);
      } else {
        setTimeout(runInit, 0);
      }
    });
  }

  #bindEvents() {
    if (!this.elem.calendar || !this.elem.year || !this.elem.month) return;

    // 日曆類型改變
    this.elem.calendar.addEventListener('change', () => {
      const currentYear = this.elem.year.value;
      this.buildYearOptions();
      if (currentYear) this.elem.year.value = currentYear;
      this.buildMonthOptions();
      this.buildDayOptions();
    });

    // 年份改變
    this.elem.year.addEventListener('change', () => {
      const currentDay = this.elem.day.value;
      this.buildMonthOptions();
      this.buildDayOptions(currentDay);
    });

    // 月份改變
    this.elem.month.addEventListener('change', () => {
      const currentDay = this.elem.day.value;
      this.applyLeapMonth();
      this.buildDayOptions(currentDay);
    });
  }

  #updateSelectOptions(select, options, defaultValue) {
    if (!select) return;

    const scrollTop = select.scrollTop;
    select.innerHTML = '';

    const fragment = document.createDocumentFragment();
    options.forEach(option => {
      const optElement = document.createElement('option');
      optElement.value = option.value;
      if (option.value < 0) {
        optElement.className = 'leap-month';
      }
      optElement.textContent = option.text;
      fragment.appendChild(optElement);
    });
    select.appendChild(fragment);

    if (defaultValue !== undefined && defaultValue !== null) {
      select.value = defaultValue;
    }

    select.scrollTop = scrollTop;
  }
  /**
     * 銷毀選擇器
     */
  destroy() {
    this.elem = null;
    this.root = null;
    this.#domCache.clear();
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

    // 獲取預設值：優先使用 data-value，否則默認為 "1"（西元）
    const defaultValue = calendar.dataset.value || "1";

    this.#updateSelectOptions(calendar, options, defaultValue);
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
    const dataValue = yearSelect.dataset.value;
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
    if (year < 1901 || year > 2100) {
      console.warn('Year out of range for leap month check:', year);
      return 0;
    }

    const yearData = this.data.lunarYear[year - 1900];
    const leapMonth = yearData & 0xf;
    return leapMonth;
  }

  getThisYear() {
    return new Date().getFullYear();
  }

  buildHourOptions() {
    const hourSelect = this.elem.hour;
    if (!hourSelect) return;

    // 使用統一的 #updateSelectOptions 方法
    const defaultValue = hourSelect.dataset.value || "00";
    this.#updateSelectOptions(hourSelect, this.options.hour, defaultValue);
  }

  buildDayOptions(preserveValue = null) {
    const daySelect = this.elem.day;
    if (!daySelect) return;

    const oldDayValue = preserveValue || daySelect.value || daySelect.dataset.value;
    const yearValue = parseInt(this.elem.year.value, 10);
    const monthValue = parseInt(this.elem.month.value, 10);
    const calendarType = this.elem.calendar.value;

    // 計算天數
    let daysInMonth;
    if (calendarType === '0') { // 農曆
      const actualMonth = monthValue;
      const isLeapMonth = monthValue < 0;

      daysInMonth = this.getLunarMonthDays(yearValue, actualMonth, isLeapMonth);
    } else { // 陽曆
      daysInMonth = new Date(yearValue, Math.abs(monthValue), 0).getDate();
    }

    const dayOptions = [];
    for (let i = 1; i <= daysInMonth; i++) {
      dayOptions.push({
        value: i,
        text: `${String(i).padStart(2, '0')}日`
      });
    }

    // 設置默認值
    let defaultValue = 1;
    if (oldDayValue) {
      const oldDayNum = parseInt(oldDayValue, 10);
      if (oldDayNum <= daysInMonth) {
        defaultValue = oldDayNum;
      }
    }

    // 更新選項
    this.#updateSelectOptions(daySelect, dayOptions, defaultValue);

    // 確保有選中值
    if (!daySelect.value && dayOptions.length > 0) {
      daySelect.value = dayOptions[0].value;
    }
  }

  /**
  * 獲取農曆月份的天數
  * @param {number} year - 年份
  * @param {number} month - 月份（負值表示閏月）
  * @param {boolean} isLeap - 是否為閏月
  * @returns {number} - 該月份的天數
  */
  getLunarMonthDays(year, month, isLeap) {
    // 檢查年份範圍
    if (year < 1901 || year > 2100) {
      console.warn('Year out of range:', year);
      return 30;
    }

    const yearIndex = year - 1900;
    const yearData = this.data.lunarYear[yearIndex];

    if (!yearData) {
      console.warn('Invalid year data for year:', year);
      return 30;
    }

    // 解析農曆數據
    const leapMonth = yearData & 0xf;         // 閏月月份
    const monthData = yearData >> 4;          // 月份數據
    const leapMonthDays = (yearData >> 16) & 0x1; // 閏月天數標誌

    // 處理閏月
    if (isLeap && Math.abs(month) === leapMonth) {
      return leapMonthDays ? 30 : 29;
    }

    // 正常月份
    const monthBit = 1 << (12 - Math.abs(month));

    return (monthData & monthBit) ? 30 : 29;
  }

  buildMonthOptions() {
    const monthSelect = this.elem.month;
    if (!monthSelect) return;

    const monthOptions = [];
    const calendarType = this.elem.calendar.value;
    const year = parseInt(this.elem.year.value, 10);

    // 儲存目前選擇的月份值
    const currentMonthValue = parseInt(monthSelect.value, 10);
    const dataValue = monthSelect.dataset.value;

    // 生成基本月份選項
    for (let i = 1; i <= 12; i++) {
      monthOptions.push({
        value: i,
        text: `${String(i).padStart(2, '0')}月`
      });
    }

    // 只在農曆模式下添加閏月
    if (calendarType === "0") {
      const leapMonth = this.checkLunarLeapYear(year);

      if (leapMonth !== 0) {
        monthOptions.splice(leapMonth, 0, {
          value: -leapMonth,
          text: `${String(leapMonth).padStart(2, '0')}(閏)月`
        });
      }
    }

    // 設置默認值
    let defaultValue;

    if (calendarType === "1") { // 西元
      // 如果是從農曆切換到西元，使用絕對值
      defaultValue = Math.abs(currentMonthValue || parseInt(dataValue, 10) || 1);
    } else { // 農曆
      // 檢查當前值是否為閏月
      const leapMonth = this.checkLunarLeapYear(year);
      if (leapMonth !== 0 && Math.abs(currentMonthValue) === leapMonth) {
        // 如果當前月份是閏月位置，保持閏月狀態
        defaultValue = -leapMonth;
      } else {
        // 否則使用原始值或 data-value
        defaultValue = currentMonthValue || parseInt(dataValue, 10) || 1;
      }
    }

    // 確保默認值在有效範圍內
    const validOptions = monthOptions.map(opt => parseInt(opt.value, 10));
    if (!validOptions.includes(defaultValue)) {
      defaultValue = validOptions[0];
    }

    // 新選項並設置值
    this.#updateSelectOptions(monthSelect, monthOptions, defaultValue);

    // 處理閏月相關邏輯
    if (calendarType === "0") {
      this.applyLeapMonth();
    } else {
      this.restoreLeapMonth();
    }
  }

  buildLeapMonth() {
    const monthName = this.elem.month.getAttribute('name');
    if (!monthName) return;

    // const leapMonthName = monthName.replace('iMonth', 'LeapMonth');
    // 只要有 name 就直接用 LeapMonth
    const leapMonthName = 'LeapMonth';

    let leapMonthInput = this.root.querySelector(`input[name="${leapMonthName}"]`);

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
    const selectedOption = this.elem.month.querySelector('option:checked');
    if (!selectedOption) return;

    // 先判斷 data-org-value（原始負值），再判斷 value
    let orgValue = selectedOption.getAttribute('data-org-value');
    let monthValue = orgValue ? parseInt(orgValue, 10) : parseInt(selectedOption.value, 10);

    if (parseInt(this.elem.calendar.value, 10) === 0 && monthValue < 0) {
      this.elem.leapmonth.value = '1';
      selectedOption.setAttribute('data-org-value', monthValue);
      selectedOption.setAttribute('value', Math.abs(monthValue));
      // 這樣送出時 iMonth 會是正值
    } else {
      // 非閏月時還原
      if (orgValue) {
        selectedOption.setAttribute('value', orgValue);
        selectedOption.removeAttribute('data-org-value');
      }
      this.elem.leapmonth.value = '';
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
        const calendarValue = this.elem.calendar.dataset.value;
        this.elem.calendar.value = this.#validateCalendarValue(calendarValue);
      }

      // 處理年份
      if (this.elem.year) {
        const yearValue = this.elem.year.dataset.value;
        const minYear = parseInt(this.elem.year.getAttribute('min'), 10);
        const maxYear = parseInt(this.elem.year.getAttribute('max'), 10);
        this.elem.year.value = this.#validateYearValue(yearValue, minYear, maxYear);
      }

      // 重建月份選項並設置值
      this.buildMonthOptions();

      // 重建日期選項並設置值
      this.buildDayOptions();

      // 處理小時
      if (this.elem.hour) {
        const hourValue = this.elem.hour.dataset.value;
        this.elem.hour.value = this.#validateHourValue(hourValue);
      }
    });
  }

  // 驗證日曆類型值
  #validateCalendarValue(value) {
    const validValue = parseInt(value, 10);
    return validValue === 0 ? "0" : "1";  // 只允許 0 或 1
  }

  // 驗證年份值
  #validateYearValue(value, min, max) {
    const currentYear = new Date().getFullYear();
    const validMin = min || 1901;
    const validMax = max || currentYear;

    let validValue = parseInt(value, 10);
    if (isNaN(validValue) || validValue < validMin || validValue > validMax) {
      validValue = validMin;
    }
    return validValue.toString();
  }

  // 驗證小時值
  #validateHourValue(value) {
    let validValue = parseInt(value, 10);
    if (isNaN(validValue) || validValue < 0 || validValue > 23) {
      validValue = 0;
    }
    return validValue.toString().padStart(2, '0');
  }

  // 新增方法：獲取格式化的日期字符串
  getFormattedDate() {
    if (!this.elem.calendar || !this.elem.year || !this.elem.month || !this.elem.day) {
      return null;
    }

    const calendarValue = this.elem.calendar.value;
    const yearValue = this.elem.year.value;
    const monthValue = parseInt(this.elem.month.value, 10);
    const monthText = this.elem.month.options[this.elem.month.selectedIndex].text;
    const dayValue = this.elem.day.value;
    const hourValue = this.elem.hour?.value;
    const hourText = this.elem.hour?.options[this.elem.hour.selectedIndex]?.text || '';

    return {
      calendar: [calendarValue, calendarValue === '0' ? '農曆' : '西元'],
      solarString: calendarValue === '1' ?
        `${yearValue}年${monthText}${dayValue}日` : '',
      lunarString: calendarValue === '0' ?
        `${yearValue}年${monthText}${dayValue}日` : '',
      hour: [!!hourValue, hourText],
      isLeapMonth: monthValue < 0,
      // isLeapMonth: (calendarValue === '0') &&
      //   (monthText.includes('閏') || (this.elem.leapmonth?.value === '1'))
    };
  }
}

// 為了向後相容，也可以掛載到 window 對象
if (typeof window !== 'undefined') {
  window.wqDateTime = wqDateTime;
}
