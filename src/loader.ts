import { Glob } from "glob";
import { Path } from "typescript";

export function extractComponentsFiles(templatePath: Path) {
  return Array.from(new Glob(`${templatePath}/components/**/*`, { withFileTypes: true, dot: true }));
}

export function extractTemplateFiles(templatePath: Path) {
  return Array.from(new Glob(`${templatePath}/template/**/*`, { withFileTypes: true, dot: true }));
}