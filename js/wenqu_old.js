'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var wqInput = function () {
    function wqInput(elem) {
        _classCallCheck(this, wqInput);

        if (typeof elem === 'string') {
            this.elem = $(elem);
        } else if ((typeof elem === 'undefined' ? 'undefined' : _typeof(elem)) === 'object') {
            if (elem instanceof jQuery) {
                this.elem = elem;
            } else {
                this.elem = $(elem);
            }
        }
        this.appendIconX();
        this.bindEvents();
        this.defaultName();
    }

    wqInput.prototype.appendIconX = function appendIconX() {
        if (this.elem.siblings('.wq-iconx').length > 0) {
            this.iconx = this.elem.siblings('.wq-iconx').eq(0);
        } else {
            this.iconx = $('<span class="wq-iconx">x</span>');
            this.iconx.click({ elem: this.elem, hideIconX: this.hideIconX }, function (event) {
                event.preventDefault();
                event.data.hideIconX($(this));
                event.data.elem.val('').focus();
            });

            this.elem.after(this.iconx);

            this.iconx.css({ 'display': 'none', 'opacity': 0 });
        }
    };

    wqInput.prototype.showIconX = function showIconX(iconx) {
        iconx.fadeTo(100, 1);
    };

    wqInput.prototype.hideIconX = function hideIconX(iconx) {
        iconx.fadeTo(500, 0, function () {
            $(this).css('display', 'none');
        });
    };

    wqInput.prototype.bindEvents = function bindEvents() {
        this.bindEventClickFocus();
        this.bindEventBlur();
        this.bindEventKeyup();
    };

    wqInput.prototype.bindEventClickFocus = function bindEventClickFocus() {
        this.elem.on('click, focus', { iconx: this.iconx, showIconX: this.showIconX }, function (event) {
            $(this).removeClass('error');
            if ($(this).val().length > 0) {
                event.data.showIconX(event.data.iconx);
            }
        });
    };

    wqInput.prototype.bindEventBlur = function bindEventBlur() {
        this.elem.on('blur', { iconx: this.iconx, hideIconX: this.hideIconX }, function (event) {
            event.data.hideIconX(event.data.iconx);
            if ($(this).val().length === 0) {
                $(this).addClass('error');
            }
        });
    };

    wqInput.prototype.bindEventKeyup = function bindEventKeyup() {
        this.elem.on('keyup', { iconx: this.iconx, showIconX: this.showIconX, hideIconX: this.hideIconX }, function (event) {
            if ($(this).val().length > 0) {
                event.data.showIconX(event.data.iconx);
            } else {
                event.data.hideIconX(event.data.iconx);
            }
        });
        this.elem.on('keyup keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                e.preventDefault();
                return false;
            }
        });
    };

    wqInput.prototype.defaultName = function defaultName() {
        var val = this.elem.val(this.elem.data('value'));
        return;
    };

    wqInput.prototype.validation = function validation() {
        var val = this.elem.val().trim();
        var valDataFormat = this.elem.data('format');
        var maxLength = 0;
        var popUpWords = "&#22995;&#21517;&#26684;&#24335;&#37679;&#35492;&#65292;&#35531;&#37325;&#26032;&#36664;&#20837;&#12290;";
        var chiRegExp = /^[\u4e00-\u9fa5\u3400-\u4db5]+$/;
        var engRegExp = /^[a-zA-Z\u4e00-\u9fa5\u3400-\u4db5]+$/;
        var numRegExp = /^\d+[.]?\d*$/;
        var ret = true;
        var errMsg = '';

        if (/^chi(\d*)$/.test(valDataFormat)) {
            var valDataFormatRegex = valDataFormat.match(/^chi(\d*)$/);
            valDataFormat = 'chi';
            if (valDataFormatRegex[1].length > 0) {
                maxLength = parseInt(valDataFormatRegex[1], 10);
            }
        }

        switch (valDataFormat) {
            case "chi":
                if (val.length == 0) {
                    ret = false;
                    errMsg = '';
                } else if (!chiRegExp.test(val) || val.indexOf(" ") != -1 || val.indexOf("&#12288;") != -1) {
                    ret = false;
                    errMsg = '&#26684;&#24335;&#37679;&#35492;&#65292;&#20677;&#21487;&#36664;&#20837;&#20013;&#25991;&#23383;';
                } else if (maxLength > 0 && val.length > maxLength) {
                    ret = false;
                    errMsg = '&#26684;&#24335;&#37679;&#35492;&#65292;&#26368;&#22810;&#21487;&#36664;&#20837;' + maxLength + '&#20491;&#20013;&#25991;&#23383;';
                }
                break;
            case "chi_eng":
                if (!engRegExp.test(val)) {
                    ret = false;
                    errMsg = '';
                }
                break;
            case "num":
                if (!numRegExp.test(val)) {
                    ret = false;
                    errMsg = '';
                }
                break;
            default:
                if (val.length == 0) {
                    ret = false;
                    errMsg = '';
                }
                break;
        }

        if (!ret) {
            if (val.length == 0) {
                this.elem.val('');
            }
            this.elem.addClass('error');
        }

        return { valid: ret, errMsg: errMsg };
    };

    return wqInput;
}();

var wqRadio = function () {
    function wqRadio(elem) {
        _classCallCheck(this, wqRadio);

        if (typeof elem === 'string') {
            this.elem = $(elem);
        } else if ((typeof elem === 'undefined' ? 'undefined' : _typeof(elem)) === 'object') {
            if (elem instanceof jQuery) {
                this.elem = elem;
            } else {
                this.elem = $(elem);
            }
        }

        if (this.elem.attr('wq-init') != '1' && $('label[for=' + this.elem.attr('id') + ']').length == 0) {
            this.setup();
            this.buildLabel();
        }
    }

    wqRadio.prototype.setup = function setup() {
        if (typeof this.elem.attr('id') === 'undefined') {
            var elemID = $('.wq-radio').index(this.elem);
            this.elem.attr('id', 'wq-radio-' + elemID);
        }

        try {
            this.elem.attr('type', this.elem.data('type'));
        } catch (e) {}
        this.elem.attr('name', this.elem.data('name'));
        this.elem.attr('value', this.elem.data('value'));
        if (typeof this.elem.data('checked') !== 'undefined' && this.elem.data('checked') == '1') {
            this.elem.attr('checked', true);
        }

        this.elem.attr('wq-init', '1');
    };

    wqRadio.prototype.buildLabel = function buildLabel() {
        var label = $('<label></label>');
        label.attr('for', this.elem.attr('id'));
        label.html(this.elem.data('title'));

        this.label = label;
        this.elem.after(this.label);

        if (typeof this.elem.data('bgcolor') !== 'undefined') {
            var lb_bg_color = this.elem.data('bgcolor');
            var validColor3 = /^#[0-9A-F]{3}$/i.test(lb_bg_color);
            var validColor6 = /^#[0-9A-F]{6}$/i.test(lb_bg_color);
            if (validColor3 || validColor6) {
                var style = document.createElement("style");
                document.body.appendChild(style);
                var sheet = style.sheet;
                try {
                    if (typeof sheet.insertRule !== 'undefined') {
                        sheet.insertRule('#' + this.elem.attr('id') + ':checked + label { background-color: ' + lb_bg_color + '; }', 0);
                    } else if (typeof sheet.addRule !== 'undefined') {
                        sheet.addRule('#' + this.elem.attr('id') + ':checked + label', 'background-color: ' + lb_bg_color);
                    }
                } catch (e) {}
            }
        }

        if (typeof this.elem.data('color') !== 'undefined') {
            var lb_color = this.elem.data('color');
            var _validColor = /^#[0-9A-F]{3}$/i.test(lb_color);
            var _validColor2 = /^#[0-9A-F]{6}$/i.test(lb_color);
            if (_validColor || _validColor2) {
                var _style = document.createElement("style");
                document.body.appendChild(_style);
                var _sheet = _style.sheet;
                try {
                    if (typeof _sheet.insertRule !== 'undefined') {
                        _sheet.insertRule('#' + this.elem.attr('id') + ' + label { color: ' + lb_color + '; }', 0);
                        _sheet.insertRule('#' + this.elem.attr('id') + ' + label::before { color: ' + lb_color + '; }', 0);
                        _sheet.insertRule('#' + this.elem.attr('id') + ' + label { border: 1px solid ' + lb_color + '; }', 0);
                    } else if (typeof _sheet.addRule !== 'undefined') {
                        _sheet.addRule('#' + this.elem.attr('id') + ' + label', 'color: ' + lb_color);
                        _sheet.addRule('#' + this.elem.attr('id') + ' + label::before', 'color: ' + lb_color);
                        _sheet.addRule('#' + this.elem.attr('id') + ' + label', 'border: 1px solid ' + lb_color);
                    }
                } catch (e) {}
            }
        }
    };

    return wqRadio;
}();

var wqSex = function () {
    function wqSex(elem) {
        _classCallCheck(this, wqSex);

        if (typeof elem === 'string') {
            this.elem = $(elem);
        } else if ((typeof elem === 'undefined' ? 'undefined' : _typeof(elem)) === 'object') {
            if (elem instanceof jQuery) {
                this.elem = elem;
            } else {
                this.elem = $(elem);
            }
        }
        this.options = {
            sex: [{ value: 0, text: "&#22899;" }, { value: 1, text: "&#30007;" }]
        };
        this.buildSexOptions();
        this.defaultSex();
    }

    wqSex.prototype.defaultSex = function defaultSex() {
        var value = this.elem.data('value');
        if (this.elem.find('option[value=' + value + ']').length > 0) {
            this.elem.val(value);
        }
    };

    wqSex.prototype.buildSexOptions = function buildSexOptions() {
        this.elem.find("option").remove();
        this.options.sex.map(function (item) {
            this.elem.append('<option value="' + item.value + '">' + item.text + '</option>');
        }, this);
    };

    wqSex.prototype.validation = function validation() {
        var validOptions = [];
        this.options.sex.map(function (item) {
            validOptions.push(item.value);
        });
        return validOptions.indexOf(parseInt(this.elem.val())) !== -1 ? true : false;
    };

    return wqSex;
}();

var wqDateTime = function () {
    function wqDateTime(elem) {
        _classCallCheck(this, wqDateTime);

        var _root;
        if (typeof elem === 'string') {
            _root = $(elem);
        } else if ((typeof elem === 'undefined' ? 'undefined' : _typeof(elem)) === 'object') {
            if (elem instanceof jQuery) {
                _root = elem;
            } else {
                _root = $(elem);
            }
        }

        this._root = _root;

        this.elem = {
            calendar: _root.find('.wq-select[data-type="calendar"]').length > 0 ? _root.find('.wq-select[data-type="calendar"]').eq(0) : false,
            year: _root.find('.wq-select[data-type="year"]').length > 0 ? _root.find('.wq-select[data-type="year"]').eq(0) : false,
            month: _root.find('.wq-select[data-type="month"]').length > 0 ? _root.find('.wq-select[data-type="month"]').eq(0) : false,
            day: _root.find('.wq-select[data-type="day"]').length > 0 ? _root.find('.wq-select[data-type="day"]').eq(0) : false,
            hour: _root.find('.wq-select[data-type="hour"]').length > 0 ? _root.find('.wq-select[data-type="hour"]').eq(0) : false
        };

        this.options = {
            calendar: [{ value: 1, text: "&#35199;&#20803;&#29983;&#26085;" }, { value: 0, text: "&#36786;&#26310;&#29983;&#26085;" }],
            hour: [{ value: '00', text: "00:00~00:59 (&#26089;&#23376;)" }, { value: '01', text: "01:00~02:59 (&#19985;)" }, { value: '03', text: "03:00~04:59 (&#23493;)" }, { value: '05', text: "05:00~06:59 (&#21359;)" }, { value: '07', text: "07:00~08:59 (&#36784;)" }, { value: '09', text: "09:00~10:59 (&#24051;)" }, { value: '11', text: "11:00~12:59 (&#21320;)" }, { value: '13', text: "13:00~14:59 (&#26410;)" }, { value: '15', text: "15:00~16:59 (&#30003;)" }, { value: '17', text: "17:00~18:59 (&#37193;)" }, { value: '19', text: "19:00~20:59 (&#25100;)" }, { value: '21', text: "21:00~22:59 (&#20133;)" }, { value: '23', text: "23:00~23:59 (&#26202;&#23376;)" }],
            debug: typeof _root.data('debug') !== "undefined" && _root.data('debug').toString() === "1" ? true : false
        };

        this.data = {
            lunarYear: [0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, 0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d295, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, 0x049b0, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50, 0x16a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, 0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, 0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, 0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0, 0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, 0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, 0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, 0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, 0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, 0x14b63],
            baseDays: [30, 49, 38, 28, 46, 34, 24, 43, 32, 21, 40, 29, 48, 36, 25, 44, 33, 22, 41, 31, 50, 38, 27, 46, 35, 23, 43, 32, 22, 40, 29, 47, 36, 25, 44, 34, 23, 41, 30, 49, 38, 26, 45, 35, 24, 43, 32, 21, 40, 28, 47, 36, 26, 44, 33, 23, 42, 30, 48, 38, 27, 45, 35, 24, 43, 32, 20, 39, 29, 47, 36, 26, 45, 33, 22, 41, 30, 48, 37, 27, 46, 35, 24, 43, 32, 50, 39, 28, 47, 36, 26, 45, 34, 22, 40, 30, 49, 37, 27, 46, 35, 23, 42, 31, 21, 39, 28, 48, 37, 25, 44, 33, 22, 40, 30, 49, 38, 27, 46, 35, 24, 42, 31, 21, 40, 28, 47, 36, 25, 43, 33, 22, 41, 30, 49, 38, 27, 45, 34, 23, 42, 31, 21, 40, 29, 47, 36, 25, 44, 32, 22]
        };
        this.buildCalendarOptions();
        this.buildHourOptions();

        this.setYearOptionsRange();
        this.buildYearOptions();
        this.buildMonthOptions();
        this.buildLeapMonth();
        this.buildDayOptions();

        this.bindCalendarEventChange();
        this.bindYearEventChange();
        this.bindMonthEventChange();

        this.defaultDateTime();
    }

    wqDateTime.prototype.defaultDateTime = function defaultDateTime() {
        var self = this;
        var array = ['calendar', 'year', 'month', 'day', 'hour'];
        $.each(array, function (index, value) {
            if (self.elem[value] !== false) {
                var dataValue = self.elem[value].data('value');
                if (self.elem[value].find('option[value=' + dataValue + ']').length > 0) {
                    self.elem[value].val(dataValue).trigger("change");
                } else if (value == 'hour' && parseInt(dataValue, 10) < 10 && self.elem[value].find('option[value=0' + dataValue + ']').length > 0) {
                    self.elem[value].val('0' + dataValue);
                }
            }
        });
    };

    wqDateTime.prototype.checkSolarLeapYear = function checkSolarLeapYear(i) {
        return i % 400 == 0 || i % 4 == 0 && i % 100 != 0;
    };

    wqDateTime.prototype.checkLunarLeapYear = function checkLunarLeapYear(i) {
        var yinYear = this.data.lunarYear[i - 1900];
        return yinYear & 0xf;
    };

    wqDateTime.prototype.getThisYear = function getThisYear() {
        var d = new Date();
        var n = d.getFullYear();
        return n;
    };

    wqDateTime.prototype.buildCalendarOptions = function buildCalendarOptions() {
        this.elem.calendar.find("option").remove();
        var fixed = this.elem.calendar.data('fixed');
        var optionIndex = void 0;
        if (typeof fixed !== 'undefined' && (optionIndex = ['solar', 'lunar'].indexOf(fixed)) > -1) {
            this.elem.calendar.append('<option value="' + this.options.calendar[optionIndex].value + '">' + this.options.calendar[optionIndex].text + '</option>');
        } else {
            this.options.calendar.map(function (item) {
                this.elem.calendar.append('<option value="' + item.value + '">' + item.text + '</option>');
            }, this);
        }
    };

    wqDateTime.prototype.setYearOptionsRange = function setYearOptionsRange() {
        var optionMin = typeof this.elem.year.data('min') === 'undefined' ? 1901 : parseInt(this.elem.year.data('min'), 10);
        var optionMax = typeof this.elem.year.data('max') === 'undefined' ? this.getThisYear() : parseInt(this.elem.year.data('max'), 10);

        if (optionMin < 1901 || optionMin > 1900 + this.data.lunarYear.length - 1) {
            optionMin = 1901;
        }
        if (optionMax < 1901 || optionMax > 1900 + this.data.lunarYear.length - 1) {
            optionMax = this.getThisYear();
        }

        this.options.year = {
            min: optionMin,
            max: optionMax
        };
    };

    wqDateTime.prototype.buildYearOptions = function buildYearOptions() {
        var oldYearValue = this.elem.year.val() || this.options.year.min;
        this.elem.year.find("option").remove();

        for (var i = this.options.year.min; i <= this.options.year.max; i++) {
            var leapLabel = '';
            if (this.options.debug) {
                if (this.elem.calendar.val() === "0" && this.checkLunarLeapYear(i) !== 0 || this.elem.calendar.val() === "1" && this.checkSolarLeapYear(i)) {
                    leapLabel = '(&#38287;)';
                }
            }
            this.elem.year.append('<option value="' + i + '">' + i + leapLabel + '&#24180;</option>');
        }

        this.elem.year.val(oldYearValue);
    };

    wqDateTime.prototype.buildMonthOptions = function buildMonthOptions() {
        var oldMonthValue = this.elem.month.val() || 1;
        this.elem.month.find("option").remove();

        for (var i = 1; i <= 12; i++) {
            this.elem.month.append('<option value="' + i + '">' + (i < 10 ? '0' + i : i) + '&#26376;</option>');
        }

        var leapMonth = this.elem.calendar.val() === "0" ? this.checkLunarLeapYear(this.elem.year.val()) : 0;
        if (leapMonth !== 0) {
            $('<option class="leap-month" value="' + -1 * leapMonth + '">' + (leapMonth < 10 ? '0' + leapMonth : leapMonth) + '(&#38287;)&#26376;</option>').insertBefore(this.elem.month.find('option:eq(' + leapMonth + ')'));
        }

        if (this.elem.month.find("option[value='" + oldMonthValue + "']").length == 0) {
            oldMonthValue = 1;
        }
        this.elem.month.val(oldMonthValue);
    };

    wqDateTime.prototype.buildLeapMonth = function buildLeapMonth() {
        var name = (this.elem.month.attr('name') || '').replace('iMonth', 'LeapMonth');
        if (this._root.find('input[type=hidden][name=' + name + ']').length > 0) {
            this.elem.leapmonth = this._root.find('input[type=hidden][name=' + name + ']').eq(0);
        } else {
            this.elem.leapmonth = $('<input type="hidden" name="' + name + '" value="" />');
            this.elem.month.after(this.elem.leapmonth);
        }
    };

    wqDateTime.prototype.applyLeapMonth = function applyLeapMonth() {
        this.elem.leapmonth.val('');
        if (parseInt(this.elem.calendar.val(), 10) == 0 && parseInt(this.elem.month.val(), 10) < 0) {
            var leapmonth_value = parseInt(this.elem.month.val(), 10);
            this.elem.leapmonth.val('1');
            this.elem.month.find('option:selected').attr('value', Math.abs(leapmonth_value));
            this.elem.month.find('option:selected').attr('data-org-value', leapmonth_value);
        }
    };

    wqDateTime.prototype.restoreLeapMonth = function restoreLeapMonth() {
        this.elem.leapmonth.val('');

        var org_value = this.elem.month.find('option:selected').attr('data-org-value');
        if (typeof org_value !== 'undefined') {
            this.elem.month.find('option:selected').attr('value', org_value);
            this.elem.month.find('option:selected').removeAttr('data-org-value', '');
        }
    };

    wqDateTime.prototype.calcSolarDay = function calcSolarDay() {
        var days = [0, 0, -3, 0, -1, 0, -1, 0, 0, -1, 0, -1, 0];
        var thisMonth = this.elem.month.val();
        var thisDay = days[thisMonth];
        if (this.elem.calendar.val() === "1" && this.checkSolarLeapYear(this.elem.year.val()) && this.elem.month.val() == 2) {
            thisDay++;
        }
        thisDay += 31;
        return thisDay;
    };

    wqDateTime.prototype.getLunarDaysForMonths = function getLunarDaysForMonths(year) {
        var days = [];
        var yinYear = this.data.lunarYear[year - 1900];
        var binaryStr = yinYear.toString(2);

        try {
            binaryStr = ('0'.repeat(17) + binaryStr).substr(-17);
        } catch (e) {
            binaryStr = ('0000000000' + binaryStr).substr(-17);
        }

        if (binaryStr.length > 17) {
            binaryStr = binaryStr.slice(-17);
        }

        binaryStr = binaryStr.substr(0, binaryStr.length - 4);
        days = binaryStr.split("");

        return days;
    };

    wqDateTime.prototype.calcLunarDay = function calcLunarDay() {
        var days = this.getLunarDaysForMonths(this.elem.year.val());
        var thisMonth = this.elem.month.val();
        thisMonth = thisMonth < 0 ? 0 : thisMonth;
        var thisDay = days[thisMonth];
        var n = 29 + parseInt(thisDay, 10);
        return n;
    };

    wqDateTime.prototype.buildDayOptions = function buildDayOptions() {
        var oldDayValue = this.elem.day.val() || 1;
        this.elem.day.find("option").remove();

        var totalDays = 0;
        if (this.elem.calendar.val() === "0") {
            totalDays = this.calcLunarDay();
        } else if (this.elem.calendar.val() === "1") {
            totalDays = this.calcSolarDay();
        }

        for (var i = 1; i <= totalDays; i++) {
            this.elem.day.append('<option value="' + i + '">' + (i < 10 ? '0' + i : i) + '&#26085;</option>');
        }

        if (this.elem.day.find("option[value='" + oldDayValue + "']").length == 0) {
            oldDayValue = 1;
        }
        this.elem.day.val(oldDayValue);
    };

    wqDateTime.prototype.buildHourOptions = function buildHourOptions() {
        if (!this.elem.hour) {
            return;
        }
        this.elem.hour.find("option").remove();
        this.options.hour.map(function (item) {
            this.elem.hour.append('<option value="' + item.value + '">' + item.text + '</option>');
        }, this);
    };

    wqDateTime.prototype.bindCalendarEventChange = function bindCalendarEventChange() {
        this.elem.calendar.on('change', { obj: this }, function (event) {
            event.data.obj.buildYearOptions();
            event.data.obj.buildMonthOptions();
            event.data.obj.buildDayOptions();
        });
    };

    wqDateTime.prototype.bindYearEventChange = function bindYearEventChange() {
        this.elem.year.on('change', { obj: this }, function (event) {
            event.data.obj.buildMonthOptions();
            event.data.obj.buildDayOptions();
        });
    };

    wqDateTime.prototype.bindMonthEventChange = function bindMonthEventChange() {
        this.elem.month.on('change', { obj: this }, function (event) {
            event.data.obj.buildDayOptions();
        });
    };

    wqDateTime.prototype.getLunarYearSign = function getLunarYearSign(year) {
        var baseYear = 1864;
        var kan = ['&#30002;', '&#20057;', '&#19993;', '&#19969;', '&#25098;', '&#24049;', '&#24218;', '&#36763;', '&#22764;', '&#30328;'];
        var chi = ['&#23376;', '&#19985;', '&#23493;', '&#21359;', '&#36784;', '&#24051;', '&#21320;', '&#26410;', '&#30003;', '&#37193;', '&#25100;', '&#20133;'];

        var gap = parseInt(year, 10) - baseYear;
        return kan[gap % kan.length] + chi[gap % chi.length];
    };

    wqDateTime.prototype.dateFormat = function dateFormat(calendar, year, month, day) {
        calendar = parseInt(calendar, 10);
        year = parseInt(year, 10);
        month = parseInt(month, 10);
        day = parseInt(day, 10);

        var addZero = function addZero(val) {
            val = val.toString();
            if (val.length < 2) {
                val = '0' + val;
            }
            return val;
        };

        var calendarStr = calendar === 0 ? '&#36786;&#26310;' : '&#35199;&#20803;';
        var monthStr = '';
        if (calendar === 0) {
            if (month > 0) {
                monthStr = addZero(month);
            } else {
                monthStr = addZero(Math.abs(month)) + '(&#38287;)';
            }
        } else {
            monthStr = addZero(month);
        }
        var dayStr = addZero(day);

        return '' + calendarStr + year + '&#24180;' + monthStr + '&#26376;' + dayStr + '&#26085;';
    };

    wqDateTime.prototype.toSolarString = function toSolarString() {
        if (this.elem.calendar.val() == 0) {
            var data = this.lunarSolarConverter();
            return this.dateFormat(1, data.year, data.month, data.day);
        } else {
            var year = this.elem.year.val();
            var month = this.elem.month.val();
            var day = this.elem.day.val();
            return this.dateFormat(1, year, month, day);
        }
    };

    wqDateTime.prototype.toLunarString = function toLunarString() {
        if (this.elem.calendar.val() == 1) {
            var data = this.lunarSolarConverter();
            return this.dateFormat(0, data.year, data.month, data.day);
        } else {
            var year = this.elem.year.val();
            var month = this.elem.month.val();
            var day = this.elem.day.val();
            return this.dateFormat(0, year, month, day);
        }
    };

    wqDateTime.prototype.lunarSolarConverter = function lunarSolarConverter() {
        var calendar = parseInt(this.elem.calendar.val(), 10);
        var year = parseInt(this.elem.year.val(), 10);
        var month = parseInt(this.elem.month.val(), 10);
        var day = parseInt(this.elem.day.val(), 10);
        return this.lunarSolarConverterCalc(calendar, year, month, day);
    };

    wqDateTime.prototype.lunarArrayIntoDays = function lunarArrayIntoDays(year) {
        var getLunarMonthArray = this.getLunarDaysForMonths(year);
        var getLunarLeapMonth = this.checkLunarLeapYear(year);
        if (getLunarLeapMonth) {
            getLunarMonthArray.splice(getLunarLeapMonth + 1, 0, getLunarMonthArray[0]);
        }
        for (var i = 1; i < getLunarMonthArray.length; i++) {
            getLunarMonthArray[i] = 29 + parseInt(getLunarMonthArray[i], 10);
        }

        return getLunarMonthArray;
    };

    wqDateTime.prototype.lunarDaysInSolarYear = function lunarDaysInSolarYear(year) {
        var totalDays = this.checkSolarLeapYear(year) ? 366 : 365;
        return totalDays - this.data.baseDays[year - 1900];
    };

    wqDateTime.prototype.solarArrayIntoDays = function solarArrayIntoDays(year) {
        var getSolarMonthArray = [0, 0, -3, 0, -1, 0, -1, 0, 0, -1, 0, -1, 0];
        if (this.checkSolarLeapYear(year)) {
            getSolarMonthArray[2]++;
        }
        getSolarMonthArray = getSolarMonthArray.map(function (i) {
            return 31 + i;
        });

        return getSolarMonthArray;
    };

    wqDateTime.prototype.lunarSolarConverterCalc = function lunarSolarConverterCalc(calendar, year, month, day) {
        var basedays = this.data.baseDays[year - 1900];
        var initMonth = void 0;
        if (calendar == 0) {
            var getLunarLeapMonth = this.checkLunarLeapYear(year);
            var getLunarMonthArray = this.lunarArrayIntoDays(year);
            var sumOfLunarDays = void 0;
            if (getLunarLeapMonth == 0) {
                initMonth = 1;
                sumOfLunarDays = 0;
                while (initMonth < month) {
                    sumOfLunarDays += getLunarMonthArray[initMonth];
                    initMonth++;
                }
                sumOfLunarDays += day;
            } else {
                var doubleMonth = Math.abs(month);
                initMonth = 1;
                sumOfLunarDays = 0;
                if (month < 0 || getLunarLeapMonth != 0 && month > getLunarLeapMonth) {
                    doubleMonth++;
                }
                while (initMonth < doubleMonth) {
                    sumOfLunarDays += getLunarMonthArray[initMonth];
                    initMonth++;
                }
                sumOfLunarDays += day;
            }
            var lunarDaysInSolarYear = this.lunarDaysInSolarYear(year);
            if (sumOfLunarDays <= lunarDaysInSolarYear) {
                initMonth = 1;
                var _rankingInSolarYear = sumOfLunarDays + basedays;
                var solarMonthDays = this.solarArrayIntoDays(year);
                while (solarMonthDays[initMonth] < _rankingInSolarYear) {
                    _rankingInSolarYear -= solarMonthDays[initMonth];
                    initMonth++;
                }
                return {
                    year: year,
                    month: initMonth,
                    day: _rankingInSolarYear
                };
            } else {
                var _solarMonthDays = this.solarArrayIntoDays(year + 1);
                initMonth = 1;
                var rankingInSolarYear = sumOfLunarDays - lunarDaysInSolarYear;
                while (_solarMonthDays[initMonth] < rankingInSolarYear) {
                    rankingInSolarYear -= _solarMonthDays[initMonth];
                    initMonth++;
                }
                return {
                    year: year + 1,
                    month: initMonth,
                    day: rankingInSolarYear
                };
            }
        } else if (calendar == 1) {
            initMonth = 1;
            var sumOfSolarDays = 0;
            var getSolarMonthArray = this.solarArrayIntoDays(year);
            while (initMonth < month) {
                sumOfSolarDays += getSolarMonthArray[initMonth];
                initMonth++;
            }
            sumOfSolarDays += day;
            if (sumOfSolarDays <= basedays) {
                var lastLunarYear = year - 1;
                basedays = this.data.baseDays[lastLunarYear - 1900];
                sumOfSolarDays += this.checkSolarLeapYear(lastLunarYear) ? 366 : 365;
                year = lastLunarYear;
            }
            var thisLunarYear = year;
            initMonth = 1;
            var rankingInLunarYear = sumOfSolarDays - basedays;
            var _getLunarMonthArray = this.lunarArrayIntoDays(thisLunarYear);
            var _getLunarLeapMonth = this.checkLunarLeapYear(thisLunarYear);

            var processMonth = function processMonth(initMonth) {
                return initMonth;
            };

            if (_getLunarLeapMonth != 0) {
                var beforeLunarMonth = 0;
                var _doubleMonth = initMonth;
                while (_doubleMonth < _getLunarLeapMonth + 1) {
                    beforeLunarMonth += _getLunarMonthArray[_doubleMonth];
                    _doubleMonth++;
                }

                if (rankingInLunarYear > beforeLunarMonth) {
                    if (rankingInLunarYear <= beforeLunarMonth + _getLunarMonthArray[_doubleMonth]) {
                        processMonth = function processMonth(initMonth) {
                            return -1 * (initMonth - 1);
                        };
                    } else {
                        processMonth = function processMonth(initMonth) {
                            return initMonth - 1;
                        };
                    }
                }
            }

            while (_getLunarMonthArray[initMonth] < rankingInLunarYear) {
                rankingInLunarYear -= _getLunarMonthArray[initMonth];
                initMonth++;
            }

            initMonth = processMonth(initMonth);

            return {
                year: thisLunarYear,
                month: initMonth,
                day: rankingInLunarYear
            };
        }
    };

    wqDateTime.prototype.validation = function validation() {
        var validCalendarOptions = [];
        this.options.calendar.map(function (item) {
            validCalendarOptions.push(item.value);
        });
        var vco = validCalendarOptions.indexOf(parseInt(this.elem.calendar.val(), 10)) !== -1 ? true : false;
        if (!vco) {
            return false;
        }

        var validHourOptions = [];
        this.options.hour.map(function (item) {
            validHourOptions.push(item.value);
        });

        var validYearOptions = void 0;
        try {
            validYearOptions = Array.from(Array(this.options.year.max + 1).keys()).slice(this.options.year.min);
        } catch (e) {
            validYearOptions = [];
            for (var i = this.options.year.min; i <= this.options.year.max; i++) {
                validYearOptions.push(i);
            }
        }

        var validMonthOptions = void 0;
        try {
            validMonthOptions = Array.from(Array(13).keys()).slice(1);
        } catch (e) {
            validMonthOptions = [];
            for (var _i = 1; _i <= 12; _i++) {
                validMonthOptions.push(_i);
            }
        }
        if (this.elem.calendar.val() === "0" && this.checkLunarLeapYear(this.elem.year.val()) > 0) {
            validMonthOptions.push(-1 * this.checkLunarLeapYear(this.elem.year.val()));
        }

        var validDayOptions = void 0;
        try {
            validDayOptions = Array.from(Array((this.elem.calendar.val() === "0" ? this.calcLunarDay() : this.calcSolarDay()) + 1).keys()).slice(1);
        } catch (e) {
            validDayOptions = [];
            var validDayMax = this.elem.calendar.val() === "0" ? this.calcLunarDay() : this.calcSolarDay();
            for (var _i2 = 1; _i2 <= validDayMax; _i2++) {
                validDayOptions.push(_i2);
            }
        }

        var vho = this.elem.hour === false ? true : validHourOptions.indexOf(this.elem.hour.val()) !== -1 ? true : false;
        var vyo = validYearOptions.indexOf(parseInt(this.elem.year.val(), 10)) !== -1 ? true : false;
        var vmo = validMonthOptions.indexOf(parseInt(this.elem.month.val(), 10)) !== -1 ? true : false;
        var vdo = validDayOptions.indexOf(parseInt(this.elem.day.val(), 10)) !== -1 ? true : false;

        return vco && vho && vyo && vmo && vdo;
    };

    return wqDateTime;
}();

var wqPopup = function () {
    function wqPopup() {
        _classCallCheck(this, wqPopup);
    }

    wqPopup.prototype.guid = function guid() {
        var s4 = function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    wqPopup.prototype.closeAlert = function closeAlert(guid) {
        $('.wq-pop.cover.alert-' + guid).remove();
    };

    wqPopup.prototype.alert = function alert(msg) {
        var self = this;

        var btn_close = $('<a></a>');
        btn_close.html('&#30906;&#23450;');

        var guid = this.guid();

        btn_close.click(function () {
            self.closeAlert(guid);
        });

        var popalert = $('<div class="wq-pop cover alert-' + guid + '">' + '<div style="display:block">' + '<div class="wqPOP" style="display:block">' + '<div class="TBAR"></div>' + '<div class="COM">' + '<p class="pop_t01">' + msg + '</p>' + '<div class="BT01">' + '<ul>' + '<li class="btn-alert"></li>' + '</ul>' + '</div>' + '</div>' + '</div>' + '</div>' + '</div>');
        popalert.find('.btn-alert').append(btn_close);
        $('body').append(popalert);
    };

    wqPopup.prototype.closeConfirm = function closeConfirm() {
        $('.wq-pop.cover').remove();
    };

    wqPopup.prototype.confirm = function confirm(form_data, on_yes, options) {
        var num = form_data.length;
        var self = this;

        var btn_no = $('<a></a>');
        btn_no.html('&#21462;&#28040;');
        btn_no.click(function () {
            self.closeConfirm();
        });

        var btn_xx = $('<a href="#" style="background-image: url(https://gimgs.click108.com.tw/wenqu/images/pop_x_icon.png);}"></a>');
        btn_xx.click(function (e) {
            e.preventDefault();
            self.closeConfirm();
        });

        var btn_yes = $('<a></a>');
        btn_yes.html('&#30906;&#23450;');
        btn_yes.click(function () {
            on_yes();
            self.closeConfirm();
        });

        var pop_title = '&#35531;&#30906;&#35469;&#24744;&#25552;&#20379;&#30340;&#36039;&#26009;&#26159;&#21542;&#27491;&#30906;';
        if (typeof options.pop_title !== 'undefined') {
            pop_title = options.pop_title;
        }

        var birth_title = '&#29983;&#36784;';
        if (typeof options.birth_title !== 'undefined') {
            birth_title = options.birth_title;
        }

        var popconfirm = $('<div class="wq-pop cover confirm">' + '<div style="display:block">' + '<div class="wqPOP">' + '<div class="TBAR">' + '<div class="XX"></div>' + '</div>' + '<div class="COM">' + '<p class="pop_t01 pop-data-container">' + pop_title + '&#65306;</p>' + '<div class="BT02">' + '<ul>' + '<li class="btn-yes"></li>' + '<li class="btn-no"></li>' + '</ul>' + '</div>' + '</div>' + '</div>' + '</div>' + '</div>');

        var clonePopconfirm = function clonePopconfirm(i) {
            var dateString = [];
            if (typeof form_data[i - 1].date_format !== 'undefined' && form_data[i - 1].date_format == 'both') {
                dateString.push(form_data[i - 1].datetime.solarString + (form_data[i - 1].datetime.hour[0] === false ? '' : ' ' + form_data[i - 1].datetime.hour[1]));
                dateString.push(form_data[i - 1].datetime.lunarString + (form_data[i - 1].datetime.hour[0] === false ? '' : ' ' + form_data[i - 1].datetime.hour[1]));
            } else {
                dateString.push(form_data[i - 1].datetime.calendar[0] == 1 ? form_data[i - 1].datetime.solarString : form_data[i - 1].datetime.lunarString);
                dateString.push(form_data[i - 1].datetime.hour[0] === false ? '' : form_data[i - 1].datetime.hour[1]);
            }
            var ret = '<p class="pop_t01">&#22995;&#21517;&#65306;<span class="pop_t03" >' + form_data[i - 1].nickname + '</span></p>' + '<p class="pop_t01">&#24615;&#21029;&#65306;<span class="pop_t03" >' + form_data[i - 1].sex[1] + '</span></p>' + '<p class="pop_t01" id="dateFormat">' + birth_title + '&#65306;<span class="pop_t03" >' + dateString[0] + '</span></p>' + '<p class="pop_t03" style="margin-left:3em;" >' + dateString[1] + '</p>';
            if (typeof form_data[i - 1].custom !== 'undefined' && form_data[i - 1].custom.length > 0) {
                for (var j in form_data[i - 1].custom) {
                    if (form_data[i - 1].custom.hasOwnProperty(j)) {
                        ret += '<p class="pop_t01">' + form_data[i - 1].custom[j][2] + "&#65306;" + '<span class="pop_t03" >' + form_data[i - 1].custom[j][1] + '</span></p>';
                    }
                }
            }

            return ret;
        };
        var clone = [];
        for (var i = 1; i <= num; i++) {
            if (i > 1) {
                clone.push('<div class="POP_LINE"></div>');
            }

            clone.push(clonePopconfirm(i));
        }
        popconfirm.find('.btn-yes').append(btn_yes);
        popconfirm.find('.btn-no').append(btn_no);
        popconfirm.find('.XX').append(btn_xx);
        popconfirm.find('.pop-data-container').after(clone.join('')).end().appendTo('body');
    };

    wqPopup.prototype.confirmCustom = function confirmCustom(confirmMsgElements, options) {
        for (var _len = arguments.length, beforeAndAfterSubmit = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            beforeAndAfterSubmit[_key - 2] = arguments[_key];
        }

        var num = confirmMsgElements.length;
        var self = this;

        var btn_no = $('<a></a>');
        btn_no.html('&#21462;&#28040;');
        btn_no.click(function () {
            self.closeConfirm();
        });

        var btn_xx = $('<a href="#" style="background-image: url(https://gimgs.click108.com.tw/wenqu/images/pop_x_icon.png);}"></a>');
        btn_xx.click(function (e) {
            e.preventDefault();
            self.closeConfirm();
        });

        var btn_yes = $('<a></a>');
        btn_yes.html('&#30906;&#23450;');
        btn_yes.click(function () {
            if (beforeAndAfterSubmit.length > 0 && typeof beforeAndAfterSubmit[0] === 'function') {
                beforeAndAfterSubmit[0]();
            }

            $('#' + options.form_id).attr('action', options.valid_action);
            $('#' + options.form_id).get(0).submit();

            if (beforeAndAfterSubmit.length > 1 && typeof beforeAndAfterSubmit[1] === 'function') {
                beforeAndAfterSubmit[1]();
            }
            self.closeConfirm();
        });

        var pop_title = '&#35531;&#30906;&#35469;&#24744;&#25552;&#20379;&#30340;&#36039;&#26009;&#26159;&#21542;&#27491;&#30906;';
        if (typeof options.pop_title !== 'undefined') {
            pop_title = options.pop_title;
        }

        var popconfirm = $('<div class="wq-pop cover confirm">' + '<div style="display:block">' + '<div class="wqPOP">' + '<div class="TBAR">' + '<div class="XX"></div>' + '</div>' + '<div class="COM">' + '<p class="pop_t01 pop-data-container">' + pop_title + '&#65306;</p>' + '<div class="BT02">' + '<ul>' + '<li class="btn-yes"></li>' + '<li class="btn-no"></li>' + '</ul>' + '</div>' + '</div>' + '</div>' + '</div>' + '</div>');

        var clonePopconfirm = function clonePopconfirm(msgElems) {
            var ret = msgElems.map(function (elem) {
                return '<p class="pop_t01">' + elem.title + '&#65306;<span class="pop_t03" >' + elem.value + '</span></p>';
            });

            return ret.join('');
        };

        var clone = [];
        for (var i = 1; i <= num; i++) {
            if (i > 1) {
                clone.push('<div class="POP_LINE"></div>');
            }

            clone.push(clonePopconfirm(confirmMsgElements[i - 1]));
        }

        popconfirm.find('.btn-yes').append(btn_yes);
        popconfirm.find('.btn-no').append(btn_no);
        popconfirm.find('.XX').append(btn_xx);
        popconfirm.find('.pop-data-container').after(clone.join('')).end().appendTo('body');
    };

    return wqPopup;
}();

var wqForm = function () {
    function wqForm(elem) {
        _classCallCheck(this, wqForm);

        if (typeof elem === 'string') {
            this.elem = $(elem);
        } else if ((typeof elem === 'undefined' ? 'undefined' : _typeof(elem)) === 'object') {
            if (elem instanceof jQuery) {
                this.elem = elem;
            } else {
                this.elem = $(elem);
            }
        }
        this.groups = [];
        this.detectGroups();
        this.popup = new wqPopup();
    }

    wqForm.prototype.detectGroups = function detectGroups() {
        var groups = this.groups;
        while (groups.length > 0) {
            groups.pop();
        }
        this.elem.find('.wq-group').each(function () {
            groups.push({
                nickname: new wqInput($(this).find('.wq-input').eq(0)),
                sex: new wqSex($(this).find('.wq-select[data-type=sex]').eq(0)),
                datetime: new wqDateTime(this),
                custom: []
            });
        });
    };

    wqForm.prototype.alert = function alert(msg) {
        this.popup.alert(msg);
    };

    wqForm.prototype.confirm = function confirm(msg, options) {
        var self = this;
        this.popup.confirm(msg, function () {
            self.submit(options);
        }, options);
    };

    wqForm.prototype.submit = function submit(options) {
        for (var i in this.groups) {
            if (this.groups.hasOwnProperty(i)) {
                this.groups[i].datetime.applyLeapMonth();
            }
        }

        this.elem.attr('action', options.valid_action);
        this.elem.submit();

        for (var _i3 in this.groups) {
            if (this.groups.hasOwnProperty(_i3)) {
                this.groups[_i3].datetime.restoreLeapMonth();
            }
        }
    };

    wqForm.prototype.addCustomInput = function addCustomInput(custom_input) {
        var group_index = this.elem.find('.wq-group').index(custom_input.elem.parents('.wq-group'));
        this.groups[group_index].custom.push(custom_input);
    };

    wqForm.prototype.validation = function validation(options) {
        var valid = true;
        var showConfirm = true;
        var _errMsg = [];
        if (typeof options === 'undefined') {
            options = {};
        }

        if (typeof options.ignore_confirm !== 'undefined' && options.ignore_confirm) {
            showConfirm = false;
        }

        this.groups.map(function (group) {
            var nickname_validation_result = group.nickname.validation();
            if (!nickname_validation_result.valid) {
                valid = false;
                if (nickname_validation_result.errMsg.length > 0) {
                    _errMsg.push(nickname_validation_result.errMsg);
                }
            }
            if (!group.sex.validation()) {
                valid = false;
                _errMsg.push("&#24615;&#21029;&#27396;&#26377;&#35492;!");
            }
            if (!group.datetime.validation()) {
                valid = false;
                _errMsg.push("&#24744;&#36664;&#20837;&#30340;&#20986;&#29983;&#26085;&#26399;&#26377;&#35492;&#65281;");
            }
            if (group.custom.length > 0) {
                for (var i in group.custom) {
                    if (group.custom.hasOwnProperty(i)) {
                        var custom_valid_result = group.custom[i].validation.check();
                        if (!custom_valid_result) {
                            valid = false;
                            if (typeof group.custom[i].validation.error === 'string' && group.custom[i].validation.error.length > 0) {
                                _errMsg.push(group.custom[i].validation.error);
                            }
                        }
                    }
                }
            }
        });

        if (valid) {
            var form_data = [];
            this.groups.map(function (group) {
                var group_data = {
                    nickname: group.nickname.elem.val(),
                    sex: [group.sex.elem.val(), group.sex.elem.find('option:selected').text()],
                    datetime: {
                        calendar: [group.datetime.elem.calendar.val(), group.datetime.elem.calendar.find('option:selected').text()],
                        year: [group.datetime.elem.year.val(), group.datetime.elem.year.find('option:selected').text()],
                        month: [group.datetime.elem.month.val(), group.datetime.elem.month.find('option:selected').text()],
                        day: [group.datetime.elem.day.val(), group.datetime.elem.day.find('option:selected').text()],
                        hour: group.datetime.elem.hour === false ? [false, false] : [group.datetime.elem.hour.val(), group.datetime.elem.hour.find('option:selected').text()],
                        solarString: group.datetime.toSolarString(),
                        lunarString: group.datetime.toLunarString()
                    },
                    date_format: typeof options.date_format === 'undefined' ? false : options.date_format
                };

                var buildCustomElements = function buildCustomElements(item) {
                    var ret = [];
                    var elemTagName = item.elem.get(0).tagName.toUpperCase();
                    var elemType = item.elem.get(0).type.toUpperCase();

                    if (elemTagName == 'SELECT') {
                        ret = [item.elem.val(), item.elem.find('option:selected').text(), item.name];
                    } else if (elemTagName == 'INPUT') {
                        if (elemType == 'RADIO') {
                            var elemChecked = $.grep(item.elem, function (e) {
                                return e.checked;
                            });
                            elemChecked = $(elemChecked[0]);
                            ret = [elemChecked.val(), elemChecked.parent('label').text(), item.name];
                        } else if (elemType == 'CHECKBOX') {
                            var elemsChecked = [];
                            elemsChecked = $.grep(item.elem, function (e) {
                                return e.checked;
                            });

                            var retVal = [];
                            var retStr = [];

                            for (var _i4 in elemsChecked) {
                                if (elemsChecked.hasOwnProperty(_i4)) {
                                    retVal.push($(elemsChecked[_i4]).val());
                                    retStr.push($(elemsChecked[_i4]).parent('label').text());
                                }
                            }

                            ret = [retVal, retStr.join('&#12289;'), item.name];
                        } else if (elemType == 'TEXT') {
                            ret = [item.elem.val(), item.elem.val(), item.name];
                        }
                    }

                    return ret;
                };

                if (group.custom.length > 0) {
                    var type = [];
                    var option = "option:selected";
                    var radio = "input:radio:checked+label";
                    var checkbox = "input:checkbox:checked+label";
                    var input = "input:text";
                    group_data.custom = [];
                    for (var i in group.custom) {
                        if (group.custom.hasOwnProperty(i)) {
                            group_data.custom.push(buildCustomElements(group.custom[i]));
                        }
                    }
                }

                form_data.push(group_data);
            });
            if (showConfirm) {
                this.confirm(form_data, options);
            }
        } else {
            if (_errMsg.length > 0) {
                this.alert(_errMsg.join("<br />"));
            }
        }

        return valid;
    };

    return wqForm;
}();

var wq_form = {};

$(document).ready(function () {
    if ($('.wq-form').length > 0) {
        $('.wq-form').each(function () {
            if ($(this).attr('preventAutoInit') != '1') {
                wq_form[this.id] = new wqForm(this);
            }
        });
    } else {
        $('.wq-input').each(function () {
            new wqInput(this);
        });

        $('.wq-select[data-type=sex]').each(function () {
            new wqSex(this);
        });

        $('.wq-datetime-group').each(function () {
            new wqDateTime(this);
        });
    }

    $('.wq-radio').each(function () {
        if ($(this).attr('wq-init') != '1' && $('label[for=' + this.id + ']').length == 0) {
            new wqRadio(this);
        }
    });
});