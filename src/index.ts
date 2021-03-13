import { sum } from 'fp-ts-std/Array';
import * as A from 'fp-ts/Array';
import * as NEA from 'fp-ts/NonEmptyArray'
import * as Eq from 'fp-ts/Eq'
import * as Ord from 'fp-ts/Ord'
import { flow, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';

export interface Branch<A, B> {
  type: 'Branch'
  value: B
  children: Tree<A, B>[]
}

export interface Leaf<A> {
  type: 'Leaf'
  value: A
}

export type Tree<A, B> = Branch<A, B> | Leaf<A>

const numLeaves = <A, B>(tree: Tree<A, B>): number => tree.type === 'Branch'
  ? pipe(tree.children, A.map(numLeaves), sum)
  : 1

const max: (ns: number[]) => number = flow(NEA.fromArray, O.fold(() => 0, NEA.max(Ord.ordNumber)))

const level = <A, B>(tree: Tree<A, B>): number => tree.type === 'Branch'
  ? pipe(tree.children, A.map(level), max) + 1
  : 1

const sameLevelEq = <A, B>() => pipe(
  Eq.eqNumber,
  Eq.contramap<number, Tree<A, B>>(level)
)

/**
 * Turns an array of Trees into a grid (2D array) of its branches's values, organized by level & excluding leaves.
 * 
 * 
 * The total 'numLeaves' of each level should be equivalent.
 * Elements w/ empty values are used to achieve this.
 * 
 * @example
 * 
 * const branches: Tree<number, string>[] = [
 *   {
 *     type: 'Branch',
 *     value: 'A1',
 *     children: [
 *       {
 *         type: 'Branch',
 *         value: 'B',
 *         children: [
 *           { type: 'Leaf', value: 1 },
 *           { type: 'Leaf', value: 2 }
 *         ]
 *       }
 *     ]
 *   },
 *   {
 *     type: 'Branch',
 *     value: 'A2',
 *     children: [
 *       { type: 'Leaf', value: 3 },
 *       { type: 'Leaf', value: 4 }
 *     ]
 *   }
 * ]
 * 
 * const grid: { numLeaves: number; value: string | undefined }[][] = [
 *   [ { numLeaves: 2, value: 'A1' },  { numLeaves: 2, value: undefined } ],
 *   [ { numLeaves: 2, value: 'B' }, { numLeaves: 2, value: 'A2' } ],
 * ]
 * 
 * assert.deepStrictEqual(branchValueGrid(branches), grid)
 */
export const branchValueGrid = <A, B>(
  branches: Array<Tree<A, B>>
): Array<Array<{ numLeaves: number, value: B | undefined }>> => {
  const maxLevel = pipe(branches, A.map(level), max)
  const nextLevel = maxLevel - 1
  const rowOutput: { numLeaves: number, value: B | undefined }[] = pipe(
    branches,
    A.chain(b => b.type === 'Leaf' || level(b) < maxLevel
      ? [{ numLeaves: numLeaves(b), value: undefined }]
      : pipe(
        b.children,
        NEA.group(sameLevelEq<A, B>()),
        A.map(d => ({
          numLeaves: pipe(d, NEA.map(numLeaves), sum),
          value: level(NEA.head(d)) === nextLevel ? b.value : undefined
        })),
      )
    )
  )
  const lowerTrees: Tree<A, B>[] = pipe(
    branches,
    A.chain(b => b.type === 'Leaf' || level(b) < maxLevel 
      ? [b]
      : pipe(
        b.children,
        NEA.group(sameLevelEq<A, B>()),
        A.chain(c => level(NEA.head(c)) === nextLevel
          ? c
          : [{
            type: 'Branch',
            value: b.value,
            children: c
          }]
        )
      )
    )
  )
  return lowerTrees.some(t => t.type === 'Branch')
    ? [rowOutput, ...branchValueGrid(lowerTrees)]
    : [rowOutput]
}

/**
 * Turns a Tree into an Array of the values of its leaves
 * 
 * @example
 * 
 * const tree: Tree<string, number> = {
 *   type: 'Branch',
 *   value: 'A',
 *   children: [
*      {
*        type: 'Branch',
*        value: 'B1',
*        children: [
*          {
*            type: 'Branch',
*            value: 'C',
*            children: [
*              { type: 'Leaf', value: 1 },
*              { type: 'Leaf', value: 2 }
*            ]
*          }
*        ]
*      },
*      {
*        type: 'Branch',
*        value: 'B2',
*        branches: [
*          { type: 'Leaf', value: 3 },
*          { type: 'Leaf', value: 4 }
*        ]
*      }
*    ]
 * }
 * 
 * const allLeaves: number[] = [1, 2, 3, 4]
 * 
 * assert.deepStrictEqual(leafValues(tree), allLeaves)
 */
export const leafValues = <A, B>(tree: Tree<A, B>): Array<A> => tree.type === 'Leaf'
  ? [tree.value]
  : pipe(tree.children, A.chain(leafValues))
