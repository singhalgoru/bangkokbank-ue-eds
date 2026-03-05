import { moveInstrumentation, createElementFromHTML } from '../../scripts/scripts.js';
import createDownloadButtonHTML from '../../scripts/helper-files/download-helpers.js';
import createGlobalDropdown from '../../scripts/helper-files/dropdown-helpers.js';
import { decorateButtonsV1 } from '../../scripts/bbl-decorators.js';

function createMenuCardItem(row, variant, doc) {
  const cells = [...row.children];
  const isNewModel = cells.length >= 14;
  const [
    imageDiv,
    titleDiv,
    descDiv,
    buttonDiv,
    enableDropdownDiv,
    dropdownLinksDiv,
    downloadLinkDiv,
    downloadLinkTextDiv,
    downloadLinkTitleDiv,
  ] = (isNewModel ? [0, 1, 3, 5, 13, 14, 10, 11, 12] : [0, 1, 2, 3, 4, 5]).map(
    (i) => cells[i],
  );

  const actionTypeCellIndex = cells.findIndex((cell) => {
    const value = cell?.textContent?.trim().toLowerCase();
    return value === 'default' || value === 'download';
  });
  const actionType = actionTypeCellIndex >= 0
    ? cells[actionTypeCellIndex]?.textContent?.trim().toLowerCase()
    : 'default';
  const isDownload = actionType === 'download';
  const isDropdownEnabled = enableDropdownDiv?.textContent?.trim().toLowerCase() === 'true';

  const inner = createElementFromHTML('<div class="menu-card-action-inner"></div>', doc);

  const img = imageDiv?.querySelector('img');
  if (img) inner.appendChild(img.cloneNode(true));

  const title = titleDiv?.innerHTML?.trim();
  if (title) {
    inner.appendChild(createElementFromHTML(`<div class="menu-card-action-title">${title}</div>`, doc));
  }

  const description = descDiv?.innerHTML?.trim();
  if (description) {
    inner.appendChild(createElementFromHTML(`<div class="menu-card-action-description">${description}</div>`, doc));
    inner.querySelector('.menu-card-action-title')?.classList.add('has-description');
  }

  if (variant === 'menu-card-cta-dropdown') {
    if (isDropdownEnabled) {
      // Show dropdown
      const buttonAnchor = buttonDiv?.querySelector('a');
      const buttonText = buttonAnchor?.textContent?.trim() || 'Select';
      const linksHTML = dropdownLinksDiv?.innerHTML?.trim() || '';

      if (linksHTML) {
        const dropdown = createGlobalDropdown(buttonText, linksHTML, doc);
        inner.appendChild(dropdown);
      }
    } else if (isDownload) {
      // Show download button
      const downloadButton = createDownloadButtonHTML(
        isNewModel ? downloadLinkDiv : cells[actionTypeCellIndex + 1],
        isNewModel ? downloadLinkTextDiv : null,
        isNewModel ? downloadLinkTitleDiv : null,
        doc,
      );
      if (downloadButton) inner.appendChild(downloadButton);
    } else {
      // Show regular button
      const buttonAnchor = buttonDiv?.querySelector('a');
      if (buttonAnchor) {
        const clonedButton = buttonAnchor.cloneNode(true);
        clonedButton.classList.add('button-m');
        inner.appendChild(clonedButton);
      }
    }
  } else if (variant === 'menu-card-text-download') {
    if (isDownload) {
      // Show download button
      const downloadButton = createDownloadButtonHTML(
        isNewModel ? downloadLinkDiv : cells[actionTypeCellIndex + 1],
        isNewModel ? downloadLinkTextDiv : null,
        isNewModel ? downloadLinkTitleDiv : null,
        doc,
      );
      if (downloadButton) inner.appendChild(downloadButton);
    } else {
      // Show regular button
      const buttonAnchor = buttonDiv?.querySelector('a');
      if (buttonAnchor) {
        const buttonContainer = buttonDiv.cloneNode(true);
        decorateButtonsV1(buttonContainer);
        const decoratedButton = buttonContainer.querySelector('a');
        if (decoratedButton) {
          decoratedButton.classList.add('button-m');
          inner.appendChild(decoratedButton);
        }
      }
    }
  }

  const card = createElementFromHTML('<div class="menu-card-action-item"></div>', doc);
  card.appendChild(inner);
  return card;
}

export default function decorate(block) {
  const doc = block.ownerDocument;
  const [variantRow, mobileRow, ...cardRows] = [...block.children];

  const variant = variantRow?.textContent?.trim() || 'default';
  const mobileExp = mobileRow?.textContent?.trim() || 'default';

  const container = createElementFromHTML(
    `<div class="menu-card-action ${variant} ${mobileExp}"></div>`,
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
