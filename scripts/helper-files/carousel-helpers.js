/**
 * Reads a boolean value from a table cell.
 */
export function readBoolean(cell, fallback = false) {
  if (!cell) return fallback;
  const value = cell.textContent.trim().toLowerCase();
  return value;
}

/**
 * Reads an alignment value from a table cell.
 */
export function readDotsAlignment(cell, fallback = 'center') {
  if (!cell) return fallback;
  const value = cell.textContent.trim().toLowerCase();
  if (['left', 'center', 'right'].includes(value)) return value;
  return fallback;
}

/**
 * Reads an alignment value from a table cell.
 */
export function readArrowsAlignment(cell, fallback = 'center') {
  if (!cell) return fallback;
  const value = cell.textContent.trim().toLowerCase();
  if (['middle', 'left', 'right'].includes(value)) return value;
  return fallback;
}

/**
 * Reads a position value from a table cell.
 */
export function readPosition(cell, fallback = 'inside-container') {
  if (!cell) return fallback;
  const value = cell.textContent.trim().toLowerCase();
  if (['inside-container', 'outside-container'].includes(value)) return value;
  return fallback;
}

/**
 * Reads a position value from a table cell.
 */
export function readAnimation(cell, fallback = 'no-animation') {
  if (!cell) return fallback;
  const value = cell.textContent.trim().toLowerCase();
  if (['fade-in', 'fade-out'].includes(value)) return value;
  return fallback;
}
