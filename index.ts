import * as Eta from 'eta';
import path from 'path';
import { glob, Glob } from 'glob';
import fs from 'fs/promises';
import fsSync from 'fs';
import inquirer from 'inquirer';
import { splitFileExtension } from './util';
import openApiSpec from './out.json';

const output = 'out';
const templateBase = 'templates';
const input = 'templates/base';

const settings = await inquirer.prompt([
  {
    name: 'name',
    message: 'What is the name of your project?',
  },
]);

console.log(openApiSpec.paths);

Eta.configure({
  views: path.resolve(templateBase),
});

await fs.mkdir(output, { recursive: true });

const g3 = new Glob(`./${input}/**/*`, { withFileTypes: true });
g3.stream().on('data', (path) => {
  const relativePath = path.relative();
  if (path.isDirectory()) {
    fsSync.mkdirSync(`${output}${getOutputPath(relativePath)}`, { recursive: true });
  } else {
    const [extension, filename] = splitFileExtension(relativePath);
    if (extension === 'ejs') {
      const file = fsSync.readFileSync(relativePath);
      return fsSync.writeFileSync(
        `${output}${getOutputPath(filename)}`,
        Eta.render(file.toString(), settings)
      );
    } else {
      fsSync.cpSync(relativePath, `${output}${getOutputPath(relativePath)}`);
    }
  }
});


function getOutputPath(relativePath: string): string {
  return relativePath.replace(input, '');
}
