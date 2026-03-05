import { moveInstrumentation, createElementFromHTML } from '../../scripts/scripts.js';
import createDownloadButtonHTML from '../../scripts/helper-files/download-helpers.js';
import createGlobalDropdown from '../../scripts/helper-files/dropdown-helpers.js';
import { decorateButtonsV1 } from '../../scripts/bbl-decorators.js';

function createMenuCardItem(row, variant, doc) {
  const cells = [...row.children];

  const imageDiv = cells[0];
  const titleDiv = cells[1];
  const descDiv = cells[2];
  const actionTypeDiv = cells[3];
  const buttonDiv = cells[4];
  const downloadLinkDiv = cells[5];
  const enableDropdownDiv = cells[6];
  const dropdownLinksDiv = cells[7];

  const actionType = actionTypeDiv?.textContent?.trim().toLowerCase() || 'default';
  const isDownload = actionType === 'download';
  const isDropdownEnabled = enableDropdownDiv?.textContent?.trim().toLowerCase() === 'true';

  const inner = createElementFromHTML('<div class="menu-card-action-inner"></div>', doc);

  const img = imageDiv?.querySelector('img');
  if (img) {
    inner.appendChild(img.cloneNode(true));
  }

  const title = titleDiv?.innerHTML?.trim();
  if (title) {
    inner.appendChild(
      createElementFromHTML(`<div class="menu-card-action-title">${title}</div>`, doc),
    );
  }

  const description = descDiv?.innerHTML?.trim();
  if (description) {
    inner.appendChild(
      createElementFromHTML(`<div class="menu-card-action-description">${description}</div>`, doc),
    );
    inner.querySelector('.menu-card-action-title')?.classList.add('has-description');
  }
  if (variant === 'menu-card-cta-dropdown') {
    if (isDropdownEnabled) {
      const buttonAnchor = buttonDiv?.querySelector('a');
      const buttonText = buttonAnchor?.textContent?.trim() || 'Select';
      const linksHTML = dropdownLinksDiv?.innerHTML?.trim() || '';

      if (linksHTML) {
        const dropdown = createGlobalDropdown(buttonText, linksHTML, doc);
        inner.appendChild(dropdown);
      }
    } else if (isDownload) {
      const downloadButton = createDownloadButtonHTML(downloadLinkDiv, doc);
      if (downloadButton) {
        inner.appendChild(downloadButton);
      }
    } else {
      const buttonAnchor = buttonDiv?.querySelector('a');
      if (buttonAnchor) {
        const clonedButton = buttonAnchor.cloneNode(true);
        clonedButton.classList.add('button-m');
        inner.appendChild(clonedButton);
      }
    }
  } else if (variant === 'menu-card-text-download') {
    if (isDownload) {
      const downloadButton = createDownloadButtonHTML(downloadLinkDiv, doc);
      if (downloadButton) {
        inner.appendChild(downloadButton);
      }
    } else {
      const buttonSource = buttonDiv?.cloneNode(true);
      if (buttonSource) {
        decorateButtonsV1(buttonSource);
        const decoratedButton = buttonSource.querySelector('a');
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
  const mobile = mobileRow?.textContent?.trim() || 'default';

  const container = createElementFromHTML(
    `<div class="menu-card-action ${variant} ${mobile}"></div>`,
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
