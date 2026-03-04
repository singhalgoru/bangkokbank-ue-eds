import { moveInstrumentation, createElementFromHTML } from '../../scripts/scripts.js';
import createDownloadButtonHTML from '../../scripts/helper-files/download-helpers.js';

function createMenuCardItem(cardElement, variant, doc) {
  const cells = [...cardElement.children];
  const isNewModel = cells.length >= 14;
  let imageDiv;
  let titleDiv;
  let descDiv;
  let buttonDiv;
  let enableDropdownDiv;
  let dropdownLinksDiv;
  let downloadLinkDiv = null;
  let downloadLinkTextDiv = null;
  let downloadLinkTitleDiv = null;

  if (isNewModel) {
    [
      imageDiv,
      titleDiv,,
      descDiv,,
      buttonDiv,
      ,
      ,,
      downloadLinkDiv,
      downloadLinkTextDiv,
      downloadLinkTitleDiv,
      enableDropdownDiv,
      dropdownLinksDiv,
    ] = cells;
  } else {
    [
      imageDiv,
      titleDiv,
      descDiv,
      buttonDiv,
      enableDropdownDiv,
      dropdownLinksDiv,
    ] = cells;
  }

  const title = titleDiv?.innerHTML?.trim();
  const description = descDiv?.innerHTML;
  const enableDropdown = enableDropdownDiv?.textContent?.trim().toLowerCase() === 'true';
  const img = imageDiv?.querySelector('img');
  const buttonHTML = buttonDiv?.innerHTML?.trim() || '';
  const buttonAnchor = buttonDiv?.querySelector('a');
  const downloadButton = createDownloadButtonHTML(
    downloadLinkDiv,
    downloadLinkTextDiv,
    downloadLinkTitleDiv,
    doc,
  );
  const isDownloadEnabled = Boolean(downloadButton);

  const card = createElementFromHTML(
    '<div class="menu-card-action-item"></div>',
    doc,
  );

  const inner = createElementFromHTML(
    '<div class="menu-card-action-inner"></div>',
    doc,
  );

  /* ---------------- IMAGE ---------------- */
  if (img) {
    const newImg = img.cloneNode(true);
    inner.appendChild(newImg);
  }

  /* ---------------- TITLE ---------------- */
  if (title) {
    inner.appendChild(
      createElementFromHTML(
        `<div class="menu-card-action-title">${title}</div>`,
        doc,
      ),
    );
  }

  /* ---------------- DESCRIPTION ---------------- */
  if (description) {
    inner.appendChild(
      createElementFromHTML(
        `<div class="menu-card-action-description">${description}</div>`,
        doc,
      ),
    );
    inner.querySelector('.menu-card-action-title')?.classList.add('has-description');
  }

  /* ---------------- BUTTON / DROPDOWN ---------------- */
  if (isDownloadEnabled && downloadButton) {
    inner.appendChild(downloadButton);
  } else if (variant === 'menu-card-cta-dropdown') {
    if (enableDropdown) {
      const dropdown = createElementFromHTML(
        '<div class="menu-card-cta-dropdown-wrapper"></div>',
        doc,
      );

      const label = createElementFromHTML(
        `<span class="menu-card-cta-dropdown-text">${buttonAnchor?.textContent.trim() || ''}</span>`,
        doc,
      );

      const links = createElementFromHTML(
        '<div class="menu-card-cta-dropdown-links"></div>',
        doc,
      );

      if (dropdownLinksDiv?.querySelector('ul')) {
        links.innerHTML = dropdownLinksDiv.innerHTML;
      }

      dropdown.append(label, links);
      inner.appendChild(dropdown);
    } else if (buttonAnchor) {
      buttonAnchor.classList.add('button-m');
      inner.appendChild(buttonAnchor);
    }
  } else if (variant === 'menu-card-text-download') {
    inner.innerHTML += buttonHTML;
  } else if (buttonAnchor) {
    buttonAnchor.classList.add('button-m');
    inner.appendChild(buttonAnchor);
  }

  card.appendChild(inner);
  return card;
}

export default function decorate(block) {
  const doc = block.ownerDocument;

  const [variantRow, mobileRow, ...cardRows] = [...block.children];

  const variant = variantRow?.textContent?.trim();
  const mobileExperience = mobileRow?.textContent?.trim();

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
