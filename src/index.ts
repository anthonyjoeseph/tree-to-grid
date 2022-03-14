import { sum } from 'fp-ts-std/Array';
import * as A from 'fp-ts/Array';
import * as NEA from 'fp-ts/NonEmptyArray'
import * as N from 'fp-ts/number'
import * as Eq from 'fp-ts/Eq'
import * as Ord from 'fp-ts/Ord'
import { flow, identity, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { Column, Accessor, isGroup, isAccessor } from './column';
import { ReactNode } from 'react';


const numAccessors = <C extends Column<any>>(column: C): number => isGroup(column)
  ? pipe(column.columns, A.map(numAccessors), sum)
  : 1

const max: (ns: number[]) => number = flow(NEA.fromArray, O.fold(() => 0, NEA.max(Ord.ordNumber)))

const level = <C extends Column<any>>(column: C): number => isGroup(column)
  ? pipe(column.columns, A.map(level), max) + 1
  : 1

const sameLevelEq = <C extends Column<any>>() => pipe(
  N.Eq,
  Eq.contramap<number, C>(level)
)

const groupChildGroups = <A extends Column<any>, C>(
  maxLevel: number,
  onNextLevel: (parent: A) => (childrenGroupedByLevel: Array<NEA.NonEmptyArray<A>>) => C[],
  onLowerLevel: (lowerLevel: A) => C,
) => A.chain((b: A) => isGroup(b) && level(b) === maxLevel
  ? pipe(
    b.columns,
    NEA.group(sameLevelEq<Column<any>>()),
    onNextLevel(b),
  )
  : [onLowerLevel(b)]
)

/**
 * Turns an array of Columns into a grid (2D array) of its Group nodes, organized by level & excluding Accessors.
 * 
 * 
 * The total 'numLeaves' of each level should be equivalent.
 * Elements w/ empty values are used to achieve this.
 * 
 * @example
 * interface TreeType {
 *   a: string;
 *   b: string;
 *   c: string;
 *   d: string;
 * }
 * const columns: Column<TreeType>[] = [
 *   {
 *     Header: 'A1',
 *     columns: [
 *       {
 *         Header: 'B',
 *         columns: [
 *           { Header: 'A header', accessor: 'd' },
 *           { Header: 'B header', accessor: 'b' }
 *         ]
 *       }
 *     ]
 *   },
 *   {
 *     Header: 'A2',
 *     columns: [
 *       { Header: 'C header', accessor: 'c' },
 *       { Header: 'D header', accessor: 'd' }
 *     ]
 *   }
 * ]
 * 
 * const grid: { numLeaves: number; Header: string | undefined }[][] = [
 *   [ { numLeaves: 2, Header: 'A1' },  { numLeaves: 2, Header: undefined } ],
 *   [ { numLeaves: 2, Header: 'B' }, { numLeaves: 2, Header: 'A2' } ],
 * ]
 * 
 * assert.deepStrictEqual(branchValueGrid(branches), grid)
 */
export const groupHeaders = <A>(
  branches: Array<Column<A>>
): Array<Array<{ numLeaves: number, Header: ReactNode }>> => {
  const maxLevel = pipe(branches, A.map(level), max)
  const nextLevel = maxLevel - 1
  return pipe(branches, A.every(isAccessor))
    ? []
    : pipe(
      branches,
      groupChildGroups(
        maxLevel,
        parent => A.chain((levelGroup): Array<Column<A>> => level(NEA.head(levelGroup)) === nextLevel
          ? levelGroup
          : [{
            ...parent,
            columns: levelGroup
          }]
        ),
        identity,
      ),
      groupHeaders,
      A.prepend(pipe(
        branches,
        groupChildGroups(
          maxLevel,
          parent => A.map(levelGroup => ({
            numLeaves: pipe(levelGroup, A.map(numAccessors), sum),
            Header: level(NEA.head(levelGroup)) === nextLevel && isGroup(parent) ? parent.Header : undefined
          })),
          b => ({ numLeaves: numAccessors(b), Header: undefined }),
        )
      ))
    )
}

/**
 * Turns an array of Columns into an array of its Accessors
 * 
 * @example
 * 
 * const columns: Column<TreeType>[] = [
 *   {
 *     Header: 'A1',
 *     columns: [
 *       {
 *         Header: 'B',
 *         columns: [
 *           { Header: 'A header', accessor: 'd' },
 *           { Header: 'B header', accessor: 'b' }
 *         ]
 *       }
 *     ]
 *   },
 *   {
 *     Header: 'A2',
 *     columns: [
 *       { Header: 'C header', accessor: 'c' },
 *       { Header: 'D header', accessor: 'd' }
 *     ]
 *   }
 * ]
 * 
 * const accessors: Accessor<TableType>[] = [
 *   { Header: 'A header', accessor: 'a' }, 
 *   { Header: 'B header', accessor: 'b' },
 *   { Header: 'C header', accessor: 'c' },
 *   { Header: 'D header', accessor: 'd' }
 * ]
 * 
 * assert.deepStrictEqual(columns.flatMap(columns), accessors)
 */
export const accessors = <A>(column: Column<A>): Array<Accessor<A>> => isAccessor(column)
  ? [{ 
      ...column,
      Header: 'Header' in column ? column.Header : ''
    }]
  : isGroup(column)
    ? pipe(column.columns, A.chain(accessors)) as Accessor<A>[]
    : []
