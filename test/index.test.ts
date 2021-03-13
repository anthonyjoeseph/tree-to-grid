import * as assert from 'assert';
import { Tree, leafValues, branchValueGrid } from '../src/index';

describe('Grid functions', () => {

  const branches: Tree<number, string>[] = [
    {
      type: 'Branch',
      value: 'A1',
      children: [
        {
          type: 'Branch',
          value: 'B',
          children: [
            { type: 'Leaf', value: 1 },
            { type: 'Leaf', value: 2 }
          ]
        }
      ]
    },
    {
      type: 'Branch',
      value: 'A2',
      children: [
        { type: 'Leaf', value: 3 },
        { type: 'Leaf', value: 4 }
      ]
    }
  ]

  it('gets leaf values', () => {
    const allLeaves: number[] = [1, 2, 3, 4]
    assert.deepStrictEqual(branches.flatMap(leafValues), allLeaves);
  });

  it('gets branch value grid', () => {
    const grid: { numLeaves: number; value: string | undefined }[][] = [
      [ { numLeaves: 2, value: 'A1' },  { numLeaves: 2, value: undefined } ],
      [ { numLeaves: 2, value: 'B' }, { numLeaves: 2, value: 'A2' } ],
    ]
    assert.deepStrictEqual(branchValueGrid(branches), grid);
  });
});