!function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = "function" == typeof require && require;
                if (!u && a)
                    return a(o, !0);
                if (i)
                    return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND",
                f
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function (e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }
    for (var i = "function" == typeof require && require, o = 0; o < r.length; o++)
        s(r[o]);
    return s
}
({
    1: [function (require, module, exports) {
            "use strict";
            browser.browserAction.onClicked.addListener(function () {
                browser.tabs.create({
                    url: browser.extension.getURL("index.html")
                })
            }),
            browser.tabs.onRemoved.addListener(function (tabId, removeInfo) {
                console.log("[background.js][handleRemoved] TabId: " + tabId, removeInfo),
                browser.runtime.sendMessage({
                    target: "index",
                    action: "http-callto-tab-closed",
                    type: "boardcast",
                    tabId: tabId
                })
            })
        }, {}
    ]
}, {}, [1]);