# tree-to-grid

## installation

```
yarn add tree-to-grid
```

## example (react)

Example is adapted from [react-table](https://codesandbox.io/s/github/tannerlinsley/react-table/tree/master/examples/basic?from-embed)

```tsx
import React from 'react';
import { groupHeaders, accessors } from '../../../tree-to-grid/src/index';
import { Column } from '../../../tree-to-grid/src/column'
//         ^----- simple version of `Column`
//    you can extend this interface if you'd like
//    or you can use react-table's `Column` type

const Table = <A,>({ data, columns }: { data: A[]; columns: Column<A>[] }) => {
  const allAccessors = columns.flatMap(accessors)
  return (
    <table>
      <thead>
        {groupHeaders(columns).map(headerGroup => (
          <tr>
            {headerGroup.map(({ Header, numLeaves }) => (
              <th colSpan={numLeaves}>{Header}</th>
            ))}
          </tr>
        ))}
        <tr>
          {allAccessors.map((a) => <th>{a.Header}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map(rowData => (
          <tr>
            {allAccessors.map(({ accessor }) => (
              <td>{rowData[accessor]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

interface User {
  firstName: string
  lastName: string
  age: number
  visits: number
  status: string
  progress: string
}
const App = () => {
  const columns: Column<User>[] = [
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
  ]
  const data: User[] = [
    {
      firstName: 'Anthony',
      lastName: 'Gabriele',
      age: 27,
      visits: 23,
      status: 'waiting',
      progress: 'humble'
    },
    {
      firstName: 'Oleg',
      lastName: 'Kiselyov',
      age: 30,
      visits: 5,
      status: 'waiting',
      progress: 'advanced'
    }
  ]
  return <Table columns={columns} data={data} />
}
```

### output

![table output](table-screenshot.png)