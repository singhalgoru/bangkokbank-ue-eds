import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, createElementFromHTML } from '../../scripts/scripts.js';

function createMenuCardItem(cardElement, variant, doc) {
  const children = [...cardElement.children];

  const [
    imageDiv,
    altDiv,
    titleDiv,
    titleTypeDiv,
    descDiv,
    buttonDiv,
    enableDropdownDiv,
    dropdownLinksDiv,
    mobileExpDiv,
  ] = children;

  const title = titleDiv?.textContent.trim();
  const titleType = titleTypeDiv?.textContent.trim() || 'h3';
  const description = descDiv?.innerHTML;
  const enableDropdown = enableDropdownDiv?.textContent.trim() === 'true';

  const mobileExperience = mobileExpDiv?.textContent.trim() || 'default';

  const img = imageDiv?.querySelector('img');
  const button = buttonDiv?.querySelector('a');

  // main item
  const card = createElementFromHTML(
    `<div class="menu-card-item ${variant} ${mobileExperience}"></div>`,
    doc,
  );

  /* ---------- IMAGE ---------- */
  if (img) {
    const picture = createOptimizedPicture(
      img.src,
      altDiv?.textContent.trim() || title || '',
      false,
    );

    const optimizedImg = picture.querySelector('img');
    if (optimizedImg) {
      moveInstrumentation(img, optimizedImg);
      const imgWrapper = createElementFromHTML(
        '<div class="menu-card-image"></div>',
        doc,
      );
      imgWrapper.appendChild(picture);
      card.appendChild(imgWrapper);
    }
  }

  /* ---------- CONTENT ---------- */
  const content = createElementFromHTML(
    '<div class="menu-card-content"></div>',
    doc,
  );

  // title
  if (title) {
    const heading = createElementFromHTML(
      `<${titleType} class="menu-card-title">${title}</${titleType}>`,
      doc,
    );
    content.appendChild(heading);
  }

  // description
  if (description) {
    const desc = createElementFromHTML(
      `<div class="menu-card-description">${description}</div>`,
      doc,
    );
    content.appendChild(desc);
  }

  /* ---------- CTA / DOWNLOAD BUTTON ---------- */
  if (button) {
    const btnWrapper = createElementFromHTML(
      '<div class="menu-card-cta"></div>',
      doc,
    );

    btnWrapper.appendChild(button);

    /* ---------- DROPDOWN ---------- */
    if (variant === 'menu-card-cta-dropdown' && enableDropdown) {
      const dropdown = createElementFromHTML(
        '<div class="menu-card-dropdown"></div>',
        doc,
      );

      dropdown.innerHTML = dropdownLinksDiv?.innerHTML || '';
      btnWrapper.appendChild(dropdown);
    }

    content.appendChild(btnWrapper);
  }

  card.appendChild(content);

  return card;
}

export default function decorate(block) {
  const doc = block.ownerDocument;
  const rows = [...block.children];

  // first row = variant selector
  const variant = rows[0]?.textContent.trim() || 'menu-card-text-download';

  const container = createElementFromHTML(
    `<div class="menu-card-actions ${variant}"></div>`,
    doc,
  );

  const cards = rows.slice(1);

  cards.forEach((row) => {
    const card = createMenuCardItem(row, variant, doc);
    moveInstrumentation(row, card);
    container.appendChild(card);
  });

  block.textContent = '';
  block.appendChild(container);
}
