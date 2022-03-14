import * as assert from 'assert';
import { accessors, groupHeaders } from '../src/index';
import { Column, Accessor } from '../src/column'
import { ReactNode } from 'react';

interface TableType { 
  a: number
  b: string
  c: string
  d: string
}

describe('Grid functions', () => {
  const columns: Column<TableType>[] = [
    {
      Header: 'A1',
      columns: [
        {
          Header: 'B',
          columns: [
            { Header: 'A header', accessor: 'a' },
            { Header: 'B header', accessor: 'b' }
          ]
        }
      ]
    },
    {
      Header: 'A2',
      columns: [
        { Header: 'C header', accessor: 'c' },
        { Header: 'D header', accessor: 'd' }
      ]
    }
  ]

  it('gets accessors', () => {
    const allAccessors: Accessor<TableType>[] = [
      { Header: 'A header', accessor: 'a' }, 
      { Header: 'B header', accessor: 'b' }, 
      { Header: 'C header', accessor: 'c' }, 
      { Header: 'D header', accessor: 'd' }
    ]
    const a = columns.flatMap(accessors)
    assert.deepStrictEqual(columns.flatMap(accessors), allAccessors);
  });

  it('gets group header grid', () => {
    const grid: { numLeaves: number; Header: ReactNode | undefined }[][] = [
      [ { numLeaves: 2, Header: 'A1' },  { numLeaves: 2, Header: undefined } ],
      [ { numLeaves: 2, Header: 'B' }, { numLeaves: 2, Header: 'A2' } ],
    ]
    assert.deepStrictEqual(groupHeaders(columns), grid);
  });

  it('accessors return empty array', () => {
    const accessors: Accessor<TableType>[] = [
      { Header: 'A header', accessor: 'a' }, { Header: 'B header', accessor: 'b' }
    ]
    assert.deepStrictEqual(groupHeaders(accessors), []);
  });
});
