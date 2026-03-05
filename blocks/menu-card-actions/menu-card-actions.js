import { moveInstrumentation, createElementFromHTML } from '../../scripts/scripts.js';
import createDownloadButtonHTML from '../../scripts/helper-files/download-helpers.js';
import createGlobalDropdown from '../../scripts/helper-files/dropdown-helpers.js';
import { decorateButtonsV1 } from '../../scripts/bbl-decorators.js';

const getCellText = (cell) => cell?.textContent?.trim().toLowerCase() || '';

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
    const value = getCellText(cell);
    return value === 'default' || value === 'download';
  });
  const actionType = actionTypeCellIndex >= 0
    ? getCellText(cells[actionTypeCellIndex])
    : 'default';
  const isDownload = actionType === 'download';
  const defaultButtonCell = isNewModel ? (cells[6] || buttonDiv) : buttonDiv;
  const buttonAnchor = defaultButtonCell?.querySelector('a') || buttonDiv?.querySelector('a');
  const actionAnchorCell = actionTypeCellIndex >= 0
    ? cells.slice(actionTypeCellIndex + 1).find((cell) => cell?.querySelector?.('a'))
    : null;
  const resolvedEnableDropdownDiv = enableDropdownDiv
    || (isNewModel ? cells[12] : null);
  const resolvedDropdownLinksDiv = dropdownLinksDiv
    || (isNewModel ? cells[13] : null)
    || cells.slice(actionTypeCellIndex + 1).find((cell) => cell?.querySelectorAll?.('a')?.length > 1);

  const downloadButton = isDownload
    ? createDownloadButtonHTML(
      isNewModel ? downloadLinkDiv : actionAnchorCell,
      isNewModel ? downloadLinkTextDiv : null,
      isNewModel ? downloadLinkTitleDiv : null,
      doc,
    )
    : null;

  const inner = createElementFromHTML('<div class="menu-card-action-inner"></div>', doc);

  const img = imageDiv?.querySelector('img');
  if (img) inner.appendChild(img.cloneNode(true));

  const title = titleDiv?.innerHTML?.trim();
  if (title) {
    inner.appendChild(createElementFromHTML(`<div class="menu-card-action-title">${title}</div>`, doc));
  }

  const description = descDiv?.innerHTML;
  if (description) {
    inner.appendChild(createElementFromHTML(`<div class="menu-card-action-description">${description}</div>`, doc));
    inner.querySelector('.menu-card-action-title')?.classList.add('has-description');
  }

  if (downloadButton && variant === 'menu-card-text-download') {
    inner.appendChild(downloadButton);
  } else if (variant === 'menu-card-cta-dropdown') {
    if (getCellText(resolvedEnableDropdownDiv) === 'true') {
      const linksHTML = resolvedDropdownLinksDiv?.querySelector('a') ? resolvedDropdownLinksDiv.innerHTML : '';
      const dropdown = createGlobalDropdown(buttonAnchor?.textContent.trim() || 'Select', linksHTML, doc);
      inner.appendChild(dropdown);
    } else if (buttonAnchor && actionType !== 'download') {
      buttonAnchor.classList.add('button-m');
      inner.appendChild(buttonAnchor);
    }
  } else if (variant === 'menu-card-text-download') {
    const actionSource = (isNewModel ? buttonDiv : actionAnchorCell)?.cloneNode(true);
    const actionAnchor = actionSource?.querySelector('a');

    if (actionSource && actionType === 'default' && actionAnchor) {
      decorateButtonsV1(actionSource);
      const decorated = actionSource.querySelector('a');
      if (decorated) {
        decorated.classList.add('button-m');
        inner.appendChild(decorated);
      }
    } else if (buttonAnchor) {
      buttonAnchor.classList.add('button-m');
      inner.appendChild(buttonAnchor);
    } else if (buttonDiv?.innerHTML && actionType !== 'default' && actionType !== 'download') {
      inner.innerHTML += buttonDiv.innerHTML.trim();
    }
  }

  const card = createElementFromHTML('<div class="menu-card-action-item"></div>', doc);
  card.appendChild(inner);
  return card;
}

export default function decorate(block) {
  const doc = block.ownerDocument;
  const [variantRow, mobileRow, ...cardRows] = [...block.children];

  const container = createElementFromHTML(
    `<div class="menu-card-action ${variantRow?.textContent?.trim()} ${mobileRow?.textContent?.trim()}"></div>`,
    doc,
  );

  cardRows.forEach((row) => {
    const card = createMenuCardItem(row, variantRow?.textContent?.trim(), doc);
    moveInstrumentation(row, card);
    container.appendChild(card);
  });

  block.textContent = '';
  block.appendChild(container);
}
