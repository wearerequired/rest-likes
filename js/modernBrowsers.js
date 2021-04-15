!function(){var t={588:function(t){t.exports=function(t,e){var n,r,i=0;function o(){var o,a,s=n,c=arguments.length;t:for(;s;){if(s.args.length===arguments.length){for(a=0;a<c;a++)if(s.args[a]!==arguments[a]){s=s.next;continue t}return s!==n&&(s===r&&(r=s.prev),s.prev.next=s.next,s.next&&(s.next.prev=s.prev),s.next=n,s.prev=null,n.prev=s,n=s),s.val}s=s.next}for(o=new Array(c),a=0;a<c;a++)o[a]=arguments[a];return s={args:o,val:t.apply(null,o)},n?(n.prev=s,s.next=n):r=s,i===e.maxSize?(r=r.prev).next=null:i++,n=s,s.val}return e=e||{},o.clear=function(){n=null,r=null,i=0},o}},975:function(t,e,n){var r;!function(){"use strict";var i={not_string:/[^s]/,not_bool:/[^t]/,not_type:/[^T]/,not_primitive:/[^v]/,number:/[diefg]/,numeric_arg:/[bcdiefguxX]/,json:/[j]/,not_json:/[^j]/,text:/^[^\x25]+/,modulo:/^\x25{2}/,placeholder:/^\x25(?:([1-9]\d*)\$|\(([^)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,key:/^([a-z_][a-z_\d]*)/i,key_access:/^\.([a-z_][a-z_\d]*)/i,index_access:/^\[(\d+)\]/,sign:/^[+-]/};function o(t){return s(u(t),arguments)}function a(t,e){return o.apply(null,[t].concat(e||[]))}function s(t,e){var n,r,a,s,c,u,l,d,p,f=1,h=t.length,v="";for(r=0;r<h;r++)if("string"==typeof t[r])v+=t[r];else if("object"==typeof t[r]){if((s=t[r]).keys)for(n=e[f],a=0;a<s.keys.length;a++){if(null==n)throw new Error(o('[sprintf] Cannot access property "%s" of undefined value "%s"',s.keys[a],s.keys[a-1]));n=n[s.keys[a]]}else n=s.param_no?e[s.param_no]:e[f++];if(i.not_type.test(s.type)&&i.not_primitive.test(s.type)&&n instanceof Function&&(n=n()),i.numeric_arg.test(s.type)&&"number"!=typeof n&&isNaN(n))throw new TypeError(o("[sprintf] expecting number but found %T",n));switch(i.number.test(s.type)&&(d=n>=0),s.type){case"b":n=parseInt(n,10).toString(2);break;case"c":n=String.fromCharCode(parseInt(n,10));break;case"d":case"i":n=parseInt(n,10);break;case"j":n=JSON.stringify(n,null,s.width?parseInt(s.width):0);break;case"e":n=s.precision?parseFloat(n).toExponential(s.precision):parseFloat(n).toExponential();break;case"f":n=s.precision?parseFloat(n).toFixed(s.precision):parseFloat(n);break;case"g":n=s.precision?String(Number(n.toPrecision(s.precision))):parseFloat(n);break;case"o":n=(parseInt(n,10)>>>0).toString(8);break;case"s":n=String(n),n=s.precision?n.substring(0,s.precision):n;break;case"t":n=String(!!n),n=s.precision?n.substring(0,s.precision):n;break;case"T":n=Object.prototype.toString.call(n).slice(8,-1).toLowerCase(),n=s.precision?n.substring(0,s.precision):n;break;case"u":n=parseInt(n,10)>>>0;break;case"v":n=n.valueOf(),n=s.precision?n.substring(0,s.precision):n;break;case"x":n=(parseInt(n,10)>>>0).toString(16);break;case"X":n=(parseInt(n,10)>>>0).toString(16).toUpperCase()}i.json.test(s.type)?v+=n:(!i.number.test(s.type)||d&&!s.sign?p="":(p=d?"+":"-",n=n.toString().replace(i.sign,"")),u=s.pad_char?"0"===s.pad_char?"0":s.pad_char.charAt(1):" ",l=s.width-(p+n).length,c=s.width&&l>0?u.repeat(l):"",v+=s.align?p+n+c:"0"===u?p+c+n:c+p+n)}return v}var c=Object.create(null);function u(t){if(c[t])return c[t];for(var e,n=t,r=[],o=0;n;){if(null!==(e=i.text.exec(n)))r.push(e[0]);else if(null!==(e=i.modulo.exec(n)))r.push("%");else{if(null===(e=i.placeholder.exec(n)))throw new SyntaxError("[sprintf] unexpected placeholder");if(e[2]){o|=1;var a=[],s=e[2],u=[];if(null===(u=i.key.exec(s)))throw new SyntaxError("[sprintf] failed to parse named argument key");for(a.push(u[1]);""!==(s=s.substring(u[0].length));)if(null!==(u=i.key_access.exec(s)))a.push(u[1]);else{if(null===(u=i.index_access.exec(s)))throw new SyntaxError("[sprintf] failed to parse named argument key");a.push(u[1])}e[2]=a}else o|=2;if(3===o)throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported");r.push({placeholder:e[0],param_no:e[1],keys:e[2],sign:e[3],pad_char:e[4],align:e[5],width:e[6],precision:e[7],type:e[8]})}n=n.substring(e[0].length)}return c[t]=r}e.sprintf=o,e.vsprintf=a,"undefined"!=typeof window&&(window.sprintf=o,window.vsprintf=a,void 0===(r=function(){return{sprintf:o,vsprintf:a}}.call(e,n,e,t))||(t.exports=r))}()}},e={};function n(r){var i=e[r];if(void 0!==i)return i.exports;var o=e[r]={exports:{}};return t[r](o,o.exports,n),o.exports}n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,{a:e}),e},n.d=function(t,e){for(var r in e)n.o(e,r)&&!n.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},function(){"use strict";var t,e,r,i,o=jQuery,a=n.n(o),s=n(588),c=n.n(s),u=n(975),l=n.n(u),d=c()(console.error);function p(t){try{for(var e=arguments.length,n=new Array(e>1?e-1:0),r=1;r<e;r++)n[r-1]=arguments[r];return l().sprintf.apply(l(),[t].concat(n))}catch(e){return d("sprintf error: \n\n"+e.toString()),t}}function f(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}t={"(":9,"!":8,"*":7,"/":7,"%":7,"+":6,"-":6,"<":5,"<=":5,">":5,">=":5,"==":4,"!=":4,"&&":3,"||":2,"?":1,"?:":1},e=["(","?"],r={")":["("],":":["?","?:"]},i=/<=|>=|==|!=|&&|\|\||\?:|\(|!|\*|\/|%|\+|-|<|>|\?|\)|:/;var h={"!":function(t){return!t},"*":function(t,e){return t*e},"/":function(t,e){return t/e},"%":function(t,e){return t%e},"+":function(t,e){return t+e},"-":function(t,e){return t-e},"<":function(t,e){return t<e},"<=":function(t,e){return t<=e},">":function(t,e){return t>e},">=":function(t,e){return t>=e},"==":function(t,e){return t===e},"!=":function(t,e){return t!==e},"&&":function(t,e){return t&&e},"||":function(t,e){return t||e},"?:":function(t,e,n){if(t)throw e;return n}};var v={contextDelimiter:"",onMissingKey:null};function y(t,e){var n;for(n in this.data=t,this.pluralForms={},this.options={},v)this.options[n]=void 0!==e&&n in e?e[n]:v[n]}function m(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function b(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?m(Object(n),!0).forEach((function(e){f(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):m(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}y.prototype.getPluralForm=function(n,o){var a,s,c,u,l=this.pluralForms[n];return l||("function"!=typeof(c=(a=this.data[n][""])["Plural-Forms"]||a["plural-forms"]||a.plural_forms)&&(s=function(t){var e,n,r;for(e=t.split(";"),n=0;n<e.length;n++)if(0===(r=e[n].trim()).indexOf("plural="))return r.substr(7)}(a["Plural-Forms"]||a["plural-forms"]||a.plural_forms),u=function(n){var o=function(n){for(var o,a,s,c,u=[],l=[];o=n.match(i);){for(a=o[0],(s=n.substr(0,o.index).trim())&&u.push(s);c=l.pop();){if(r[a]){if(r[a][0]===c){a=r[a][1]||a;break}}else if(e.indexOf(c)>=0||t[c]<t[a]){l.push(c);break}u.push(c)}r[a]||l.push(a),n=n.substr(o.index+a.length)}return(n=n.trim())&&u.push(n),u.concat(l.reverse())}(n);return function(t){return function(t,e){var n,r,i,o,a,s,c=[];for(n=0;n<t.length;n++){if(a=t[n],o=h[a]){for(r=o.length,i=Array(r);r--;)i[r]=c.pop();try{s=o.apply(null,i)}catch(t){return t}}else s=e.hasOwnProperty(a)?e[a]:+a;c.push(s)}return c[0]}(o,t)}}(s),c=function(t){return+u({n:t})}),l=this.pluralForms[n]=c),l(o)},y.prototype.dcnpgettext=function(t,e,n,r,i){var o,a,s;return o=void 0===i?0:this.getPluralForm(t,i),a=n,e&&(a=e+this.options.contextDelimiter+n),(s=this.data[t][a])&&s[o]?s[o]:(this.options.onMissingKey&&this.options.onMissingKey(n,t),0===o?n:r)};var g={"":{plural_forms:function(t){return 1===t?0:1}}},k=/^i18n\.(n?gettext|has_translation)(_|$)/,x=function(t){return"string"!=typeof t||""===t?(console.error("The namespace must be a non-empty string."),!1):!!/^[a-zA-Z][a-zA-Z0-9_.\-\/]*$/.test(t)||(console.error("The namespace can only contain numbers, letters, dashes, periods, underscores and slashes."),!1)},w=function(t){return"string"!=typeof t||""===t?(console.error("The hook name must be a non-empty string."),!1):/^__/.test(t)?(console.error("The hook name cannot begin with `__`."),!1):!!/^[a-zA-Z][a-zA-Z0-9_.-]*$/.test(t)||(console.error("The hook name can only contain numbers, letters, dashes, periods and underscores."),!1)},_=function(t,e){return function(n,r,i){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:10,a=t[e];if(w(n)&&x(r))if("function"==typeof i)if("number"==typeof o){var s={callback:i,priority:o,namespace:r};if(a[n]){var c,u=a[n].handlers;for(c=u.length;c>0&&!(o>=u[c-1].priority);c--);c===u.length?u[c]=s:u.splice(c,0,s),a.__current.forEach((function(t){t.name===n&&t.currentIndex>=c&&t.currentIndex++}))}else a[n]={handlers:[s],runs:0};"hookAdded"!==n&&t.doAction("hookAdded",n,r,i,o)}else console.error("If specified, the hook priority must be a number.");else console.error("The hook callback must be a function.")}},A=function(t,e){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];return function(r,i){var o=t[e];if(w(r)&&(n||x(i))){if(!o[r])return 0;var a=0;if(n)a=o[r].handlers.length,o[r]={runs:o[r].runs,handlers:[]};else for(var s=o[r].handlers,c=function(t){s[t].namespace===i&&(s.splice(t,1),a++,o.__current.forEach((function(e){e.name===r&&e.currentIndex>=t&&e.currentIndex--})))},u=s.length-1;u>=0;u--)c(u);return"hookRemoved"!==r&&t.doAction("hookRemoved",r,i),a}}},E=function(t,e){return function(n,r){var i=t[e];return void 0!==r?n in i&&i[n].handlers.some((function(t){return t.namespace===r})):n in i}},S=function(t,e){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];return function(r){var i=t[e];i[r]||(i[r]={handlers:[],runs:0}),i[r].runs++;for(var o=i[r].handlers,a=arguments.length,s=new Array(a>1?a-1:0),c=1;c<a;c++)s[c-1]=arguments[c];if(!o||!o.length)return n?s[0]:void 0;var u={name:r,currentIndex:0};for(i.__current.push(u);u.currentIndex<o.length;){var l=o[u.currentIndex],d=l.callback.apply(null,s);n&&(s[0]=d),u.currentIndex++}return i.__current.pop(),n?s[0]:void 0}},j=function(t,e){return function(){var n,r,i=t[e];return null!==(n=null===(r=i.__current[i.__current.length-1])||void 0===r?void 0:r.name)&&void 0!==n?n:null}},F=function(t,e){return function(n){var r=t[e];return void 0===n?void 0!==r.__current[0]:!!r.__current[0]&&n===r.__current[0].name}},I=function(t,e){return function(n){var r=t[e];if(w(n))return r[n]&&r[n].runs?r[n].runs:0}},O=new function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.actions=Object.create(null),this.actions.__current=[],this.filters=Object.create(null),this.filters.__current=[],this.addAction=_(this,"actions"),this.addFilter=_(this,"filters"),this.removeAction=A(this,"actions"),this.removeFilter=A(this,"filters"),this.hasAction=E(this,"actions"),this.hasFilter=E(this,"filters"),this.removeAllActions=A(this,"actions",!0),this.removeAllFilters=A(this,"filters",!0),this.doAction=S(this,"actions"),this.applyFilters=S(this,"filters",!0),this.currentAction=j(this,"actions"),this.currentFilter=j(this,"filters"),this.doingAction=F(this,"actions"),this.doingFilter=F(this,"filters"),this.didAction=I(this,"actions"),this.didFilter=I(this,"filters")},L=(O.addAction,O.addFilter,O.removeAction,O.removeFilter,O.hasAction,O.hasFilter,O.removeAllActions,O.removeAllFilters,O.doAction,O.applyFilters,O.currentAction,O.currentFilter,O.doingAction,O.doingFilter,O.didAction,O.didFilter,O.actions,O.filters,function(t,e,n){var r=new y({}),i=new Set,o=function(){i.forEach((function(t){return t()}))},a=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"default";r.data[e]=b(b(b({},g),r.data[e]),t),r.data[e][""]=b(b({},g[""]),r.data[e][""])},s=function(t,e){a(t,e),o()},c=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"default",e=arguments.length>1?arguments[1]:void 0,n=arguments.length>2?arguments[2]:void 0,i=arguments.length>3?arguments[3]:void 0,o=arguments.length>4?arguments[4]:void 0;return r.data[t]||a(void 0,t),r.dcnpgettext(t,e,n,i,o)},u=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"default";return t},l=function(t,e,r){var i=c(r,e,t);return n?(i=n.applyFilters("i18n.gettext_with_context",i,t,e,r),n.applyFilters("i18n.gettext_with_context_"+u(r),i,t,e,r)):i};if(n){var d=function(t){k.test(t)&&o()};n.addAction("hookAdded","core/i18n",d),n.addAction("hookRemoved","core/i18n",d)}return{getLocaleData:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"default";return r.data[t]},setLocaleData:s,subscribe:function(t){return i.add(t),function(){return i.delete(t)}},__:function(t,e){var r=c(e,void 0,t);return n?(r=n.applyFilters("i18n.gettext",r,t,e),n.applyFilters("i18n.gettext_"+u(e),r,t,e)):r},_x:l,_n:function(t,e,r,i){var o=c(i,void 0,t,e,r);return n?(o=n.applyFilters("i18n.ngettext",o,t,e,r,i),n.applyFilters("i18n.ngettext_"+u(i),o,t,e,r,i)):o},_nx:function(t,e,r,i,o){var a=c(o,i,t,e,r);return n?(a=n.applyFilters("i18n.ngettext_with_context",a,t,e,r,i,o),n.applyFilters("i18n.ngettext_with_context_"+u(o),a,t,e,r,i,o)):a},isRTL:function(){return"rtl"===l("ltr","text direction")},hasTranslation:function(t,e,i){var o,a,s=e?e+""+t:t,c=!(null===(o=r.data)||void 0===o||null===(a=o[null!=i?i:"default"])||void 0===a||!a[s]);return n&&(c=n.applyFilters("i18n.has_translation",c,t,e,i),c=n.applyFilters("i18n.has_translation_"+u(i),c,t,e,i)),c}}}(0,0,O)),T=(L.getLocaleData.bind(L),L.setLocaleData.bind(L)),C=(L.subscribe.bind(L),L.__.bind(L));function N(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"polite",e=document.createElement("div");e.id="a11y-speak-".concat(t),e.className="a11y-speak-region",e.setAttribute("style","position: absolute;margin: -1px;padding: 0;height: 1px;width: 1px;overflow: hidden;clip: rect(1px, 1px, 1px, 1px);-webkit-clip-path: inset(50%);clip-path: inset(50%);border: 0;word-wrap: normal !important;"),e.setAttribute("aria-live",t),e.setAttribute("aria-relevant","additions text"),e.setAttribute("aria-atomic","true");var n=document,r=n.body;return r&&r.appendChild(e),e}L._x.bind(L),L._n.bind(L),L._nx.bind(L),L.isRTL.bind(L),L.hasTranslation.bind(L);var P,q,D,M,z="";function B(t,e){!function(){for(var t=document.getElementsByClassName("a11y-speak-region"),e=document.getElementById("a11y-speak-intro-text"),n=0;n<t.length;n++)t[n].textContent="";e&&e.setAttribute("hidden","hidden")}(),t=function(t){return t=t.replace(/<[^<>]+>/g," "),z===t&&(t+=" "),z=t,t}(t);var n=document.getElementById("a11y-speak-intro-text"),r=document.getElementById("a11y-speak-assertive"),i=document.getElementById("a11y-speak-polite");r&&"assertive"===e?r.textContent=t:i&&(i.textContent=t),n&&n.removeAttribute("hidden")}function R(t){return function(t){if(Array.isArray(t))return H(t)}(t)||function(t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t))return Array.from(t)}(t)||$(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function $(t,e){if(t){if("string"==typeof t)return H(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?H(t,e):void 0}}function H(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}P=function(){var t=document.getElementById("a11y-speak-intro-text"),e=document.getElementById("a11y-speak-assertive"),n=document.getElementById("a11y-speak-polite");null===t&&function(){var t=document.createElement("p");t.id="a11y-speak-intro-text",t.className="a11y-speak-intro-text",t.textContent=C("Notifications"),t.setAttribute("style","position: absolute;margin: -1px;padding: 0;height: 1px;width: 1px;overflow: hidden;clip: rect(1px, 1px, 1px, 1px);-webkit-clip-path: inset(50%);clip-path: inset(50%);border: 0;word-wrap: normal !important;"),t.setAttribute("hidden","hidden");var e=document.body;e&&e.appendChild(t)}(),null===e&&N("assertive"),null===n&&N("polite")},"undefined"!=typeof document&&("complete"!==document.readyState&&"interactive"!==document.readyState?document.addEventListener("DOMContentLoaded",P):P()),T(restLikes.l10n,"rest-likes");try{M=new Date,(q=window.localStorage).setItem(M,M),D=q.getItem(M)!=M,q.removeItem(M),D&&(q=!1)}catch(t){}if("function"!=typeof window.CustomEvent){var J=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{bubbles:!1,cancelable:!1,detail:void 0},n=document.createEvent("CustomEvent");return n.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),n};J.prototype=window.Event.prototype,window.CustomEvent=J}window.NodeList&&!NodeList.prototype.forEach&&(NodeList.prototype.forEach=Array.prototype.forEach);var X=window.RestLikesApi={},Z=function(t){if(q){var e=q.getItem("rest-likes-".concat(t));if(e)return JSON.parse(e)}return[]},K=function(t,e){return-1!==Z(t).indexOf(parseInt(e,10))},U=function(t){var e=t.getAttribute("data-id"),n=t.getAttribute("data-type"),r=restLikes.object_types[n],i=r.classnames;t.classList.contains(i.liked)||K(n,e)&&(t.classList.add(i.liked),t.querySelector(".".concat(i.label)).innerHTML=r.texts.unlike)};X.request=function(t,e,n){var r=restLikes.object_types[t];return window.fetch(restLikes.root+r.endpoint.replace("%s",e),{method:n?"DELETE":"POST",headers:restLikes.nonce&&{"X-WP-Nonce":restLikes.nonce},credentials:"include"})},X.buttonClickHandler=function(t,e){var n=document.querySelectorAll('[data-rest-like-button][data-type="'.concat(t,'"][data-id="').concat(e,'"]')),r=restLikes.object_types[t],i=r.classnames;n.forEach((function(t){t.classList.add(i.processing)}));var o=K(t,e);X.request(t,e,o).then((function(t){if(!t.ok)throw Error(t.statusText);return t.json()})).then((function(a){if(n.forEach((function(t){t.classList.remove(i.processing);var e=t.querySelector(".".concat(i.count));e.innerText=a.countFormatted,e.setAttribute("data-likes",a.count)})),o)return function(t,e){if(q){var n=Z(t);n=n.filter((function(t){return t!==parseInt(e,10)})),n=R(new Set(n)),q.setItem("rest-likes-".concat(t),JSON.stringify(n))}}(t,e),n.forEach((function(t){t.classList.remove(i.liked),t.querySelector(".".concat(i.label)).innerHTML=r.texts.like})),B(p(C("Unlike processed. New like count: %d","rest-likes"),a.count)),void document.dispatchEvent(new CustomEvent("restLikes",{detail:{action:"unlike",count:a.count,countFormatted:a.countFormatted,objectType:t,objectId:e}}));o||(function(t,e){if(q){var n=Z(t);n&&(n.push(parseInt(e,10)),n=R(new Set(n)),q.setItem("rest-likes-".concat(t),JSON.stringify(n)))}}(t,e),n.forEach((function(t){t.classList.add(i.liked),t.querySelector(".".concat(i.label)).innerHTML=r.texts.unlike})),B(p(C("Like processed. New like count: %d","rest-likes"),a.count)),document.dispatchEvent(new CustomEvent("restLikes",{detail:{action:"like",count:a.count,countFormatted:a.countFormatted,objectType:t,objectId:e}})))})).catch((function(r){Array.prototype.forEach.call(n,(function(t){t.classList.remove(i.processing)})),console.log(r),B(C("There was an error processing your request.","rest-likes")),document.dispatchEvent(new CustomEvent("restLikes",{detail:{action:"error",objectType:t,objectId:e}}))}))};var Q=a()(document);Q.on("heartbeat-send",(function(t,e){e.rest_likes={},Object.keys(restLikes.object_types).forEach((function(t){var n=document.querySelectorAll('[data-rest-like-button][data-type="'.concat(t,'"]')),r=[];n.forEach((function(t){r.push(t.getAttribute("data-id"))})),e.rest_likes[t]=R(new Set(r))}))})),Q.on("heartbeat-tick",(function(t,e){if(e.rest_likes){var n,r=function(t,e){var n;if("undefined"==typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(n=$(t))){n&&(t=n);var r=0,i=function(){};return{s:i,n:function(){return r>=t.length?{done:!0}:{done:!1,value:t[r++]}},e:function(t){throw t},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,s=!1;return{s:function(){n=t[Symbol.iterator]()},n:function(){var t=n.next();return a=t.done,t},e:function(t){s=!0,o=t},f:function(){try{a||null==n.return||n.return()}finally{if(s)throw o}}}}(e.rest_likes);try{var i=function(){var t=n.value,e=t.objectType,r=t.objectId,i=t.count,o=t.countFormatted,a=restLikes.object_types[e].classnames,s=document.querySelectorAll('[data-rest-like-button][data-type="'.concat(e,'"][data-id="').concat(r,'"]'));Array.prototype.forEach.call(s,(function(t){var e=t.querySelector(".".concat(a.count));e.innerText=o,e.setAttribute("data-likes",i)}))};for(r.s();!(n=r.n()).done;)i()}catch(t){r.e(t)}finally{r.f()}}})),document.dispatchEvent(new CustomEvent("restLikes.initialized",{detail:{api:X}})),document.querySelectorAll("[data-rest-like-button]").forEach((function(t){return U(t)})),void 0!==window.MutationObserver&&new window.MutationObserver((function(t){t.forEach((function(t){t.addedNodes.length&&t.addedNodes.forEach((function(t){if("function"==typeof t.querySelectorAll){var e=t.querySelectorAll("[data-rest-like-button]");e.length&&e.forEach((function(t){return U(t)}))}}))}))})).observe(document.body,{childList:!0,subtree:!0}),document.body.addEventListener("click",(function(t){var e=t.target.closest("[data-rest-like-button]");e&&X.buttonClickHandler(e.getAttribute("data-type"),e.getAttribute("data-id"),e)}))}()}();