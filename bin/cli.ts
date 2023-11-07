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
import { Path } from 'typescript';
import { extractComponentsFiles, extractTemplateFiles } from '../src/loader';

const FILENAME_TEMPLATE_MARKER = '$$';

(async () => {
  const templateBase = '../templates';

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
  options.template = path.resolve(options.template);

  Eta.configure({
    views: path.resolve(templateBase),
    root: options.template,
  });

  await fs.mkdir(options.output, { recursive: true });
  const components = extractComponentsFiles(options.template);
  components.forEach((found) => {
    if (found.isDirectory()) {
      return;
    }
    let { name } = path.parse(found.fullpath());
    Eta.templates.define(name, Eta.compile(fsSync.readFileSync(found.fullpath()).toString()));
  });

  const templateFiles = extractTemplateFiles(options.template);

  const toGenerate = templateFiles.flatMap((found) => {
    return setupFileGeneration(found);
  });

  type FileGenerationSetup = {
    type: 'file' | 'dir';
    fullPath: Path;
    newName?: string;
    data?: {
      item?: any;
      global: any;
    };
  };

  function setupFileGeneration(file): FileGenerationSetup | FileGenerationSetup[] {
    const fullPath = file.fullpath();
    if (file.isDirectory()) {
      return {
        type: 'dir',
        fullPath,
      };
    }

    let { name } = path.parse(fullPath);
    if (isFileNameTemplated(name)) {
      const expression = extractTemplateExpressionFromFileName(name);
      const match = filenameGrammar.match(expression);
      if (match.failed()) {
        throw new Error(`Error while parsing templated name for file ${name}`);
      }
      const propList = filenameSemantics(match).toList();
      const nameList = generateFilenameCases(propList, settings);
      return nameList.map(({ newName, data }) => {
        const fileName = getNewFileName(name, expression, newName);
        return {
          type: 'file',
          fullPath,
          newName: fileName,
          data: { item: data, global: settings },
        };
      });
    } else {
      return {
        type: 'file',
        fullPath,
        data: { global: settings },
      };
    }
  }

  Promise.all(
    toGenerate.map(async (fileToGenerate) => {
      await generateFile(fileToGenerate);
    })
  );

  async function generateFile({ fullPath, newName, data, type }: FileGenerationSetup): Promise<void> {
    let { ext, name, dir } = path.parse(fullPath);
    if (type === 'dir') {
      await fs.mkdir(path.join(options.output, getOutputPath(fullPath)), { recursive: true });
    } else if (isTemplateFile(ext)) {
      const file = fsSync.readFileSync(fullPath);
      await fs.writeFile(
        path.join(options.output, getOutputPath(dir), newName || name),
        Eta.render(file.toString(), data || settings)
      );
    } else {
      await fs.cp(fullPath, path.join(options.output, getOutputPath(fullPath)));
    }
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

function getNewFileName(name: string, expression: string, newName: any) {
  return name.replace(`${FILENAME_TEMPLATE_MARKER}${expression}${FILENAME_TEMPLATE_MARKER}`, newName as string);
}

function extractTemplateExpressionFromFileName(name: string) {
  return name.substring(
    name.indexOf(FILENAME_TEMPLATE_MARKER) + FILENAME_TEMPLATE_MARKER.length,
    name.lastIndexOf(FILENAME_TEMPLATE_MARKER)
  );
}
