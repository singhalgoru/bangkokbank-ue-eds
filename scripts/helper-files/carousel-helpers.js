/**
 * Reads a boolean value from a table cell.
 */
export function readBoolean(cell, fallback = false) {
  if (!cell) return fallback;
  const value = cell.textContent.trim().toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
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
  if (['middle', 'bottom-left', 'bottom-right', 'top-left', 'top-right'].includes(value)) return value;
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
 * Normalizes a variant string to lowercase alpha-only.
 */
export function normalizeVariantValue(value = '') {
  return value.toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Normalizes an arbitrary key/prop name to lowercase alpha-only.
 */
export function normalizeKey(value = '') {
  return value.toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Resolves a raw string to a canonical variant name.
 * @param {string} value - The raw value to resolve.
 * @param {string} [fallback='showDots'] - Returned when no match is found.
 * @returns {'showDots'|'showArrowsDots'|string}
 */
export function resolveVariant(value, fallback = 'showDots') {
  const normalized = normalizeVariantValue(value);
  if (
    normalized.includes('showdotsandarrows')
    || normalized.includes('showarrowsdots')
    || normalized === 'arrows'
    || normalized === 'arrowsdots'
  ) {
    return 'showArrowsDots';
  }
  if (normalized.includes('showdots') || normalized === 'dots') {
    return 'showDots';
  }
  if (normalized.includes('dots') && !normalized.includes('arrow')) {
    return 'showDots';
  }
  return fallback;
}

/**
 * Returns the value cell from a two-column row, or the element itself.
 */
export function getRowValueCell(row) {
  if (!row) return null;
  if (row.children?.length === 2) return row.children[1];
  return row;
}

/**
 * Detects the carousel variant by inspecting (in priority order):
 *  1. Block data attributes: data-filter, data-variant, data-aue-filter
 *  2. Block className
 *  3. Rows whose data-aue-prop / data-field / data-name equals "filter" or "variant"
 *
 * @param {HTMLElement} block - The carousel block element.
 * @param {HTMLElement[]} [rows=[]] - All child rows of the block.
 * @param {string} [fallback='showDots'] - Returned when nothing resolves.
 * @returns {string} Canonical variant name.
 */
export function detectVariantHint(block, rows = [], fallback = 'showDots') {
  // 1. Check block-level data attributes and className first
  const blockHints = [
    block?.dataset?.filter,
    block?.dataset?.variant,
    block?.dataset?.aueFilter,
    block?.getAttribute?.('data-aue-filter'),
    block?.className,
  ];

  for (let i = 0; i < blockHints.length; i += 1) {
    const resolved = resolveVariant(blockHints[i] || '', '');
    if (resolved) return resolved;
  }

  // 2. Scan rows for a "filter" or "variant" prop
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const prop = normalizeKey(
      row?.dataset?.aueProp
      || row?.dataset?.field
      || row?.dataset?.name
      || row?.getAttribute?.('data-aue-prop')
      || row?.getAttribute?.('data-field')
      || row?.getAttribute?.('data-name')
      || '',
    );
    const valueCell = getRowValueCell(row);
    const valueText = valueCell?.textContent?.trim() || '';

    if (prop === 'filter' || prop === 'variant') {
      const resolved = resolveVariant(valueText, '');
      if (resolved) return resolved;
    }

    if (prop === 'showarrowsdots' && readBoolean(valueCell)) return 'showArrowsDots';
    if (prop === 'showdots' && readBoolean(valueCell)) return 'showDots';
  }

  return fallback;
}
