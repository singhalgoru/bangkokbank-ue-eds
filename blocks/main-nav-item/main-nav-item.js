/**
 * Decorates the Main Nav Item block.
 * Creates a megamenu navigation item with:
 * - A main navigation link/button that triggers the dropdown
 * - A megamenu panel (megamenu-inner) containing:
 *   - Megamenu columns (image + categorized links)
 *   - Quick nav items (label, link, optional icon) below the columns
 * Authoring fields are preserved by wrapping/moving existing DOM nodes
 * instead of clearing the block and rebuilding, so editor bindings remain.
 * @param {Element} block The main-nav-item block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // First row: mainNavItem (main nav text).
  // Second row: mainNavItemGroup_label + mainNavItemGroup_link (per _main-nav-item.json)
  const mainNavRow = rows[0];
  const homeLinkRow = rows[1];
  homeLinkRow.classList.add('megamenu-home-link');
  const homeLinkCells = homeLinkRow?.querySelectorAll('p');
  const homeLabelCell = homeLinkCells[0];
  const homeLinkCell = homeLinkCells[1] || homeLinkRow;
  homeLinkCell.querySelector('a').innerHTML = '';
  homeLinkCell.querySelector('a').classList.add('icon-arrow-left');
  homeLinkCell.querySelector('a').innerText = homeLabelCell.textContent.trim();
  homeLabelCell.setAttribute('hidden', 'hidden');

  // Create the main nav item structure (do not clear block; move nodes instead)
  const navItem = document.createElement('div');
  navItem.className = 'main-nav-item-wrapper';

  // Create the nav trigger button and preserve the first row inside it for authoring
  const navTrigger = document.createElement('button');

  navTrigger.className = 'main-nav-trigger icon-dropdown';

  navTrigger.setAttribute('aria-expanded', 'false');
  navTrigger.setAttribute('aria-haspopup', 'true');

  // Keep authoring fields visible: move the original first row into the trigger
  mainNavRow.classList.add('main-nav-trigger-text');
  navTrigger.appendChild(mainNavRow);

  navItem.appendChild(navTrigger);

  // Create the megamenu panel
  const megamenu = document.createElement('div');
  megamenu.className = 'megamenu-panel';
  megamenu.setAttribute('aria-hidden', 'true');

  const megamenuInner = document.createElement('div');
  megamenuInner.className = 'megamenu-inner';
  megamenuInner.appendChild(homeLinkRow);

  // Create columns container
  const columnsContainer = document.createElement('div');
  columnsContainer.className = 'megamenu-columns';

  const columnRows = rows.slice(2);

  // Process megamenu columns
  columnRows.forEach((row, index) => {
    row.classList.add('megamenu-column');
    row.setAttribute('data-column-index', index);

    const cells = [...row.children];

    cells.forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture) {
        cell.classList.add('megamenu-column-image');
        // const imageAltTextElem = cells[cellIndex + 1].querySelector('p');
        // if (imageAltTextElem) {
        //   const imageAltText = imageAltTextElem.textContent.trim();
        //   cell.querySelector('img').alt = imageAltText;
        //   imageAltTextElem.remove();
        // }
      }

      const lists = cell.querySelectorAll('ul');

      if (lists.length > 0) {
        cell.classList.add('megamenu-column-links');
        lists.forEach((list) => {
          list.classList.add('megamenu-link-list');
          list.querySelectorAll('li').forEach((li) => {
            li.classList.add('megamenu-link-item');
            const h3 = li.querySelector('h3');
            if (h3) {
              h3.classList.add('megamenu-category-title');
              li.classList.add('megamenu-category');
            }
            const anchor = li.querySelector('a');
            if (anchor) {
              anchor.classList.add('megamenu-link');
            }
          });
        });
      }
    });

    if (row.children.length > 0) {
      columnsContainer.appendChild(row);
    }
  });

  megamenuInner.appendChild(columnsContainer);

  megamenu.appendChild(megamenuInner);
  navItem.appendChild(megamenu);

  block.appendChild(navItem);
}
