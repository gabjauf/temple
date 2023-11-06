import fs from 'fs';
import {grammar} from 'ohm-js';
import { toAST } from 'ohm-js/extras';
const contents = fs.readFileSync('filename-grammar.ohm', 'utf-8');



const myGrammar = grammar(contents);

const res = myGrammar.match('para.[dz].prop.[zdza].[zd]')

const sem = myGrammar.createSemantics()

// sem.addOperation('toList()', {
//   Exp(n) {
//     return n.children.flatMap(c => c.toList())
//   },
//   // PropertyExp(exp, dot, property) {
//   //   console.log(this)
//   //   return [exp.toList(), property.toList()]
//   //   // return this.children.flatMap(c => c.toList())
//   // },
//   property(l) {
//     return l.sourceString;
//   },
//   // table(a, b, c) {
//   //   console.log(a, b, c, this)
//   //   return [this.zda()]
//   // },
//   // letter(l) {
//   //   return this.sourceString;
//   // },
//   _terminal() {
//     return 
//   }
// })

sem.addOperation('toList()', {
  Start(list) {
    return list.asIteration().children.map(c => c.toList());
  },
  property(l) {
    return { type: l, txt: this.sourceString };
  },
  table(a, b, c) {
    return this.sourceString;
  },
  letter(l) {
    return this.sourceString;
  }
});

console.log(sem(res).toList())