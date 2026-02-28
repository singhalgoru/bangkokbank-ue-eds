import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, createElementFromHTML } from '../../scripts/scripts.js';

function createMenuCardItem(cardElement, variant, doc) {
  const children = [...cardElement.children];

  const [
    imageDiv,
    altDiv,
    titleDiv,
    descDiv,
    buttonDiv,
    enableDropdownDiv,
    dropdownLinksDiv,
  ] = children;

  const title = titleDiv?.innerHTML.trim();
  const description = descDiv?.innerHTML;
  const enableDropdown = enableDropdownDiv?.textContent.trim() === 'true';

  const img = imageDiv?.querySelector('img');
  const button = buttonDiv?.querySelector('p');

  const card = createElementFromHTML(
    '<div class="menu-card-actions-item"></div>',
    doc,
  );

  const inner = createElementFromHTML(
    '<div class="menu-card-actions-inner"></div>',
    doc,
  );

  // image
  if (img) {
    const picture = createOptimizedPicture(
      img.src,
      altDiv?.textContent.trim() || title || '',
      false,
    );

    const optimizedImg = picture.querySelector('img');
    if (optimizedImg) {
      moveInstrumentation(img, optimizedImg);
      inner.appendChild(picture);
    }
  }

  // title
  if (title) {
    inner.appendChild(
      createElementFromHTML(`<div class="menu-card-actions-title">${title}</div>`, doc),
    );
  }

  // button + optional dropdown
  if (button) {
    inner.appendChild(button);

    if (variant === 'menu-card-actions-cta-dropdown' && enableDropdown) {
      const dropdown = createElementFromHTML(
        '<div class="menu-card-actions-dropdown"></div>',
        doc,
      );
      dropdown.innerHTML = dropdownLinksDiv?.innerHTML || '';
      inner.appendChild(dropdown);
    }
  }

  // description
  if (description) {
    inner.appendChild(
      createElementFromHTML(
        `<p class="menu-card-actions-description">${description}</p>`,
        doc,
      ),
    );
  }

  card.appendChild(inner);

  return card;
}

export default function decorate(block) {
  const doc = block.ownerDocument;
  const [firstRow, ...cardRows] = [...block.children];
  const [variantDiv, mobileDiv] = [...(firstRow?.children || [])];
  const variant = variantDiv?.textContent.trim() || 'menu-card-actions--text-download';
  const mobileExperience = mobileDiv?.textContent.trim() || 'default';

  const container = createElementFromHTML(
    `<div class="menu-card-actions ${variant} ${mobileExperience}"></div>`,
    doc,
  );

  cardRows.forEach((row) => {
    const card = createMenuCardItem(row, variant, doc);
    moveInstrumentation(row, card);
    container.appendChild(card);
  });

  block.textContent = '';
  block.appendChild(container);
}
