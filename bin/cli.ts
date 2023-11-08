#! /usr/bin/env node

import * as Eta from 'eta';
import path from 'path';
import { glob, Glob } from 'glob';
import fs from 'fs/promises';
import fsSync from 'fs';
import inquirer from 'inquirer';
import { program } from 'commander';
import ajv from '../src/json-schema-validator';
import { Path } from 'typescript';
import { FileGenerationSetup, setupTemplate } from '../src/setupTemplate';

(async () => {

  program.requiredOption('-t, --template <file>').requiredOption('-o, --output <path>').option('--values <json>');

  program.parse();

  const options = program.opts();

  const config = JSON.parse(fsSync.readFileSync(`${options.template}/config.json`).toString());

  const settings = options.values
    ? fsSync.existsSync(options.values)
      ? JSON.parse(fsSync.readFileSync(options.values).toString())
      : JSON.parse(options.values)
    : config.prompt && (await inquirer.prompt(config.prompt));

  console.log(options, settings);

  const validate = await ajv.compileAsync(config.schema);
  const valid = validate(settings);

  if (!valid) {
    console.error(validate.errors);
    process.exit(1);
  }

  options.output = path.resolve(options.output);
  options.template = path.relative(process.cwd(), path.resolve(options.template));

  await fs.mkdir(options.output, { recursive: true });

  const toGenerate = await setupTemplate(options.template, settings, config);

  await writeTemplatedFiles(toGenerate, options.output);

})();

async function writeTemplatedFiles(toGenerate: FileGenerationSetup[], output: Path) {
  await Promise.all(
    toGenerate.map(async (fileToGenerate) => {
      await generateFile(fileToGenerate, output);
    })
  );
}

async function generateFile(
  { fullPath, newName, data, type, outputPath }: FileGenerationSetup,
  output: Path
): Promise<void> {
  let { ext, name, dir } = path.parse(outputPath);
  if (type === 'dir') {
    await fs.mkdir(path.join(output, outputPath), { recursive: true });
  } else if (isTemplateFile(ext)) {
    const file = fsSync.readFileSync(fullPath);
    await fs.writeFile(path.join(output, dir, newName || name), Eta.render(file.toString(), data));
  } else {
    await fs.cp(fullPath, path.join(output, outputPath));
  }
}

function isTemplateFile(ext: string) {
  return ext === '.ejs';
}
