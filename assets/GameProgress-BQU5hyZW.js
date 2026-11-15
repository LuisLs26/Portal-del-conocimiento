import{c as n,j as s}from"./main-YeW3jQ3I.js";/**
 * @license lucide-react v1.55.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c={name:"rotate-ccw",size:24,node:[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]};c.node;const d=n(c);function o({title:a,hint:e}){return s.jsxs("div",{className:"game-heading",children:[s.jsx("h1",{children:a}),e&&s.jsx("p",{children:e})]})}function t({value:a,total:e,label:r}){return s.jsxs("div",{className:"game-progress",children:[s.jsxs("span",{children:[r,": ",a," de ",e]}),s.jsx("progress",{className:"sr-only","aria-label":r,value:a,max:e}),s.jsx("div",{className:"progress-track","aria-hidden":"true",children:s.jsx("div",{className:"progress-fill",style:{transform:`scaleX(${a/e})`}})})]})}export{o as G,d as R,t as a};
