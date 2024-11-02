# WenQu

改善以往下拉式選單，無法連動陰陽曆轉換，陽曆陰曆換算。

## Prerequisites 必要條件：
WenQu 需依賴原生jQuery，引用之前必需先載入jQuery
```html
<script src="./js/jquery-2.0.3/jquery.min.js"></script>
<script src="./js/wenqu.js"></script>
```

## Configuration 參數配置：
- 在需實現文曲的表單\<form>，增加套件進入點所需的屬性及屬性值，實際範例如下：
```html
<form class="wq-form" id="form" method="post">
  <div class="wq-group">
    <div class="wq-datetime-group">
        ..............
    </div>
  </div>
</form>
```
- class 其屬性值代表意義：
  - 群體資料集合 wq-form:
  ```html
  <div class="wq-form">甲方資料集合＋乙方資料集合</div>
  ```
  - 個別資料集合 wq-group:
  ```html
  <div class="wq-form">
    <div class="wq-group">甲方資料集合</div>
    <div class="wq-group">乙方資料集合</div>
  </div>
  ```
  - 輸入框 wq-input:
  ```html
  <li style="width:40%; padding-right: 1%;">
    <input type="text" class="wq-input" placeholder="你的中文姓氏" data-format="chi2/chi3/chi/chi_eng" />
  </li>
  ```

  - 下拉式選單 wq-select:
  
  ```html
  <li style="width:35%; padding-right: 1%;">
    <select class="wq-select" data-type="sex/calendar/year/month/day"></select>
  </li>
  ```

- ### HTML5自定義屬性||元素：
  - data-type
  - data-format
  - ...............................

