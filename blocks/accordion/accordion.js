import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Builds a single accordion item from a block row.
 * Preserves all child nodes and moves AEM instrumentation to the new elements.
 * @param {Element} row - Row element (two cells: title, description)
 * @param {Document} doc - Document reference
 * @returns {Element} Accordion item element
 */
function buildAccordionItem(row, doc) {
  const cells = [...row.children];
  const titleCell = cells[0];
  const contentCell = cells[1];
  const isSingleCell = !contentCell;

  const item = doc.createElement('div');
  item.className = 'accordion-item';

  const header = doc.createElement('h3');
  header.className = 'accordion-header';

  const suffix = Math.random().toString(36).slice(2, 9);
  const panelId = `accordion-panel-${suffix}`;
  const buttonId = `accordion-header-${suffix}`;
  const button = doc.createElement('button');
  button.type = 'button';
  button.id = buttonId;
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', panelId);
  if (titleCell) {
    const titleText = titleCell.textContent?.trim() || '';
    button.textContent = titleText;
    if (!isSingleCell) moveInstrumentation(titleCell, button);
  }

  header.appendChild(button);
  item.appendChild(header);

  const panel = doc.createElement('div');
  panel.className = 'accordion-panel';
  panel.id = panelId;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', buttonId);
  panel.hidden = true;

  const sourceCell = contentCell || titleCell;
  if (sourceCell) {
    while (sourceCell.firstChild) {
      panel.appendChild(sourceCell.firstChild);
    }
    moveInstrumentation(sourceCell, panel);
  }

  item.appendChild(panel);
  moveInstrumentation(row, item);

  return item;
}

/**
 * Initialize accordion behavior: toggle panels on header click.
 * @param {Element} block - Accordion block root
 */
function initAccordion(block) {
  const headers = block.querySelectorAll('.accordion-header button');
  headers.forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.accordion-item');
      const panel = item?.querySelector('.accordion-panel');
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', !isExpanded);
      if (panel) panel.hidden = isExpanded;
    });
  });
}

/**
 * Decorate the accordion block into EDS-style accordion structure.
 * Each block row becomes one accordion item (title + description).
 * Preserves all DOM nodes and AEM editor instrumentation.
 * @param {Element} block - The accordion block element
 */
export default function decorate(block) {
  const doc = block.ownerDocument;
  const rows = [...block.children];

  const wrapper = doc.createElement('div');
  wrapper.className = 'accordion-list';

  rows.forEach((row) => {
    if (row.children.length === 0) return;
    const item = buildAccordionItem(row, doc);
    wrapper.appendChild(item);
  });

  block.replaceChildren(wrapper);
  initAccordion(block);
}
