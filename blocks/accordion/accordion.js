import { moveInstrumentation } from '../../scripts/scripts.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * If body contains only a single internal link, load that fragment and return its section content.
 * @param {Element} body Element containing possible fragment link
 * @returns {Promise<Element[]|null>} Fragment section children or null
 */
async function tryLoadFragmentContent(body) {
  const link = body.querySelector('a[href^="/"]');
  if (!link) return null;

  try {
    const url = new URL(link.href, window.location.origin);
    if (url.origin !== window.location.origin) return null;
  } catch {
    return null;
  }

  const allLinks = body.querySelectorAll('a[href^="/"]');
  const isOnlyFragmentLink = (allLinks.length === 1
    && body.textContent.trim() === link.textContent.trim()
    && (body.children.length === 1 && (body.firstElementChild === link
      || body.firstElementChild?.querySelector?.('a[href^="/"]') === link)));
  if (!isOnlyFragmentLink) return null;

  const path = new URL(link.href, window.location.href).pathname.replace(/(\.plain)?\.html$/i, '');
  const fragment = await loadFragment(path);
  if (!fragment) return null;

  const section = fragment.querySelector(':scope .section');
  if (!section) return null;

  return [...section.children];
}

/**
 * Builds accordion structure from block table content.
 * Each row = one accordion item. First cell = title, remaining cells = body content.
 * If body is a single link to an internal path, loads that fragment and uses its content.
 * @param {Element} block The accordion block element
 */
async function buildAccordionStructure(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  const accordion = document.createElement('div');
  accordion.className = 'accordion-list';

  await rows.reduce(async (prev, row) => {
    await prev;
    const cells = [...row.children];
    if (cells.length === 0) return;

    const titleCell = cells[0];
    const title = titleCell?.textContent?.trim() || '';

    const item = document.createElement('div');
    item.className = 'accordion-item';
    moveInstrumentation(row, item);

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'accordion-header';
    header.setAttribute('aria-expanded', 'false');
    header.innerHTML = '';
    const titleSpan = document.createElement('span');
    titleSpan.className = 'accordion-title';
    titleSpan.textContent = title;
    header.appendChild(titleSpan);
    const icon = document.createElement('span');
    icon.className = 'accordion-icon';
    icon.setAttribute('aria-hidden', 'true');
    header.appendChild(icon);

    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.hidden = true;

    const body = document.createElement('div');
    body.className = 'accordion-body';
    cells.slice(1).forEach((cell) => {
      moveInstrumentation(cell, body);
      while (cell.firstElementChild) body.append(cell.firstElementChild);
    });

    const fragmentContent = await tryLoadFragmentContent(body);
    if (fragmentContent && fragmentContent.length > 0) {
      body.innerHTML = '';
      body.classList.add('accordion-body-fragment');
      fragmentContent.forEach((el) => body.appendChild(el));
    }

    panel.appendChild(body);

    item.appendChild(header);
    item.appendChild(panel);
    accordion.appendChild(item);
  }, Promise.resolve());

  block.textContent = '';
  block.appendChild(accordion);
}

/**
 * Sets up expand/collapse behavior and accessibility.
 * @param {Element} block The accordion block element
 */
function setupAccordionBehavior(block) {
  const headers = block.querySelectorAll('.accordion-header');
  const singleExpand = !block.classList.contains('multiple-expand');

  headers.forEach((header) => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const panel = item?.querySelector('.accordion-panel');
      const isExpanded = header.getAttribute('aria-expanded') === 'true';

      if (singleExpand) {
        block.querySelectorAll('.accordion-header').forEach((h) => {
          h.setAttribute('aria-expanded', 'false');
          const p = h.closest('.accordion-item')?.querySelector('.accordion-panel');
          if (p) p.hidden = true;
        });
      }

      if (panel) {
        if (isExpanded && singleExpand) {
          header.setAttribute('aria-expanded', 'false');
          panel.hidden = true;
        } else {
          header.setAttribute('aria-expanded', 'true');
          panel.hidden = false;
        }
      }
    });
  });
}

/**
 * Decorates the accordion block.
 * @param {Element} block The accordion block element
 */
export default async function decorate(block) {
  await buildAccordionStructure(block);
  setupAccordionBehavior(block);
}
