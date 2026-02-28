import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, createElementFromHTML } from '../../scripts/scripts.js';

function createMenuCardItem(cardElement, variant, doc) {
  const [
    imageDiv,
    titleDiv,
    descDiv,
    buttonDiv,
    enableDropdownDiv,
    dropdownLinksDiv,
  ] = [...cardElement.children];

  const title = titleDiv?.innerHTML.trim();
  const description = descDiv?.innerHTML;
  const enableDropdown = enableDropdownDiv?.textContent.trim() || true;
  const img = imageDiv?.querySelector('img');
  const button = buttonDiv?.querySelector('a');

  const card = createElementFromHTML('<div class="menu-card-action-item"></div>', doc);
  const inner = createElementFromHTML('<div class="menu-card-action-inner"></div>', doc);

  // image
  if (img) {
    const picture = createOptimizedPicture(
      img.src,
      title || '',
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
      createElementFromHTML(`<div class="menu-card-action-title">${title}</div>`, doc),
    );
  }

  if (button && variant !== 'menu-card-cta-dropdown') {
    inner.appendChild(button);
  }

  if (variant === 'menu-card-cta-dropdown' && enableDropdown) {
    const dropdown = createElementFromHTML(
      '<div class="menu-card-cta-dropdown-wrapper"></div>',
      doc,
    );

    const label = createElementFromHTML(
      `<span class="menu-card-cta-dropdown-text">${button?.textContent.trim() || ''}</span>`,
      doc,
    );

    const links = createElementFromHTML(
      '<div class="menu-card-cta-dropdown-links"></div>',
      doc,
    );

    if (dropdownLinksDiv) {
      links.innerHTML = dropdownLinksDiv.innerHTML;
    }

    dropdown.append(label, links);
    inner.appendChild(dropdown);
  } else if (button) {
    inner.appendChild(button);
  }

  // description
  if (description) {
    inner.appendChild(
      createElementFromHTML(`<p class="menu-card-action-description">${description}</p>`, doc),
    );
  }

  card.appendChild(inner);
  return card;
}

export default function decorate(block) {
  const doc = block.ownerDocument;
  const [variantRow, mobileRow, ...cardRows] = [...block.children];
  const variant = variantRow?.textContent.trim();
  const mobileExperience = mobileRow?.textContent.trim();

  const container = createElementFromHTML(
    `<div class="menu-card-action ${variant} ${mobileExperience}"></div>`,
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
