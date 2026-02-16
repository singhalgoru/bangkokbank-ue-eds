import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Decorates the mega menu block
 * @param {Element} block The mega menu block element
 */
export default function decorate(block) {
  const menuItems = [...block.children];

  // Create the mega menu container
  const megaMenuContainer = document.createElement('div');
  megaMenuContainer.className = 'megamenu-container';

  menuItems.forEach((row) => {
    const menuItem = document.createElement('div');
    menuItem.className = 'megamenu-item';
    moveInstrumentation(row, menuItem);

    const cols = [...row.children];

    // First column is the menu category header
    if (cols[0]) {
      const categoryHeader = document.createElement('div');
      categoryHeader.className = 'megamenu-category';
      moveInstrumentation(cols[0], categoryHeader);

      // Get the category title and link
      const titleEl = cols[0].querySelector('h2, h3, h4, p strong, strong');
      const linkEl = cols[0].querySelector('a');

      if (titleEl || linkEl) {
        const title = document.createElement('button');
        title.className = 'megamenu-title';
        title.setAttribute('aria-expanded', 'false');
        title.textContent = titleEl?.textContent || linkEl?.textContent || 'Menu';

        if (linkEl) {
          title.dataset.href = linkEl.href;
        }

        // Add click handler for mobile toggle
        title.addEventListener('click', (e) => {
          const isExpanded = title.getAttribute('aria-expanded') === 'true';
          // Close all other menus
          block.querySelectorAll('.megamenu-title[aria-expanded="true"]').forEach((btn) => {
            if (btn !== title) {
              btn.setAttribute('aria-expanded', 'false');
              btn.closest('.megamenu-item')?.classList.remove('expanded');
            }
          });
          // Toggle current menu
          title.setAttribute('aria-expanded', !isExpanded);
          menuItem.classList.toggle('expanded', !isExpanded);
        });

        categoryHeader.appendChild(title);
      }

      menuItem.appendChild(categoryHeader);
    }

    // Second column contains the dropdown content (columns/links)
    if (cols[1]) {
      const dropdownPanel = document.createElement('div');
      dropdownPanel.className = 'megamenu-panel';
      moveInstrumentation(cols[1], dropdownPanel);

      // Process the content - look for column groups
      const columnGroups = cols[1].querySelectorAll('ul');

      if (columnGroups.length > 0) {
        const columnsContainer = document.createElement('div');
        columnsContainer.className = 'megamenu-columns';

        columnGroups.forEach((ul) => {
          const column = document.createElement('div');
          column.className = 'megamenu-column';

          // Check if there's a heading before the ul
          const prevSibling = ul.previousElementSibling;
          if (prevSibling && (prevSibling.tagName === 'H3' || prevSibling.tagName === 'H4' || prevSibling.tagName === 'P')) {
            const columnTitle = document.createElement('h4');
            columnTitle.className = 'megamenu-column-title';
            columnTitle.textContent = prevSibling.textContent;
            column.appendChild(columnTitle);
          }

          // Process list items
          const navList = document.createElement('ul');
          navList.className = 'megamenu-list';

          ul.querySelectorAll('li').forEach((li) => {
            const navItem = document.createElement('li');
            navItem.className = 'megamenu-list-item';

            const link = li.querySelector('a');
            if (link) {
              const navLink = document.createElement('a');
              navLink.href = link.href;
              navLink.textContent = link.textContent;
              navLink.className = 'megamenu-link';
              navItem.appendChild(navLink);
            } else {
              navItem.textContent = li.textContent;
            }

            navList.appendChild(navItem);
          });

          column.appendChild(navList);
          columnsContainer.appendChild(column);
        });

        dropdownPanel.appendChild(columnsContainer);
      } else {
        // Simple content without columns
        dropdownPanel.innerHTML = cols[1].innerHTML;
      }

      // Add featured/promo section if there's a third column
      if (cols[2]) {
        const promoSection = document.createElement('div');
        promoSection.className = 'megamenu-promo';
        moveInstrumentation(cols[2], promoSection);

        const picture = cols[2].querySelector('picture');
        if (picture) {
          promoSection.appendChild(picture.cloneNode(true));
        }

        const promoTitle = cols[2].querySelector('h3, h4, p strong');
        if (promoTitle) {
          const title = document.createElement('h4');
          title.className = 'megamenu-promo-title';
          title.textContent = promoTitle.textContent;
          promoSection.appendChild(title);
        }

        const promoDesc = cols[2].querySelector('p:not(:has(strong)):not(:has(a))');
        if (promoDesc) {
          const desc = document.createElement('p');
          desc.className = 'megamenu-promo-desc';
          desc.textContent = promoDesc.textContent;
          promoSection.appendChild(desc);
        }

        const promoLink = cols[2].querySelector('a');
        if (promoLink) {
          const link = document.createElement('a');
          link.href = promoLink.href;
          link.textContent = promoLink.textContent;
          link.className = 'megamenu-promo-link';
          promoSection.appendChild(link);
        }

        dropdownPanel.appendChild(promoSection);
      }

      menuItem.appendChild(dropdownPanel);
    }

    megaMenuContainer.appendChild(menuItem);
  });

  // Clear and append
  block.textContent = '';
  block.appendChild(megaMenuContainer);

  // Add keyboard navigation
  block.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      block.querySelectorAll('.megamenu-title[aria-expanded="true"]').forEach((btn) => {
        btn.setAttribute('aria-expanded', 'false');
        btn.closest('.megamenu-item')?.classList.remove('expanded');
      });
    }
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) {
      block.querySelectorAll('.megamenu-title[aria-expanded="true"]').forEach((btn) => {
        btn.setAttribute('aria-expanded', 'false');
        btn.closest('.megamenu-item')?.classList.remove('expanded');
      });
    }
  });
}
