function getCellText(cell) {
  return cell?.textContent?.trim() || '';
}

/**
 * Creates the download action anchor from authored download fields.
 * @param {Element} downloadLinkCell
 * @param {Element} downloadTextCell
 * @param {Element} downloadTitleCell
 * @param {Document} doc
 * @returns {HTMLAnchorElement|null}
 */
export default function createDownloadButtonHTML(
  downloadLinkCell,
  downloadTextCell,
  downloadTitleCell,
  doc,
) {
  const authoredLink = downloadLinkCell?.querySelector('a');
  const href = authoredLink?.getAttribute('href') || authoredLink?.href || '';
  const text = getCellText(downloadTextCell) || authoredLink?.textContent?.trim() || '';

  if (!href || !text) return null;

  const title = getCellText(downloadTitleCell) || text;
  const anchor = doc.createElement('a');
  anchor.href = href;
  anchor.className = 'button download-file';
  anchor.textContent = text;

  if (title) {
    anchor.title = title;
  }

  return anchor;
}
