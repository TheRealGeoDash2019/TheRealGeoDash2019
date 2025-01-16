// ==UserScript==
// @name         Beable Answers
// @namespace    http://tampermonkey.net/
// @version      0.0.28
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
    function htmlDecode(input) {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }
    document.textSelector = function(selector, text) {
        var elements = document.querySelectorAll(selector);
        return Array.prototype.filter.call(elements, function(element){
            const regexp = RegExp(text);
            const regexp2 = RegExp(text.split(" ").join(""))
            return regexp.test(element.textContent) || regexp.test(element.innerHTML) || regexp.test(htmlDecode(element.textContent)) || regexp.test(htmlDecode(element.innerHTML)) || regexp2.test(htmlDecode(element.innerHTML.split(" ").join(""))) || regexp2.test(htmlDecode(element.innerHTML));
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
                                //console.log(correctElem.parentNode);
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
                            const element = await document.textSelector(`.lrn_tokenhighlight_text > * > span:not(.behighlighted)`, answer);
                            const correctElem = element? element[0] : null;
                            if (correctElem && ("style" in correctElem)) {
                                mu.disconnect();
                                correctElem.style.fontWeight = "bolder";
                                correctElem.style.backgroundColor = "#50248d10";
                                correctElem.classList.add("behighlighted");
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
                const correctAnswers = q.options.map((e, i) => (q.validation.valid_response.value.includes(e.value.toString())? e.label.replace(/&nbsp;/gmi, "") : null)).filter(e => e);
                const mu = new MutationObserver(function() {
                    document.awaitSelector("div.lrn_question").then(async () => {
                        for (const answer of correctAnswers) {
                            const element = await document.textSelector(`div.lrn_response_wrapper .lrn_contentWrapper`, answer);
                            const correctElem = element? element[0] : null;
                            if (correctElem && ("style" in correctElem)) {
                                mu.disconnect();
                                correctElem.style.fontWeight = "bolder";
                                correctElem.parentNode.parentNode.style.backgroundColor = "#50248d10";
                                // setTimeout(() => correctElem.click(), 1000);
                            }
                        }
                    })
                });
                mu.observe(document.querySelector(`body`), {
                    subtree: true,
                    childList: true,
                });
                console.log("%c"+q.stimulus.replace(/&nbsp;/gmi, "")+"\n\n%c- "+correctAnswers.join("\n- "), `font-size: 10px; color: #888888;`, `color: #44ff44; font-weight: bolder;`);
            } else if (q.type === "classification") {
                const sortedItems = q.ui_style.column_titles.map((e, i) => ({category: e, values: q.validation.valid_response.value.map(e => e.map(e => q.possible_responses[e]))[i]}));
                const mu = new MutationObserver(function() {
                    const randomHex = ()=>("#"+Array.from(crypto.getRandomValues(new Uint8Array(3))).map(e => ((e > 200)?(e-200).toString(16).padStart(2, "0"):e.toString(16).padStart(2, "0"))).join(""));
                    document.awaitSelector("div.lrn_question").then(async () => {
                        let colorKey = ["#b33a0e", "#a68f1f", "#1f4aa6", "#6e1fa6"];
                        const cTable = document.querySelector(`[id^="${q.response_id}"] table.lrn_classification_table`);
                        const cHeader = Array.from(cTable.querySelectorAll(`thead [scope="col"]`));
                        const cZones = Array.from(cTable.querySelectorAll(`tbody td.lrn_dragdrop`));
                        for (const hdr of cHeader) {
                            const cAnsw = sortedItems.find(e => (e.category == hdr.innerText || e.category == hdr.textContent || htmlDecode(e.category) == htmlDecode(hdr.innerText) || htmlDecode(e.category)?.split?.(" ")?.join?.("")?.toLowerCase?.() == htmlDecode(hdr.innerText)?.split?.(" ")?.join?.("")?.toLowerCase?.())) || null;
                            const hdrIdx = cHeader.indexOf(hdr);
                            const hdrColor = colorKey[hdrIdx];
                            hdr.style.color = hdrColor;
                            cZones[hdrIdx].style.backgroundColor = (hdrColor+"5f");
                            if (cAnsw && ("values" in cAnsw)) {
                                for (const answ of cAnsw.values) {
                                    const element = await document.textSelector(`.lrn_possibilityList.lrn_dragdrop > *`, answ);
                                    const correctElem = element? element[0] : null;
                                    if (correctElem && ("style" in correctElem)) {
                                        correctElem.style.backgroundColor = (hdrColor+"8f");
                                        mu.disconnect();
                                    }
                                }
                            }
                        }
                    })
                });
                mu.observe(document.querySelector(`body`), {
                    subtree: true,
                    childList: true,
                });
                const prettied = sortedItems.map(e => ("" + e.category + "\n- " + ((e.values && e.values.length)? e.values.join("\n- ") : "[No Items in Category]")));
                console.log("%c"+q.stimulus.replace(/&nbsp;/gmi, "")+"\n\n%c"+prettied.join("\n\n"), `font-size: 10px; color: #888888;`, `color: #44ff44; font-weight: bolder;`);
            } else if (q.type === "imageclozeassociationV2") {
                const mu = new MutationObserver(function() {
                    document.awaitSelector(`.jss201.readaloud-block [data-reference="${q.metadata.sheet_reference}"]`).then(async () => {
                        const dropZones = Array.from(document.querySelectorAll(`.jss201.readaloud-block [data-reference="${q.metadata.sheet_reference}"] .lrn_imagecloze_response .lrn_dragdrop.lrn_dropzone`));
                        const dropElements = Array.from(document.querySelectorAll(`.jss201.readaloud-block [data-reference="${q.metadata.sheet_reference}"] .lrn_btn_drag.lrn_draggable`));
                        
                        for (const element of dropElements) {
                            const elementIndex = dropElements.indexOf(element);
                            element.click();
                            dropZones[elementIndex].click();
                            mu.disconnect();
                        };
                    });
                });
                mu.observe(document.querySelector(`body`), {
                    subtree: true,
                    childList: true,
                });
            } else {
                console.log("Unhandled Question:", q);
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
                            headers: new Headers(Object.fromEntries(payload.headers.split("\r\n").map(e => e.replace(":", "%SEPARATOR%").split("%SEPARATOR%")).filter(e => e[0]))),
                            url: url
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
    Object.defineProperty(unsafeWindow, "xfetch", {
        value: bypassFetch,
        enumerable: false,
        configurable: false,
        writable: false
    });
})();
