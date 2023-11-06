// export function evalInContext(js: string, context: Object = {}) {
//   //# Return the results of the in-line anonymous function we .call with the passed context
//   return Function(`fetch = undefined; this.constructor = undefined; return ${js}`).call(context);
// }

// export function evalInContext(js: string, context: Object = {}) {
//   //# Return the results of the in-line anonymous function we .call with the passed context
//   return function () {
//     return eval(`fetch = undefined; this.constructor = undefined;` + js);
//   }.call(context);
// }

import vm from 'vm'

export function evalInContext (code: string, context: Object = {}, opts?) {
  const sandbox = {}
  const resultKey = 'SAFE_EVAL_' + Math.floor(Math.random() * 1000000)
  sandbox[resultKey] = {}
  code = `(${clearContext.toString()})(); ${resultKey} = ${code}`
  if (context) {
    Object.keys(context).forEach(function (key) {
      sandbox[key] = context[key]
    })
  }
  vm.runInNewContext(code, sandbox, opts)
  return sandbox[resultKey]
}

function clearContext() {
  Function = null;
  globalThis.__proto__ = null;
  // console.log("PRRROUUUUUTTT", __proto__)
  // globalThis = null;
  globalThis.fetch = null;
  const keys = Object.getOwnPropertyNames(this).concat(['constructor']);
  keys.forEach((key) => {
    const item = this[key];
    if (!item || typeof item.constructor !== 'function') return;
    this[key].constructor = null;
  });
}