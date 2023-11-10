import { Path } from 'typescript';
import { describe, expect, test } from 'vitest';
import { setupTemplate } from './setupTemplate';

const setupTemplateCases = [
  {
    templatePath: __dirname + '/../templates/hello-world',
    expectedComponentLength: 0,
    expectedTemplateLength: 1,
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
  {
    templatePath: __dirname + '/../templates/with-import',
    expectedComponentLength: 0,
    expectedTemplateLength: 3
  },
];

describe('setupTemplate', () => {
  setupTemplateCases.map(({ templatePath, expectedTemplateLength }) => {
    test(templatePath, async () => {
      const res = await setupTemplate(templatePath as Path, {});
      expect([...new Set(res.map(el => el.outputPath))]).toHaveLength(expectedTemplateLength);
    });
  });
});