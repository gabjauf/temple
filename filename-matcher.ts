import {grammar} from 'ohm-js';
import fs from 'fs';

const contents = fs.readFileSync('filename-grammar.ohm', 'utf-8');

export const filenameGrammar = grammar(contents);

export const filenameSemantics = filenameGrammar.createSemantics()

filenameSemantics.addOperation('toList()', {
  Start(list) {
    return list.asIteration().children.map(c => c.toList());
  },
  property(l) {
    return this.sourceString;
  },
  table(a, b, c) {
    return this.sourceString;
  },
  letter(l) {
    return this.sourceString;
  }
});
