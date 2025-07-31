// 添加專案中需要使用的驗證規則
WQ.addValidationRule(
  'taiwanId',
  /^[A-Z][12]\d{8}$/,
  '請輸入正確的身分證字號格式'
);

WQ.addValidationRule(
  'chi10',
  /^[\u4e00-\u9fa5\u3400-\u4db5]{1,10}$/,
  '格式錯誤，最多可輸入10個中文字'
);
WQ.addValidationRule(
  'nickname',
  /^[\u4e00-\u9fa5\u3400-\u4db5a-zA-Z0-9]{2,10}$/,
  '暱稱須為2-10個字元（可包含中文、英文、數字）'
);

WQ.addValidationRule(
  'mobile_tw',
  /^09\d{8}$/,
  '請輸入正確的台灣手機號碼格式'
);

WQ.addValidationRule(
  'birthday',
  /^\d{4}\/\d{2}\/\d{2}$/,
  '請輸入正確的生日格式（YYYY/MM/DD）'
);

WQ.addValidationRule('mixedName',
  {
    required: true,
    validate: function (element, value, rule) {
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
            errMsg: defaultErrMsg || rule?.message
          };
        }
      }

      return {
        valid: true,
        errMsg: ''
      };
    },
    message: '姓名欄位格式錯誤，最多可輸入5個中文字或是10個非中文字'
  }
);

WQ.addValidationRule(
  'sex',
  {
    required: true,
    title: '性別',
    type: 'radio',
    name: 'sex',
    validate: window.validateRadioSex,
    errMsg: '請選擇性別'
  }
);

WQ.addValidationRule(
  'relationship',
  {
    required: true,
    title: '感情狀態',
    type: 'radio',
    name: 'relationship',
    validate: window.validateRelationship,
    errMsg: '請選擇感情狀態'
  }
);