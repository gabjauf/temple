import fs from 'fs';
import ajv from './json-schema-validator';

let validate = await ajv.compileAsync({
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['schema'],
  properties: {
    schema: {
      // $id: 'openApi3',
      $ref: 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/schemas/v3.0/schema.json',
      // $ref: 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/schemas/v3.1/schema.json',
    },
  },
});


const file = JSON.parse(fs.readFileSync('./petstore.json').toString());

console.log(validate);

const valid = validate({ schema: file });

console.log(valid, validate.errors);

process.exit();
