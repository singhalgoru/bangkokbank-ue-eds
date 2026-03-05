import { moveInstrumentation, createElementFromHTML } from '../../scripts/scripts.js';
import createDownloadButtonHTML from '../../scripts/helper-files/download-helpers.js';
import createGlobalDropdown from '../../scripts/helper-files/dropdown-helpers.js';
import { decorateButtonsV1 } from '../../scripts/bbl-decorators.js';

function getCellText(cell) {
  return cell?.textContent?.trim() || '';
}

function getCellByProp(cells, propName) {
  return cells.find((cell) => {
    const directProp = cell.getAttribute('data-aue-prop') || cell.getAttribute('data-richtext-prop');
    if (directProp === propName) return true;
    return Boolean(cell.querySelector(`[data-aue-prop="${propName}"], [data-richtext-prop="${propName}"]`));
  });
}

function getLinkHref(linkCell) {
  const authoredLink = linkCell?.querySelector('a');
  return authoredLink?.getAttribute('href') || authoredLink?.href || getCellText(linkCell);
}

function createDefaultButton({
  linkCell,
  linkTextCell,
  linkTitleCell,
  linkTypeCell,
  doc,
}) {
  const href = getLinkHref(linkCell);
  const text = getCellText(linkTextCell) || linkCell?.querySelector('a')?.textContent?.trim() || '';

  if (!href || !text) return null;

  const button = doc.createElement('a');
  button.href = href;
  button.textContent = text;
  button.title = getCellText(linkTitleCell) || text;
  button.className = 'button-m';

  const variant = getCellText(linkTypeCell).toLowerCase();
  if (variant === 'primary' || variant === 'secondary') {
    button.classList.add('button', variant);
  } else {
    button.classList.add('button-tertiary');
  }

  return button;
}

function createMenuCardItem(row, variant, doc) {
  const cells = [...row.children];
  const actionTypeCell = getCellByProp(cells, 'buttonActionType');
  const actionTypeCellIndex = actionTypeCell ? cells.indexOf(actionTypeCell) : -1;
  const actionType = actionTypeCell
    ? getCellText(actionTypeCell).toLowerCase()
    : 'default';
  const isNewModel = actionTypeCellIndex >= 0 || Boolean(getCellByProp(cells, 'linkText'));

  const imageDiv = getCellByProp(cells, 'menuCardImage') || cells[0];
  const titleDiv = getCellByProp(cells, 'title') || cells[isNewModel ? 2 : 1];
  const descDiv = getCellByProp(cells, 'description') || cells[isNewModel ? 4 : 2];

  const linkDiv = getCellByProp(cells, 'link') || (isNewModel ? cells[actionTypeCellIndex + 1] : cells[3]);
  const linkTextDiv = getCellByProp(cells, 'linkText') || (isNewModel ? cells[actionTypeCellIndex + 2] : null);
  const linkTitleDiv = getCellByProp(cells, 'linkTitle') || (isNewModel ? cells[actionTypeCellIndex + 3] : null);
  const linkTypeDiv = getCellByProp(cells, 'linkType') || (isNewModel ? cells[actionTypeCellIndex + 4] : null);
  const enableDropdownDiv = getCellByProp(cells, 'enableCtaDropdown')
    || (isNewModel ? cells[actionTypeCellIndex + 5] : cells[4]);
  const dropdownLinksDiv = getCellByProp(cells, 'drop-links')
    || (isNewModel ? cells[actionTypeCellIndex + 6] : cells[5]);
  const downloadLinkDiv = getCellByProp(cells, 'downloadLink')
    || cells[actionTypeCellIndex + 1];
  const downloadLinkTextDiv = getCellByProp(cells, 'downloadLinkText')
    || (isNewModel ? cells[actionTypeCellIndex + 2] : null);
  const downloadLinkTitleDiv = getCellByProp(cells, 'downloadLinkTitle')
    || (isNewModel ? cells[actionTypeCellIndex + 3] : null);

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
      const buttonText = getCellText(linkTextDiv)
        || linkDiv?.querySelector('a')?.textContent?.trim()
        || 'Select';
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
    } else if (isNewModel) {
      // Show regular button
      const defaultButton = createDefaultButton({
        linkCell: linkDiv,
        linkTextCell: linkTextDiv,
        linkTitleCell: linkTitleDiv,
        linkTypeCell: linkTypeDiv,
        doc,
      });
      if (defaultButton) inner.appendChild(defaultButton);
    } else {
      const buttonAnchor = linkDiv?.querySelector('a');
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
    } else if (isNewModel) {
      // Show regular button
      const defaultButton = createDefaultButton({
        linkCell: linkDiv,
        linkTextCell: linkTextDiv,
        linkTitleCell: linkTitleDiv,
        linkTypeCell: linkTypeDiv,
        doc,
      });
      if (defaultButton) inner.appendChild(defaultButton);
    } else {
      const buttonAnchor = linkDiv?.querySelector('a');
      if (buttonAnchor) {
        const buttonContainer = linkDiv.cloneNode(true);
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
