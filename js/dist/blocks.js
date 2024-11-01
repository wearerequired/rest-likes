(()=>{var e={991:(e,t,s)=>{var r={"./comment-like-button/index.ts":363,"./post-like-button/index.ts":658};function n(e){var t=o(e);return s(t)}function o(e){if(!s.o(r,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return r[e]}n.keys=function(){return Object.keys(r)},n.resolve=o,e.exports=n,n.id=991},363:(e,t,s)=>{"use strict";s.r(t),s.d(t,{metadata:()=>r,name:()=>p,settings:()=>d});const r=JSON.parse('{"$schema":"https://schemas.wp.org/wp/6.6/block.json","name":"wearerequired/comment-like-button","apiVersion":3,"category":"theme","ancestor":["core/comment-template"],"title":"Comment Like Button","description":"Let users like a comment.","textdomain":"rest-likes","supports":{"html":false,"interactivity":{"clientNavigation":true}},"usesContext":["commentId"],"viewScript":"rest-likes","editorScript":"rest-likes-blocks-editor","editorStyle":"rest-likes-blocks-editor","render":"file:comment-like-button-block-render.php"}');var n=s(723),o=s(715),i=s(790);var a,l=s(609);function c(){return c=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var r in s)({}).hasOwnProperty.call(s,r)&&(e[r]=s[r])}return e},c.apply(null,arguments)}const{name:p}=r,d={icon:e=>l.createElement("svg",c({xmlns:"http://www.w3.org/2000/svg",width:1600,height:1600,viewBox:"0 0 1200 1200"},e),a||(a=l.createElement("path",{d:"m377.64 573.24 33.719 16.441-4.922 168h208.68v76.801l-80.402 173.52-270.72-1.078h-75.602v-177.96h75.602l113.76-255.72m0-84v-.004a84.04 84.04 0 0 0-45.78 13.523 84 84 0 0 0-31.02 36.277l-91.68 205.92H188.39a84 84 0 0 0-84 84v177.96c0 22.277 8.852 43.641 24.605 59.395s37.117 24.605 59.395 24.605h75.602l270.48 1.078a84.01 84.01 0 0 0 76.2-48.718l80.397-173.64a84 84 0 0 0 7.8-35.28V757.2a84.004 84.004 0 0 0-84-84H492.95l2.4-81.122a84 84 0 0 0-47.282-78l-33.719-16.44v.003a84 84 0 0 0-36.719-8.402zM920.88 192a90.6 90.6 0 0 1 64.191 26.508 90.6 90.6 0 0 1-.11 128.293l-31.68 31.68-187.56 187.92-219.24-219.24a90.7 90.7 0 0 1-26.863-64.238 90.714 90.714 0 0 1 90.941-90.921 89.76 89.76 0 0 1 64.082 26.641l31.68 31.68 60 59.398 60-59.398 31.68-31.68a90.13 90.13 0 0 1 62.879-26.641m0-84a173.99 173.99 0 0 0-123.48 51.601l-31.68 31.68-31.68-31.68a174.37 174.37 0 0 0-78.266-45.297 174.4 174.4 0 0 0-90.426 0 174.37 174.37 0 0 0-78.27 45.297 174.72 174.72 0 0 0-51.105 123.48 174.72 174.72 0 0 0 51.105 123.48l278.64 278.64 246.96-246.96 31.32-31.68a174.7 174.7 0 0 0 48.043-89.414 174.72 174.72 0 0 0-74.055-179.591 174.74 174.74 0 0 0-97.109-29.559z"}))),edit:()=>{const e=(0,o.useBlockProps)();return(0,i.jsx)("div",{...e,children:(0,i.jsxs)("button",{type:"button",className:"rest-like-button",children:[(0,i.jsx)("span",{className:"rest-like-button-label",children:(0,n.__)("Like","rest-likes")}),(0,i.jsxs)("span",{className:"rest-like-count",children:[(0,i.jsx)("span",{"aria-hidden":"true",children:"37"}),(0,i.jsx)("span",{className:"screen-reader-text",children:/* translators: %s: number of likes */ /* translators: %s: number of likes */
(0,n.sprintf)((0,n._n)("%s likes","%s likes",37,"rest-likes"),37)})]})]})})}}},658:(e,t,s)=>{"use strict";s.r(t),s.d(t,{metadata:()=>r,name:()=>k,settings:()=>w});const r=JSON.parse('{"$schema":"https://schemas.wp.org/wp/6.6/block.json","name":"wearerequired/post-like-button","apiVersion":3,"category":"theme","title":"Post Like Button","description":"Let users like a post.","textdomain":"rest-likes","supports":{"html":false,"interactivity":{"clientNavigation":true}},"usesContext":["postId","postType"],"viewScript":"rest-likes","editorScript":"rest-likes-blocks-editor","editorStyle":"rest-likes-blocks-editor","render":"file:post-like-button-block-render.php"}'),n=window.wp.apiFetch;var o=s.n(n),i=s(723);const a=window.wp.data,l=window.wp.element;var c=s(715);const p=window.wp.components;var d=s(790);var u,m=s(609);function h(){return h=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var r in s)({}).hasOwnProperty.call(s,r)&&(e[r]=s[r])}return e},h.apply(null,arguments)}const{name:k}=r,w={icon:e=>m.createElement("svg",h({xmlns:"http://www.w3.org/2000/svg",width:1600,height:1600,viewBox:"0 0 1200 1200"},e),u||(u=m.createElement("path",{d:"m377.64 573.24 33.719 16.441-4.922 168h208.68v76.801l-80.402 173.52-270.72-1.078h-75.602v-177.96h75.602l113.76-255.72m0-84v-.004a84.04 84.04 0 0 0-45.78 13.523 84 84 0 0 0-31.02 36.277l-91.68 205.92H188.39a84 84 0 0 0-84 84v177.96c0 22.277 8.852 43.641 24.605 59.395s37.117 24.605 59.395 24.605h75.602l270.48 1.078a84.01 84.01 0 0 0 76.2-48.718l80.397-173.64a84 84 0 0 0 7.8-35.28V757.2a84.004 84.004 0 0 0-84-84H492.95l2.4-81.122a84 84 0 0 0-47.282-78l-33.719-16.44v.003a84 84 0 0 0-36.719-8.402zM920.88 192a90.6 90.6 0 0 1 64.191 26.508 90.6 90.6 0 0 1-.11 128.293l-31.68 31.68-187.56 187.92-219.24-219.24a90.7 90.7 0 0 1-26.863-64.238 90.714 90.714 0 0 1 90.941-90.921 89.76 89.76 0 0 1 64.082 26.641l31.68 31.68 60 59.398 60-59.398 31.68-31.68a90.13 90.13 0 0 1 62.879-26.641m0-84a173.99 173.99 0 0 0-123.48 51.601l-31.68 31.68-31.68-31.68a174.37 174.37 0 0 0-78.266-45.297 174.4 174.4 0 0 0-90.426 0 174.37 174.37 0 0 0-78.27 45.297 174.72 174.72 0 0 0-51.105 123.48 174.72 174.72 0 0 0 51.105 123.48l278.64 278.64 246.96-246.96 31.32-31.68a174.7 174.7 0 0 0 48.043-89.414 174.72 174.72 0 0 0-74.055-179.591 174.74 174.74 0 0 0-97.109-29.559z"}))),edit:({context:e})=>{const t=(0,c.useBlockProps)(),[s,r]=(0,l.useState)(null),n=(0,a.useSelect)((t=>{const s=t("core").getPostType(e.postType);return s?s.rest_base:null}),[e.postType]);return(0,l.useEffect)((()=>{n&&o()({path:`/wp/v2/${n}/${e.postId}`}).then((e=>{r(e._rest_likes)})).catch((e=>{console.error((0,i.__)("Error fetching like count:","rest-likes"),e)}))}),[n,e.postId]),!n||!s&&0!==s?(0,d.jsx)(p.Spinner,{}):(0,d.jsx)("div",{...t,children:(0,d.jsxs)("button",{type:"button",className:"rest-like-button",children:[(0,d.jsx)("span",{className:"rest-like-button-label",children:(0,i.__)("Like","rest-likes")}),(0,d.jsxs)("span",{className:"rest-like-count",children:[(0,d.jsx)("span",{"aria-hidden":"true",children:s}),(0,d.jsx)("span",{className:"screen-reader-text",children:(0,i.sprintf)(/* translators: %s: number of likes */ /* translators: %s: number of likes */
(0,i._n)("%s likes","%s likes",s,"rest-likes"),s)})]})]})})}}},609:e=>{"use strict";e.exports=window.React},790:e=>{"use strict";e.exports=window.ReactJSXRuntime},715:e=>{"use strict";e.exports=window.wp.blockEditor},723:e=>{"use strict";e.exports=window.wp.i18n}},t={};function s(r){var n=t[r];if(void 0!==n)return n.exports;var o=t[r]={exports:{}};return e[r](o,o.exports,s),o.exports}s.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return s.d(t,{a:t}),t},s.d=(e,t)=>{for(var r in t)s.o(t,r)&&!s.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),s.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{"use strict";const e=window.wp.blocks,t=s(991);t.keys().forEach((s=>{const r=t(s);if(!r)return;const{metadata:n,settings:o,name:i}=r;(0,e.registerBlockType)({name:i,...n},o)}))})()})();