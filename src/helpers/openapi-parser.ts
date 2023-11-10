import OpenAPIParser from "@readme/openapi-parser";

export async function parseOpenApi(openApiSpec) {
  return OpenAPIParser.validate(openApiSpec);
}