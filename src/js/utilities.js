// eslint-disable-next-line
(function (window, document, undefined) {
    var _jacks = (function(){
        // To call this ajax request, you would for get requests:
        // var getReq = _jacks.get('data.txt');
        // you can either chain the success and error functions, or do it like this:
        // getReq.success(function() { })
        // That callback function will have 2 arguments passed to it, the responseText, and the request.
        // SO it can look like this:
        // getReq.success(function(a,b) {  console.log(a); consoel.lgo(b)});
        // 
        // Example of a data string. Format like this:
        // var dataString = 'nameInput=' + nameInput + '&emailInput=' + emailInput + '&messageInput=' + messageInput;
      const exports = {};
      const parse = function parse (req) {
        let result;
        try {
          result = JSON.parse(req.responseText);
        } catch(e) {
          result = req.responseText;
        }
        return [result,req];
      };

      function xhr(type, url, data) {
        const methods = {
          success() {},
          error() {}
        };
        const request = new XMLHttpRequest();
        request.open(type, url, true);
        if(type.toLowerCase()==='post'){
          request.setRequestHeader('Content-type','application/json;charset=UTF-8');
          // request.setRequestHeader('Content-type','application/x-www-form-urlencoded');
          // request.setRequestHeader('X-WP-Nonce', magicalData.nonce)
        }
        request.onreadystatechange = function() {
          if(request.readyState === 4) {
            if(request.status >= 200 && request.status < 300 ){
              methods.success.apply(methods, parse(request));
            }else{
              methods.error.apply(methods,parse(request));
            }
          }
        };

        request.send(data);
        const callbacks = {
          success(callback) {
            methods.success = callback;
            return callbacks;
          },
          error(callback) {
            methods.error = callback;
            return callbacks;
          }
        };
        return callbacks;

      } /*end xhr function*/

      exports['get'] = function(src) {
        return xhr('GET',src);
      };
      exports['put'] = function(url, data) {
        return xhr('PUT',url,data);
      };
      exports['post'] = function(url, data) {
        return xhr('POST',url,data);
      };
      exports['delete'] = function(url, data) {
        return xhr('DELETE',url,data);
      };

      return exports;

    }())



    var _ = (function () {
        function classReg( className ) {
          return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
        }

        // classList support for class management
        // altho to be fair, the api sucks because it won't accept multiple classes at once
        var hasClass, addClass, removeClass;

        if ( 'classList' in document.documentElement ) {
          hasClass = function( elem, c ) {
            return elem.classList.contains( c );
          };
          addClass = function( elem, c ) {
            elem.classList.add( c );
          };
          removeClass = function( elem, c ) {
            elem.classList.remove( c );
          };
        }else {
          hasClass = function( elem, c ) {
            return classReg( c ).test( elem.className );
          };
          addClass = function( elem, c ) {
            if ( !hasClass( elem, c ) ) {
              elem.className = elem.className + ' ' + c;
            }
          };
          removeClass = function( elem, c ) {
            elem.className = elem.className.replace( classReg( c ), ' ' );
          };
        }

        function toggleClass( elem, c ) {
          var fn = hasClass( elem, c ) ? removeClass : addClass;
          fn( elem, c );
        }

        var clisp = {
          // full names
          hasClass: hasClass,
          addClass: addClass,
          removeClass: removeClass,
          toggleClass: toggleClass,
          // short names
          has: hasClass,
          add: addClass,
          remove: removeClass,
          toggle: toggleClass
        };
        return clisp;
    })(); 


    var atts = (function () {
      var setit;
        setit = function( elem, tribName, tribValue ) {
          if((typeof tribName === 'string' && tribName.length>=1) && (typeof tribValue === 'string' && tribValue.length>=1)) {
            if(typeof elem !== 'undefined') {
              elem.setAttribute(tribName, tribValue);
            }
          }
        }
        var getit = function (el,tribName) {
          if(el.getAttribute(tribName)) {
            return el.getAttribute(tribName);
          }
        }

        var hasit = function (el,tribName) {
            return el.hasAttribute(tribName);
        }
        
        var rmit = function (el,tribName) {
          if(el.hasAttribute(tribName)) {
            el.removeAttribute(tribName);
          }
        }


        var tribs = {
          // full names
          setit: setit,
          hasit: hasit,
          getit: getit,
          rmit : rmit
        };
        return tribs;
    })();


    //  Helper to return all possible matches to a selector in type Array.
    function $$(selector, context) {
        return Array.prototype.slice.call((context || document).querySelectorAll(selector));
    }

    function CrossMyHeart(url) {
        return new Promise((resolve,reject)=>{
            this.jacksGet(url).success((a,b)=>{
                resolve(a);
            }).error((a,b)=>{
                reject(b.statusText);
            })
        })
    }

    function css(elem, rule) {
        var ruleJS = rule.replace(/-(\w)/g, function (match, $1) {
            return $1.toUpperCase();
        }),
            value = 0;
        if (document.defaultView && document.defaultView.getComputedStyle) {
            value = document.defaultView.getComputedStyle(elem, null).getPropertyValue(rule);
        } else {
            value = elem.style[ruleJS];
        }
        return value;
    }

    function strip_hash(url) {
        return url.slice(0, url.lastIndexOf('#'));
    }
    function forEach(subj, fn) {
        var len = subj.length,
            i;
        for (i = 0; i < len; i++) {
            fn(subj[i], i, subj);
        }
    }

    function hide(el) {
        if (this.has(el, 'fadeIn')) {
            this.remove(el, 'fadeIn');
            this.add(el, 'fadeOut');
        } else {
            this.toggle(el, 'fadeOut');
        }
    }
    function show(el) {
        if (this.has(el, 'fadeOut')) {
            this.remove(el, 'fadeOut');
            this.add(el, 'fadeIn');
        } else {
            this.toggle(el, 'fadeIn');
        }
    }
    function getByQuery(val) {
        var cRe = /^\.(?=[A-Za-z])/,
            /* class reg expression. is there a period and then some letters? */
        iRe = /^#(?=[A-Za-z])/,
            query = void 0; /* id regex. Is there a pound sign and then some letters? */
        query = iRe.exec(val) !== null ? 'id' : cRe.exec(val) !== null ? 'class' : 'tagName';
        switch (query) {
            case 'id':
                return this.getById(val.slice(1));
            case 'class':
                return this.getByClass(val.slice(1));
            case 'tagName':
                return this.getByTag(val);
            default:
                return null;
        }
    }

    function viewport_height() {
      return window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    }
    /**
     * Get the width of the viewport
     * @return {Integer}
     * @private
     */
    function viewport_width() {
      return window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;
    }

    /**
     * Get the size of the viewport
     * @return {Object.<number>}
     */
    function getViewportSize(dir) {
        var dir = dir || false;
        var viewportSize = {
          height: viewport_height(),
          width: viewport_width()
        }
        if(dir){dir=dir.toLowerCase();return viewportSize[dir]};
      return viewportSize;
    }


    function generateRandomNumber() {
        return Math.round((Math.round(Math.random() * Date.now()))/2000);
    }


    function isWhat(o) {
        return Object.prototype.toString.call(o).slice(8, -1);
    }

    function isThis(obj,type) {
        let thisType = this.isWhat(obj)
        thisType = thisType.toLowerCase() || thisType
        type = type.toLowerCase() || type
        return (obj !== undefined) && (obj !== null) && thisType === type
    }

    function toArray(list) {
        if ((Array.isArray && Array.isArray(list)) || (isWhat(list) === "Array")) {
            return list;
        } else {
            return Array.prototype.slice.call(list);
        }
    }
    function extend(o) {
        var extended = {};
        var merge = function merge(obj) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    extended[prop] = obj[prop];
                }
            }
        };
        merge(arguments[0]);
        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];
            merge(obj);
        }
        return extended;
    }
    function deepExtend(objs) {
        var extended = {};
        var merge = function merge(obj) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        extended[prop] = deepExtend(extended[prop], obj[prop]);
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };
        merge(arguments[0]);
        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];
            merge(obj);
        }
        return extended;
    }

    function getByTag(tag_name, context, single) {
        var thecontext = context || document;
        return single ? thecontext.getElementsByTagName(tag_name)[0] : thecontext.getElementsByTagName(tag_name);
    }
    function addEvent(type, el, fn, cap) {
        cap = cap || false;
        if (typeof addEventListener !== 'undefined') {
            el.addEventListener(type, fn, cap);
        } else if (typeof attachEvent !== 'undefined') {
            el.attachEvent("on" + type, fn);
        } else {
            el["on" + type] = fn;
        }
    }

    function removeEvent(type, el, fn) {
        if (typeof removeEventListener !== "undefined") {
            el.removeEventListener(type, fn, false);
        } else if (typeof detachEvent !== "undefined") {
            el.detachEvent("on" + type, fn);
        } else {
            el["on" + type] = null;
        }
    }

    function getTarget(e) {
        if (typeof e.target !== "undefined") {
            return e.target;
        } else if (typeof e.srcElement !== "undefined") {
            return e.srcElement;
        } else {
            return false;
        }
    }

    function prevDefault(e) {
        if (typeof e.preventDefault !== "undefined") {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    }

    function stopProp(e) {
        if (typeof e.stopPropagation() !== "undefined") {
            e.stopPropagation();
        } else {
            e.returnValue = false;
        }
    }

    function getCharCode(event) {
        if (typeof event.charCode === "number") {
            return event.charCode;
        } else {
            return event.keyCode;
        }
    }
    function getRects(el) {
        return el.getBoundingClientRect();
    }
    function getStyle(el, styleProp) {
        var x = window.getComputedStyle(el)[styleProp];
        return parseInt(x,10);
    }
    function getStyles(el) {
        if(typeof window.getComputedStyle !== 'function') {
            return el.style;
        }else{
            return window.getComputedStyle(el);
        }
    }
    function getById(id) {
        return document.getElementById(id);
    }
    function getByClass(val,ctx=false) {
        ctx = ctx || document
        return ctx.getElementsByClassName(val)
    }
    function getClassed(val) {
        return this.getByClass(val)[0];
    }
    function trimStr(str) {
        var reggy = /^\s+|\s+$/g;
        return {}.toString.call(str).slice(8, -1).toLowerCase() === "string" ? str.replace(reggy, '') : "Please provide a string";
    }
    // take an array and return an object that 'sorts' the array so that the key is a unique array element and the value is the number of times the element is present in the array
    function sortArr(arr) {
        var _o = {};
        arr.forEach(function (el, i, arr) {
            _o[el] = !_o[el] ? 1 : _o[el] + 1;
        });
        return _o;
    }
    var domReady = function domReady(callback) {
        document.readyState === 'interactive' || document.readyState === 'complete' ? callback() : document.addEventListener("DOMContentLoaded", callback);
    };

    var log = function (val) {
        console.log(val)
    }

    // This function does the same thing as the function above (sortArr) but uses the reduce method
    function sortArrToObjOfUniqKeys(arr) {
        return arr.reduce(function (o, el) {
            o[el] = !o[el] ? 1 : o[el] + 1;
            return o;
        }, {});
    };

    function removeByElement(haystack,element) {
      haystack.splice(haystack.indexOf(element),1);
    }

    var _util = {
        removeByElement: removeByElement,
        log: log,
        crossMyHeart: CrossMyHeart,
        getByQuery: getByQuery,
        addEvent: addEvent,
        removeEvent: removeEvent,
        prevDefault: prevDefault,
        stopProp: stopProp,
        getTarget: getTarget,
        getCharCode: getCharCode,
        hasClass: _.hasClass,
        has: _.hasClass,
        addClass: _.addClass,
        add: _.addClass,
        removeClass: _.removeClass,
        remove: _.removeClass,
        toggle: _.toggleClass,
        getRects: getRects,
        getById: getById,
        getByTag: getByTag,
        getByClass: getByClass,
        toArray: toArray,
        isWhat: isWhat,
        isThis: isThis,
        getStyle: getStyle,
        getStyles: getStyles,
        trimStr: trimStr,
        extend: extend,
        forEach: forEach,
        deepExtend: deepExtend,
        sortArr: sortArr,
        sortArrToObjOfUniqKeys: sortArrToObjOfUniqKeys,
        hide: hide,
        show: show,
        getViewportSize: getViewportSize,
        domReady: domReady,
        getClassed: getClassed,
        jacksGet: _jacks.get,
        jacksPost: _jacks.post,
        jacksPut: _jacks.put,
        jacksDelete: _jacks.delete,
        setAtt: atts.setit,
        getAtt: atts.getit,
        hasAtt: atts.hasit,
        rmAtt: atts.rmit,
        $$: $$,
        _ : _,
        generateRandomNumber: generateRandomNumber,
        stripHash: strip_hash,
        css: css
    };

if (typeof define === 'function' && define.amd) {
        define([], _util);
    } else if (typeof exports === 'object') {
        module.exports = _util;
    } else {
        window._util = _util;
    }



})(window, document, undefined);
