import { moveInstrumentation } from '../../scripts/scripts.js';
import { loadBlock, decorateBlock } from '../../scripts/aem.js';

/**
 * Returns whether the row is an accordion item (title) row.
 * Item row: editor-marked (class/data), or first row, or single cell with text-only content.
 * @param {Element} row - A block row (div)
 * @param {number} index - Row index (0-based)
 * @returns {boolean}
 */
function isAccordionItemRow(row, index) {
  const firstCell = row.querySelector(':scope > div');
  if (!firstCell) return false;

  if (
    row.classList.contains('accordion-item')
    || row.dataset.accordionItem !== undefined
    || firstCell.classList.contains('accordion-item')
    || firstCell.dataset.accordionItem !== undefined
  ) {
    return true;
  }
  if (index === 0) return true;

  const hasSingleCell = row.children.length === 1;
  const textOnly = !firstCell.querySelector('picture, a[href]') && firstCell.textContent.trim().length > 0;
  if (hasSingleCell && textOnly) return true;

  return false;
}

/**
 * Extracts title text from an accordion item row (first cell).
 * @param {Element} row
 * @returns {string}
 */
function getTitleFromRow(row) {
  const firstCell = row.querySelector(':scope > div');
  return firstCell ? firstCell.textContent.trim() : '';
}

/**
 * Groups block.children (rows) into accordion items.
 * @param {Element} block - The accordion block
 * @returns {{ title: string, contentRows: Element[] }[]}
 */
function groupRowsIntoItems(block) {
  const rows = [...block.children];
  const items = [];
  let currentItem = null;

  rows.forEach((row, index) => {
    if (isAccordionItemRow(row, index)) {
      currentItem = { title: getTitleFromRow(row), contentRows: [] };
      items.push(currentItem);
    } else if (currentItem) {
      currentItem.contentRows.push(row);
    }
  });

  return items;
}

/**
 * Builds the accordion DOM and replaces block content.
 * @param {Element} block - The accordion block
 * @param {{ title: string, contentRows: Element[] }[]} items
 */
function buildAccordionDOM(block, items) {
  if (items.length === 0) return;

  const fragment = document.createDocumentFragment();

  items.forEach((item, index) => {
    const itemId = `accordion-panel-${index}`;
    const headerId = `accordion-header-${index}`;
    const isFirst = index === 0;

    const itemWrapper = document.createElement('div');
    itemWrapper.className = 'accordion-item';
    if (isFirst) itemWrapper.classList.add('active');

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'accordion-header';
    header.id = headerId;
    header.setAttribute('aria-expanded', isFirst ? 'true' : 'false');
    header.setAttribute('aria-controls', itemId);
    header.textContent = item.title;

    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.id = itemId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', headerId);
    if (!isFirst) panel.setAttribute('aria-hidden', 'true');

    const panelInner = document.createElement('div');
    panelInner.className = 'accordion-panel-inner';
    item.contentRows.forEach((row) => {
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'accordion-panel-cell';
      moveInstrumentation(row, contentWrapper);
      while (row.firstElementChild) contentWrapper.append(row.firstElementChild);
      panelInner.appendChild(contentWrapper);
    });
    panel.appendChild(panelInner);

    itemWrapper.appendChild(header);
    itemWrapper.appendChild(panel);
    fragment.appendChild(itemWrapper);
  });

  block.replaceChildren(fragment);
}

/**
 * Adds expand/collapse behavior (single-open) and accessibility.
 * @param {Element} block - The accordion block
 */
function setupAccordion(block) {
  const headers = block.querySelectorAll('.accordion-header');

  headers.forEach((header) => {
    header.addEventListener('click', () => {
      const itemWrapper = header.closest('.accordion-item');
      const panel = itemWrapper.querySelector('.accordion-panel');
      const isActive = itemWrapper.classList.contains('active');

      const allItems = block.querySelectorAll('.accordion-item');
      allItems.forEach((item) => {
        item.classList.remove('active');
        const p = item.querySelector('.accordion-panel');
        const h = item.querySelector('.accordion-header');
        if (p) p.setAttribute('aria-hidden', 'true');
        if (h) h.setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        itemWrapper.classList.add('active');
        panel.setAttribute('aria-hidden', 'false');
        header.setAttribute('aria-expanded', 'true');
      }
    });

    header.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      header.click();
    });
  });
}

/**
 * Decorates and loads any EDS blocks nested inside accordion panels.
 * @param {Element} block - The accordion block element
 */
async function loadNestedBlocks(block) {
  const nestedBlocks = block.querySelectorAll('.accordion-panel .block');
  nestedBlocks.forEach((el) => {
    if (!el.dataset.blockName) {
      decorateBlock(el);
    }
  });
  const toLoad = block.querySelectorAll('.accordion-panel [data-block-name]');
  await Promise.all([...toLoad].map((el) => loadBlock(el)));
}

/**
 * Decorates the accordion block: parses rows into items,
 * builds DOM, wires behavior, loads nested blocks.
 * @param {Element} block - The accordion block element
 */
export default async function decorate(block) {
  const items = groupRowsIntoItems(block);
  buildAccordionDOM(block, items);
  setupAccordion(block);
  await loadNestedBlocks(block);
}
