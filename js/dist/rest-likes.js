(()=>{"use strict";var e={n:t=>{var s=t&&t.__esModule?()=>t.default:()=>t;return e.d(s,{a:s}),s},d:(t,s)=>{for(var r in s)e.o(s,r)&&!e.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:s[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};const t=window.jQuery;var s=e.n(t);const r=window.wp.a11y,n=window.wp.i18n;let o,i,c;try{c=(new Date).getTime().toString(),(o=window.localStorage).setItem(c,c),i=o.getItem(c)!==c,o.removeItem(c),i&&(o=!1)}catch(e){}const a=window.RestLikesApi={},d=e=>{if(o){const t=o.getItem(`rest-likes-${e}`);if(t)return JSON.parse(t)}return[]},l=(e,t)=>-1!==d(e).indexOf(parseInt(t,10)),u=e=>{const t=e.getAttribute("data-type"),s=window.restLikes.object_types[t],r=s.classnames;if(e.classList.contains(r.liked))return;const n=e.getAttribute("data-id");l(t,n)&&(e.classList.add(r.liked),e.querySelector(`.${r.label}`).innerHTML=s.texts.unlike)};a.request=(e,t,s)=>{const r=window.restLikes.object_types[e];return window.fetch(window.restLikes.root+r.endpoint.replace("%s",t),{method:s?"DELETE":"POST",headers:window.restLikes.nonce&&{"X-WP-Nonce":window.restLikes.nonce},credentials:"include"})},a.buttonClickHandler=(e,t)=>{const s=document.querySelectorAll(`[data-rest-like-button][data-type="${e}"][data-id="${t}"]`),i=window.restLikes.object_types[e],c=i.classnames;s.forEach((e=>{e.classList.add(c.processing)}));const u=l(e,t);a.request(e,t,u).then((e=>{if(window.Response&&e instanceof Response){if(!e.ok)throw Error(e.statusText);return e.json()}if("object"==typeof e)return e;throw Error("Unknown response")})).then((a=>{if(s.forEach((e=>{e.classList.remove(c.processing);const t=e.querySelector(`.${c.count}`);let s;s=1===a.count?(0,n.sprintf)(/* translators: $s = number of likes */ /* translators: $s = number of likes */
(0,n.__)("%s like","rest-likes"),a.countFormatted):(0,n.sprintf)(/* translators: $s = number of likes */ /* translators: $s = number of likes */
(0,n._n)("%s like","%s likes",a.count,"rest-likes"),a.countFormatted),t.innerHTML=(0,n.sprintf)(i.html.visual_text,a.countFormatted)+(0,n.sprintf)(i.html.screen_reader_text,s),t.setAttribute("data-likes",a.count)})),u)return((e,t)=>{if(o){let s=d(e);s=s.filter((e=>e!==parseInt(t,10))),s=[...new Set(s)],o.setItem(`rest-likes-${e}`,JSON.stringify(s))}})(e,t),s.forEach((e=>{e.classList.remove(c.liked),e.querySelector(`.${c.label}`).innerHTML=i.texts.like})),(0,r.speak)((0,n.sprintf)(/* translators: %d: Like count */ /* translators: %d: Like count */
(0,n.__)("Unlike processed. New like count: %d","rest-likes"),a.count)),void document.dispatchEvent(new CustomEvent("restLikes",{detail:{action:"unlike",count:a.count,countFormatted:a.countFormatted,objectType:e,objectId:t}}));u||(((e,t)=>{if(o){let s=d(e);s&&(s.push(parseInt(t,10)),s=[...new Set(s)],o.setItem(`rest-likes-${e}`,JSON.stringify(s)))}})(e,t),s.forEach((e=>{e.classList.add(c.liked),e.querySelector(`.${c.label}`).innerHTML=i.texts.unlike})),(0,r.speak)((0,n.sprintf)(/* translators: %d: Like count */ /* translators: %d: Like count */
(0,n.__)("Like processed. New like count: %d","rest-likes"),a.count)),document.dispatchEvent(new CustomEvent("restLikes",{detail:{action:"like",count:a.count,countFormatted:a.countFormatted,objectType:e,objectId:t}})))})).catch((o=>{s.forEach((e=>{e.classList.remove(c.processing)})),console.error(o),(0,r.speak)((0,n.__)("There was an error processing your request.","rest-likes")),document.dispatchEvent(new CustomEvent("restLikes",{detail:{action:"error",objectType:e,objectId:t}}))}))};const k=s()(document);k.on("heartbeat-send",((e,t)=>{t.rest_likes={},Object.keys(window.restLikes.object_types).forEach((e=>{const s=document.querySelectorAll(`[data-rest-like-button][data-type="${e}"]`),r=[];s.forEach((e=>{r.push(e.getAttribute("data-id"))})),t.rest_likes[e]=[...new Set(r)]}))})),k.on("heartbeat-tick",((e,t)=>{if(t.rest_likes)for(const e of t.rest_likes){const{objectType:t,objectId:s,count:r,countFormatted:o}=e,i=window.restLikes.object_types[t],c=i.classnames;document.querySelectorAll(`[data-rest-like-button][data-type="${t}"][data-id="${s}"]`).forEach((e=>{const t=e.querySelector(`.${c.count}`);let s;s=1===r?(0,n.sprintf)(/* translators: $s = number of likes */ /* translators: $s = number of likes */
(0,n.__)("%s like","rest-likes"),o):(0,n.sprintf)(/* translators: $s = number of likes */ /* translators: $s = number of likes */
(0,n._n)("%s like","%s likes",r,"rest-likes"),o),t.innerHTML=(0,n.sprintf)(i.html.visual_text,o)+(0,n.sprintf)(i.html.screen_reader_text,s),t.setAttribute("data-likes",r)}))}}));const p=e=>{e.forEach((e=>{e.addedNodes.length&&e.addedNodes.forEach((e=>{if("function"!=typeof e.querySelectorAll)return;const t=e.querySelectorAll("[data-rest-like-button]");t.length&&t.forEach((e=>u(e)))}))}))};document.dispatchEvent(new CustomEvent("restLikes.initialized",{detail:{api:a}})),document.querySelectorAll("[data-rest-like-button]").forEach((e=>u(e))),void 0!==window.MutationObserver&&new window.MutationObserver(p).observe(document.body,{childList:!0,subtree:!0}),document.body.addEventListener("click",(e=>{const t=e.target.closest("[data-rest-like-button]");t&&a.buttonClickHandler(t.getAttribute("data-type"),t.getAttribute("data-id"),t)}))})();