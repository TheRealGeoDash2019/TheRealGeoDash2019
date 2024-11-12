// ==UserScript==
// @name         Beable Answers
// @namespace    http://tampermonkey.net/
// @version      0.0.4
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

    const setupQuestions = function(apiQuestions) {
        const questions = apiQuestions.questionsApiActivity.questions;
        console.log(`%cArticle Name: ${apiQuestions.questionsApiActivity.name}`, `font-size: 24px;`);
        for (const q of questions) {
            if (q.list) {
                const correctOrder = q.validation.valid_response.value.map((e, i) => (`${i+1}. ` + q.list[e]).replace(/&nbsp;/gmi, ""));
                console.log(q.stimulus+"\n\n%c"+correctOrder.join("\n"), `color: #44ff44; font-weight: bolder;`);
            } else if (q.type === "tokenhighlight") {
                const correctSentences = q.validation.valid_response.value;
                const correctAnswers = Array.from(new DOMParser().parseFromString(q.template, "text/html").querySelectorAll(`span`)).map(e => e.childNodes[0].textContent).filter((e, i) => correctSentences.includes(i)).join("\n\n- ");
                console.log(q.stimulus+"\n\n%c-"+correctAnswers, `color: #44ff44; font-weight: bolder;`);
            } else if (q.type === "mcq") {
                console.log(q.stimulus+"\n\n%c- "+q.options.map(e => e.label).map((e, i) => (q.validation.valid_response.value.includes(i.toString())? e.replace(/&nbsp;/gmi, "") : null)).filter(e => e).join("\n- "), `color: #44ff44; font-weight: bolder;`)
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
