import createDownloadButtonHTML from '../../scripts/helper-files/download-helpers.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  block.textContent = '';
  const button = createDownloadButtonHTML(rows[0], rows[1], rows[2], block.ownerDocument);
  if (button) block.appendChild(button);
}
