interface GameState {
  [key: string]: [Piece | null, number];
}

export interface Player {
  name: string;
  color: string;
  alive: Piece[];
  grace: Piece[];
}

interface MoveResult {
  isValid: boolean;
  newState: GameState;
  player1: Player;
  player2: Player;
}

export const grid: string[][] = [
  ['A7', 'A6', 'A5', 'A4', 'A3', 'A2', 'A1', 'A0'],
  ['B7', 'B6', 'B5', 'B4', 'B3', 'B2', 'B1', 'B0'],
  ['C7', 'C6', 'C5', 'C4', 'C3', 'C2', 'C1', 'C0'],
  ['D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1', 'D0'],
  ['E7', 'E6', 'E5', 'E4', 'E3', 'E2', 'E1', 'E0'],
  ['F7', 'F6', 'F5', 'F4', 'F3', 'F2', 'F1', 'F0'],
  ['G7', 'G6', 'G5', 'G4', 'G3', 'G2', 'G1', 'G0'],
  ['H7', 'H6', 'H5', 'H4', 'H3', 'H2', 'H1', 'H0']
];

export class Player {
  name: string;
  color: string;
  alive: Piece[];
  grave: Piece[];

  constructor(name: string = '', color: string = '', alive: Piece[] = [], grave: Piece[] = []) {
    this.name = name;
    this.color = color;
    this.alive = alive;
    this.grave = grave;
  }
}

export abstract class Piece {
  constructor(
    public trackerTag: string,
    public pieceName: string,
    public position: string,
    public moved: boolean,
    public player: Player,
    public isWhite: boolean,
  ) { }

  get_all_diagonal(grid: string[][], state: any, col: number, row: number): string[] {
    let all_moves: string[] = [];
    all_moves = all_moves.concat(this.recurse_diagonal((col + 1), 8, (row + 1), grid, state, [], 'f-slash'));
    all_moves = all_moves.concat(this.recurse_diagonal((col - 1), (-1), (row - 1), grid, state, [], 'f-slash'));
    all_moves = all_moves.concat(this.recurse_diagonal((col + 1), 8, (row - 1), grid, state, [], 'b-slash'));
    all_moves = all_moves.concat(this.recurse_diagonal((col - 1), (-1), (row + 1), grid, state, [], 'b-slash'));
    return all_moves;
  }

  get_all_straight(grid: string[][], state: any, col: number, row: number): string[] {
    let all_moves: string[] = [];
    all_moves = all_moves.concat(this.recurse_straight((row + 1), 8, col, grid, state, [], 'vert'));
    all_moves = all_moves.concat(this.recurse_straight((row - 1), -1, col, grid, state, [], 'vert'));
    all_moves = all_moves.concat(this.recurse_straight((col + 1), 8, row, grid, state, [], 'hor'));
    all_moves = all_moves.concat(this.recurse_straight((col - 1), -1, row, grid, state, [], 'hor'));
    return all_moves;
}

  recurse_straight(looper: number, end: number, anchor: number, grid: string[][], state: any, all_moves: string[], axis: string): string[] {
    if (looper === end) {
        return all_moves;
    }
    let spot: string = axis === 'vert' ? grid[anchor][looper] : grid[looper][anchor];
    if (state[spot][0] === null) {
        all_moves.push(spot);
        if (end === 8) {
            return this.recurse_straight((looper + 1), end, anchor, grid, state, all_moves, axis);
        } else {
            return this.recurse_straight((looper - 1), end, anchor, grid, state, all_moves, axis);
        }
    } else if (state[spot][0].player.color === this.player.color) {
        return all_moves;
    } else {
        all_moves.push(spot);
        return all_moves;
    }
  }

  recurse_diagonal(col_rec: number, end: number, row_rec: number, grid: string[][], state: any, all_moves: string[], axis: string): string[] {
    if (col_rec === 8 || col_rec === (-1) || row_rec === 8 || row_rec === (-1)) {
        return all_moves;
    }
    let spot: string = grid[col_rec][row_rec];
    if (state[spot][0] === null) {
        all_moves.push(spot);
        if (axis === 'f-slash' && end === 8) {
            return this.recurse_diagonal((col_rec + 1), end, (row_rec + 1), grid, state, all_moves, axis);
        } else if (axis === 'f-slash' && end !== 8) {
            return this.recurse_diagonal((col_rec - 1), end, (row_rec - 1), grid, state, all_moves, axis);
        } else if (axis !== 'f-slash' && end === 8) {
            return this.recurse_diagonal((col_rec + 1), end, (row_rec - 1), grid, state, all_moves, axis);
        } else {
            return this.recurse_diagonal((col_rec - 1), end, (row_rec + 1), grid, state, all_moves, axis);
        }
    } else if (state[spot][0].player.color === this.player.color) {
        return all_moves;
    } else {
        all_moves.push(spot);
        return all_moves;
    }
  }
}

export class Pawn extends Piece {
  validPawnMoves(grid: string[][], state: any, col: number, row: number): string[] {
    let all_moves: string[] = [];
    // Check the color of the pawn to decide which direction it should move
    let nextRow = this.isWhite ? row - 1 : row + 1;
    if (state[grid[col][nextRow]][0] === null) {
      all_moves.push(grid[col][nextRow]);
    }
  
    let attacks: string[] = [grid[(col - 1)][nextRow], grid[(col + 1)][nextRow]];
    for (let d of attacks) {
      if (state[d][0] === null) {
          continue;
      } else if (!this.player.alive.includes(state[d][0])) {
          all_moves.push(d);
      } else {
          continue;
      }
    }
  
    // If the pawn hasn't moved yet, it can move two spaces forward
    if (!this.moved) {
      nextRow = this.isWhite ? row - 2 : row + 2;
      // The pawn can move two spaces forward only if both spaces in front of it are empty
      if (state[grid[col][nextRow]][0] === null && state[grid[col][nextRow + (this.isWhite ? 1 : -1)]][0] === null) {
        all_moves.push(grid[col][nextRow]);
      }
    }
    
    return all_moves;
  }
}

export class Rook extends Piece {}

export class Knight extends Piece {
  validKnightMoves(grid: string[][], state: any, col: number, row: number): string[] {
    const allMoves: string[] = [];
    
    const potentialMoves: [number, number][] = [
      [col - 2, row - 1], [col - 2, row + 1],
      [col + 2, row - 1], [col + 2, row + 1],
      [col + 1, row + 2], [col - 1, row + 2],
      [col + 1, row - 2], [col - 1, row - 2]
    ];

    for (const move of potentialMoves) {
      if (move[0] < 0 || move[0] > 7 || move[1] < 0 || move[1] > 7) {
        continue;
      }

      const spot = grid[move[0]][move[1]];
      if (state[spot][0] === null || state[spot][0].player.color !== this.player?.color) {
        allMoves.push(spot);
      }
    }

    return allMoves;
  }
}

export class Bishop extends Piece {
}

export class Queen extends Piece {}

export class King extends Piece {
  validKingMoves(grid: string[][], state: any, col: number, row: number): string[] {
    const cords = [
      [col, (row + 1)],
      [(col - 1), (row + 1)],
      [(col + 1), (row + 1)],
      [col, (row - 1)],
      [(col - 1), (row - 1)],
      [(col + 1), (row - 1)],
      [(col + 1), row],
      [(col - 1), row]
    ];

    const allMoves: string[] = [];
    for (const c of cords) {
      if (c[0] === 8 || c[0] === -1 || c[1] === 8 || c[1] === -1) {
        continue;
      } else {
        const spot = grid[c[0]][c[1]];
        if (state[spot][0] === null) {
          allMoves.push(spot);
        } else if (state[spot][0].player.color === this.player?.color) {
          continue;
        } else {
          allMoves.push(spot);
        }
      }
    }

    return allMoves;
  }
}

export const assignWhitePieces = (grid: string[][], player: Player): void => {
  for (let col of grid) {
    player.alive.push(new Pawn('wP', 'whitePawn', col[6], false, player, true));
  }
  player.alive.push(
    new Rook('wR', 'whiteRook', grid[0][7], false, player, true),
    new Knight('wN', 'whiteKnight', grid[1][7], false, player, true),
    new Bishop('wB', 'whiteBishop', grid[2][7], false, player, true),
    new Queen('wQ', 'whiteQueen', grid[3][7], false, player, true),
    new King('wK', 'whiteKing', grid[4][7], false, player, true),
    new Bishop('wB', 'whiteBishop', grid[5][7], false, player, true),
    new Knight('wN', 'whiteKnight', grid[6][7], false, player, true),
    new Rook('wR', 'whiteRook', grid[7][7], false, player, true)
  )
}

export const assignBlackPieces = (grid: string[][], player: Player): void => {
  for (let col of grid) {
      player.alive.push(new Pawn('bP', 'blackPawn', col[1], false, player, false));
  }
  player.alive.push(
      new Rook('bR', 'blackRook', grid[0][0], false, player, false),
      new Knight('bN', 'blackKnight', grid[1][0], false, player, false),
      new Bishop('bB', 'blackBishop', grid[2][0], false, player, false),
      new Queen('bQ', 'blackQueen', grid[3][0], false, player, false),
      new King('bK', 'blackKing', grid[4][0], false, player, false),
      new Bishop('bB', 'blackBishop', grid[5][0], false, player, false),
      new Knight('bN', 'blackKnight', grid[6][0], false, player, false),
      new Rook('bR', 'blackRook', grid[7][0], false, player, false)
  );
}

export const process_move = (start: string, end: string, gameState: GameState, player1: Player, player2: Player): MoveResult => {
  let copyState = {...gameState};
  let startPosition = start[0] + start[1];
  console.log(`adjusted start: ${startPosition}`)
  let endPosition = end[0] + end[1];
  console.log(`adjusted start: ${endPosition}`)
  let startCol = gameState[startPosition][1];
  console.log(`start column: ${startCol}`)
  let startRow = 7 - parseInt(startPosition[1]);
  console.log(`start row: ${startRow}`)

  let piece = copyState[startPosition][0];
  console.log('piece VVVV');
  console.log(piece)
  let allMoves: string[] = [];
  // find what piece we are moving
  if (piece instanceof Pawn) {
      allMoves = piece.validPawnMoves(grid, gameState, startCol, startRow);
  } else if (piece instanceof Knight) {
      allMoves = piece.validKnightMoves(grid, gameState, startCol, startRow);
  } else if (piece instanceof Rook) {
      allMoves = piece.get_all_straight(grid, gameState, startCol, startRow);
  } else if (piece instanceof Bishop) {
      allMoves = piece.get_all_diagonal(grid, gameState, startCol, startRow);
  } else if (piece instanceof Queen) {
      allMoves = piece.get_all_straight(grid, gameState, startCol, startRow)
          .concat(piece.get_all_diagonal(grid, gameState, startCol, startRow));
  } else if (piece instanceof King) {
      allMoves = piece.validKingMoves(grid, gameState, startCol, startRow);
  }

  console.log('all moves after checking vvvv')
  console.log(allMoves)

  if (allMoves.includes(endPosition)) {
    // if the piece moving is taking an opponents piece
    if (copyState[endPosition][0] !== null) {
      const piece = copyState[endPosition][0];
      // update the alive and grave list for player losing a piece
      if (piece && player1 && player2) {
        if (player1.alive.includes(piece)) {
          player1.grave.push(piece);
          player1.alive = player1.alive.filter(item => item !== piece);
        } else {
          player2.grave.push(piece);
          player2.alive = player2.alive.filter(item => item !== piece);
        }
      }
    }

    // update the positions of the pieces on the board
    copyState[endPosition][0] = copyState[startPosition][0];
    copyState[startPosition][0] = null;
    if (copyState[endPosition][0] !== null) {
      let piece = copyState[endPosition][0];
      if (piece) {
        piece.position = endPosition;
        if (player1 === piece.player) {
          player1.alive.forEach((p) => {
              if (p.position === startPosition) {
                  p.position = endPosition;
              }
          });
        } else {
          if (player2) {
            player2.alive.forEach((p) => {
              if (p.position === startPosition) {
                  p.position = endPosition;
              }
          });
          }
        }
      }
    }
  } else {
      return { isValid: false, newState: copyState, player1: player1, player2: player2 };
  }
  return { isValid: true, newState: copyState, player1: player1, player2: player2 };
}