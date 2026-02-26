import { moveInstrumentation, decorateDownloadAnchor } from '../../scripts/scripts.js';

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [linkCell, targetCell] = row.children;
    const anchor = linkCell?.querySelector('a');
    decorateDownloadAnchor(anchor, targetCell?.textContent?.trim());

    linkCell.className = 'download-item';
    moveInstrumentation(row, linkCell);
    row.replaceWith(linkCell);
  });
}
