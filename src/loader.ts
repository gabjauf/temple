import { readFile } from 'fs/promises';
import { Glob } from 'glob';
import path from 'path';
import { Path } from 'typescript';

export type TemplateFile = {
  type: 'dir' | 'file';
  fullPath: string;
  relativePath: string;
  templateRootRelativePath: string;
  content: string;
};

export function extractComponentsFiles(templatePath: Path) {
  return Promise.all(
    Array.from(new Glob(`${templatePath}/components/**/*`, { withFileTypes: true, dot: true })).map(async (file) => {
      return formatFile(file, `${templatePath}/components`);
    })
  );
}

export async function extractTemplateFiles(templatePath: Path) {
  return Promise.all(
    Array.from(new Glob(`${templatePath}/template/**/*`, { withFileTypes: true, dot: true })).map(async (file) => {
      return formatFile(file, `${templatePath}/template`);
    })
  );
}

async function formatFile(file, templatePath: string): Promise<TemplateFile> {
  const fullPath = file.fullpath();
  const type = file.isDirectory() ? 'dir' : 'file';
  return {
    type,
    fullPath,
    relativePath: file.relative(),
    templateRootRelativePath: path.relative(templatePath, fullPath),
    content: type === 'file' ? (await readFile(fullPath)).toString() : null,
  };
}
