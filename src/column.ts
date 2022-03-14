import { FunctionComponent, ReactNode } from 'react';

export type Column<D> =
  | Group<D>
  | Accessor<D>
  // unused, but needed for 'react-table' support
  | LooseAccessor<D>;

export type Accessor<D> =
  {
    [K in keyof D]: {
        Header: ReactNode;
        accessor: K;
        Cell?: ReactNode
        | FunctionComponent<{ 
          row: { cells: D[] }; 
          cell: D; 
          value: D[K];
        }>;
    }
  }[keyof D];

export type LooseAccessor<D> =
  { Header: string }
  | { accessor: keyof D; }
  | { id: keyof D }

export interface Group<D> {
  Header: ReactNode;
  Footer?: ReactNode;
  width?: number | string | undefined;
  minWidth?: number | undefined;
  maxWidth?: number | undefined;
  columns: Column<D>[];
}

export const isGroup = <A = any>(c: Column<A>): c is Group<A> => 'columns' in c
export const isAccessor = <A = any>(c: Column<A>): c is Accessor<A> => 'accessor' in c
