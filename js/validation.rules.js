// 定義全局命名空間
window.WQ = window.WQ || {};

// 驗證規則集合
WQ.ValidationRules = {
    // 基本規則
    chi: {
        pattern: /^[\u4e00-\u9fa5\u3400-\u4db5]+$/,
        message: '格式錯誤，僅可輸入中文字'
    },
    chi_eng: {
        pattern: /^[a-zA-Z\u4e00-\u9fa5\u3400-\u4db5]+$/,
        message: '格式錯誤，僅可輸入中文或英文'
    },
    num: {
        pattern: /^\d+[.]?\d*$/,
        message: '格式錯誤，僅可輸入數字'
    },
    // 電子郵件驗證
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: '請輸入有效的電子郵件地址'
    },
    // 手機號碼驗證
    phone: {
        pattern: /^09\d{8}$/,
        message: '請輸入有效的手機號碼'
    }
};

// 添加新規則的方法
WQ.addValidationRule = function(name, pattern, message) {
    WQ.ValidationRules[name] = {
        pattern: pattern,
        message: message
    };
}; 