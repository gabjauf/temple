import * as Eta from 'eta';
import fsSync from 'fs';

const routeTemplate = fsSync.readFileSync('');

export function OpenApiGenerator(openApiSpec) {
  return {
    generateRoute(route) {
      return Eta.render()
    }
  }
}