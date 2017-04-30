(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _utilities = require('./utilities.js');

var _utilities2 = _interopRequireDefault(_utilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line
(function (window, document, undefined) {
    var get = function get(key) {
        return JSON.parse(localStorage.getItem(key));
    };
    var key = function key(n) {
        return localStorage.key(n);
    };

    var store = function store(key, val) {
        if (!_utilities2.default.isThis(val, 'string')) {
            val = JSON.stringify(val);
        }
        localStorage.setItem(key, val);
    };

    var remove = function remove(key) {
        if (this.get(key) !== null) {
            localStorage.removeItem(key);
            return true;
        } else {
            return false;
        }
    };

    var getLen = function getLen() {
        return localStorage.length;
    };

    var db = {
        get: get,
        remove: remove,
        length: getLen,
        key: key,
        store: store
    };

    if (typeof define === 'function' && define.amd) {
        define([], db);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        module.exports = db;
    } else {
        window.db = db;
    }
})(window, document, undefined);

},{"./utilities.js":3}],2:[function(require,module,exports){
'use strict';

var _utilities = require('./utilities.js');

var _utilities2 = _interopRequireDefault(_utilities);

var _localDb = require('./localDb.js');

var _localDb2 = _interopRequireDefault(_localDb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var wrapper = _utilities2.default.getById('wrapper');
var searchInputContainer = _utilities2.default.getById('ideaListHeader');
var searchInput = _utilities2.default.getByTag('input', searchInputContainer, true);
var titleInput = _utilities2.default.getById('title_input');
var messageContainer = _utilities2.default.getById('message-container');
var bodyInput = _utilities2.default.getById('body_input');
var valueMessage = _utilities2.default.getClassed('input-error');
var ideasList = _utilities2.default.getById('ideasList');
var saveButton = _utilities2.default.getClassed('save_button');
var log = _utilities2.default.log;

var ideaList = {
  editMode: false,
  state: {
    ideas: []
  },
  init: function init() {
    var reloading = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    // Begin. If there are ideas in localStorage, lets grab them and populate the ideas property array.
    var x = _localDb2.default.length();
    var i = void 0,
        key = void 0,
        val = void 0;
    if (!reloading) this.assignEvents();
    if (!x) {
      _utilities2.default.remove(messageContainer, 'hide');return;
    }
    _utilities2.default.add(messageContainer, 'hide');
    if (reloading) {
      this.state.ideas = [];
    }
    for (i = 0; i <= x - 1; i++) {
      key = _localDb2.default.key(i);
      val = _localDb2.default.get(key);
      this.state.ideas.push(val);
    }
    this.state.ideas.sort(function (a, b) {
      if (a['id'] < b['id']) {
        return -1;
      } else if (a['id'] > b['id']) {
        return 1;
      } else {
        return 0;
      }
    });
    // Now lets list them on the page.
    this.listIdeas();
  },
  assignEvents: function assignEvents() {
    _utilities2.default.addEvent('click', _utilities2.default.getClassed('save_button'), this.handleNewIdeaSave.bind(this));
    _utilities2.default.addEvent('input', searchInput, this.handleSearchInput.bind(this));
  },
  handleSearchInput: function handleSearchInput(e) {
    var needle = e.target.value.toLowerCase();
    var needleLength = needle.length;
    var haystack = this.state.ideas;
    var vu = void 0;
    if (!needleLength) {
      return;
    }
    vu = haystack.filter(function (el) {
      return ~el.title.toLowerCase().indexOf(needle);
    });
    this.listIdeas(vu);
  },
  clearSearch: function clearSearch() {
    if (searchInput.value.length > 0) {
      searchInput.textContent = '';
      searchInput.value = '';
    }
  },
  handleNewIdeaSave: function handleNewIdeaSave(e) {
    this.clearSearch();
    e = e || window.event;
    if (!_utilities2.default.has(valueMessage, 'hide')) {
      _utilities2.default.add(valueMessage, 'hide');
    }
    if (titleInput.value === '' || !titleInput.value.length) {
      // valueMessage.classList.remove('hide');
      _utilities2.default.remove(valueMessage, 'hide');
      return false;
    }
    var myDee = _utilities2.default.generateRandomNumber(),
        objectifiedData = {};

    // Populate the object with values from user
    objectifiedData.title = titleInput.value;
    objectifiedData.quality = 1;
    objectifiedData.id = myDee; /* Get it? Not "EYE DEE" but "MY DEE"*/
    objectifiedData.body = bodyInput.value;

    this.updateStorage(objectifiedData);

    // Reset the input fields
    titleInput.value = '';
    bodyInput.value = '';
    window.focus();
    return;
  },
  listIdeas: function listIdeas() {
    var _this = this;

    var filteredState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    ideasList.innerHTML = '';
    if (filteredState) {
      filteredState.map(function (idea) {
        _this.addIdeaToList(idea);
      });
    } else {
      // ideasList is our container, so lets make sure it's empty so we can put our ideas in it.
      this.state.ideas.map(function (idea) {
        _this.addIdeaToList(idea);
      });
    }
  },
  addIdeaToList: function addIdeaToList(idea) {
    var val = this.listed_content(idea);
    ideasList.insertAdjacentHTML('afterbegin', val);
  },
  listed_content: function listed_content(oIdea) {
    var id = oIdea.id,
        title = oIdea.title,
        body = oIdea.body,
        quality = oIdea.quality;

    return '\n    <article class="message" data-id="' + id + '">\n      <div class="message-header">\n        <p>' + title + '</p>\n        <a class="edit edit_button" onclick="ideaList.editIdea(event,' + id + ')"><img src="images/edit.png" alt="edit" /></a>\n        <button class="delete" onclick="ideaList.deleteIdea(' + id + ')"></button>\n      </div>\n      <div class="message-body">\n        <p>' + body + '</p>\n        <div class="voting-block">\n          <span class=\'vote-comp upvote\' onclick="ideaList.handleUpvote(' + (quality || 1) + ', ' + id + ', 1)"><img src="images/voteIcons/upvote.svg" alt="upvote icon" /></span>\n          <span class=\'vote-comp downvote\' onclick="ideaList.handleUpvote(' + (quality || 1) + ', ' + id + ', 0)"><img src="images/voteIcons/downvote.svg" alt="downvote icon" /></span>\n          <p class="vote-comp">&nbsp&nbsp <strong>Quality:</strong>&nbsp ' + (quality && quality === 3 ? "Genius" : quality === 2 ? "Decent" : "Swill") + '</p>\n        </div>\n      </div>\n    </article>\n    ';
  },
  removeFromState: function removeFromState(id) {
    var y = this.state.ideas.findIndex(function (el) {
      return el.id == id;
    });
    if (y >= 0) {
      if (_localDb2.default.get(id) !== null) {
        _localDb2.default.remove(id);
      }
      this.state.ideas.splice(y, 1);
      this.listIdeas();
    }
  },
  deleteIdea: function deleteIdea(val) {
    this.clearSearch();
    var x = confirm('This will permenantly delete this idea. Is it really that bad?');
    if (!x) {
      return;
    }
    this.removeFromState(val);
  },
  doneEditing: function doneEditing(e) {
    var origId = void 0;
    e = e || window.event;
    var charCode = e.keyCode || e.which;
    if (charCode == 13 || charCode == 27) {
      origId = e.target.dataset['ideaid'];
      window.removeEventListener('keyup', ideaList.doneEditing);
      ideaList.handleEdit(null, origId, true);
    }
  },
  editIdea: function editIdea(e, val) {
    this.editMode = true;
    // e is the event object, id is id of the idea in storage and state
    // Get a reference to the object that is being edited from local storage ?
    var x = _localDb2.default.get(val);
    var title = x.title,
        body = x.body,
        quality = x.quality,
        id = x.id;
    // We need to crawl up the dom until we get to the element with data-id, because that's the container where we control innerHTML

    var parentElement = e.target.parentElement || document.body;
    while (!_utilities2.default.hasAtt(parentElement, 'data-id')) {
      parentElement = parentElement.parentElement;
    }
    // Make the content editable with input elements
    parentElement.innerHTML = this.editable_content(x);
    window.addEventListener('keyup', ideaList.doneEditing, false);
  },
  handleEdit: function handleEdit() {
    var _this2 = this;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var x = void 0;
    var fromKeyPress = args[2] || false;
    this.clearSearch();
    setTimeout(function () {
      x = document.activeElement.id;
      if (!(x === "edited_body_input" || x === "edited_title_input") || args[0] === null) {
        _this2.saveEdits(args[1]);
        _this2.editMode = false;
      }
    }, 150);
  },
  saveStorageEvent: function saveStorageEvent(id, old, newObj) {
    var oldId = id;

    var objToEditIndex = this.state.ideas.findIndex(function (idea) {
      return idea.id == oldId;
    });

    _localDb2.default.store(oldId, newObj);
    this.state.ideas.splice(objToEditIndex, 1, newObj);
    this.listIdeas();
  },
  saveEdits: function saveEdits(origId) {
    if (this.editMode) {
      var objToEditIndex = this.state.ideas.findIndex(function (idea) {
        return idea.id == origId;
      });
      var objToEdit = this.state.ideas[objToEditIndex];
      var editedIdea = {
        body: _utilities2.default.getById('edited_body_input').value,
        quality: objToEdit.quality,
        title: _utilities2.default.getById('edited_title_input').value,
        id: objToEdit.id
      };
      _localDb2.default.store(editedIdea.id, editedIdea);
      this.state.ideas.splice(objToEditIndex, 1, editedIdea);
      this.editMode = false;
      this.listIdeas();
    }
  },

  // Handle User Voting Up or Down their idea. Type is either 1 for 'up' or 0 for 'down'
  handleUpvote: function handleUpvote(currQuality, id, type) {
    var x = this.state.ideas.find(function (idea) {
      return idea.id === id;
    });
    if (type) {
      x.quality = currQuality === 3 || currQuality === 2 ? 3 : 2;
    } else {
      x.quality = currQuality === 1 || currQuality === 2 ? 1 : 2;
    }
    _localDb2.default.store(id, x);
    this.listIdeas();
  },
  editable_content: function editable_content(theRest) {
    var id = theRest.id,
        title = theRest.title,
        body = theRest.body;

    // wrapper.insertAdjacentHTML('afterbegin',

    return '\n        <div class="message-header">\n          <div style="display:none;" class="field field_hidden">\n            <p class="control">\n              <input id="edited_id_input" class="input" type="number" value=' + id + ' hidden />\n            </p>\n          </div>\n        </div>\n        <div class="message-body">\n          <div class="field">\n            <p class="control">\n              <input id="edited_title_input" class="input" type="text" data-ideaId="' + id + '" onblur="ideaList.handleEdit(event, ' + id + ')" value="' + title + '" />\n            </p>\n          </div>\n          <div class="field">\n            <p class="control">\n              <input id="edited_body_input" data-ideaId="' + id + '" class="input" type="text" onblur="ideaList.handleEdit(event, ' + id + ')" value="' + body + '" />\n            </p>\n          </div>\n        </div>\n        ';
  },
  updateStorage: function updateStorage(idea) {
    var storedObject = JSON.stringify(idea);
    var storedKey = idea.id;
    if (_localDb2.default.get(storedKey) === null) {
      _localDb2.default.store(storedKey, storedObject);
    }
    this.handleNewIdea(idea);
  },
  handleNewIdea: function handleNewIdea(idea) {
    this.state.ideas.push(idea);
    // this.addIdeaToList(idea);
    this.listIdeas();
  }
};

window.addEventListener('storage', function (e) {
  setTimeout(ideaList.init(true), 1000);
});

_utilities2.default.domReady(function () {
  window.ideaList = ideaList;
  ideaList.init();
});

},{"./localDb.js":1,"./utilities.js":3}],3:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// eslint-disable-next-line
(function (window, document, undefined) {
    var _jacks = function () {
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
        var exports = {};
        var parse = function parse(req) {
            var result = void 0;
            try {
                result = JSON.parse(req.responseText);
            } catch (e) {
                result = req.responseText;
            }
            return [result, req];
        };

        function xhr(type, url, data) {
            var methods = {
                success: function success() {},
                error: function error() {}
            };
            var request = new XMLHttpRequest();
            request.open(type, url, true);
            if (type.toLowerCase() === 'post') {
                request.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
                // request.setRequestHeader('Content-type','application/x-www-form-urlencoded');
                // request.setRequestHeader('X-WP-Nonce', magicalData.nonce)
            }
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    if (request.status >= 200 && request.status < 300) {
                        methods.success.apply(methods, parse(request));
                    } else {
                        methods.error.apply(methods, parse(request));
                    }
                }
            };

            request.send(data);
            var callbacks = {
                success: function success(callback) {
                    methods.success = callback;
                    return callbacks;
                },
                error: function error(callback) {
                    methods.error = callback;
                    return callbacks;
                }
            };
            return callbacks;
        } /*end xhr function*/

        exports['get'] = function (src) {
            return xhr('GET', src);
        };
        exports['put'] = function (url, data) {
            return xhr('PUT', url, data);
        };
        exports['post'] = function (url, data) {
            return xhr('POST', url, data);
        };
        exports['delete'] = function (url, data) {
            return xhr('DELETE', url, data);
        };

        return exports;
    }();

    var _ = function () {
        function classReg(className) {
            return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
        }

        // classList support for class management
        // altho to be fair, the api sucks because it won't accept multiple classes at once
        var hasClass, addClass, removeClass;

        if ('classList' in document.documentElement) {
            hasClass = function hasClass(elem, c) {
                return elem.classList.contains(c);
            };
            addClass = function addClass(elem, c) {
                elem.classList.add(c);
            };
            removeClass = function removeClass(elem, c) {
                elem.classList.remove(c);
            };
        } else {
            hasClass = function hasClass(elem, c) {
                return classReg(c).test(elem.className);
            };
            addClass = function addClass(elem, c) {
                if (!hasClass(elem, c)) {
                    elem.className = elem.className + ' ' + c;
                }
            };
            removeClass = function removeClass(elem, c) {
                elem.className = elem.className.replace(classReg(c), ' ');
            };
        }

        function toggleClass(elem, c) {
            var fn = hasClass(elem, c) ? removeClass : addClass;
            fn(elem, c);
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
    }();

    var atts = function () {
        var setit;
        setit = function setit(elem, tribName, tribValue) {
            if (typeof tribName === 'string' && tribName.length >= 1 && typeof tribValue === 'string' && tribValue.length >= 1) {
                if (typeof elem !== 'undefined') {
                    elem.setAttribute(tribName, tribValue);
                }
            }
        };
        var getit = function getit(el, tribName) {
            if (el.getAttribute(tribName)) {
                return el.getAttribute(tribName);
            }
        };

        var hasit = function hasit(el, tribName) {
            return el.hasAttribute(tribName);
        };

        var rmit = function rmit(el, tribName) {
            if (el.hasAttribute(tribName)) {
                el.removeAttribute(tribName);
            }
        };

        var tribs = {
            // full names
            setit: setit,
            hasit: hasit,
            getit: getit,
            rmit: rmit
        };
        return tribs;
    }();

    //  Helper to return all possible matches to a selector in type Array.
    function $$(selector, context) {
        return Array.prototype.slice.call((context || document).querySelectorAll(selector));
    }

    function CrossMyHeart(url) {
        var _this = this;

        return new Promise(function (resolve, reject) {
            _this.jacksGet(url).success(function (a, b) {
                resolve(a);
            }).error(function (a, b) {
                reject(b.statusText);
            });
        });
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
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }
    /**
     * Get the width of the viewport
     * @return {Integer}
     * @private
     */
    function viewport_width() {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
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
        };
        if (dir) {
            dir = dir.toLowerCase();return viewportSize[dir];
        };
        return viewportSize;
    }

    function generateRandomNumber() {
        return Math.round(Math.round(Math.random() * Date.now()) / 2000);
    }

    function isWhat(o) {
        return Object.prototype.toString.call(o).slice(8, -1);
    }

    function isThis(obj, type) {
        var thisType = this.isWhat(obj);
        thisType = thisType.toLowerCase() || thisType;
        type = type.toLowerCase() || type;
        return obj !== undefined && obj !== null && thisType === type;
    }

    function toArray(list) {
        if (Array.isArray && Array.isArray(list) || isWhat(list) === "Array") {
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
        return parseInt(x, 10);
    }
    function getStyles(el) {
        if (typeof window.getComputedStyle !== 'function') {
            return el.style;
        } else {
            return window.getComputedStyle(el);
        }
    }
    function getById(id) {
        return document.getElementById(id);
    }
    function getByClass(val) {
        var ctx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        ctx = ctx || document;
        return ctx.getElementsByClassName(val);
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

    var log = function log(val) {
        console.log(val);
    };

    // This function does the same thing as the function above (sortArr) but uses the reduce method
    function sortArrToObjOfUniqKeys(arr) {
        return arr.reduce(function (o, el) {
            o[el] = !o[el] ? 1 : o[el] + 1;
            return o;
        }, {});
    };

    function removeByElement(haystack, element) {
        haystack.splice(haystack.indexOf(element), 1);
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
        _: _,
        generateRandomNumber: generateRandomNumber,
        stripHash: strip_hash,
        css: css
    };

    if (typeof define === 'function' && define.amd) {
        define([], _util);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        module.exports = _util;
    } else {
        window._util = _util;
    }
})(window, document, undefined);

},{}]},{},[2]);
