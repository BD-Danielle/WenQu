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


WQ.addValidationRule('mixedName', {
  type: 'input',
  name: 'mixedName',
  validate: 'validateMixedName',
  errMsg: '姓名欄位格式錯誤，最多可輸入5個中文字或是10個非中文字'
});

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

WQ.addValidationRule(
  'sex',
  {
    type: 'radio',
    name: 'sex',
    validate: 'validateRadioSex',
    errMsg: '請選擇性別'
  }
);

WQ.addValidationRule(
  'relationship',
  {
    type: 'radio',
    name: 'relationship',
    validate: 'validateRelationship',
    errMsg: '請選擇感情狀態'
  }
);