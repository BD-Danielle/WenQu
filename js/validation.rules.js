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
  const group = element.closest('.radio-group[data-type="sex"]');
  if (!group) return { valid: false, errMsg: '無效的性別選擇器' };

  const checkedRadio = group.querySelector('input[type="radio"]:checked');
  return {
    valid: !!checkedRadio,
    errMsg: checkedRadio ? '' : '請選擇性別'
  };
};

window.validateRelationship = function (element) {
  const group = element.closest('.radio-group[data-type="relationship"]');
  if (!group) return { valid: false, errMsg: '無效的感情狀態選擇器' };

  const checkedRadio = group.querySelector('input[type="radio"]:checked');
  return {
    valid: !!checkedRadio,
    errMsg: checkedRadio ? '' : '請選擇感情狀態'
  };
};

window.validateMixedName = function (element, value, rule) {
  // 計算中文字符數量
  const chineseChars = value.match(/[\u4e00-\u9fa5\uF900-\uFA2D\u3400-\u4DB5]/g) || [];
  const chineseCount = chineseChars.length;

  // 計算非中文字符數量（排除空白字符和全形英文字母）
  const nonChineseChars = value.match(/[^\u4e00-\u9fa5\uF900-\uFA2D\u3400-\u4DB5\s\uFF21-\uFF3A\uFF41-\uFF5A]/g) || [];
  const nonChineseCount = nonChineseChars.length;

  // 檢查是否包含空白字符
  if (/\s/.test(value)) {
    console.log('❌ 姓名不能包含空白字符');
    return {
      valid: false,
      message: rule?.errorMsg || '預設錯誤訊息'
    };
  }

  // 檢查是否包含全形英文字母
  if (/[\uFF21-\uFF3A\uFF41-\uFF5A]/.test(value)) {
    console.log('❌ 姓名不能包含全形英文字母');
    return {
      valid: false,
      message: rule?.errorMsg || '預設錯誤訊息'
    };
  }

  // 檢查總長度（1-15個字符）
  if (value.length < 1 || value.length > 15) {
    console.log('❌ 姓名長度超出範圍:', value.length);
    return {
      valid: false,
      message: rule?.errorMsg || '預設錯誤訊息'
    };
  }

  // 檢查中文字數量（最多5個）
  if (chineseCount > 5) {
    console.log('❌ 中文字數量超出限制:', chineseCount);
    return {
      valid: false,
      message: rule?.errorMsg || '預設錯誤訊息'
    };
  }

  // 檢查非中文字數量（最多10個）
  if (nonChineseCount > 10) {
    console.log('❌ 非中文字數量超出限制:', nonChineseCount);
    return {
      valid: false,
      message: rule?.errorMsg || '預設錯誤訊息'
    };
  }

  return {
    valid: true,
    message: ''
  };
};

// 安全地添加新規則的方法
if (typeof window.WQ.addValidationRule !== 'function') {
  window.WQ.addValidationRule = function (name, pattern, message) {
    // console.log('addValidationRule 被調用:', { name, pattern, message });

    // 🔥 修復：如果 pattern 是對象且包含 validate 屬性，直接存儲
    if (typeof pattern === 'object' && pattern.validate) {
      // console.log('直接存儲對象格式的規則:', name);
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

    // console.log('✅ 規則已添加:', name, window.WQ.ValidationRules[name]);
  };
}