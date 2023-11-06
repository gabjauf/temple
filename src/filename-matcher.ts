import {grammar} from 'ohm-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// const modulePath = path.dirname(fileURLToPath(import.meta.url))

const grammarFile = path.resolve(__dirname, './filename-grammar.ohm')

const contents = fs.readFileSync(grammarFile, 'utf-8');

export const filenameGrammar = grammar(contents);

export const filenameSemantics = filenameGrammar.createSemantics()

filenameSemantics.addOperation('toList()', {
  Start(list): any {
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
