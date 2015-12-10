(function() { 

var GamboaJS = {

    VERSION: '0.0.1',

    i: function(idElm) 
    {
        if(typeof(idElm) === 'string') {
            return document.getElementById(idElm) || null;
        } else {
            return idElm;
        }
    }, 

    s: function(selector, from) 
    {
        if(!from) {
            from = document;
        }
        var result = from.querySelector(selector);
        return result; 
    }, 

    ss: function(selector, from)
    {
        if(!from) {
            from = document; 
        }
        var result = from.querySelectorAll(selector);
        result = [].slice.call(result, 1);
        return result;
    }, 

    extendObj: function(destination/*, source... */) 
    {
        var sources = [].slice.call(arguments, 1);
        for (var i = 0, len = sources.length; i < len; i++) {
            if (!sources[i]) { continue; }
            for (var property in sources[i]) {
                if(Object.prototype.hasOwnProperty.call(sources[i], property)) {
                    destination[property] = sources[i][property];
                }
            }
        }
        return destination;
    },

    getCurrentScriptTag: function(dataAttribute, keepDataAttribute) 
    {
        var aScript = document.getElementsByTagName('script');
        var curScript;
        for(var i=0, len=aScript.length; i < len; i++) {
            curScript = aScript[i];
            if(curScript.getAttribute(dataAttribute) !== null) {
                if(!keepDataAttribute) {
                    curScript.removeAttribute(dataAttribute);
                }
                return curScript; 
            }
        }
        return null;
    },

    addClassName: function(elm, className)
    {
        if (!elm || !className) {
            return null;
        }
        className = ('' + className).split(/[, ]+/);
        var i = 0;
        var len = className.length;

        for (; i < len; i++) {
            if (className[i].replace(/^\s+|\s+$/g, '')) {
                if (typeof elm.classList !== "undefined") {
                    elm.classList.add(className[i]);
                } else if (!this.hasClassName(elm, className[i])) {
                    elm.className += (elm.className ? ' ' : '') + className[i];
                }
            }
        }
    },

    removeClassName: function(elm, className)
    {
        if (!elm || !className) {
            return null;
        }
        className = ('' + className).split(/[, ]+/);
        var i = 0;
        var len = className.length;

        if (typeof elm.classList !== "undefined"){
            for (; i < len; i++) {
                elm.classList.remove(className[i]);
            }
        } else {
            var elmClassName = elm.className || '';
            var re;
            for (; i < len; i++) {
                re = new RegExp("(^|\\s+)" + className[i] + "(\\s+|$)");
                elmClassName = elmClassName.replace(re, ' ');
            }
            elm.className = (elmClassName
                    .replace(/^\s+/, '')
                    .replace(/\s+$/, ''));
        }
    },

    hasClassName: function(elm, className, all)
    {
        className = ('' + className).split(/[, ]+/);
        var i = 0;
        var len = className.length;
        var has;
        var re;

        for ( ; i < len; i++) {
            if (typeof elm.classList !== "undefined"){
                has = elm.classList.contains(className[i]);
            } else {
                var elmClassName = elm.className;
                if (elmClassName === className[i]) {
                    has = true;
                } else {
                    re = new RegExp("(^|\\s)" + className[i] + "(\\s|$)");
                    has = re.test(elmClassName);
                }
            }
            if (has && !all) { return true; }  // return if looking for any class
            if (!has && all) { return false; }  // return if looking for all classes
        }

        if (all) {
            // if we got here, all classes were found so far
            return true;
        } else {
            // if we got here with all == false, no class was found
            return false;
        }
    },

    addEvent: function(elm, evt, cb)
    {
        if(elm && evt && cb) {
            if(elm.addEventListener) {
                elm.addEventListener(evt, cb, false);
            } else if(elm.attachEvent) {
                elm.attachEvent('on'+evt, cb);
            }
        }
    },

    prevEventDefault: function(evt)
    {
        if(evt) {
            if(evt.preventDefault) {
                evt.preventDefault();
            }
            if(window.attachEvent) {
                evt.returnValue = false;
            }
            if(evt.cancel !== null) {
                evt.cancel = true;
            }
        }
    },

    findUpByClass: function(element, className)
    {
        while (element && element.nodeType === 1) {
            if (this.hasClassName(element, className)) {
                return element;
            }
            element = element.parentNode;
        }
        return false;
    },

    getCookie: function(cookieName)
    {
        var cookie = document.cookie || false;
        var _Cookie = {};
        if(cookie) {
            cookie = cookie.replace(new RegExp("; ", "g"), ';');
            var aCookie = cookie.split(';');
            var aItem = [];
            if(aCookie.length > 0) {
                for(var i=0; i < aCookie.length; i++) {
                    aItem = aCookie[i].split('=');
                    if(aItem.length === 2) {
                        _Cookie[aItem[0]] = decodeURIComponent(aItem[1]);
                    }
                    aItem = [];
                }
            }
            if(cookieName) {
                if(cookieName in _Cookie) {
                    return _Cookie[cookieName];
                } else {
                    return null;
                }
            }
            return _Cookie;
        }
    },

    setCookie: function(name, value, expires, path, domain)
    {
        if(!name || !value) {
            return;
        }
        var sNameValue,
            sExpires,
            sDomain,
            sPath;

        sNameValue = encodeURIComponent(name) + '=' + encodeURIComponent(value) + '';
        if(expires) {
            var oDate = new Date();
            oDate.setTime(oDate.getTime() + (expires * 1000));

            sExpires = '; expires=' + oDate.toUTCString() + '';
        } else {
            sExpires = '';
        }
        if(!domain) {
            sDomain = '; domain=' + window.location.host + '';
        } else {
            sDomain = '; domain=' + domain + '';
        }
        var portClean = new RegExp(":([^;]+)");
        sDomain = sDomain.replace(portClean, "");
        if(!path) {
            sPath = '; path=/';
        } else {
            sPath = '; path=' + path;
        }

        //console.log('setting cookie: ', sNameValue + sExpires + sDomain + sPath);

        document.cookie = sNameValue + sExpires + sDomain + sPath;
    },

    _tplToElm: function(tplOrDomElm, tag)
    {
        var tpl;
        if(typeof(tplOrDomElm) === 'string') {
            tpl = tplOrDomElm;
        } else {
            tpl = tplOrDomElm.text || tplOrDomElm.textContent || null;
        }
        var elmChild = null;
        if(tpl) {
            //tpl = tpl.replace(/^\s+|\s+$|\n+$/g, '');
            tpl = this._trim(tpl);

            var elm = document.createElement('div');

            if(tag && tag === 'tr') {
                tpl = '<table><tbody>' + tpl + '</tbody></table>';
            }
            elm.innerHTML = tpl;

            if(tag) {
                if(tag === 'tr') {
                    elmChild = Ink.s('table > tbody > '+tag+'', elm);
                } else {
                    elmChild = Ink.s('> '+tag+'', elm);
                }
            } else {
                if(elm.firstChild.nodeType === 1) {
                    elmChild = elm.firstChild;
                }
            }
        }  
        return elmChild;
    },


    _trim: function(str)
    {
        if(typeof(str) === 'string') {
            return str.replace(/^\s+|\s+$|\n+$/g, '');
        }
        return str;
    },

    _removeChilds: function(elmParent) 
    {
        var aChildNodes = elmParent.childNodes;
        for(var i=(aChildNodes.length - 1); i >= 0; i--) {
            if(aChildNodes[i] && aChildNodes[i].parentNode) {
                aChildNodes[i].parentNode.removeChild(aChildNodes[i]);
            }
        }
    },

    log: function() 
    {
        var console = window.console;
        if (console && console.log) {
            Function.prototype.apply.call(console.log, console, arguments);
        }
    },

    _debug: function() {}
}; 

if(window) {
    window.GamboaJS = GamboaJS;
} else if(require && module && module.exports) {
    module.exports = GamboaJS;
}

})();
