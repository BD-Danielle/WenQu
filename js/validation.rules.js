// 檢查並初始化 WQ 命名空間
if (typeof window.WQ === 'undefined') {
  window.WQ = {};
}

// 如果 ValidationRules 已存在，則擴展它而不是覆蓋
window.WQ.ValidationRules = window.WQ.ValidationRules || {};

// 合併新的驗證規則
Object.assign(window.WQ.ValidationRules, {
  // 基本規則
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '請輸入有效的電子郵件地址'
  },
  phone: {
    pattern: /^09\d{8}$/,
    message: '請輸入有效的手機號碼'
  }
});
// 🔥 修復：將驗證函數定義在全局作用域
window.validateRadioSex = function (element) {
  const checkedRadio = element.querySelector('input[type="radio"]:checked');
  return {
    valid: !!checkedRadio,
    errMsg: checkedRadio ? '' : '請選擇性別'
  };
};

window.validateRelationship = function (element) {
  const checkedRadios = element.querySelectorAll('input[type="radio"]:checked');
  return {
    valid: checkedRadios.length > 0,
    errMsg: checkedRadios.length > 0 ? '' : '請選擇感情狀態'
  };
};

window.validateMixedName = function (element, value, rule) {
  const defaultErrMsg = '姓名欄位格式錯誤，最多可輸入5個中文字或是10個非中文字';
  const chineseChars = value.match(/[\u4e00-\u9fa5\uF900-\uFA2D\u3400-\u4DB5]/g) || [];
  const chineseCount = chineseChars.length;
  const nonChineseChars = value.match(/[^\u4e00-\u9fa5\uF900-\uFA2D\u3400-\u4DB5\s\uFF21-\uFF3A\uFF41-\uFF5A]/g) || [];
  const nonChineseCount = nonChineseChars.length;

  // 條件與錯誤訊息集合
  const checks = [
    { cond: /[<>'"&\x00-\x1f\x7f-\x9f]/.test(value), console: '輸入包含不安全字符' },
    { cond: /[';\/\*-]/.test(value), console: '輸入包含潛在危險字符' },
    { cond: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(value), console: '輸入包含控制字符' },
    { cond: /\s/.test(value), console: '姓名不能包含空白字符' },
    { cond: /[\uFF21-\uFF3A\uFF41-\uFF5A]/.test(value), console: '姓名不能包含全形英文字母' },
    { cond: value.length < 1 || value.length > 15, console: `姓名長度不在充許範圍內: ${value.length}` },
    { cond: chineseCount > 5, console: `中文字數量超出限制: ${chineseCount}` },
    { cond: nonChineseCount > 10, console: `非中文字數量超出限制: ${nonChineseCount}` }
  ];

  for (const check of checks) {
    if (check.cond) {
      console.log('❌', check.console);
      return {
        valid: false,
        errMsg: defaultErrMsg
      };
    }
  }

  return {
    valid: true,
    errMsg: ''
  };
};
// 安全地添加新規則的方法
if (typeof window.WQ.addValidationRule !== 'function') {
  window.WQ.addValidationRule = function (name, pattern, message) {

    // 🔥 修復：如果 pattern 是對象且包含 validate 屬性，直接存儲
    if (typeof pattern === 'object' && pattern.validate) {
      window.WQ.ValidationRules[name] = pattern;
    }
    // 🔥 如果 pattern 是正則表達式或函數，包裝成對象
    else if (pattern instanceof RegExp || typeof pattern === 'function') {
      window.WQ.ValidationRules[name] = {
        pattern: pattern,
        message: message
      };
    }
    // 🔥 其他情況也直接存儲
    else {
      window.WQ.ValidationRules[name] = pattern;
    }
  };
}
