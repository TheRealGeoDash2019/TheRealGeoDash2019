// ==UserScript==
// @name         Beable Answers
// @namespace    http://tampermonkey.net/
// @version      0.0.10
// @description  Get free legit answers on Beable using Ancient Chinese Technique
// @author       TheRealGeoDash
// @match        *://*.beable.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=beable.com
// @grant        unsafeWindow
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/TheRealGeoDash2019/TheRealGeoDash2019/main/scripts/beableAnswers.user.js
// @downloadURL  https://raw.githubusercontent.com/TheRealGeoDash2019/TheRealGeoDash2019/main/scripts/beableAnswers.user.js
// ==/UserScript==

(function() {
    'use strict';
    document.textSelector = function(selector, text) {
        var elements = document.querySelectorAll(selector);
        return Array.prototype.filter.call(elements, function(element){
            return RegExp(text).test(element.textContent) || RegExp(text).test(element.innerHTML);
        });
    };
    document.awaitSelector = function(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }
            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });
            observer.observe(document.querySelector("html"), {
                childList: true,
                subtree: true
            });
        });
    };
    const setupQuestions = function(apiQuestions) {
        const questions = apiQuestions.questionsApiActivity.questions;
        console.log(`%c${apiQuestions.questionsApiActivity.name}`, `font-size: 20px;`);
        for (const q of questions) {
            if (q.list) {
                const correctOrder = q.validation.valid_response.value.map((e, i) => (`${i+1}. ` + q.list[e]).replace(/&nbsp;/gmi, ""));
                const mu = new MutationObserver(function() {
                    document.awaitSelector("div.lrn_question").then(async () => {
                        let colorKey = ["", "#eb403444", "#eb8c3444", "#ebcf3444", "#34eb7444"];
                        for (const answer of correctOrder) {
                            const element = await document.textSelector(`.lrn_dragdrop span`, answer.slice(3));
                            const correctElem = element? element[0] : null;
                            if (correctElem && ("style" in correctElem)) {
                                mu.disconnect();
                                console.log(correctElem.parentNode);
                                correctElem.parentNode.style.background = (colorKey[parseInt(answer.slice(0, 1))]);
                            }
                        }
                    })
                });
                mu.observe(document.querySelector(`body`), {
                    subtree: true,
                    childList: true,
                });
                console.log("%c"+q.stimulus.replace(/&nbsp;/gmi, "")+"\n\n%c"+correctOrder.join("\n"), `font-size: 10px; color: #888888;`, `color: #44ff44; font-weight: bolder;`);
            } else if (q.type === "tokenhighlight") {
                const correctSentences = q.validation.valid_response.value;
                const correctAnswers = Array.from(new DOMParser().parseFromString(q.template, "text/html").querySelectorAll(`span`)).map(e => e.childNodes[0].textContent).filter((e, i) => correctSentences.includes(i));
                const mu = new MutationObserver(function() {
                    document.awaitSelector("div.lrn_question").then(async () => {
                        for (const answer of correctAnswers) {
                            const element = await document.textSelector(`.lrn_tokenhighlight_text span`, answer);
                            const correctElem = element? element[0] : null;
                            if (correctElem && ("style" in correctElem)) {
                                mu.disconnect();
                                correctElem.style.fontWeight = "bolder";
                            }
                        }
                    })
                });
                mu.observe(document.querySelector(`body`), {
                    subtree: true,
                    childList: true,
                });
                console.log("%c"+q.stimulus.replace(/&nbsp;/gmi, "")+"\n\n%c-"+correctAnswers.join("\n\n- "), `font-size: 10px; color: #888888;`, `color: #44ff44; font-weight: bolder;`);
            } else if (q.type === "mcq") {
                const correctAnswers = q.options.map(e => e.label).map((e, i) => (q.validation.valid_response.value.includes(i.toString())? e.replace(/&nbsp;/gmi, "") : null)).filter(e => e);
                const mu = new MutationObserver(function() {
                    document.awaitSelector("div.lrn_question").then(async () => {
                        for (const answer of correctAnswers) {
                            const element = await document.textSelector(`div.lrn_response_wrapper .lrn_contentWrapper`, answer);
                            const correctElem = element? element[0] : null;
                            if (correctElem && ("style" in correctElem)) {
                                mu.disconnect();
                                correctElem.style.fontWeight = "bolder";
                            }
                        }
                    })
                });
                mu.observe(document.querySelector(`body`), {
                    subtree: true,
                    childList: true,
                });
                console.log("%c"+q.stimulus.replace(/&nbsp;/gmi, "")+"\n\n%c- "+correctAnswers.join("\n- "), `font-size: 10px; color: #888888;`, `color: #44ff44; font-weight: bolder;`);
            }
        }
    };
    unsafeWindow.addEventListener(`message`, ({ target, data }) => {
        if (data && data?.includes?.(`response_id`)) {
            const questionsPayload = (JSON.parse(data).responseText);
            const payload = JSON.parse(questionsPayload);
            if (payload && payload.data && payload.data.apiActivity) {
                setupQuestions(payload.data.apiActivity);
            };
        }
    });
    // Fetch for CORS Bypass
    const bypassFetch = function(url, options) {
        const crossFrame = document.querySelector(`iframe.x-origin-frame`);
        if (!crossFrame) throw new Error(`Frame not initialized!`);
        return new Promise((res, rej) => {
            const defaults = Object.assign({
                method: "GET",
                headers: {},
                url: "/",
                body: null
            }, {
                url,
                headers: options?.headers || {},
                method: options?.method || "GET",
                body: options?.body || null
            });
            const requestId = crypto.randomUUID();
            unsafeWindow.addEventListener(`message`, function(event) {
                const url = new URL(event.origin);
                const crossFrameUrl = new URL(crossFrame.src);
                if (url.origin === crossFrameUrl.origin) {
                    const payload = JSON.parse(event.data);
                    if (payload.id === requestId) {
                        return res(new Response(payload.responseText, {
                            status: payload.status,
                            headers: new Headers(Object.fromEntries(payload.headers.split("\r\n").map(e => e.replace(":", "%SEPARATOR%").split("%SEPARATOR%")).filter(e => e[0])))
                        }))
                    }
                }
            });
            crossFrame.contentWindow.postMessage(JSON.stringify({
                method: defaults.method,
                url: defaults.url,
                headers: defaults.headers,
                requestId: requestId,
                data: defaults.body
            }), "*");
        });
    };
})();
