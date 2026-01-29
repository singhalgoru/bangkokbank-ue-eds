// Desktop media query
const isDesktop = window.matchMedia('(min-width: 1025px)');

/**
 * Decorates the Main Nav Item block.
 * Creates a megamenu navigation item with:
 * - A main navigation link/button that triggers the dropdown
 * - A megamenu panel containing multiple columns
 * - Each column has an optional image and categorized links
 * @param {Element} block The main-nav-item block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // First row contains the main nav item text and link
  const mainNavRow = rows[0];
  const mainNavText = mainNavRow.querySelector('p')?.textContent?.trim()
    || mainNavRow.textContent?.trim()
    || 'Navigation';
  const mainNavLink = mainNavRow.querySelector('a')?.href || '#';

  // Clear the block
  block.textContent = '';

  // Create the main nav item structure
  const navItem = document.createElement('div');
  navItem.className = 'main-nav-item-wrapper';

  // Create the nav trigger button/link
  const navTrigger = document.createElement('button');

  if (isDesktop.matches) {
    navTrigger.className = 'main-nav-trigger icon-dropdown';
  } else {
    navTrigger.className = 'main-nav-trigger icon-arrow-left';
  }

  navTrigger.setAttribute('aria-expanded', 'false');
  navTrigger.setAttribute('aria-haspopup', 'true');

  const navTriggerText = document.createElement('span');
  navTriggerText.className = 'main-nav-trigger-text';
  navTriggerText.textContent = mainNavText;
  navTrigger.appendChild(navTriggerText);

  // Add dropdown indicator icon
  // const dropdownIcon = document.createElement('span');
  // if (isDesktop.matches) {
  //   dropdownIcon.className = 'icon-dropdown';
  // } else {
  //   dropdownIcon.className = 'icon-arrow-left';
  // }
  // dropdownIcon.setAttribute('aria-hidden', 'true');
  // navTrigger.appendChild(dropdownIcon);

  navItem.appendChild(navTrigger);

  // Create the megamenu panel
  const megamenu = document.createElement('div');
  megamenu.className = 'megamenu-panel';
  megamenu.setAttribute('aria-hidden', 'true');

  // Create megamenu inner container
  const megamenuInner = document.createElement('div');
  megamenuInner.className = 'megamenu-inner';

  // Add the home link for this section at the top
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

  // Process megamenu columns (rows after the first one)
  const columnRows = rows.slice(1);
  columnRows.forEach((row, index) => {
    const column = document.createElement('div');
    column.className = 'megamenu-column';
    column.setAttribute('data-column-index', index);

    // Get cells from the row
    const cells = [...row.children];

    // Process each cell in the column row
    cells.forEach((cell) => {
      // Check for image
      const picture = cell.querySelector('picture');
      if (picture) {
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'megamenu-column-image';
        imageWrapper.appendChild(picture.cloneNode(true));
        column.appendChild(imageWrapper);
      }

      // Check for links/content (richtext with H3 headings and lists)
      const headings = cell.querySelectorAll('h3');
      const lists = cell.querySelectorAll('ul');

      if (headings.length > 0 || lists.length > 0) {
        const linksWrapper = document.createElement('div');
        linksWrapper.className = 'megamenu-column-links';

        // Process headings and their associated lists
        headings.forEach((heading) => {
          const categoryGroup = document.createElement('div');
          categoryGroup.className = 'megamenu-category';

          const categoryTitle = document.createElement('h3');
          categoryTitle.className = 'megamenu-category-title';
          categoryTitle.textContent = heading.textContent;
          categoryGroup.appendChild(categoryTitle);

          // Find the next sibling list after this heading
          let nextSibling = heading.nextElementSibling;
          while (nextSibling && nextSibling.tagName !== 'UL' && nextSibling.tagName !== 'H3') {
            nextSibling = nextSibling.nextElementSibling;
          }

          if (nextSibling && nextSibling.tagName === 'UL') {
            const linkList = document.createElement('ul');
            linkList.className = 'megamenu-link-list';

            [...nextSibling.children].forEach((li) => {
              const linkItem = document.createElement('li');
              linkItem.className = 'megamenu-link-item';

              const anchor = li.querySelector('a');
              if (anchor) {
                const link = document.createElement('a');
                link.href = anchor.href;
                link.className = 'megamenu-link';
                link.textContent = anchor.textContent;
                linkItem.appendChild(link);
              } else {
                linkItem.textContent = li.textContent;
              }

              linkList.appendChild(linkItem);
            });

            categoryGroup.appendChild(linkList);
          }

          linksWrapper.appendChild(categoryGroup);
        });

        // Handle standalone lists (without preceding h3)
        lists.forEach((list) => {
          // Skip if this list was already processed with a heading
          if (list.previousElementSibling?.tagName === 'H3') return;

          const linkList = document.createElement('ul');
          linkList.className = 'megamenu-link-list megamenu-link-list-standalone';

          [...list.children].forEach((li) => {
            const linkItem = document.createElement('li');
            linkItem.className = 'megamenu-link-item';

            const anchor = li.querySelector('a');
            if (anchor) {
              const link = document.createElement('a');
              link.href = anchor.href;
              link.className = 'megamenu-link';
              link.textContent = anchor.textContent;
              linkItem.appendChild(link);
            } else {
              linkItem.textContent = li.textContent;
            }

            linkList.appendChild(linkItem);
          });

          linksWrapper.appendChild(linkList);
        });

        if (linksWrapper.children.length > 0) {
          column.appendChild(linksWrapper);
        }
      }
    });

    // Only add column if it has content
    if (column.children.length > 0) {
      columnsContainer.appendChild(column);
    }
  });

  megamenuInner.appendChild(columnsContainer);
  megamenu.appendChild(megamenuInner);
  navItem.appendChild(megamenu);

  // Add event listeners for megamenu interaction
  navTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    const isExpanded = navTrigger.getAttribute('aria-expanded') === 'true';

    // Close other open megamenus
    document.querySelectorAll('.main-nav-trigger[aria-expanded="true"]').forEach((trigger) => {
      if (trigger !== navTrigger) {
        trigger.setAttribute('aria-expanded', 'false');
        trigger.closest('.main-nav-item-wrapper')
          ?.querySelector('.megamenu-panel')
          ?.setAttribute('aria-hidden', 'true');
      }
    });

    // Toggle current megamenu
    navTrigger.setAttribute('aria-expanded', !isExpanded);
    megamenu.setAttribute('aria-hidden', isExpanded);
  });

  // Close megamenu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navItem.contains(e.target)) {
      navTrigger.setAttribute('aria-expanded', 'false');
      megamenu.setAttribute('aria-hidden', 'true');
    }
  });

  // Keyboard navigation
  navTrigger.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      navTrigger.setAttribute('aria-expanded', 'false');
      megamenu.setAttribute('aria-hidden', 'true');
      navTrigger.focus();
    }
  });

  block.appendChild(navItem);
}
