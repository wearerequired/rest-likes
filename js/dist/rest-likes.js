(()=>{"use strict";var e={n:t=>{var s=t&&t.__esModule?()=>t.default:()=>t;return e.d(s,{a:s}),s},d:(t,s)=>{for(var r in s)e.o(s,r)&&!e.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:s[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};const t=window.jQuery;var s=e.n(t);const r=window.wp.a11y,o=window.wp.i18n;let n,i,a;try{a=(new Date).getTime().toString(),(n=window.localStorage).setItem(a,a),i=n.getItem(a)!==a,n.removeItem(a),i&&(n=!1)}catch(e){}const c=window.RestLikesApi={},d=e=>{if(n){const t=n.getItem(`rest-likes-${e}`);if(t)return JSON.parse(t)}return[]},l=(e,t)=>-1!==d(e).indexOf(parseInt(t,10)),u=e=>{const t=e.getAttribute("data-type"),s=window.restLikes.object_types[t],r=s.classnames;if(e.classList.contains(r.liked))return;const o=e.getAttribute("data-id");l(t,o)&&(e.classList.add(r.liked),e.querySelector(`.${r.label}`).innerHTML=s.texts.unlike)},p=(e,t,s,r)=>{const n=e.querySelector("[aria-hidden]"),i=e.querySelector(".screen-reader-text");n&&i&&(n.textContent=s,i.textContent=1===t?r:(0,o.sprintf)(r,s),e.setAttribute("data-likes",t))};c.request=(e,t,s)=>{const r=window.restLikes.object_types[e];return window.fetch(window.restLikes.root+r.endpoint.replace("%s",t),{method:s?"DELETE":"POST",headers:window.restLikes.nonce&&{"X-WP-Nonce":window.restLikes.nonce},credentials:"include"})},c.buttonClickHandler=(e,t)=>{const s=document.querySelectorAll(`[data-rest-like-button][data-type="${e}"][data-id="${t}"]`),i=window.restLikes.object_types[e],a=i.classnames;s.forEach((e=>{e.classList.add(a.processing)}));const u=l(e,t);c.request(e,t,u).then((e=>{if(window.Response&&e instanceof Response){if(!e.ok)throw Error(e.statusText);return e.json()}if("object"==typeof e)return e;throw Error("Unknown response")})).then((c=>{if(s.forEach((e=>{e.classList.remove(a.processing);const t=e.querySelector(`.${a.count}`);p(t,c.count,c.countFormatted,c.screenReaderText)})),u)return((e,t)=>{if(n){let s=d(e);s=s.filter((e=>e!==parseInt(t,10))),s=[...new Set(s)],n.setItem(`rest-likes-${e}`,JSON.stringify(s))}})(e,t),s.forEach((e=>{e.classList.remove(a.liked),e.querySelector(`.${a.label}`).innerHTML=i.texts.like})),(0,r.speak)((0,o.sprintf)(s[0].dataset.speakUnlike,c.count)),void document.dispatchEvent(new CustomEvent("restLikes",{detail:{action:"unlike",count:c.count,countFormatted:c.countFormatted,screenReaderText:c.screenReaderText,objectType:e,objectId:t}}));u||(((e,t)=>{if(n){let s=d(e);s&&(s.push(parseInt(t,10)),s=[...new Set(s)],n.setItem(`rest-likes-${e}`,JSON.stringify(s)))}})(e,t),s.forEach((e=>{e.classList.add(a.liked),e.querySelector(`.${a.label}`).innerHTML=i.texts.unlike})),(0,r.speak)((0,o.sprintf)(s[0].dataset.speakLike,c.count)),document.dispatchEvent(new CustomEvent("restLikes",{detail:{action:"like",count:c.count,countFormatted:c.countFormatted,screenReaderText:c.screenReaderText,objectType:e,objectId:t}})))})).catch((n=>{s.forEach((e=>{e.classList.remove(a.processing)})),console.error(n),(0,r.speak)((0,o.__)("There was an error processing your request.","rest-likes")),document.dispatchEvent(new CustomEvent("restLikes",{detail:{action:"error",objectType:e,objectId:t}}))}))};const k=s()(document);k.on("heartbeat-send",((e,t)=>{t.rest_likes={},Object.keys(window.restLikes.object_types).forEach((e=>{const s=document.querySelectorAll(`[data-rest-like-button][data-type="${e}"]`),r=[];s.forEach((e=>{r.push(e.getAttribute("data-id"))})),t.rest_likes[e]=[...new Set(r)]}))})),k.on("heartbeat-tick",((e,t)=>{if(t.rest_likes)for(const e of t.rest_likes){const{objectType:t,objectId:s,count:r,countFormatted:o,screenReaderText:n}=e,i=window.restLikes.object_types[t].classnames;document.querySelectorAll(`[data-rest-like-button][data-type="${t}"][data-id="${s}"]`).forEach((e=>{const t=e.querySelector(`.${i.count}`);p(t,r,o,n)}))}}));const w=e=>{e.forEach((e=>{const t=e.target.closest("[data-rest-like-button]");"attributes"===e.type&&t?u(t):"childList"===e.type&&e.addedNodes.length&&e.addedNodes.forEach((e=>{if("function"!=typeof e.querySelectorAll)return;const t=e.querySelectorAll("[data-rest-like-button]");t.length&&t.forEach((e=>u(e)))}))}))};document.dispatchEvent(new CustomEvent("restLikes.initialized",{detail:{api:c}})),document.querySelectorAll("[data-rest-like-button]").forEach((e=>u(e))),void 0!==window.MutationObserver&&new window.MutationObserver(w).observe(document.body,{childList:!0,subtree:!0,attributes:!0}),document.body.addEventListener("click",(e=>{const t=e.target.closest("[data-rest-like-button]");t&&c.buttonClickHandler(t.getAttribute("data-type"),t.getAttribute("data-id"),t)}))})();