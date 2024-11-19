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

// 安全地添加新規則的方法
if (typeof window.WQ.addValidationRule !== 'function') {
    window.WQ.addValidationRule = function(name, pattern, message) {
        window.WQ.ValidationRules[name] = {
            pattern: pattern,
            message: message
        };
    };
} 