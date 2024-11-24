class ErrorHandler {
  static handle(error, context) {
    // 記錄錯誤
    this.logError(error, context);
    
    // 顯示用戶友善的錯誤訊息
    this.showUserError(error);
    
    // 在開發環境輸出詳細錯誤信息
    // 使用 window.location.hostname 來判斷環境
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      console.error(`[${context}]`, error);
    }
  }

  static logError(error, context) {
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

  static showUserError(error) {
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

  static getUserFriendlyMessage(error) {
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

// 確保 ErrorHandler 被正確導出到全局
window.ErrorHandler = ErrorHandler; 