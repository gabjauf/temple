import OpenAPIParser from "@readme/openapi-parser";
import fs from 'fs';

OpenAPIParser.validate('./petstore.json', (err, api) => {
  if (err) {
    console.error(err.message);
  }
  else {
    console.log("API name: %s, Version: %s", api.info.title, api.info.version);

    console.log(JSON.stringify(api.paths['/pet'].put.responses['200'].content, null, 2))
    console.log(JSON.stringify(api.components, null, 2))
  }
});