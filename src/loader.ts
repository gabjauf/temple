import { readFile } from 'fs/promises';
import { Glob } from 'glob';
import { Path } from 'typescript';

export type TemplateFile = {
  type: 'dir' | 'file';
  fullPath: any;
  relativePath: any;
  content: string;
};

export function extractComponentsFiles(templatePath: Path) {
  return Promise.all(
    Array.from(new Glob(`${templatePath}/components/**/*`, { withFileTypes: true, dot: true })).map(async (file) => {
      return formatFile(file);
    })
  );
}

export async function extractTemplateFiles(templatePath: Path) {
  return Promise.all(
    Array.from(new Glob(`${templatePath}/template/**/*`, { withFileTypes: true, dot: true })).map(async (file) => {
      return formatFile(file);
    })
  );
}

async function formatFile(file): Promise<TemplateFile> {
  const fullPath = file.fullpath();
  const type = file.isDirectory() ? 'dir' : 'file';
  return {
    type,
    fullPath,
    relativePath: file.relative(),
    content: type === 'file' ? (await readFile(fullPath)).toString() : null,
  };
}
