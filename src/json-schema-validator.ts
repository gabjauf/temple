import Ajv from 'ajv/dist/2019';
import axios from 'axios';
import addFormats from 'ajv-formats';
import migrate from 'json-schema-migrate';
import { default as addMetaSchema2020 } from 'ajv/dist/refs/json-schema-2020-12';
import addFormats2019 from 'ajv-formats-draft2019';
import draft7MetaSchema from 'ajv/dist/refs/json-schema-draft-07.json';
import draft6MetaSchema from 'ajv/dist/refs/json-schema-draft-06.json';

const ajv = new Ajv({
  loadSchema: loadSchema,
  strictSchema: false,
});
ajv.addMetaSchema(draft7MetaSchema);
ajv.addMetaSchema(draft6MetaSchema);
addFormats(ajv);
addFormats2019(ajv);
(addMetaSchema2020 as any).default.call(ajv);

async function loadSchema(uri) {
  let { data, status } = await axios.get(uri);
  if (status >= 400) throw new Error('Loading error: ' + status);
  console.count('request');
  console.log(uri);
  if (data.$schema === 'http://json-schema.org/draft-04/schema#') {
    console.time('alterSchema');
    migrate.draft2019(data);
    console.timeEnd('alterSchema');
  }

  return data;
}

export default ajv;
