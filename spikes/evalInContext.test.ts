import { describe, test, expect } from 'vitest';
import { evalInContext } from './evalInContext';

describe('evalInContext', () => {
  test('should perform string concatenation', function () {
    const code = '"app" + "le"';
    const evaluated = evalInContext(code);
    expect(evaluated).toBe('apple');
  });

  test('should perform simple math', function () {
    const code = '9 + 1';
    const evaluated = evalInContext(code);
    expect(evaluated).toBe(10);
  });

  test('should have access to standard JavaScript library', function () {
    const code = 'Math.floor(22/7)';
    const evaluated = evalInContext(code);
    expect(evaluated).toBe(3);
  });

  test('should parse JSON', function () {
    const code = '{name: "Borat", hobbies: ["disco dance", "sunbathing"]}';
    const evaluated = evalInContext(code);
    expect(evaluated.name).toBe('Borat');
    expect(evaluated.hobbies[0]).toBe('disco dance');
    expect(evaluated.hobbies[1]).toBe('sunbathing');
  });

  test('should parse a function expression', function () {
    const code = '(function square(b) { return b * b; })(5)';
    const evaluated = evalInContext(code);
    expect(evaluated).toBe(25);
  });

  test('should not have access to Node.js objects', function () {
    const code = 'process';
    expect(() => evalInContext(code)).toThrow();
  });

  test('should not have access to Node.js objects (CWE-265)', function () {
    const code = "this.constructor.constructor('return process')()";
    expect(() => evalInContext(code)).toThrow();
  });

  test('should support context API', function () {
    const code = '{pid: process.pid, apple: a()}';
    const context = {
      process: process,
      a: () => {
        return 'APPLE';
      },
    };
    const evaluated = evalInContext(code, context);
    expect(evaluated.pid).toBeGreaterThan(0);
    expect(evaluated.apple).toBe('APPLE');
  });

  test('should not have access to Node.js objects (CWE-265)', function () {
    const code = `(function () {
      let ret = hasOwnProperty;
      ret.constructor('return process')().mainModule.require('child_process').execSync('touch flag');
  }());`;
    expect(() => evalInContext(code)).toThrow();
  });

  test('should not have access to Node.js objects (CWE-265)', function () {
    const code = `
    (function() { 
        try{ 
            valueOf()
        } catch(pp){
            pp.constructor.constructor('return process')().mainModule.require('child_process').execSync('touch flag'); 
        }
    })()
    `;
    expect(() => evalInContext(code)).toThrow();
  });

  test('should not have access to globalThis', function () {
    const code = `
    (function() { 
        let ret = globalThis;
        ret.__proto__.polluted = "ret.__proto__.polluted";
    })()
    `;
    expect(() => evalInContext(code)).toThrow();
  });

  test('should not have access to __proto__', function () {
    const code = `
    (function() { 
        __proto__.polluted = "ret.polluted"
        return (new Object()).__proto__;
    })()
    `;
    expect(() => evalInContext(code)).toThrow();
  });

  test('should not have access to process via constructors', function () {
    const code = `
    (function() { 
    try{ 
      propertyIsEnumerable.call();
     } catch(pp){
    
       pp.constructor.constructor('return process')().mainModule.require('child_process').execSync('touch flag');
    
    }
    })()
    `;
    expect(() => evalInContext(code)).toThrow();
  });
});
