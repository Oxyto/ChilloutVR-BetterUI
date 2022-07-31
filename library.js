const scrollViews = [];

var cvr = function (params) {
    return new Library(params);
};
var Library = function (params) {
    if (params.nodeType){
        this.length = 1;
        this[0] = params;
        return this;
    }

    var selector = document.querySelectorAll(params),
        i = 0;
    this.length = selector.length;
    for (; i < this.length; i++) {
        this[i] = selector[i];
    }
    return this;
};
cvr.fn = Library.prototype = {
    innerHTML: function (html) {
        var len = this.length;
        while (len--) {
            this[len].innerHTML = html;
        }
        return this;
    },
    addHTML: function (html) {
        var len = this.length;
        while (len--) {
            this[len].insertAdjacentHTML("beforeend", html);
        }
        return this;
    },
    load: function (url) {
        var len = this.length;
        while (len--) {
            var target = this[len];
            cvr.ajax({
                url: url, success: function (e) {
                    target.innerHTML = e.result;
                }
            });
        }
        return this;
    },
    attr: function (name, value) {
        var len = this.length;
        while (len--) {
            this[len].setAttribute(name, value);
        }
        return this;
    },
    event: function (triggerEvent, TriggerFunction) {
        var len = this.length;
        while (len--) {
            if (!this[len].addEventListener) {
                this[len].attachEvent("on" + triggerEvent, TriggerFunction);
            } else {
                this[len].addEventListener(triggerEvent, TriggerFunction, false);
            }
        }
        return this;
    },
    clear: function(){
        var len = this.length;
        while (len--) {
            while (this[len].firstChild) this[len].removeChild(this[len].firstChild);
        }
        return this;
    },
    addClass: function (className) {
        var len = this.length;
        while (len--) {
            if ((" " + this[len].className + " ").indexOf(" " + className + " ") === -1) {
                this[len].className = (this[len].className + " " + className).trim();
            }
        }
        return this;
    },
    removeClass: function (className) {
        var len = this.length;
        while (len--) {
            var localClassName = this[len].className;
            localClassName = localClassName.replace(new RegExp("(?:^|\\s)" + className + "(?!\\S)"), "");
            this[len].className = localClassName.trim();
        }
        return this;
    },
    className: function (className) {
        var len = this.length;
        while (len--) {
            this[len].className = className;
        }
        return this;
    },
    getClassName: function () {
        var len = this.length;
        if (len > 0) {
            return this[0].className;
        } else {
            return "";
        }
    },
    getAttr: function (name) {
        var len = this.length;
        if (len > 0) {
            return this[0].getAttribute(name);
        } else {
            return "";
        }
    },
    appendChild: function (child) {
        var len = this.length;
        if (len > 0) {
            this[0].appendChild(child);
            return child;
        } else {
            return this;
        }
    },
    first: function () {
        var len = this.length;
        if (len > 0) {
            return this[0];
        } else {
            return false;
        }
    },
    find: function (selector) {
        var len = this.length;
        if (len > 0) {
            var elements = this[0].querySelectorAll(selector),
                i = 0;
            this.length = elements.length;
            for (; i < this.length; i++) {
                this[i] = elements[i];
            }
            return this;
        } else {
            return false;
        }
    },
    hide: function () {
        this.addClass("hide");
        return this;
    },
    hideExcept: function (className) {
        var len = this.length;
        while (len--) {
            if (!this[len].classList.contains(className)){
                this[len].classList.add("hide");
            }
        }
        return this;
    },
    show: function () {
        this.removeClass("hide").removeClass("hidden").addClass("show");
        return this;
    },
    filterAttr: function (name, value, exclude){
        exclude = cvr.defVal(exclude, false);
        var len = this.length;
        var elements = this;
        var result = [];
        while (len--) {
            if (exclude)  {
                if (!elements[len].getAttribute(name) == value){
                    result.push(elements[len]);
                }
            } else {
                if (elements[len].getAttribute(name) == value){
                    result.push(elements[len]);
                }
            }
        }
        this.length = result.length;
        for (var i=0; i < result.length; i++){
            this[i] = result[i];
        }
        return this;
    }
};
cvr.defVal = function (_val, _defVal) {
    return (typeof(_val) !== "undefined") ? (_val !== "" ? _val : _defVal) : _defVal;
};
cvr.ajax = function (config) {
    var async = cvr.defVal(config.async, true);
    var url = config.url;
    var data = cvr.defVal(config.data, "");
    var method = cvr.defVal(config.method, "GET");
    var http;
    var dataString = "";
    if (method === "FILE") {
        dataString = data;
    } else if (typeof(data) === "string") {
        dataString = data;
    } else if (typeof(data) === "object") {
        var i = 0;
        for (var index in data) {
            if (i > 0) dataString += "&";
            dataString += index + "=" + data[index];
            i++;
        }
    }
    if (method === "GET") {
        url = (dataString === "") ? url : url + "?" + dataString;
    }
    if (window.XMLHttpRequest) {
        http = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        http = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (http !== null) {
        if (typeof(config.progress) !== "undefined") {
            http.upload.addEventListener("progress", config.progress);
        }
        http.open((method === "FILE" ? "POST" : method), url, async);
        http.onreadystatechange = function () {
            if (http.readyState === 4) {
                http.result = http.response;
                if (http.status === 200) {
                    if (typeof(config.success) !== "undefined") config.success(http);
                } else {
                    if (typeof(config.error) !== "undefined") config.error(http);
                }
            }
        };
        if (method === "POST") http.setRequestHeader("Content-Type",
            "application/x-www-form-urlencoded");
        for (var h in config.header) {
            http.setRequestHeader(h, config.header[h]);
        }
        http.send(dataString);
    }
};
cvr.simpleRequest = function(url, method, data){
    var dataString = "";
    if (typeof(data) === "string") {
        dataString = data;
    } else if (typeof(data) === "object") {
        var i = 0;
        for (var index in data) {
            if (i > 0) dataString += "&";
            dataString += index + "=" + data[index];
            i++;
        }
    }
    engine.call('CVRAppCallSendRequest', url, method, dataString);
};
cvr.token = function(string, replacements){
    for (const [key, value] of Object.entries(replacements)){
        string = string.replace(key, value);
    }
    return string;
};
cvr.render = function(object, tokens, templates, actions){
    var element = document.createElement(cvr.defVal(object.t, 'div'));
    object.s = cvr.defVal(object.s, []);
    object.l = cvr.defVal(object.l, []);

    if (typeof(object.i) !== "undefined"){
        element.id = cvr.token(object.i, tokens);
    }

    if (typeof(object.c) !== "undefined"){
        element.className = cvr.token(object.c, tokens);
    }

    if (typeof(object.h) !== "undefined"){
        element.innerHTML = cvr.token(object.h, tokens);
    }

    if (typeof(object.x) !== "undefined"){
        if (typeof(actions[object.x]) !== "undefined") {
            element.addEventListener("click", actions[object.x]);
            element.setAttribute("data-x", object.x);
        }
    }

    if (Array.isArray(object.l)) {
        object.l.forEach(load => {
                if (typeof (templates) !== "undefined" && typeof (templates[load]) !== "undefined") {
                    object.s.push(templates[load]);
                }
            }
        );
    }

    for (const [key, value] of Object.entries(cvr.defVal(object.a, {}))){
        element.setAttribute(key, cvr.token(value, tokens));
    }

    object.s.forEach(sub => element.appendChild(cvr.render(sub, tokens, templates, actions)));

    if (element.classList.contains("scroll-view")) {
        scrollViews[scrollViews.length] = new scroll_view(element);
    }

    return element;
};
cvr.t = function(lang, identifier, translations){
    if (typeof (translations[lang]) !== "undefined" && typeof (translations[lang][identifier]) !== "undefined"){
        return translations[lang][identifier];
    } else if (typeof (translations["en"][identifier]) !== "undefined"){
        return translations["en"][identifier];
    } else {
        return "ERROR: Definition for \""+identifier+"\" missing!";
    }

};
cvr.call = function(func, args){
    switch(args.length){
        case 1:
            func(args[0]);
            break;
        case 2:
            func(args[0],args[1]);
            break;
        case 3:
            func(args[0],args[1],args[2]);
            break;
        default:
            func();
            break;
    }
};
cvr.callArr = function(funcArr, arr){
    for (var i in funcArr){
        if (typeof funcArr[i] === "function"){
            cvr.call(funcArr[i], arr);
        }
    }
};

cvr.registerNewLanguage = function(ident, name, list){
    languages[ident] = name;
    translations[ident] = [];
    for (var key in list){
        translations[ident][key] = list[key];
    }
}

const languages = [];
const translations = [];

function inp_slider(_obj, menu){
    this.obj = _obj;
    this.minValue = parseFloat(_obj.getAttribute('data-min'));
    this.maxValue = parseFloat(_obj.getAttribute('data-max'));
    this.percent  = 0;
    this.value    = parseFloat(_obj.getAttribute('data-current'));
    this.saveOnChange = _obj.getAttribute('data-saveOnChange') == 'true';
    this.dragActive = false;
    this.name = _obj.id;
    this.type = _obj.getAttribute('data-type');
    this.caption = _obj.getAttribute('data-caption');
    this.continuousUpdate = _obj.getAttribute('data-continuousUpdate');
    this.menu = menu;

    var self = this;

    this.valueLabel = document.createElement('div');
    this.valueLabel.className = 'valueLabel';
    this.valueLabel.innerHTML = this.caption + Math.round(this.value);
    this.obj.appendChild(this.valueLabel);

    this.valueBar = document.createElement('div');
    this.valueBar.className = 'valueBar';
    this.valueBar.setAttribute('style', 'width: '+(((this.value - this.minValue) / (this.maxValue - this.minValue)) * 100)+'%;');
    this.obj.appendChild(this.valueBar);

    this.valueLabel2nd = document.createElement('div');
    this.valueLabel2nd.className = 'valueLabel2nd';
    this.valueLabel2nd.innerHTML = this.caption + Math.round(this.value);
    this.valueLabel2nd.setAttribute('style', 'width: '+(1 / ((this.value - this.minValue) / (this.maxValue - this.minValue)) * 100)+'%;');
    this.valueBar.appendChild(this.valueLabel2nd);

    this.mouseDown = function(_e){
        self.dragActive = true;
        self.mouseMove(_e, false);
    }

    this.mouseMove = function(_e, _write){
        if(self.dragActive){
            var rect = _obj.getBoundingClientRect();
            var start = rect.left;
            var end = rect.right;
            self.percent = Math.min(Math.max((_e.clientX - start) / rect.width, 0), 1);
            var value = self.percent;
            value *= (self.maxValue - self.minValue);
            value += self.minValue;
            self.value = Math.round(value);

            self.valueBar.setAttribute('style', 'width: '+(self.percent * 100)+'%;');
            self.valueLabel.innerHTML = self.caption + self.value;
            self.valueLabel2nd.innerHTML = self.caption + self.value;
            self.valueLabel2nd.setAttribute('style', 'width: '+(1 / self.percent * 100)+'%;');

            if(self.type == 'avatar'){
                var color = self.name.substr(self.name.length - 2, self.name.length);
                var name = self.name.replace('AVS_', '').replace(color, '');
                var preview = document.getElementById('AVS_PREV_' + name);
                if(preview){
                    var red = preview.getAttribute('data-r');
                    var green = preview.getAttribute('data-g');
                    var blue = preview.getAttribute('data-b');

                    switch(color){
                        case '-r':
                            red = parseInt(self.value);
                            preview.setAttribute('data-r', red);
                            break;
                        case '-g':
                            green = parseInt(self.value);
                            preview.setAttribute('data-g', green);
                            break;
                        case '-b':
                            blue = parseInt(self.value);
                            preview.setAttribute('data-b', blue);
                            break;
                    }

                    preview.setAttribute('style', 'background-color: rgba('+red+','+green+','+blue+',1);');
                }
            }

            if(self.saveOnChange && (_write === true || self.type == 'avatar' || self.continuousUpdate == 'true')){
                if(self.type == 'avatar'){
                    //changeAnimatorParam(self.name.replace('AVS_', ''), self.value / self.maxValue);
                    self.menu.core.changeAnimatorParam(self.name.replace('AVS_', ''), self.value / self.maxValue);
                }else{
                    //engine.call('CVRAppCallSaveSetting', self.name, "" + self.value);
                    //game_settings[self.name] = self.value;
                    //self.displayImperial();
                }
            }
        }
    }

    this.mouseUp = function(_e){
        self.mouseMove(_e, true);
        self.dragActive = false;
    }

    _obj.addEventListener('mousedown', this.mouseDown);
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('mouseup', this.mouseUp);
    //_obj.addEventListener('mouseup', this.mouseUp);

    this.getValue = function(){
        return self.value;
    }

    this.updateValue = function(value){
        self.value = Math.round(value * self.maxValue);
        self.percent = (self.value - self.minValue) / (self.maxValue - self.minValue);
        self.valueBar.setAttribute('style', 'width: '+(self.percent * 100)+'%;');
        self.valueLabel.innerHTML = self.caption + self.value;
        self.valueLabel2nd.innerHTML = self.caption + self.value;
        self.valueLabel2nd.setAttribute('style', 'width: '+(1 / self.percent * 100)+'%;');
        self.displayImperial();

        if(self.type == 'avatar'){
            var color = self.name.substr(self.name.length - 2, self.name.length);
            var name = self.name.replace('AVS_', '').replace(color, '');
            var preview = document.getElementById('AVS_PREV_' + name);
            if(preview){
                var red = preview.getAttribute('data-r');
                var green = preview.getAttribute('data-g');
                var blue = preview.getAttribute('data-b');

                switch(color){
                    case '-r':
                        red = parseInt(self.value);
                        preview.setAttribute('data-r', red);
                        break;
                    case '-g':
                        green = parseInt(self.value);
                        preview.setAttribute('data-g', green);
                        break;
                    case '-b':
                        blue = parseInt(self.value);
                        preview.setAttribute('data-b', blue);
                        break;
                }

                preview.setAttribute('style', 'background-color: rgba('+red+','+green+','+blue+',1);');
            }
        }
    }

    this.displayImperial = function(){
        var displays = document.querySelectorAll('.imperialDisplay');
        for (var i = 0; i < displays.length; i++){
            var binding = displays[i].getAttribute('data-binding');
            if(binding == self.name){
                var realFeet = ((self.value * 0.393700) / 12);
                var feet = Math.floor(realFeet);
                var inches = Math.floor((realFeet - feet) * 12);
                displays[i].innerHTML = feet + "&apos;" + inches + '&apos;&apos;';
            }
        }
    }

    return {
        name: this.name,
        value: this.getValue,
        updateValue: this.updateValue
    }
}
function inp_dropdown(_obj, menu){
    this.obj = _obj;
    this.value    = _obj.getAttribute('data-current');
    this.saveOnChange = _obj.getAttribute('data-saveOnChange') == 'true';
    this.options  = _obj.getAttribute('data-options').split(',');
    this.name = _obj.id;
    this.opened = false;
    this.keyValue = [];
    this.type = _obj.getAttribute('data-type');
    this.menu = menu;

    this.optionElements = [];

    var self = this;

    this.SelectValue = function(_e){
        self.value = _e.target.getAttribute('data-key');
        self.valueElement.innerHTML = _e.target.getAttribute('data-value');
        self.globalClose();

        if(self.saveOnChange){
            if(self.type == 'avatar'){
                //changeAnimatorParam(self.name.replace('AVS_', ''), parseFloat(self.value));
                self.menu.core.changeAnimatorParam(self.name.replace('AVS_', ''), parseFloat(self.value));
            }else {
                //engine.call('CVRAppCallSaveSetting', self.name, self.value);
                //game_settings[self.name] = self.value;
            }
        }
    }

    this.openClick = function(_e){
        if(self.obj.classList.contains('open')){
            self.obj.classList.remove('open');
            self.list.setAttribute('style', 'display: none;');
        }else{
            self.obj.classList.add('open');
            self.list.setAttribute('style', 'display: block;');
            self.opened = true;
            window.setTimeout(function(){self.opened = false;}, 10);
        }
    }

    this.globalClose = function(_e){
        if(self.opened) return;
        self.obj.classList.remove('open');
        self.list.setAttribute('style', 'display: none;');
    }

    this.list = document.createElement('div');
    this.list.className = 'valueList';

    this.updateOptions = function(){
        self.list.innerHTML = "";
        for(var i = 0; i < self.options.length; i++){
            self.optionElements[i] = document.createElement('div');
            self.optionElements[i].className = 'listValue';
            var valuePair = Array.isArray(self.options[i])?self.options[i]:self.options[i].split(':');
            var key = "";
            var value = "";
            if(valuePair.length == 1){
                key = valuePair[0];
                value = valuePair[0];
            }else{
                key = valuePair[0];
                value = valuePair[1];
            }
            self.keyValue[key] = value;
            self.optionElements[i].innerHTML = value;
            self.optionElements[i].setAttribute('data-value', value);
            self.optionElements[i].setAttribute('data-key', key);
            self.list.appendChild(self.optionElements[i]);
            self.optionElements[i].addEventListener('mousedown', self.SelectValue);
        }

        self.valueElement.innerHTML = self.keyValue[self.value];
    }

    this.valueElement = document.createElement('div');
    this.valueElement.className = 'dropdown-value';

    this.updateOptions();

    this.obj.appendChild(this.valueElement);
    this.obj.appendChild(this.list);
    this.valueElement.addEventListener('mousedown', this.openClick);
    document.addEventListener('mousedown', this.globalClose);

    this.getValue = function(){
        return self.value;
    }

    this.updateValue = function(value){
        self.value = value;
        self.valueElement.innerHTML = self.keyValue[value];
    }

    this.setOptions = function(options){
        self.options = options;
    }

    return {
        name: this.name,
        value: this.getValue,
        updateValue: this.updateValue,
        updateOptions: this.updateOptions,
        setOptions: this.setOptions
    }
}
function inp_toggle(_obj, menu){
    this.obj = _obj;
    this.value = _obj.getAttribute('data-current');
    this.saveOnChange = _obj.getAttribute('data-saveOnChange') == 'true';
    this.name = _obj.id;
    this.type = _obj.getAttribute('data-type');
    this.menu = menu;

    var self = this;

    this.mouseDown = function(_e){
        self.value = self.value=="True"?"False":"True";
        self.updateState();
    }

    this.updateState = function(){
        self.obj.classList.remove("checked");
        if(self.value == "True"){
            self.obj.classList.add("checked");
        }

        if(self.saveOnChange){
            if(self.type == 'avatar'){
                //changeAnimatorParam(self.name.replace('AVS_', ''), (self.value=="True"?1:0));
                self.menu.core.changeAnimatorParam(self.name.replace('AVS_', ''), (self.value=="True"?1:0));
            }else{
                //engine.call('CVRAppCallSaveSetting', self.name, self.value);
                //game_settings[self.name] = self.value;
            }
        }
    }

    _obj.addEventListener('mousedown', this.mouseDown);

    this.getValue = function(){
        return self.value;
    }

    this.updateValue = function(value){
        self.value = value == 1 ? "True" : "False";

        self.obj.classList.remove("checked");
        if(self.value == "True"){
            self.obj.classList.add("checked");
        }
    }

    if (self.value == "True") {
        self.updateValue(1);
    } else {
        self.updateValue(0);
    }

    return {
        name: this.name,
        value: this.getValue,
        updateValue: this.updateValue
    }
}
function inp_joystick(_obj, menu){
    this.obj = _obj;
    this.minValue = 0;
    this.maxValue = 1;
    this.pos1     = 0;
    this.pos2     = 0;
    this.value    = _obj.getAttribute('data-current').split('|');
    this.saveOnChange = _obj.getAttribute('data-saveOnChange') == 'true';
    this.dragActive = false;
    this.name = _obj.id;
    this.type = _obj.getAttribute('data-type');
    this.caption = _obj.getAttribute('data-caption');
    this.menu = menu

    var self = this;

    this.pointer = document.createElement('div');
    this.pointer.className = 'pointer';
    this.pointer.setAttribute('style', 'left: '+(parseFloat(this.value[0])*100)+'%; top: '+((1 - parseFloat(this.value[1]))*100)+'%;');
    this.obj.appendChild(this.pointer);

    this.mouseDown = function(_e){
        self.dragActive = true;
        self.mouseMove(_e, false);
        pauseScrolling = true;
    }

    this.mouseMove = function(_e, _write){
        if(self.dragActive){
            var rect = _obj.getBoundingClientRect();
            var startLeft = rect.left;
            var startTop = rect.top;
            self.pos1 = Math.min(Math.max((_e.clientX - startLeft) / rect.width, 0), 1);
            self.pos2 = 1 - Math.min(Math.max((_e.clientY - startTop) / rect.height, 0), 1);
            self.value = [self.pos1, self.pos2];

            self.pointer.setAttribute('style', 'left: '+(parseFloat(self.value[0])*100)+'%; top: '+((1 - parseFloat(self.value[1]))*100)+'%;');

            if(self.saveOnChange && (_write === true || self.type == 'avatar')){
                if(self.type == 'avatar'){
                    //changeAnimatorParam(self.name.replace('AVS_', '')+'-x', self.value[0]);
                    //changeAnimatorParam(self.name.replace('AVS_', '')+'-y', self.value[1]);
                    self.menu.core.changeAnimatorParam(self.name.replace('AVS_', '')+'-x', (self.value[0]));
                    self.menu.core.changeAnimatorParam(self.name.replace('AVS_', '')+'-y', (self.value[1]));
                }else{
                    //engine.call('CVRAppCallSaveSetting', self.name, "" + self.value);
                    //game_settings[self.name] = self.value;
                    //self.displayImperial();
                }
            }
        }
    }

    this.mouseUp = function(_e){
        self.mouseMove(_e, true);
        self.dragActive = false;
        pauseScrolling = false;
    }

    _obj.addEventListener('mousedown', this.mouseDown);
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('mouseup', this.mouseUp);
    //_obj.addEventListener('mouseup', this.mouseUp);

    this.getValue = function(){
        return self.value;
    }

    this.updateValue = function(value){
        self.value = Math.round(value);
        self.percent = (self.value - self.minValue) / (self.maxValue - self.minValue);
        self.valueBar.setAttribute('style', 'width: '+(self.percent * 100)+'%;');
        self.valueLabel.innerHTML = self.caption + self.value;
        self.displayImperial();
    }

    this.displayImperial = function(){
        var displays = document.querySelectorAll('.imperialDisplay');
        for (var i = 0; i < displays.length; i++){
            var binding = displays[i].getAttribute('data-binding');
            if(binding == self.name){
                var realFeet = ((self.value * 0.393700) / 12);
                var feet = Math.floor(realFeet);
                var inches = Math.floor((realFeet - feet) * 12);
                displays[i].innerHTML = feet + "&apos;" + inches + '&apos;&apos;';
            }
        }
    }

    return {
        name: this.name,
        value: this.getValue,
        updateValue: this.updateValue
    }
}
function inp_sliderH(_obj, menu){
    this.obj = _obj;
    this.minValue = parseFloat(_obj.getAttribute('data-min'));
    this.maxValue = parseFloat(_obj.getAttribute('data-max'));
    this.percent  = 0;
    this.value    = parseFloat(_obj.getAttribute('data-current'));
    this.saveOnChange = _obj.getAttribute('data-saveOnChange') == 'true';
    this.dragActive = false;
    this.name = _obj.id;
    this.type = _obj.getAttribute('data-type');
    this.caption = _obj.getAttribute('data-caption');
    this.menu = menu;

    var self = this;

    this.valueBar = document.createElement('div');
    this.valueBar.className = 'valueBar';
    this.valueBar.setAttribute('style', 'height: '+(((this.value - this.minValue) / (this.maxValue - this.minValue)) * 100)+'%;');
    this.obj.appendChild(this.valueBar);

    this.valueLabel = document.createElement('div');
    this.valueLabel.className = 'valueLabel';
    this.valueLabel.innerHTML = this.caption + Math.round(this.value);
    this.obj.appendChild(this.valueLabel);

    /*this.valueLabel2nd = document.createElement('div');
    this.valueLabel2nd.className = 'valueLabel2nd';
    this.valueLabel2nd.innerHTML = this.caption + Math.round(this.value);
    this.valueLabel2nd.setAttribute('style', 'height: '+(1 / ((this.value - this.minValue) / (this.maxValue - this.minValue)) * 100)+'%;');
    this.valueBar.appendChild(this.valueLabel2nd);*/

    this.mouseDown = function(_e){
        self.dragActive = true;
        self.mouseMove(_e, false);
        pauseScrolling = true;
    }

    this.mouseMove = function(_e, _write){
        if(self.dragActive){
            var rect = _obj.getBoundingClientRect();
            var start = rect.top;
            var end = rect.bottom;
            self.percent = 1 - Math.min(Math.max((_e.clientY - start) / rect.height, 0), 1);
            var value = self.percent;
            value *= (self.maxValue - self.minValue);
            value += self.minValue;
            self.value = Math.round(value);

            self.valueBar.setAttribute('style', 'height: '+((1 - self.percent) * 100)+'%;');
            self.valueLabel.innerHTML = self.caption + self.value;
            //self.valueLabel2nd.innerHTML = self.caption + self.value;
            //self.valueLabel2nd.setAttribute('style', 'height: '+(1 / (1 - self.percent) * 100)+'%;');

            if(self.saveOnChange && (_write === true || self.type == 'avatar')){
                if(self.type == 'avatar'){
                    //changeAnimatorParam(self.name.replace('AVS_', ''), self.value / self.maxValue);
                    self.menu.core.changeAnimatorParam(self.name.replace('AVS_', ''), self.value / self.maxValue);
                }else{
                    //engine.call('CVRAppCallSaveSetting', self.name, "" + self.value);
                    //game_settings[self.name] = self.value;
                    //self.displayImperial();
                }
            }
        }
    }

    this.mouseUp = function(_e){
        self.mouseMove(_e, true);
        self.dragActive = false;
        pauseScrolling = false;
    }

    _obj.addEventListener('mousedown', this.mouseDown);
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('mouseup', this.mouseUp);
    //_obj.addEventListener('mouseup', this.mouseUp);

    this.getValue = function(){
        return self.value;
    }

    this.updateValue = function(value){
        self.value = Math.round(value * self.maxValue);
        self.percent = 1 - (self.value - self.minValue) / (self.maxValue - self.minValue);
        self.valueBar.setAttribute('style', 'height: '+((1 - self.percent) * 100)+'%;');
        self.valueLabel.innerHTML = self.caption + self.value;
        //self.valueLabel2nd.innerHTML = self.caption + self.value;
        //self.valueLabel2nd.setAttribute('style', 'height: '+(1 / self.percent * 100)+'%;');
        self.displayImperial();
    }

    this.displayImperial = function(){
        var displays = document.querySelectorAll('.imperialDisplay');
        for (var i = 0; i < displays.length; i++){
            var binding = displays[i].getAttribute('data-binding');
            if(binding == self.name){
                var realFeet = ((self.value * 0.393700) / 12);
                var feet = Math.floor(realFeet);
                var inches = Math.floor((realFeet - feet) * 12);
                displays[i].innerHTML = feet + "&apos;" + inches + '&apos;&apos;';
            }
        }
    }

    return {
        name: this.name,
        value: this.getValue,
        updateValue: this.updateValue
    }
}
function inp_number(_obj, menu){
    this.obj = _obj;
    this.minValue = parseFloat(_obj.getAttribute('data-min'));
    this.maxValue = parseFloat(_obj.getAttribute('data-max'));
    this.value    = parseFloat(_obj.getAttribute('data-current'));
    this.saveOnChange = _obj.getAttribute('data-saveOnChange') == 'true';
    this.name = _obj.id;
    this.type = _obj.getAttribute('data-type');
    this.caption = _obj.getAttribute('data-caption');
    this.mode = _obj.getAttribute('data-mode');
    this.menu = menu;

    var self = this;

    self.obj.value = self.value;

    this.keyup = function(_e){
        if (_e.keyCode === 13){
            self.updateValue(_e.target.value, true);
            self.obj.blur();
        }
    }

    _obj.addEventListener('keyup', this.keyup);

    this.updateValue = function(_value, _write){
        var new_val = ("" + _value).replace(",", ".");
        if (isNaN(new_val)) return;
        if (isNaN(parseFloat(new_val))) return;
        if (self.value == new_val) return;

        self.value = Math.min(9999, Math.max(-9999, new_val));

        self.obj.value = self.value.toFixed(4);

        if(self.saveOnChange && (_write === true && self.type == 'avatar')){
            if(self.type == 'avatar'){
                self.menu.core.changeAnimatorParam(self.name.replace('AVS_', ''), parseFloat(self.value));
                //changeAnimatorParam(self.name.replace('AVS_', ''), self.value);
            }else{
                //engine.call('CVRAppCallSaveSetting', self.name, "" + self.value);
                //game_settings[self.name] = self.value;
                //self.displayImperial();
            }
        }
    }

    /*if(this.mode == "int"){
        this.obj.innerHTML = this.caption + ": " + this.value;
    }else{
        this.obj.innerHTML = this.caption + ": " + this.value.toFixed(4);
    }

    var self = this;

    this.mouseDown = function(_e){
        self.dragActive = true;
        pauseScrolling = true;
        displayNumpad(self);
    }

    this.updateValue = function(_value, _write){
        self.value = Math.min(9999, Math.max(-9999, _value));

        if(self.mode == "int"){
            _obj.innerHTML = self.caption + ": " + self.value;
        }else{
            _obj.innerHTML = self.caption + ": " + self.value.toFixed(4);
        }

        if(self.saveOnChange && (_write === true || self.type == 'avatar')){
            if(self.type == 'avatar'){
                changeAnimatorParam(self.name.replace('AVS_', ''), self.value);
            }else{
                engine.call('CVRAppCallSaveSetting', self.name, "" + self.value);
                game_settings[self.name] = self.value;
                self.displayImperial();
            }
        }
    }

    this.mouseUp = function(_e){
        self.dragActive = false;
        pauseScrolling = false;
    }

    _obj.addEventListener('mousedown', this.mouseDown);
    document.addEventListener('mouseup', this.mouseUp);*/

    this.getValue = function(){
        return self.value;
    }

    this.getMode = function(){
        return self.mode;
    }

    return {
        name: this.name,
        value: this.getValue,
        updateValue: this.updateValue,
        getMode: this.getMode
    }
}

function scroll_view(_obj){
    this.obj = _obj;
    this.content = cvr(_obj).find(".scroll-content").first();
    this.viewHeight = 0;
    this.contentHeight = 0;

    var self = this;

    this.update = function(){
        self.viewHeight = cvr.defVal(self.obj.scrollHeight, 1.0);
        self.contentHeight = cvr.defVal(self.content.scrollHeight, 1.0);

        var factor = self.viewHeight / self.contentHeight;
        var style = "";
        if (factor < 1.0) {
            style = "height: "+(factor*100)+"%;";
        } else {
            style = "height: 0;";
        }

        var offset = self.content.scrollTop;
        var max_offset = self.contentHeight - self.viewHeight;
        var scrollPercent = offset / max_offset;
        style += "top: "+((1.0 - factor) * scrollPercent* 100)+"%;";

        cvr(self.obj).find(".scroll-marker-v").attr("style", style);
    }

    self.update();

    return {
        update: this.update
    }
}

//region Global Scroll
var scrollTarget = null;

var mouseScrolling = false;
var pauseScrolling = false;

var startY = 0;
var startScrollY = 0;
var oldY = 0;
var speedY = 0;

var startX = 0;
var startScrollX = 0;
var oldX = 0;
var speedX = 0;

var scrollWheelTarget = null;

document.addEventListener('mousedown', function(e){
    scrollTarget = e.target.closest('.scroll-content');
    startY = e.clientY;
    startX = e.clientX;
    if(scrollTarget !== null){
        mouseScrolling = true;
        startScrollY = scrollTarget.scrollTop;
        startScrollX = scrollTarget.scrollLeft;
    }
});

document.addEventListener('mousemove', function(e){
    if(scrollTarget !== null && mouseScrolling && !pauseScrolling){
        scrollTarget.scrollTop = startScrollY - e.clientY + startY;
        scrollTarget.scrollLeft = startScrollX - e.clientX + startX;
        speedY = e.clientY - oldY;
        speedX = e.clientX - oldX;
        oldY = e.clientY;
        oldX = e.clientX;
        UpdateScrollViews();
    }

    scrollWheelTarget = e.target.closest('.scroll-content');
});

document.addEventListener('mouseup', function(e){
    mouseScrolling = false;
    if(scrollTarget != null){
        startScrollY = scrollTarget.scrollTop;
        startScrollX = scrollTarget.scrollLeft;
    }
});

window.setInterval(function(){
    if(!mouseScrolling && scrollTarget != null && (Math.abs(speedY) > 0.01 || Math.abs(speedX) > 0.01) && !pauseScrolling){
        speedY *= 0.95;
        speedX *= 0.95;

        scrollTarget.scrollTop -= speedY;
        scrollTarget.scrollLeft -= speedX;
        UpdateScrollViews();

    }else if(!mouseScrolling && scrollTarget != null){
        scrollTarget = null;
    }
}, 10);

window.addEventListener('wheel', function(e){
    if(scrollWheelTarget != null){
        scrollWheelTarget.scrollTop += e.deltaY;
        scrollWheelTarget.scrollLeft += e.deltaY;
        UpdateScrollViews();
    }

    //e.preventDefault();
});

function UpdateScrollViews(){
    for (var i in scrollViews){
        scrollViews[i].update();
    }
}
//endregion