var _main,
    main_debug = true;

window.APP = window.APP || {};
window.APP.main = {

    o: {
        debug        : ((main_debug === undefined) || (main_debug !== true)) ? false : true,
        url          : window.location.href
    },

    init: function() {

        _main = this;

        /*
        // inits google analytics tracking module
        if ( window.APP.tracker !== undefined){
        setTimeout(function() {
            window.APP.tracker.init();
        }, 222);
        }
        */
        _main.d('init!');
        _main.d('code injection!');
        _main.d('sweet!');
        /*
        var outsider = $('#outsider');
        TweenLite.to(outsider, 1.5, {
            width:900
        });
        */
    },

    addMarkdown: function(){
    },

    isIE: function(){
        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){
            return true;
        }
    },

    d: function(c, msg) {
        msg = msg || ' ';
        if (_main.o.debug === true) {
            console.log(c, msg);
        }
    }
};

$(function() {

    // Avoids `console` errors in browsers that lack a console.
    (function() {
        var method;
        var noop = function noop() {};
        var methods = [
            'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
            'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
            'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
            'timeStamp', 'trace', 'warn'
        ];
        var length = methods.length;
        var console = (window.console = window.console || {});

        while (length--) {
            method = methods[length];

            // Only stub undefined methods.
            if (!console[method]) {
                console[method] = noop;
            }
        }
    }());

    window.APP.main.init();
});
