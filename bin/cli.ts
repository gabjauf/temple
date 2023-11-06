#! /usr/bin/env node

import * as Eta from 'eta';
import path from 'path';
import { glob, Glob } from 'glob';
import fs from 'fs/promises';
import fsSync from 'fs';
import inquirer from 'inquirer';
import { program } from 'commander';
import ajv from '../src/json-schema-validator';
import { filenameGrammar, filenameSemantics } from '../src/filename-matcher';
import { generateFilenameCases } from '../src/generateFilenameCases';

(async () => {
  const templateBase = '../templates';

  program.requiredOption('-t, --template <file>').requiredOption('-o, --output <path>').option('--values <json>');

  program.parse();

  const options = program.opts();

  const config = JSON.parse(fsSync.readFileSync(`${options.template}/config.json`).toString());

  const settings =
    (options.values && fsSync.existsSync(options.values)
      ? JSON.parse(fsSync.readFileSync(options.values).toString())
      : JSON.parse(options.value)) || (await inquirer.prompt(config.prompt));
  console.log(options, settings);

  const validate = await ajv.compileAsync(config.schema);
  const valid = validate(settings);

  if (!valid) {
    console.error(validate.errors);
    process.exit(1);
  }

  options.output = path.resolve(options.output);
  options.template = path.resolve(options.template);

  Eta.configure({
    views: path.resolve(templateBase),
    root: options.template,
  });

  await fs.mkdir(options.output, { recursive: true });
  const components = new Glob(`${options.template}/components/**/*`, { withFileTypes: true });

  components.stream().on('data', (found) => {
    if (found.isDirectory()) {
      return;
    }
    let { name } = path.parse(found.fullpath());
    Eta.templates.define(name, Eta.compile(fsSync.readFileSync(found.fullpath()).toString()));
  });

  const g3 = new Glob(`${options.template}/template/**/*`, { withFileTypes: true });
  const FILENAME_TEMPLATE_MARKER = '$$';
  g3.stream().on('data', (found) => {
    const fullPath = found.fullpath();
    if (found.isDirectory()) {
      return fsSync.mkdirSync(path.join(options.output, getOutputPath(fullPath)), { recursive: true });
    }

    let { name } = path.parse(fullPath);
    if (isFileNameTemplated(name)) {
      const expression = name.substring(
        name.indexOf(FILENAME_TEMPLATE_MARKER) + FILENAME_TEMPLATE_MARKER.length,
        name.lastIndexOf(FILENAME_TEMPLATE_MARKER)
      );
      const match = filenameGrammar.match(expression);
      if (match.failed()) {
        throw new Error(`Error while parsing templated name for file ${name}`);
      }
      const propList = filenameSemantics(match).toList();
      let nameList = generateFilenameCases(propList, settings);
      console.log(nameList);
      nameList.forEach(({ newName, data }) => {
        if (typeof data === 'string') {
          const fileName = name.replace(
            `${FILENAME_TEMPLATE_MARKER}${expression}${FILENAME_TEMPLATE_MARKER}`,
            newName as string
          );
          return generateFile(fullPath, fileName, { item: data, global: settings });
        } else {
          const fileName = name.replace(
            `${FILENAME_TEMPLATE_MARKER}${expression}${FILENAME_TEMPLATE_MARKER}`,
            newName as string
          );
          return generateFile(fullPath, fileName, { item: data, global: settings });
        }
      });
    } else {
      generateFile(fullPath, undefined, { global: settings });
    }
  });

  function generateFile(fullPath: string, targetName?: string, data?: any): void {
    let { ext, name, dir } = path.parse(fullPath);
    if (isTemplateFile(ext)) {
      const file = fsSync.readFileSync(fullPath);
      return fsSync.writeFileSync(
        path.join(options.output, getOutputPath(dir), targetName || name),
        Eta.render(file.toString(), data || settings)
      );
    }
    return fsSync.cpSync(fullPath, path.join(options.output, getOutputPath(fullPath)));
  }

  function isFileNameTemplated(name: string) {
    return (
      name.indexOf(FILENAME_TEMPLATE_MARKER) >= 0 &&
      name.indexOf(FILENAME_TEMPLATE_MARKER) !== name.lastIndexOf(FILENAME_TEMPLATE_MARKER)
    );
  }

  function isTemplateFile(ext: string) {
    return ext === '.ejs';
  }

  function getOutputPath(fullPath: string): string {
    return fullPath.replace(`${options.template}/template`, '');
  }
})();
