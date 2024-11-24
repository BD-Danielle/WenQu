# WenQu Form System

## 專案結構
```tree
project/
├── css/
│ ├── reset.css # 重置樣式
│ └── wenqu.css # 主要樣式
├── js/
│ ├── class.datetime.js # 日期時間處理核心
│ ├── class.form.js # 表單處理核心
│ ├── class.popup.js # 彈窗組件
│ ├── class.input.js # 輸入框組件
│ ├── class.sex.js # 性別選擇組件
│ ├── class.radio.js # 單選組件
│ ├── class.init.js # 初始化腳本
│ ├── event.manager.js # 事件管理
│ └── error.handler.js # 錯誤處理
├── images/
│ ├── x_icon.png # 關閉圖標
│ ├── select_icon.png # 選擇圖標
│ ├── popup-bem.png # 彈窗背景
│ └── pop_x_icon.png # 彈窗關閉圖標
├── index.html # 示例頁面
├── gulpfile.js # 構建配置
├── package.json # 項目配置
└── README.md # 項目文檔
```
## 核心功能

### 1. 表單處理 (class.form.js)
- 表單數據收集和驗證
- 支持多組數據
- 自定義驗證規則
- 錯誤提示
- 事件管理

### 2. 日期時間處理 (class.datetime.js)
- 農曆/西曆轉換
- 支持閏月
- 時辰選擇
- 年份範圍：1901-當前年
- 自動驗證日期有效性

### 3. 彈窗系統 (class.popup.js)
- 確認彈窗
- 警告提示
- 自定義內容
- 動畫效果
- 多層級支持

### 4. 輸入控制 (class.input.js)
- 即時驗證
- 自定義規則
- 錯誤提示
- 數據格式化

## 安裝和配置

### 1. 安裝依賴

```bash
npm install
```

### 2. 引入必要文件

```html
<!-- CSS -->
<link rel="stylesheet" href="css/reset.css">
<link rel="stylesheet" href="css/wenqu.css">
<!-- JavaScript -->
<script src="js/error.handler.js"></script>
<script src="js/event.manager.js"></script>
<script src="js/class.input.js"></script>
<script src="js/class.datetime.js"></script>
<script src="js/class.popup.js"></script>
<script src="js/class.sex.js"></script>
<script src="js/class.radio.js"></script>
<script src="js/class.form.js"></script>
<script src="js/class.init.js"></script>
```

### 3. HTML 結構

```html
<form class="wq-form" id="form2088">
<!-- 基本信息 -->
<div class="wq-group">
<input type="text" class="wq-input" data-type="nickname" placeholder="姓名">
<select class="wq-select" data-type="sex">
<option value="1">男</option>
<option value="0">女</option>
</select>
</div>
<!-- 日期時間選擇 -->
<div class="wq-group">
<select class="wq-select" data-type="calendar">
<option value="1">西元</option>
<option value="0">農曆</option>
</select>
<select class="wq-select" data-type="year"></select>
<select class="wq-select" data-type="month"></select>
<select class="wq-select" data-type="day"></select>
<select class="wq-select" data-type="hour"></select>
</div>
</form>
```


## API 文檔

### wqForm 類

```javascript
const form = new wqForm('.wq-form', {
submit_button: '#checkGo_free',
popup_title: '請確認資料',
birth_title: '生辰',
customFieldLabels: {
id: '身分證字號',
textarea: '備註內容'
}
});
```

### wqDateTime 類

```javascript
const datetime = new wqDateTime('.wq-group');
// 獲取日期數據
const date = datetime.getFormattedDate();
```

### wqPopup 類

```javascript
const popup = new wqPopup();
// 顯示確認框
popup.confirm(data, callback, {
pop_title: '確認標題',
birth_title: '生辰'
});
// 顯示警告
popup.alert('警告訊息');
```

## 開發指南

### 1. 開發環境設置

```bash
安裝依賴
npm install
啟動開發服務器
npm run dev
構建專案
npm run build
```

### 2. 目錄結構說明
- `css/`: 樣式文件
- `js/`: JavaScript 源碼
- `images/`: 圖片資源
- `tests/`: 測試文件（待添加）

### 3. 代碼規範
- 使用 ES6+ 語法
- 遵循 ESLint 規則
- 使用 JSDoc 註釋
- 保持代碼簡潔清晰

## 常見問題

1. **日期選擇器無法選擇閏月**
   - 確認已正確設置 calendar 類型為農曆
   - 檢查年份是否有閏月

2. **表單驗證不生效**
   - 確認 class.input.js 已正確引入
   - 檢查 data-type 屬性設置

3. **彈窗樣式異常**
   - 確認 wenqu.css 已正確引入
   - 檢查 z-index 設置

## 更新日誌

### v1.0.0 (2024-03-20)
- 初始版本發布
- 基本功能實現

### v1.1.0 (計劃中)
- 錯誤處理優化
- 性能改進
- 新增單元測試

## 開發團隊

- 前端開發：WenQu Team
- UI 設計：WenQu Design
- 測試：QA Team

## 技術支持

- Issues: https://github.com/wenqu/form-system/issues
- Email: support@wenqu.com
- 文檔：https://docs.wenqu.com

## 授權說明

本專案採用 MIT 授權協議。詳見 [LICENSE](LICENSE) 文件。

## 致謝

特別感謝以下開源項目：
- [Gulp](https://gulpjs.com/)
- [ESLint](https://eslint.org/)
- [Jest](https://jestjs.io/)
