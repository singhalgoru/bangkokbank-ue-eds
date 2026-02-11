// Desktop media query
const isDesktop = window.matchMedia('(min-width: 1025px)');

/**
 * Decorates the Main Nav Item block.
 * Creates a megamenu navigation item with:
 * - A main navigation link/button that triggers the dropdown
 * - A megamenu panel containing multiple columns
 * - Each column has an optional image and categorized links
 * Authoring fields are preserved by wrapping/moving existing DOM nodes
 * instead of clearing the block and rebuilding, so editor bindings remain.
 * @param {Element} block The main-nav-item block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // First row contains the main nav item text and link (preserve for authoring)
  const mainNavRow = rows[0];
  const mainNavText = mainNavRow.querySelector('p')?.textContent?.trim()
    || mainNavRow.textContent?.trim()
    || 'Navigation';
  const mainNavLink = mainNavRow.querySelector('a')?.href || '#';

  // Create the main nav item structure (do not clear block; move nodes instead)
  const navItem = document.createElement('div');
  navItem.className = 'main-nav-item-wrapper';

  // Create the nav trigger button and preserve the first row inside it for authoring
  const navTrigger = document.createElement('button');

  if (isDesktop.matches) {
    navTrigger.className = 'main-nav-trigger icon-dropdown';
  } else {
    navTrigger.className = 'main-nav-trigger icon-arrow-left';
  }

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

  // Add the home link for this section at the top (derived from first row data)
  if (mainNavLink && mainNavLink !== '#') {
    const homeLink = document.createElement('a');
    homeLink.href = mainNavLink;
    homeLink.className = 'megamenu-home-link';
    homeLink.textContent = `${mainNavText} Home`;
    megamenuInner.appendChild(homeLink);
  }

  // Add main nav item title before the columns
  const mainNavItemTitle = document.createElement('h2');
  mainNavItemTitle.className = 'main-nav-item-title';
  mainNavItemTitle.textContent = mainNavText;
  megamenuInner.appendChild(mainNavItemTitle);

  // Create columns container
  const columnsContainer = document.createElement('div');
  columnsContainer.className = 'megamenu-columns';

  // Process megamenu columns: add classes to existing rows/cells to preserve authoring
  const columnRows = rows.slice(1);
  columnRows.forEach((row, index) => {
    row.classList.add('megamenu-column');
    row.setAttribute('data-column-index', index);

    const cells = [...row.children];

    cells.forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture) {
        cell.classList.add('megamenu-column-image');
      }

      const headings = cell.querySelectorAll('h3');
      const lists = cell.querySelectorAll('ul');

      if (headings.length > 0 || lists.length > 0) {
        cell.classList.add('megamenu-column-links');

        // Wrap each H3 and its next UL in a category div (preserves original nodes)
        headings.forEach((heading) => {
          const categoryGroup = document.createElement('div');
          categoryGroup.className = 'megamenu-category';

          heading.classList.add('megamenu-category-title');

          let nextSibling = heading.nextElementSibling;
          while (nextSibling && nextSibling.tagName !== 'UL' && nextSibling.tagName !== 'H3') {
            nextSibling = nextSibling.nextElementSibling;
          }

          if (nextSibling && nextSibling.tagName === 'UL') {
            nextSibling.classList.add('megamenu-link-list');
            categoryGroup.appendChild(heading);
            categoryGroup.appendChild(nextSibling);
          } else {
            categoryGroup.appendChild(heading);
          }

          cell.appendChild(categoryGroup);
        });

        // Standalone lists (no preceding H3): add class and keep in place
        lists.forEach((list) => {
          if (list.previousElementSibling?.tagName === 'H3') return;
          list.classList.add('megamenu-link-list', 'megamenu-link-list-standalone');
        });

        // Add link item classes to existing li/a for styling (no new nodes)
        cell.querySelectorAll('.megamenu-link-list li').forEach((li) => {
          li.classList.add('megamenu-link-item');
          const anchor = li.querySelector('a');
          if (anchor) anchor.classList.add('megamenu-link');
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

  // Add event listeners for megamenu interaction
  navTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    const isExpanded = navTrigger.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.main-nav-trigger[aria-expanded="true"]').forEach((trigger) => {
      if (trigger !== navTrigger) {
        trigger.setAttribute('aria-expanded', 'false');
        trigger.closest('.main-nav-item-wrapper')
          ?.querySelector('.megamenu-panel')
          ?.setAttribute('aria-hidden', 'true');
      }
    });

    navTrigger.setAttribute('aria-expanded', !isExpanded);
    megamenu.setAttribute('aria-hidden', isExpanded);
  });

  document.addEventListener('click', (e) => {
    if (!navItem.contains(e.target)) {
      navTrigger.setAttribute('aria-expanded', 'false');
      megamenu.setAttribute('aria-hidden', 'true');
    }
  });

  navTrigger.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      navTrigger.setAttribute('aria-expanded', 'false');
      megamenu.setAttribute('aria-hidden', 'true');
      navTrigger.focus();
    }
  });

  block.appendChild(navItem);
}
