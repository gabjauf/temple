import { describe, test, expect } from 'vitest';
import { generateFilenameCases } from './generateFilenameCases';

describe('generateFilenameCases', () => {
  const testCases = [
    {
      name: 'single array',
      input: ['[array]'],
      data: { array: ['1', '2', '3'] },
      expected: [
        { newName: '1', data: '1' },
        { newName: '2', data: '2' },
        { newName: '3', data: '3' },
      ],
    },
    {
      name: 'single object property',
      input: ['lala'],
      data: { lala: 'hey' },
      expected: [{ newName: 'hey', data: { lala: 'hey' } }],
    },
    {
      name: 'array then property',
      input: ['[array]', 'prop'],
      data: { array: [{ prop: '1' }, { prop: '2' }, { prop: '3' }] },
      expected: [
        { newName: '1', data: { prop: '1' } },
        { newName: '2', data: { prop: '2' } },
        { newName: '3', data: { prop: '3' } },
      ],
    },
    {
      name: 'property then array',
      input: ['prop', '[array]'],
      data: { prop: { array: ['1', '2', '3'] } },
      expected: [
        { newName: '1', data: '1' },
        { newName: '2', data: '2' },
        { newName: '3', data: '3' },
      ],
    },
    {
      name: 'property then array then prop',
      input: ['prop', '[array]', 'prop'],
      data: { prop: { array: [{ prop: '1' }, { prop: '2' }, { prop: '3' }] } },
      expected: [
        { newName: '1', data: { prop: '1' } },
        { newName: '2', data: { prop: '2' } },
        { newName: '3', data: { prop: '3' } },
      ],
    },
  ];

  testCases.map(({ input, data, expected, name }) => {
    test.concurrent(name, () => {
      expect(generateFilenameCases(input, data)).toStrictEqual(expected);
    });
  });
});
