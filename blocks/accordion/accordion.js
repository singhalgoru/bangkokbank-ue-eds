import { moveInstrumentation } from '../../scripts/scripts.js';
import { readBlockConfig, toClassName } from '../../scripts/aem.js';

/**
 * Builds a single accordion item from a block row (two cells: title, description).
 * Preserves EDS instrumentation by moving data-aue-* and data-richtext-* to the right nodes.
 * @param {Element} row - Block row (div with two child divs)
 * @param {number} index - Item index (for id and aria-controls)
 * @param {boolean} expandFirst - Whether the first item is expanded by default
 * @param {Document} doc - Document (defaults to document)
 * @returns {Element} Accordion item element
 */
function buildAccordionItem(row, index, expandFirst, doc = document) {
  const [titleCell, descriptionCell] = [...row.children];
  const item = doc.createElement('div');
  item.className = 'accordion-item';
  if (index === 0 && expandFirst) item.classList.add('is-open');

  moveInstrumentation(row, item);

  const header = doc.createElement('div');
  header.className = 'accordion-header';
  const trigger = doc.createElement('button');
  trigger.type = 'button';
  trigger.className = 'accordion-trigger';
  trigger.setAttribute('aria-expanded', index === 0 && expandFirst ? 'true' : 'false');
  const panelId = `accordion-panel-${index}`;
  trigger.setAttribute('aria-controls', panelId);
  trigger.id = `accordion-trigger-${index}`;

  if (titleCell) {
    moveInstrumentation(titleCell, trigger);
    while (titleCell.firstChild) trigger.appendChild(titleCell.firstChild);
  }
  header.appendChild(trigger);
  item.appendChild(header);

  const panel = doc.createElement('div');
  panel.className = 'accordion-panel';
  panel.id = panelId;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', trigger.id);
  if (index !== 0 || !expandFirst) panel.hidden = true;

  if (descriptionCell) {
    moveInstrumentation(descriptionCell, panel);
    while (descriptionCell.firstChild) panel.appendChild(descriptionCell.firstChild);
  }
  item.appendChild(panel);

  return item;
}

/**
 * Binds click handlers to accordion triggers (one item open at a time).
 * @param {Element} block - Accordion block element
 */
function bindAccordionBehavior(block) {
  block.addEventListener('click', (e) => {
    const trigger = e.target.closest('.accordion-trigger');
    if (!trigger) return;

    const item = trigger.closest('.accordion-item');
    const panel = item?.querySelector('.accordion-panel');
    if (!panel) return;

    const isOpen = item.classList.contains('is-open');
    const allItems = block.querySelectorAll('.accordion-item');
    const allPanels = block.querySelectorAll('.accordion-panel');
    const allTriggers = block.querySelectorAll('.accordion-trigger');

    if (isOpen) {
      item.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
    } else {
      allItems.forEach((el) => el.classList.remove('is-open'));
      allPanels.forEach((el) => { el.hidden = true; });
      allTriggers.forEach((el) => el.setAttribute('aria-expanded', 'false'));

      item.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
    }
  });
}

/** Config keys that identify a block config row (not an accordion item). */
const CONFIG_ROW_KEYS = ['expand-first-accordion', 'heading-type', 'faq'];

/**
 * Returns true if the row looks like a config row (first cell matches a known config key).
 * @param {Element} row - Block row
 * @returns {boolean}
 */
function isConfigRow(row) {
  const firstCell = row.querySelector(':scope > div:first-child');
  const key = firstCell ? toClassName(firstCell.textContent) : '';
  return CONFIG_ROW_KEYS.includes(key);
}

/**
 * Decorates the accordion block: builds item DOM and preserves EDS nodes/instrumentation.
 * Expects each content row to have two cells: title (heading) and description (body).
 * Optional first row can be config (e.g. expand-first-accordion / true);
 * config rows are skipped as items.
 * @param {Element} block - The accordion block element
 */
export default function decorate(block) {
  const config = readBlockConfig(block);
  const expandFirst = config['expand-first-accordion'] === 'true' || config['expand-first-accordion'] === true;

  const rows = [...block.children].filter((row) => !isConfigRow(row));
  if (rows.length === 0) return;

  const fragment = document.createDocumentFragment();
  rows.forEach((row, index) => {
    const item = buildAccordionItem(row, index, expandFirst, document);
    fragment.appendChild(item);
  });

  block.replaceChildren(fragment);
  bindAccordionBehavior(block);
}
