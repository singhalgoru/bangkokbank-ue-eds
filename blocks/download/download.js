import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [linkCell, targetCell] = row.children;
    const anchor = linkCell?.querySelector('a');
    anchor?.setAttribute('target', targetCell?.textContent?.trim());
    anchor?.classList.add('download-file');

    const href = anchor?.getAttribute('href');
    if (href?.startsWith('/-/media')) {
      anchor.setAttribute('href', `https://www.bangkokbank.com${href}`);
    }

    const icon = document.createElement('span');
    icon.className = 'icon-download';
    anchor?.append(icon);

    linkCell.className = 'download-item';
    moveInstrumentation(row, linkCell);
    row.replaceWith(linkCell);
  });
}
