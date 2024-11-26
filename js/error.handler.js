class ErrorHandler {
  constructor() {
    // 初始化實例屬性
    this.isDevEnvironment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
  }

  handle(error, context) {
    // 使用實例方法而非靜態方法
    this.logError(error, context);
    this.showUserError(error);
    
    // 在開發環境輸出詳細錯誤信息
    if (this.isDevEnvironment) {
      console.error(`[${context}]`, error);
    }
  }

  logError(error, context) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      context: context,
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent
    };
    
    // 記錄錯誤到控制台
    console.error('Error logged:', errorLog);
  }

  showUserError(error) {
    const message = this.getUserFriendlyMessage(error);
    
    // 如果有彈窗系統可用，使用彈窗顯示錯誤
    if (window.wqPopup) {
      const popup = new window.wqPopup();
      popup.alert(message);
    } else {
      // 否則使用 alert
      alert(message);
    }
  }

  getUserFriendlyMessage(error) {
    // 錯誤訊息對照表
    const errorMessages = {
      'Invalid form element': '表單初始化失敗，請重新載入頁面',
      'wqPopup is not defined': '系統組件載入失敗，請重新載入頁面',
      'validation failed': '表單驗證失敗，請檢查輸入內容',
      'network error': '網絡連接失敗，請檢查網絡連接',
      'default': '系統發生錯誤，請稍後再試'
    };

    return errorMessages[error.message] || errorMessages.default;
  }
}

// 導出一個 ErrorHandler 實例而非類別
window.errorHandler = new ErrorHandler(); 