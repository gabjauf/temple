import * as Eta from 'eta';
import path from 'path';
import fs from 'fs/promises';
import { filenameGrammar, filenameSemantics } from './filename-matcher';
import { generateFilenameCases } from './generateFilenameCases';
import { Path } from 'typescript';
import { extractComponentsFiles, extractTemplateFiles } from './loader';

export const FILENAME_TEMPLATE_MARKER = '$$';

export type FileGenerationSetup = {
  type: 'file' | 'dir';
  fullPath: string;
  outputPath: string;
  newName?: string;
  data?: {
    item?: any;
    global: any;
  };
};

export async function setupTemplate(templatePath: Path, data: any, config) {
  console.log('CALL SETUP TEMPLATE', templatePath, data, config)
  const components = await extractComponentsFiles(templatePath);
  components.forEach((found) => {
    if (found.type === 'dir') {
      return;
    }
    let { name } = path.parse(found.fullPath);
    Eta.templates.define(name, Eta.compile(found.content));
  });

  const templateFiles = await extractTemplateFiles(templatePath);

  const imports = config.imports && Object.keys(config.imports).reduce((res, key) => {
    res[key] = config.imports[key];
    return res;
  }, {})

  const toGenerate = await Promise.all(
    templateFiles.flatMap(async (found) => {
      const { name, ext, dir } = path.parse(found.fullPath);
      if (`${name}${ext}` === 'imports.temple.json') {
        console.log("IMPORTS", imports);
        const localImports = JSON.parse((await fs.readFile(found.fullPath)).toString());
        const importsTemplatePath = path.relative(process.cwd(), path.resolve(path.join(templatePath, imports[localImports.source])));
        console.log("LOCAL", localImports, importsTemplatePath)
        const localConfig = JSON.parse((await fs.readFile(`${importsTemplatePath}/config.json`)).toString());
        return setupTemplate(importsTemplatePath as Path, data, localConfig);
        // return setupFileGeneration(found, templatePath, data);
      } else {
        return setupFileGeneration(found, templatePath, data);
      }
    })
  );

  console.log(toGenerate);

  return toGenerate.flat();
}

export function setupFileGeneration(file, templatePath: Path, data: any): FileGenerationSetup | FileGenerationSetup[] {
  const fullPath = file.relativePath;
  if (file.type === 'dir') {
    return {
      ...file,
      outputPath: getOutputPath(fullPath, templatePath),
    };
  }

  let { name, dir } = path.parse(fullPath);
  if (isFileNameTemplated(name)) {
    const expression = extractTemplateExpressionFromFileName(name);
    const match = filenameGrammar.match(expression);
    if (match.failed()) {
      throw new Error(`Error while parsing templated name for file ${name}`);
    }
    const propList = filenameSemantics(match).toList();
    const nameList = generateFilenameCases(propList, data);
    return nameList.map(({ newName, data }) => {
      const fileName = getNewFileName(name, expression, newName);
      return {
        type: 'file',
        fullPath,
        newName: fileName,
        outputPath: getOutputPath(dir, templatePath),
        data: { item: data, global: data },
      };
    });
  } else {
    return {
      type: 'file',
      fullPath,
      outputPath: getOutputPath(fullPath, templatePath),
      data: { global: data },
    };
  }
}

export function isFileNameTemplated(name: string) {
  return (
    name.indexOf(FILENAME_TEMPLATE_MARKER) >= 0 &&
    name.indexOf(FILENAME_TEMPLATE_MARKER) !== name.lastIndexOf(FILENAME_TEMPLATE_MARKER)
  );
}

export function getNewFileName(name: string, expression: string, newName: any) {
  return name.replace(`${FILENAME_TEMPLATE_MARKER}${expression}${FILENAME_TEMPLATE_MARKER}`, newName as string);
}

export function extractTemplateExpressionFromFileName(name: string) {
  return name.substring(
    name.indexOf(FILENAME_TEMPLATE_MARKER) + FILENAME_TEMPLATE_MARKER.length,
    name.lastIndexOf(FILENAME_TEMPLATE_MARKER)
  );
}

export function getOutputPath(fullPath: string, templatePath: string): string {
  return fullPath.replace(`${templatePath}/template`, '');
}
