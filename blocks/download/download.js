import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [linkCell] = row.children;
    const anchor = linkCell?.querySelector('a');
    anchor?.classList.add('download-file');
    const href = anchor?.getAttribute('href');
    if (href?.startsWith('/-/media')) {
      anchor.setAttribute('href', `https://www.bangkokbank.com${href}`);
    }

    anchor.insertAdjacentHTML('beforeend', '<span class="icon-download"></span>');

    linkCell.className = 'download-item';
    moveInstrumentation(row, linkCell);
    row.replaceWith(linkCell);
  });
}
