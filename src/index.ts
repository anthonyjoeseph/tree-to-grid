import { sum } from 'fp-ts-std/Array';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
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

export const numLeaves = <A, B>(tree: Tree<A, B>): number => tree.type === 'Branch'
  ? pipe(tree.children, A.map(numLeaves), sum)
  : 1

const branchValueGridInternal = <A, B>(
  branches: Array<Tree<A, B> | { type: 'Empty' }>
): Array<Array<{ numLeaves: number; value: O.Option<B> }>> => pipe(
  branches,
  A.chain((col): Array<Tree<A, B> | { type: 'Empty' }> => col.type === 'Branch' ? col.children : [{ type: "Empty" }]),
  O.fromPredicate(A.some(column => column.type === 'Branch')),
  O.fold(() => A.empty, branchValueGridInternal),
  A.cons(pipe(
    branches,
    A.map((node) => ({
      value: pipe(node, O.fromPredicate((c): c is Branch<A, B> => c.type === 'Branch'), O.map(c => c.value)),
      numLeaves: node.type !== 'Empty' ? numLeaves(node) : 1
    }))
  ))
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
 * const tree: Tree<string, number>[] = [
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
 *     branches: [
 *       { type: 'Leaf', value: 3 },
 *       { type: 'Leaf', value: 4 }
 *     ]
 *   }
 * ]
 * 
 * const grid: { numLeaves: number; value: O.Option<string> }[][] = [
 *   [ { numLeaves: 2, value: O.some('A1') },  { numLeaves: 2, value: O.some('A2') } ],
 *   [ { numLeaves: 2, value: O.some('B') }, { numLeaves: 2, value: O.none } ],
 * ]
 * 
 * assert.deepStrictEqual(branchValueGrid(branches), grid)
 */
export const branchValueGrid = <A, B>(branches: Tree<A, B>[]) => branchValueGridInternal(branches)

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
