/** A single tile face, e.g. "A" or "Qu". A face may be more than one character. */
export type Face = string

/** One cell of the board: its position, which die it holds, and the face shown. */
export interface Cell {
  /** Flat index into the board, 0-based, row-major (0..size*size - 1). */
  index: number
  /** Row of this cell, 0-based. */
  row: number
  /** Column of this cell, 0-based. */
  col: number
  /** Index (0..15) of the die placed on this cell, into balance.json `dice`. */
  dieIndex: number
  /** The face of that die currently shown, e.g. "A" or "Qu". */
  face: Face
}

/** A generated board: a square grid of cells plus the seed it was built from. */
export interface Board {
  /** Edge length of the (square) grid, from balance.json `gridSize`. */
  size: number
  /** Cells in row-major order; length is size * size. */
  cells: Cell[]
  /** The seed used to generate this board (reusing it reproduces the board). */
  seed: number | string
}
