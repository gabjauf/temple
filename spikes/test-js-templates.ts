import fs from 'fs';
import { evalInContext } from './evalInContext';

const raw = fs.readFileSync('./template.tjs').toString();

const data = { prop1: 'zooi', prop2: 'zdoako' };

const templated = evalInContext(
  // `process = undefined; fetch = undefined; this.constructor = undefined;` +
    raw,
  data
);

function func(strings, ...values) {
  console.log(strings, values)
}

console.log(templated);

// console.log(templated);
// fs.writeFileSync('./templated.js', templated);
