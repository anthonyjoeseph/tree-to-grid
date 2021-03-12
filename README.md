# tree-to-grid

Example is adapted from [react-table](https://codesandbox.io/s/github/tannerlinsley/react-table/tree/master/examples/basic?from-embed) - `makeData` can be found there

```tsx
import { identity, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array'
import React from 'react';
import makeData from './lib/makeData';
import { Tree, branchValueGrid, leafValues } from './lib/TreeUtil';

type ValueOf<A> = A[keyof A]

interface Group<A> {
  Header: string
  columns: Column<A>[]
}
type Accessor<A> = ValueOf<{
  [K in keyof A]: {
    Header: string
    accessor: K
    Cell?: (val: A[K]) => React.ReactNode
  }
}>
type Column<A> = Group<A> | Accessor<A>

const toTree = <A,>(col: Column<A>): Tree<Accessor<A>, string> => 'columns' in col
  ? {
    type: 'Branch',
    value: col.Header,
    children: col.columns.map(toTree)
  }
  : {
    type: 'Leaf',
    value: col
  }

const Table = <A,>({ data, columns }: { data: A[]; columns: Column<A>[] }) => {
  const accessors = pipe(columns, A.map(toTree), A.chain(leafValues))
  return (
    <table>
      <thead>
        {branchValueGrid(columns.map(toTree)).map(headerGroup => (
          <tr>
            {headerGroup.map(({ value, numLeaves }) => (
              <th colSpan={numLeaves}>{pipe(value, O.toUndefined)}</th>
            ))}
          </tr>
        ))}
        <tr>
          {accessors.map(({Header}) => <th>{Header}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map(rowData => (
          <tr>
            {accessors.map(({Cell = identity, accessor}) => (
              <td>{Cell(rowData[accessor])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

type User = ReturnType<typeof makeData>[number]
const App = () => {
  const columns = React.useMemo(
    (): Column<User>[] => [
      {
        Header: 'Name',
        columns: [
          { Header: 'First Name', accessor: 'firstName' },
          { Header: 'Last Name', accessor: 'lastName' },
        ],
      },
      {
        Header: 'Info',
        columns: [
          { Header: 'Age', accessor: 'age' },
          { Header: 'Visits', accessor: 'visits' },
          { Header: 'Status', accessor: 'status' },
          { Header: 'Profile Progress', accessor: 'progress' },
        ],
      },
    ],
    []
  )
  const data = React.useMemo(() => makeData(20), [])
  return <Table columns={columns} data={data} />
}

export default App
```

## TODO

- better example
- tests
- different behavior for 3+ headers