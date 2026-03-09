/**
 * Convierte coordenadas baricéntricas (x, y, z) a posición en el layout
 * Retorna {row, col} donde row es la fila y col es el índice dentro de esa fila
 */
export const coordToRowCol = (x: number, y: number, size: number): { row: number; col: number } => {
  const row = size - 1 - x;
  const col = y;
  return { row, col };
};

/**
 * Convierte (row, col) a coordenadas baricéntricas (x, y, z)
 */
export const rowColToCoord = (row: number, col: number, size: number): { x: number; y: number; z: number } => {
  const x = size - 1 - row;
  const y = col;
  const z = row - col;
  return { x, y, z };
};

/**
 * Crea un layout inicial con separadores '/'
 */
export const createInitialLayout = (size: number): string => {
  const rows = [];
  for (let row = 0; row < size; row++) {
    rows.push('.'.repeat(row + 1));
  }
  return rows.join('/');
};

/**
 * Actualiza una posición en el layout
 */
export const updateLayoutPosition = (layout: string, row: number, col: number, newState: string): string => {
  const rows = layout.split('/');
  if (row < rows.length && col < rows[row].length) {
    const rowArray = rows[row].split('');
    rowArray[col] = newState;
    rows[row] = rowArray.join('');
    return rows.join('/');
  }
  return layout;
};

/**
 * Obtiene el estado en una posición del layout
 */
export const getLayoutState = (layout: string, row: number, col: number): string => {
  const rows = layout.split('/');
  if (row < rows.length && col < rows[row].length) {
    return rows[row][col];
  }
  return '.';
};

/**
 * Obtiene el total de casillas en un tablero triangular
 */
export const getTotalSquares = (size: number): number => {
  return (size * (size + 1)) / 2;
};
