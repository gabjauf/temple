import { Glob } from 'glob';
import { Path } from 'typescript';
import { describe, expect, test } from 'vitest';
import { extractComponentsFiles, extractTemplateFiles } from './loader';

const extractComponentTestCases = [
  {
    templatePath: __dirname + '/../templates/hello-world',
    expectedComponentLength: 0,
    expectedTemplateLength: 1
  },
  {
    templatePath: __dirname + '/../templates/fastify-openapi',
    expectedComponentLength: 1,
    expectedTemplateLength: 1
  },
  {
    templatePath: __dirname + '/../templates/base',
    expectedComponentLength: 0,
    expectedTemplateLength: 9
  },
];

describe('extractComponentsFiles', () => {
  extractComponentTestCases.map(({ templatePath, expectedComponentLength }) => {
    test(templatePath, () => {
      const res = extractComponentsFiles(templatePath as Path);
      expect(res).toHaveLength(expectedComponentLength);
    });
  });
});

describe('extractTemplateFiles', () => {
  extractComponentTestCases.map(({ templatePath, expectedTemplateLength }) => {
    test(templatePath, () => {
      const res = extractTemplateFiles(templatePath as Path);
      expect(res).toHaveLength(expectedTemplateLength);
    });
  });
});
