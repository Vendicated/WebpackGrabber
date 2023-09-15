// ==UserScript==
// @name            WebpackGrabber
// @description     Grabs the webpack_require instance on any site that uses webpack and offers methods to find modules
// @version         1.0.3
// @author          Vendicated (https://github.com/Vendicated)
// @namespace       https://github.com/Vendicated/WebpackGrabber
// @license         GPL-3.0
// @match           *://*/*
// @grant           none
// @run-at          document-start
// ==/UserScript==

const values = o => (Array.isArray(o) ? o : Object.values(o));

function extractPrivateCache(wreq) {
    let cache = null;
    const sym = Symbol("wpgrabber.extract");

    Object.defineProperty(Object.prototype, sym, {
        get() {
            cache = this;
            return { exports: {} };
        },
        set() { },
        configurable: true,
    })

    wreq(sym);
    delete Object.prototype[sym];
    if (cache) delete cache[sym];

    return cache;
}

Object.defineProperty(Function.prototype, "m", {
    set(v) {
        const source = this.toString();
        if (
            source.includes("exports") &&
            (source.includes("false") || source.includes("!1")) &&
            !(Array.isArray(v) && v?.some(m => m.toString().includes("CHROME_WEBSTORE_EXTENSION_ID"))) // react devtools
        ) {
            window.WEBPACK_GRABBER = {
                require: this,
                get cache() {
                    this.require.c ??= extractPrivateCache(this.require);
                    return this.require.c;
                },
                get modules() {
                    return this.require.m;
                },
                get entryPoint() {
                    return this.require.s;
                },
                get path() {
                    return this.require.p;
                },
                get getDefaultExport() {
                    return this.require.n;
                },
                cacheValues() {
                    return values(this.cache);
                },
                moduleValues() {
                    return values(this.modules);
                },

                find(filter) {
                    const values = this.cacheValues();
                    for (const { exports } of values) {
                        if (exports && filter(exports)) return exports;
                        if (exports?.default && filter(exports.default)) return exports.default;
                        if (typeof exports === "object" && exports !== window) {
                            // Mangled exports
                            for (const key in exports) {
                                if (key.length > 3 || !exports[key]) continue;
                                if (filter(exports[key])) return exports[key];
                            }
                        }
                    }
                    return null;
                },

                findAll(filter) {
                    const results = [];
                    const values = this.cacheValues();
                    for (const { exports } of values) {
                        if (exports && filter(exports)) results.push(exports);
                        else if (exports?.default && filter(exports.default)) results.push(exports.default);
                        if (typeof exports === "object" && exports !== window) {
                            // Mangled exports
                            for (const key in exports) {
                                if (key.length > 3 || !exports[key]) continue;
                                if (filter(exports[key])) {
                                    results.push(exports[key]);
                                    break;
                                }
                            }
                        }
                    }
                    return results;
                },

                filters: {
                    byProps:
                        (...props) =>
                        m =>
                            props.every(p => m[p] !== void 0),
                    byDisplayName: displayName => m => m.displayName === displayName,
                    byName: name => m => m.name === name,
                    byCode:
                        (...codes) =>
                        m => {
                            if (typeof m !== "function") return false;
                            const code = Function.prototype.toString.call(m);
                            return codes.every(c => {
                                if (typeof c === "string") return code.includes(c);
                                if (c instanceof RegExp) {
                                    const matches = c.test(code);
                                    c.lastIndex = 0;
                                    return matches;
                                }
                                throw new Error("findByCode: Expected one or more RegExp or string, got " + typeof c);
                            });
                        },
                },

                findByProps(...props) {
                    return this.find(this.filters.byProps(...props));
                },
                findAllByProps(...props) {
                    return this.findAll(this.filters.byProps(...props));
                },
                findByDisplayName(displayName) {
                    return this.find(this.filters.byDisplayName(displayName));
                },
                findAllByDisplayName(displayName) {
                    return this.findAll(this.filters.byDisplayName(displayName));
                },
                findByName(name) {
                    return this.find(this.filters.byName(name));
                },
                findAllByName(name) {
                    return this.findAll(this.filters.byName(name));
                },
                findByCode(...codes) {
                    return this.find(this.filters.byCode(...codes));
                },
                findAllByCode(...codes) {
                    return this.findAll(this.filters.byCode(...codes));
                },
                findId(...codes) {
                    const filter = this.filters.byCode(...codes);
                    for (const id in this.modules) {
                        if (filter(this.modules[id])) return id;
                    }
                    return null;
                },
                findModuleBySourceCode(...codes) {
                    const id = this.findId(...codes);
                    return id && this.require(id);
                },
            };

            delete Function.prototype.m;
            this.m = v;
            console.info(
                "%c%s%c %s %c%s",
                "background-color: #babbf1; color: black; border-radius: 4px; padding: 2px 4px; font-weight: bold;",
                "WebpackGrabber",
                "",
                "Found webpack_require! Check out",
                "font-weight: 600",
                "window.WEBPACK_GRABBER"
            );
        } else {
            // huh not webpack_require
            Object.defineProperty(this, "m", {
              value: v,
              configurable: true,
              writable: true,
              enumerable: true
            });
        }
    },
    configurable: true,
});
