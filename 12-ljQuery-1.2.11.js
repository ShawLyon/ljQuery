/**
 * Created by xmg on 2017/2/21.
 */
(function (window, undefined) {

    // 用于创建ljQuery对象的工厂方法
    var ljQuery = function(selector) {
        return new ljQuery.fn.init( selector );
    };
    // 修改ljQuery的原型
    ljQuery.fn = ljQuery.prototype = {
        constructor: ljQuery,
        init:  function (selector) {
            // 1.传入 '' null undefined NaN  0  false , 直接返回空对象, this
            if(!selector){
                return this;
            }
            // 判断是否是Function
            else if(ljQuery.isFunction(selector)){
               ljQuery.ready(selector);
            }
            // 2.传入的是字符串, 那么需要判断是选择器还是html代码片段
            else if(ljQuery.isString(selector)){
                // 0.为了防止用户是猴子派来的, 所以先去掉空格
                selector = ljQuery.trim(selector);
                // 2.1如果是html代码片段, 会先根据html代码片段创建DOM元素, 然后将创建好的元素添加到jQ对象中
                // 最简单的代码片段: <a>
                // 先你判断是否以<开头, 再判断是否以>结尾, 再判断长度是否>=3
                if(ljQuery.isHTML(selector)){
                    // console.log('代码片段');
                    // 1.先手动创建一个DOM元素
                    var temp = document.createElement('div');
                    // 2.利用innerHTML将代码片段直接写入创建的DOM元素中
                    temp.innerHTML = selector;
                    /*
                     // 3.从临时的DOM元素中取出创建好的元素
                     for(var i = 0, len = temp.children.length; i < len; i++){
                     // console.log(temp.children[i]);
                     this[i] = temp.children[i];
                     }
                     // 4.给jQ对象添加lenght属性
                     this.length = temp.children.length;
                     */
                    /*
                     谁调用就push到谁上, 一般情况下都是利用数组调用, 所以都是push到了数组上
                     如果利用apply修改了push内部的this, 那么push就是push到修改之后的那个对象上
                     也就是说把push的this修改为了谁, 将来就push到谁上
                     apply有一个特点, 会将传入的参数依次取出来传入给指定的方法
                     */
                    [].push.apply(this, temp.children);
                }
                // 2.2如果是选择器, 将查找的DOM元素存储到当前jQ对象中返回
                else{
                    // console.log('选择器');
                    // 1.根据传入的选择器在当前界面中查找对应的元素
                    var nodes = document.querySelectorAll(selector);
                    /*
                     // 2.将查找的DOM元素存储到当前jQ对象中返回
                     for(var i = 0, len = nodes.length; i < len; i++){
                     this[i] = nodes[i];
                     }
                     this.length = nodes.length;
                     */
                    [].push.apply(this, nodes);
                }
            }
            // 3.传入的是数组, 会把数组/伪数组中的每一个项添加到jQ对象中
            else if(ljQuery.isArraylike(selector)){
                // 1.先将伪数组转化为真数组
                selector = [].slice.call(selector);
                // 2.再利用apply将真数组设置给jQ对象
                [].push.apply(this, selector);
            }
            // 4.其它情况,直接把传入的内容添加到jQ对象中
            else{
                this[0] = selector;
                this.length = 1;
            }

        },
        jquery: '6.6.6',
        selector: '',
        length: 0,
        toArray: function () {
            return [].slice.call(this);
        },
        get: function (index) {
            // 1.判断有没有传入index
            if(arguments.length == 0){
                return this.toArray();
            }
            // 2.判断是否是正数
            else if(index >= 0){
                return this[index];
            }
            // 3.判断是否是负数
            else{
                return this[this.length + index];
            }
        },
        eq: function (index) {
            /*
            // 1.判断有没有传入index
            if(arguments.length == 0){
                return ljQuery();
            }
            // 2.判断是否是正数
            else if(index >= 0){
                return ljQuery(this.get(index));
            }
            // 3.判断是否是负数
            else{
                return ljQuery(this.get(index));
            }
            */
            return (arguments.length == 0) ? ljQuery() : ljQuery(this.get(index));
        },
        first: function () {
            return this.eq(0);
        },
        last: function () {
            return this.eq(-1);
        },
        /*[].push.apply(jq)*/
        push: [].push,
        sort: [].sort,
        splice: [].splice,
        // 遍历当前jQ实例
        each: function (fn) {
            ljQuery.each(this, fn);
        },
        // 遍历指定对象, 根据fn的返回结果生成一个新数组
        map: function (fn) {
            return ljQuery.map(this, fn);
        }
    };
    
    // 修改init函数的原型为ljQuery的原型
    ljQuery.fn.init.prototype = ljQuery.fn;

    // 将内部创建的ljQuery对象暴露给外界使用
    window.ljQuery = window.$ = ljQuery;

    /*
    直接写在这个地方弊端:
    1.随着代码量的增加, 后期不利于维护
    2.由于这里定义的都是一些工具方法, 所以我们希望大家都能使用, 但是由于定义在了init上, 外界无法访问init, 所以外界无法访问
    */
    // 给外界提供一个动态扩展静态属性/方法和实例属性/方法的方法
    ljQuery.extend = ljQuery.prototype.extend = function (obj) {
        for(var key in obj){
            this[key] = obj[key];
        }
    }
    
    // 扩展一些静态工具方法
    /*
    好处: 
    1.让外界可以使用内部工具方法
    2.将某个类型的工具方法集中到一起管理, 便于后期维护
    */
    ljQuery.extend({
        // 判断是否是字符串
        isString : function (content) {
        return typeof content === 'string';
    },
        // 判断是否是HTML代码片段
        isHTML : function (html) {
            if(!ljQuery.isString(html)){
                return false;
            }
            return html.charAt(0) === '<' &&
                html.charAt(html.length - 1) === '>' &&
                html.length >= 3;
        },
        // 取出两端空格
        trim : function (str) {
            // 1.判断是否是字符串, 如果不是就直接返回传入的内容
            if(!ljQuery.isString(str)){
                return str;
            }
            // 2.判断当前浏览器是否支持自带的trim方法, 如果支持就用系统的
            if(str.trim){
                return str.trim();
            }else{
                return str.replace(/^\s+|\s+$/g, '');
            }
        },
        // 判断是否是对象
        isObject: function (obj) {
            // 对null特殊处理
            if(obj == null){
                return false;
            }
            return typeof obj === 'object';
        },
        // 判断是否是window
        isWindow: function (w) {
            return w.window === window;
        },
        // 判断是否是真/伪数组
        isArraylike : function (arr) {
            // 1.排除非对象和window
            if (!ljQuery.isObject(arr) ||
                ljQuery.isWindow(arr)){
                return false;
            }
            // 2.判断是否是真数组
            else if(({}).toString.apply(arr) === '[object Array]'){
                return true;
            }
            // 3.判断是否是伪数组
            else if('length' in arr &&
                (arr.length == 0 ||
                arr.length - 1 in arr)){
                return true;
            }
            return false;
        },
        // 判断是否是Function
        isFunction : function (fn) {
            return typeof fn === 'function';
        },
        // 对函数的处理
        ready: function (fn) {
            // 处理传入函数的情况
            // 1.直接判断当前document.readyState的状态
            if(document.readyState === 'complete'){
                fn();
            }
            // 2.判断当前浏览器是否支持addEventListener
            else if(document.addEventListener){
                addEventListener('DOMContentLoaded', fn);
            }
            // 3.如果当前浏览器不支持addEventListener, 那么我们就使用attachEvent
            else{
                document.attachEvent('onreadystatechange', function () {
                    // 由于onreadystatechange事件肯能触发多次, 所以需要进一步判断是否真正的加载完毕
                    if(document.readyState === 'complete'){
                        fn();
                    }
                });
            }
        },
        // 遍历指定的对象
        each: function (obj, fn) {
            // 1.判断是否是数组(包含真数组和伪数组)
            if(ljQuery.isArraylike(obj)){
                for(var i = 0, len = obj.length; i < len; i++){
                    if(fn.call(obj[i], i, obj[i]) == false){
                        break;
                    }
                }
            }
            // 2.判断是否是对象
            else if(ljQuery.isObject(obj)){
                for(var key in obj){
                    if(fn.call(obj[key], key, obj[key]) == false){
                        break;
                    }
                }
            }
            return obj;
        },
        // 遍历指定对象, 根据fn的返回结果生成一个新数组
        map: function (obj, fn) {
            var res = [];
            // 1.判断是否是数组
            if(ljQuery.isArraylike(obj)){
                for(var i = 0, len = obj.length; i < len; i++){
                    var temp = fn(obj[i], i);
                    if(temp){
                        res.push(temp)
                    } 
                }
            }
            // 2.判断是否是对象
            else if(ljQuery.isObject(obj)){
                for(var key in obj){
                    var temp = fn(obj[key], key);
                    if(temp){
                        res.push(temp);
                    }
                }
            }
            return res;
        },
        // 获取指定DOM元素的样式
        getStyle: function (dom, styleName) {
        // 判断是否支持getComputedStyle方法
        if(window.getComputedStyle){
            return getComputedStyle(dom)[styleName];
        }else{
            return dom.currentStyle[styleName];
        }
    },
        // 给指定的元素添加事件
        // 1.obj  需要添加事件的对象, 例如div
        // 2.type 添加的事件类型, 例如 click
        // 3.fn 事件触发之后的回调
        addEvent: function (obj, type, callBack) {
        // 0.安全校验
        if(!obj.nodeType ||
            !ljQuery.isString(type) ||
            !ljQuery.isFunction(callBack)){
            return;
        }

        // 1.判断是否支持addEventLister
        if(obj.addEventListener){
            obj.addEventListener(type, callBack);
        }else{
            // IE8
            obj.attachEvent('on'+type, callBack);
        }
    },
        // 移出指定元素的指定事件
        removeEvent: function (obj, type, callBack) {
        // 0.安全校验
        if(!obj.nodeType ||
            !ljQuery.isString(type) ||
            !ljQuery.isFunction(callBack)){
            return;
         }
            
        // 1.判断是否支持removeEventListener
        if(obj.removeEventListener){
            obj.removeEventListener(type, callBack);
        }else{
            obj.detachEvent('on'+type, callBack);
        }
    }
    });
    
    // 扩展一些实例方法(DOM操作)
    ljQuery.fn.extend({
        empty: function () {
            // 1.遍历传入的对象
            for(var i = 0, len = this.length; i < len; i++){
                // 2.利用innerHTML清空元素中的内容
                this[i].innerHTML = '';
            }
            // 3.返回this
            return this;
        },
        remove: function () {
            // 1.遍历jQ实例对象, 取出每一个元素
            for(var i = 0, len = this.length; i < len; i++){
                // 2.找到当前遍历到元素的父元素
                this[i].parentNode.removeChild(this[i]);
            }
            return this;
        },
        html: function (html) {
            // 1.判断有没有传入参数
            if(arguments.length == 0){
                return this[0].innerHTML;
            }
            // 2.如果传入了参数, 那么就给遍历所有的元素设置值
            else{
                /*
                for(var i = 0, len = this.length; i < len; i++){
                    this[i].innerHTML = html;
                }
                */
                // this是jQ实例
                this.each(function () {
                    // this是遍历到的值
                    // 如果不明白, 请看each内部实现
                    this.innerHTML = html;
                });
                return this;
            }
           
        },
        text: function (text) {
            // 1.判断有没有传入参数
            if(arguments.length == 0){
                var res = '';
                // 获取所有元素的内容拼接之后返回
                this.each(function () {
                    res += this.innerText;
                });
                return res;
            }
            // 2.如果没有参数参数, 直接更改元素的内容即可
            else{
                this.each(function () {
                    this.innerText = text;
                });
                return this;
            }
        },
        appendTo: function (target) {
            // 1.对传入的数据进行统一包装处理
            target = $(target);

            // 定义数组保存结果
            var res = [];
            // 2.通过外循环遍历target
            for(var i = 0, len = target.length; i < len; i++){
                // 3.通过内循环遍历source
                for(var j = 0, jLen = this.length; j < jLen; j++){
                    // 判断是否是第一次添加, 如果是第一次就添加对象本身
                    if(i == 0) {
                        var temp = this[j];
                        target[i].appendChild(temp);
                        res.push(temp);
                    }
                    // 如果不是第一次添加, 那么就添加克隆版本
                    else{
                        var temp = this[j].cloneNode(true);
                        target[i].appendChild(temp);
                        res.push(temp);
                    }
                }
            }

            return  res;
        },
        prependTo: function (target) {
            // 1.对传入的数据进行统一包装处理
            target = $(target);

            // 定义数组保存结果
            var res = [];
            // 2.通过外循环遍历target
            for(var i = 0, len = target.length; i < len; i++){
                // 3.通过内循环遍历source
                for(var j = 0, jLen = this.length; j < jLen; j++){
                    // 判断是否是第一次添加, 如果是第一次就添加对象本身
                    if(i == 0) {
                        var temp = this[j];
                        target[i].insertBefore(temp, target[i].firstChild);
                        res.push(temp);
                    }
                    // 如果不是第一次添加, 那么就添加克隆版本
                    else{
                        var temp = this[j].cloneNode(true);
                        target[i].insertBefore(temp, target[i].firstChild);
                        res.push(temp);
                    }
                }
            }

            return  res;
        },
        append: function (content) {
            // 1.遍历当前jQ实例,取出每一个元素
            this.each(function () {
                this.innerHTML += content;
            });
            return this;
        },
        prepend: function (content) {
            // 1.判断是否是字符串
            if(ljQuery.isString(content)){
                // 遍历当前jQ实例,取出每一个元素
                this.each(function () {
                    this.innerHTML = content + '\n' + this.innerHTML;
                });
            }else{
                this.prependTo.call(content, this);
            }
            return this;
        }
    });
    
    // 扩展一些实例方法(样式相关)
    ljQuery.fn.extend({
        // 设置或者获取属性节点的值
        attr: function (attr, value) {
            // 1.判断是否是字符串
            if(ljQuery.isString(attr)){
                // 判断传入了几个参数
                // 1.1如果传入了一个参数, 那么返回第一个元素的属性节点值
                if(arguments.length == 1){
                    return this[0].getAttribute(attr);
                }
                // 1.2如果传入了两个参数, 那么就遍历当前jQ实例, 取出每一个元素设置属性节点的值
                else if(arguments.length == 2){
                    this.each(function () {
                        this.setAttribute(attr, value);
                    });
                }
            }
            // 2.判断是否是对象
            else if(ljQuery.isObject(attr)){
                // 2.1遍历传入的对象
                for(var key in attr){
                    // 2.1遍历当前jQ实例中所有的元素
                    this.each(function () {
                        // 给每个遍历到的元素设置当前遍历到的属性节点值
                        this.setAttribute(key, attr[key]);
                    });
                }
                
            }
            
            return this;
        },
        // 设置或者获取属性的值
        prop: function (attr, value) {
            // 1.判断是否是字符串
            if(ljQuery.isString(attr)){
                // 判断传入了几个参数
                // 1.1如果传入了一个参数, 那么返回第一个元素的属性节点值
                if(arguments.length == 1){
                    return this[0][attr];
                }
                // 1.2如果传入了两个参数, 那么就遍历当前jQ实例, 取出每一个元素设置属性节点的值
                else if(arguments.length == 2){
                    this.each(function () {
                        this[attr] = value;
                    });
                }
            }
            // 2.判断是否是对象
            else if(ljQuery.isObject(attr)){
                // 2.1遍历传入的对象
                for(var key in attr){
                    // 2.1遍历当前jQ实例中所有的元素
                    this.each(function () {
                        // 给每个遍历到的元素设置当前遍历到的属性节点值
                        this[key] = attr[key];
                    });
                }
            }
            return this;
        },
        // 设置/获取样式
        css: function (styleName, value) {
            // 1.判断是字符串还是对象
            if(ljQuery.isString(styleName)){
                // 1.1判断传入的是否是一个参数
                if(arguments.length == 1){
                    return ljQuery.getStyle(this[0], styleName);
                }
                // 1.2判断传入的是否是两个参数
                else if(arguments.length == 2){
                   // 遍历取出每一个元素
                    this.each(function () {
                        this['style'][styleName] = value;
                    });
                }
            }
            else if(ljQuery.isObject(styleName)){
                // 2.遍历传入的对象
                for(var key in styleName){
                    // 3.遍历当前jQ实例的每一个元素
                    this.each(function () {
                        // 将遍历到的每一个属性设置给遍历到的每一个元素
                        this['style'][key] = styleName[key];
                    });
                }
            }

            return this;
        },
        // 设置/获取value
        val: function (content) {
            // 1.判断有没有传递参数
            if (arguments.length == 0){
                return this[0].value;
            }else{
                // 遍历所有元素
                this.each(function () {
                    this.value = content;
                });
            }
            return this;
        },
        _val: function (content) {
            // 1.判断有没有传递参数
            if (arguments.length == 0){
                return this.prop('value');
            }else{
                // 遍历所有元素
                this.each(function () {
                    // 注意点: 这里取出的值是原生的DOM元素
                    $(this).prop('value', content);
                });
            }
            return this;
        },
        // 判断有没有指定类
        hasClass: function (className) {
            if(arguments.length == 0){
                return false;
            }else{
                var flag = false;
               // 遍历取出每一个元素
                this.each(function () {
                    // 取出元素上的class
                    var name = ' ' + this.className + ' ';
                    if(name.indexOf(' ' + className + ' ') !== -1){
                        flag = true;
                        return false;
                    }
                });
                return flag;
            }
        },
        // 给所有元素添加指定类或所有类
        addClass: function (className) {

            if(!ljQuery.isString(className)){
                return this;
            }
            // 0.将传入的class转化为数组
            var classNames = className.split(' ');
            /*
            // 1.遍历所有的元素
            this.each(function () {
               
                // 这里的this是遍历到的元素
                // 因为遍历到的元素是原生的DOM元素
                var self = $(this);
                // 2.遍历传入的所有className
                ljQuery.each(classNames, function () {
                    // 3.判断当前遍历到的元素上有没有当前遍历到的className
                    if(!self.hasClass(this)){
                        // 这里的this是遍历到的传入className
                        // 注意点: 这里的self是包装之后的jQ实例
                        self[0].className += ' ' + this;
                    }
                });
                
            });
                 */
            // 1.遍历所有的元素
            for(var i = 0, len = this.length; i < len; i++){
                // 2.遍历传入的所有classNames
                for(var j = 0, jLen = classNames.length; j < jLen; j++){
                    // 3.判断当前遍历到的元素上有没有当前遍历到的className
                    //3.1取出当前遍历到的元素
                    var dom = this[i];
                    // 3.2取出当前遍历到的className
                    var name = classNames[j];
                    if(!$(dom).hasClass(name)){
                        dom.className += ' ' + name;
                    }
                }
            }
            
            return this;
        },
        // 清空元素指定类或所有类
        removeClass: function (className) {
            // 1.判断有没有传入参数
            if(arguments.length == 0){
                this.each(function () {
                    this.className = '';
                });
            }else{
                if(!ljQuery.isString(className)){
                    return this;
                }
                // 0. 将传入的参数转化为数组
                var classNames = className.split(' ');
                // 1.遍历取出所有元素
                for(var i = 0, len = this.length; i < len; i++){
                    // 2.遍历取出所有className
                    for(var j = 0, jLen = classNames.length; j < jLen; j++){
                        // 2.1取出当前遍历到的元素
                        var dom = this[i];
                        // 2.2取出当前遍历到的className
                        var name = classNames[j];
                        // 2.3判断有没有需要删除的name
                        if($(dom).hasClass(name)){
                            dom.className = (' ' + dom.className + ' ').replace(' ' + name + ' ', ' ');
                        }
                    }
                }

            }
            return this;
        },
        // 有则删除，没有则添加
        toggleClass: function (className) {
            // 1.判断有没有传入参数
            if(arguments.length == 0){
                this.removeClass();
            }
            else{
                /*
                var self = this;
                // 2.判断传入的class有没有
                var classNames = className.split(' ');
                // 3.遍历取出所有元素
                ljQuery.each(classNames, function () {
                    if(self.hasClass(this)){
                        self.removeClass(this);
                    }else{
                        self.addClass(this);
                    }
                });
                */
                // 1.将传入的参数切割为数组
                var classNames = className.split(' ');
                // 2.遍历取出每一个元素
                for(var i = 0, len = this.length; i < len; i++){
                    // 3.遍历取出每一个className
                    for(var j = 0, jLen = classNames.length; j < jLen; j++){
                        // 3.1取出当前遍历到的元素
                        var dom = this[i];
                        // 3.2取出当前遍历到的className
                        var name = classNames[j];
                        // 3.3判断当前遍历到的元素中有没有当前遍历到的className
                        if($(dom).hasClass(name)){
                            $(dom).removeClass(name);
                        }else{
                            $(dom).addClass(name);
                        }
                    }
                }
            }
        }
    });

    // 扩展一些事件相关的方法
    ljQuery.fn.extend({
        on: function (type, callBack) {
            // 1.遍历当前jQ实例, 取出每一个元素
            this.each(function () {
                // 创建一个对象
                this.event_cache =  this.event_cache || {};
                // 2.判断当前遍历到的元素有没有event_cache属性
                if(!this.event_cache[type]){
                    // 2.1添加一个新的属性叫做event_cache, 用于保存所有添加的事件

                    // 根据当前的类型给对象添加一个属性,属性对应一个属性
                    // 例如: this.event_cache['click'] = [];
                    this.event_cache[type] = [];
                    // 2.2把添加的事件添加到数组中
                    this.event_cache[type].push(callBack);

                    // 保存当前遍历到的元素
                    var self = this;
                    // 2.3真正的注册事件
                    ljQuery.addEvent(this, type, function (e) {
                        // 2.3.1遍历当前元素上的event_cache数组, 依次取出保存的函数执行
                        for(var i = 0, len = self.event_cache[type].length; i < len ; i++){
                            self.event_cache[type][i].call(self, e);
                        }
                    });
                }
                // 如果当前遍历到的元素已经添加了event_cache属性, 那么直接将回调保存到数组中即可
                else{
                    // if(this.event_cache[type]){
                        this.event_cache[type].push(callBack);
                    // }else{
                    //     this.event_cache[type] = [];
                    //     this.event_cache[type].push(callBack);
                    // }
                }

            });
        },
        off: function (type, callBack) {
            
            // 0.定义变量记录传递参数的个数
            var argLen = arguments.length;
            
            // 1.遍历取到所有的元素
            this.each(function () {
                // 2.判断是否传递了参数
                // 移出所有事件
                if(argLen == 0){
                    this.event_cache = {};
                }
                // 3.判断是否传递了一个参数
                // 移出指定类型的所有事情
                else if(argLen == 1){
                    this.event_cache[type] = [];
                }
                // 4.判断是否传递了两个参数
                // 移出指定类型中指定的回调
                else if(argLen == 2){
                    // 4.1遍历存储指定类型事件的数组
                    for(var i = 0, len = this.event_cache[type].length; i < len; i++){
                        // 4.2依次取出每一个回调, 判断是否是指定的那个回调
                        if(this.event_cache[type][i] == callBack){
                            this.event_cache[type].splice(i, 1);
                        }
                    }
                }
            });
        }
    });
    
})(window);