import _ from './utilities.js';

// eslint-disable-next-line
(function (window, document, undefined) {
    const get = function (key) {
        return JSON.parse(localStorage.getItem(key))
    }
    const key = function (n) {
        return localStorage.key(n)
    }

    const store = function (key,val) {
        if(!_.isThis(val,'string')) {
            val = JSON.stringify(val)
        }
        localStorage.setItem(key,val)
    }

    const remove = function (key) {
        if (this.get(key)!==null) {
            localStorage.removeItem(key);
            return true;
        }else{
            return false;
        }
    }

    const getLen = function () {
        return localStorage.length;
    }

    const db = {
        get: get,
        remove: remove,
        length: getLen,
        key: key,
        store: store
    };

if (typeof define === 'function' && define.amd) {
        define([], db);
    } else if (typeof exports === 'object') {
        module.exports = db;
    } else {
        window.db = db;
    }

})(window, document, undefined);
