"use strict";var StyleNode=function(){this.start=0,this.end=0,this.previous=null,this.parent=null,this.rules=null,this.parsedCssText="",this.cssText="",this.atRule=!1,this.type=0,this.keyframesName="",this.selector="",this.parsedSelector=""};function parse(e){return parseCss(lex(e=clean(e)),e)}function clean(e){return e.replace(RX.comments,"").replace(RX.port,"")}function lex(e){var t=new StyleNode;t.start=0,t.end=e.length;for(var r,n,s=t,o=0,a=e.length;o<a;o++){e[o]===OPEN_BRACE?(s.rules||(s.rules=[]),n=(r=s).rules[r.rules.length-1]||null,(s=new StyleNode).start=o+1,s.parent=r,s.previous=n,r.rules.push(s)):e[o]===CLOSE_BRACE&&(s.end=o+1,s=s.parent||t)}return t}function parseCss(e,t){var r,n,s=t.substring(e.start,e.end-1);e.parsedCssText=e.cssText=s.trim(),e.parent&&(r=e.previous?e.previous.end:e.parent.start,s=(s=(s=_expandUnicodeEscapes(s=t.substring(r,e.start-1))).replace(RX.multipleSpaces," ")).substring(s.lastIndexOf(";")+1),n=e.parsedSelector=e.selector=s.trim(),e.atRule=0===n.indexOf(AT_START),e.atRule?0===n.indexOf(MEDIA_START)?e.type=types.MEDIA_RULE:n.match(RX.keyframesRule)&&(e.type=types.KEYFRAMES_RULE,e.keyframesName=e.selector.split(RX.multipleSpaces).pop()):0===n.indexOf(VAR_START)?e.type=types.MIXIN_RULE:e.type=types.STYLE_RULE);var o=e.rules;if(o)for(var a=0,i=o.length,l=void 0;a<i&&(l=o[a]);a++)parseCss(l,t);return e}function _expandUnicodeEscapes(e){return e.replace(/\\([0-9a-f]{1,6})\s/gi,function(){for(var e=arguments[1],t=6-e.length;t--;)e="0"+e;return"\\"+e})}var types={STYLE_RULE:1,KEYFRAMES_RULE:7,MEDIA_RULE:4,MIXIN_RULE:1e3},OPEN_BRACE="{",CLOSE_BRACE="}",RX={comments:/\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,port:/@import[^;]*;/gim,customProp:/(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,mixinProp:/(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,mixinApply:/@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,varApply:/[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,keyframesRule:/^@[^\s]*keyframes/,multipleSpaces:/\s+/g},VAR_START="--",MEDIA_START="@media",AT_START="@";function findRegex(e,t,r){e.lastIndex=0;var n=t.substring(r).match(e);if(n){var s=r+n.index;return{start:s,end:s+n[0].length}}return null}var VAR_USAGE_START=/\bvar\(/,VAR_ASSIGN_START=/\B--[\w-]+\s*:/,COMMENTS=/\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,TRAILING_LINES=/^[\t ]+\n/gm;function resolveVar(e,t,r){return e[t]?e[t]:r?executeTemplate(r,e):""}function findVarEndIndex(e,t){for(var r=0,n=t;n<e.length;n++){var s=e[n];if("("===s)r++;else if(")"===s&&--r<=0)return n+1}return n}function parseVar(e,t){var r=findRegex(VAR_USAGE_START,e,t);if(!r)return null;var n=findVarEndIndex(e,r.start),s=e.substring(r.end,n-1).split(","),o=s[0],a=s.slice(1);return{start:r.start,end:n,propName:o.trim(),fallback:0<a.length?a.join(",").trim():void 0}}function compileVar(e,t,r){var n=parseVar(e,r);if(!n)return t.push(e.substring(r,e.length)),e.length;var s=n.propName,o=null!=n.fallback?compileTemplate(n.fallback):void 0;return t.push(e.substring(r,n.start),function(e){return resolveVar(e,s,o)}),n.end}function executeTemplate(e,t){for(var r="",n=0;n<e.length;n++){var s=e[n];r+="string"==typeof s?s:s(t)}return r}function findEndValue(e,t){for(var r=!1,n=!1,s=t;s<e.length;s++){var o=e[s];if(r)n&&'"'===o&&(r=!1),n||"'"!==o||(r=!1);else if('"'===o)n=r=!0;else if("'"===o)n=!(r=!0);else{if(";"===o)return s+1;if("}"===o)return s}}return s}function removeCustomAssigns(e){for(var t="",r=0;;){var n=findRegex(VAR_ASSIGN_START,e,r),s=n?n.start:e.length;if(t+=e.substring(r,s),!n)break;r=findEndValue(e,s)}return t}function compileTemplate(e){var t=0;e=removeCustomAssigns(e=e.replace(COMMENTS,"")).replace(TRAILING_LINES,"");for(var r=[];t<e.length;)t=compileVar(e,r,t);return r}function resolveValues(e){var t={};e.forEach(function(e){e.declarations.forEach(function(e){t[e.prop]=e.value})});for(var s={},r=Object.entries(t),n=function(e){var n=!1;if(r.forEach(function(e){var t=e[0],r=executeTemplate(e[1],s);r!==s[t]&&(s[t]=r,n=!0)}),!n)return"break"},o=0;o<10&&"break"!==n();o++);return s}function getSelectors(e,r){if(void 0===r&&(r=0),!e.rules)return[];var n=[];return e.rules.filter(function(e){return e.type===types.STYLE_RULE}).forEach(function(e){var t=getDeclarations(e.cssText);0<t.length&&e.parsedSelector.split(",").forEach(function(e){e=e.trim(),n.push({selector:e,declarations:t,specificity:computeSpecificity(),nu:r})}),r++}),n}function computeSpecificity(e){return 1}var IMPORTANT="!important",FIND_DECLARATIONS=/(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};{])+)|\{([^}]*)\}(?:(?=[;\s}])|$))/gm;function getDeclarations(e){for(var t,r=[];t=FIND_DECLARATIONS.exec(e.trim());){var n=normalizeValue(t[2]),s=n.value,o=n.important;r.push({prop:t[1].trim(),value:compileTemplate(s),important:o})}return r}function normalizeValue(e){var t=(e=e.replace(/\s+/gim," ").trim()).endsWith(IMPORTANT);return t&&(e=e.substr(0,e.length-IMPORTANT.length).trim()),{value:e,important:t}}function getActiveSelectors(t,e,r){var n=[],s=getScopesForElement(e,t);return r.forEach(function(e){return n.push(e)}),s.forEach(function(e){return n.push(e)}),sortSelectors(getSelectorsForScopes(n).filter(function(e){return matches(t,e.selector)}))}function getScopesForElement(e,t){for(var r=[];t;){var n=e.get(t);n&&r.push(n),t=t.parentElement}return r}function getSelectorsForScopes(e){var t=[];return e.forEach(function(e){t.push.apply(t,e.selectors)}),t}function sortSelectors(e){return e.sort(function(e,t){return e.specificity===t.specificity?e.nu-t.nu:e.specificity-t.specificity}),e}function matches(e,t){return":root"===t||"html"===t||e.matches(t)}function parseCSS(e){var t=parse(e),r=compileTemplate(e);return{original:e,template:r,selectors:getSelectors(t),usesCssVars:1<r.length}}function addGlobalStyle(e,t){if(e.some(function(e){return e.styleEl===t}))return!1;var r=parseCSS(t.textContent);return r.styleEl=t,e.push(r),!0}function updateGlobalScopes(e){var t=resolveValues(getSelectorsForScopes(e));e.forEach(function(e){e.usesCssVars&&(e.styleEl.textContent=executeTemplate(e.template,t))})}function reScope(t,r){var e=t.template.map(function(e){return"string"==typeof e?replaceScope(e,t.scopeId,r):e}),n=t.selectors.map(function(e){return Object.assign(Object.assign({},e),{selector:replaceScope(e.selector,t.scopeId,r)})});return Object.assign(Object.assign({},t),{template:e,selectors:n,scopeId:r})}function replaceScope(e,t,r){return replaceAll(e,"\\."+t,"."+r)}function replaceAll(e,t,r){return e.replace(new RegExp(t,"g"),r)}function loadDocument(e,t){return loadDocumentStyles(e,t),loadDocumentLinks(e,t).then(function(){updateGlobalScopes(t)})}function startWatcher(e,t){"undefined"!=typeof MutationObserver&&new MutationObserver(function(){loadDocumentStyles(e,t)&&updateGlobalScopes(t)}).observe(document.head,{childList:!0})}function loadDocumentLinks(e,t){for(var r=[],n=e.querySelectorAll('link[rel="stylesheet"][href]:not([data-no-shim])'),s=0;s<n.length;s++)r.push(addGlobalLink(e,t,n[s]));return Promise.all(r)}function loadDocumentStyles(e,t){return Array.from(e.querySelectorAll("style:not([data-styles]):not([data-no-shim])")).map(function(e){return addGlobalStyle(t,e)}).some(Boolean)}function addGlobalLink(r,n,s){var o=s.href;return fetch(o).then(function(e){return e.text()}).then(function(e){var t;hasCssVariables(e)&&s.parentNode&&(hasRelativeUrls(e)&&(e=fixRelativeUrls(e,o)),(t=r.createElement("style")).setAttribute("data-styles",""),t.textContent=e,addGlobalStyle(n,t),s.parentNode.insertBefore(t,s),s.remove())}).catch(function(e){console.error(e)})}var CSS_VARIABLE_REGEXP=/[\s;{]--[-a-zA-Z0-9]+\s*:/m;function hasCssVariables(e){return-1<e.indexOf("var(")||CSS_VARIABLE_REGEXP.test(e)}var CSS_URL_REGEXP=/url[\s]*\([\s]*['"]?(?!(?:https?|data)\:|\/)([^\'\"\)]*)[\s]*['"]?\)[\s]*/gim;function hasRelativeUrls(e){return CSS_URL_REGEXP.lastIndex=0,CSS_URL_REGEXP.test(e)}function fixRelativeUrls(e,t){var n=t.replace(/[^/]*$/,"");return e.replace(CSS_URL_REGEXP,function(e,t){var r=n+t;return e.replace(t,r)})}var CustomStyle=function(){function e(e,t){this.win=e,this.doc=t,this.count=0,this.hostStyleMap=new WeakMap,this.hostScopeMap=new WeakMap,this.globalScopes=[],this.scopesMap=new Map,this.didInit=!1}return e.prototype.i=function(){var t=this;return this.didInit||!this.win.requestAnimationFrame?Promise.resolve():(this.didInit=!0,new Promise(function(e){t.win.requestAnimationFrame(function(){startWatcher(t.doc,t.globalScopes),loadDocument(t.doc,t.globalScopes).then(function(){return e()})})}))},e.prototype.addLink=function(e){var t=this;return addGlobalLink(this.doc,this.globalScopes,e).then(function(){t.updateGlobal()})},e.prototype.addGlobalStyle=function(e){addGlobalStyle(this.globalScopes,e)&&this.updateGlobal()},e.prototype.createHostStyle=function(e,t,r,n){if(this.hostScopeMap.has(e))throw new Error("host style already created");var s=this.registerHostTemplate(r,t,n),o=this.doc.createElement("style");return o.setAttribute("data-no-shim",""),s.usesCssVars?n?(o["s-sc"]=t=s.scopeId+"-"+this.count,o.textContent="/*needs update*/",this.hostStyleMap.set(e,o),this.hostScopeMap.set(e,reScope(s,t)),this.count++):(s.styleEl=o,s.usesCssVars||(o.textContent=executeTemplate(s.template,{})),this.globalScopes.push(s),this.updateGlobal(),this.hostScopeMap.set(e,s)):o.textContent=r,o},e.prototype.removeHost=function(e){var t=this.hostStyleMap.get(e);t&&t.remove(),this.hostStyleMap.delete(e),this.hostScopeMap.delete(e)},e.prototype.updateHost=function(e){var t,r,n=this.hostScopeMap.get(e);n&&n.usesCssVars&&n.isScoped&&((t=this.hostStyleMap.get(e))&&(r=resolveValues(getActiveSelectors(e,this.hostScopeMap,this.globalScopes)),t.textContent=executeTemplate(n.template,r)))},e.prototype.updateGlobal=function(){updateGlobalScopes(this.globalScopes)},e.prototype.registerHostTemplate=function(e,t,r){var n=this.scopesMap.get(t);return n||((n=parseCSS(e)).scopeId=t,n.isScoped=r,this.scopesMap.set(t,n)),n},e}();!function(e){!e||e.__cssshim||e.CSS&&e.CSS.supports&&e.CSS.supports("color","var(--c)")||(e.__cssshim=new CustomStyle(e,e.document))}("undefined"!=typeof window&&window);