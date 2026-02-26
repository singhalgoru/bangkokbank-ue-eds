import { createOptimizedPicture, loadCSS } from '../../scripts/aem.js';
import { moveInstrumentation, decorateDownloadAnchor } from '../../scripts/scripts.js';

function tryDecorateDownloadInCard(div) {
  if (div.children.length !== 2) return false;
  const linkCell = div.firstElementChild;
  const targetCell = div.lastElementChild;
  const anchor = linkCell?.querySelector('a');
  if (!anchor) return false;
  const targetValue = targetCell?.textContent?.trim() || '_self';
  const downloadItem = document.createElement('div');
  downloadItem.className = 'download-item';
  moveInstrumentation(div, downloadItem);
  downloadItem.append(anchor);
  decorateDownloadAnchor(anchor, targetValue);
  const bodyWrap = document.createElement('div');
  bodyWrap.className = 'cards-card-body';
  bodyWrap.append(downloadItem);
  div.replaceWith(bodyWrap);
  return true;
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  let hasDownloadInCards = false;
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
        if (tryDecorateDownloadInCard(div)) hasDownloadInCards = true;
      }
    });
    ul.append(li);
  });
  if (hasDownloadInCards) {
    loadCSS(`${window.hlx.codeBasePath}/blocks/download/download.css`);
  }
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.replaceChildren(ul);
}
