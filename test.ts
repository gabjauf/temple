import OpenAPIParser from "@readme/openapi-parser";
import fs from 'fs';

OpenAPIParser.validate('./petstore.json', (err, api) => {
  if (err) {
    console.error(err.message);
  }
  else {
    console.log("API name: %s, Version: %s", api.info.title, api.info.version);

    console.log(JSON.stringify(api['components'], null, 2))
  }
});