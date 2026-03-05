const getCellText = (cell) => cell?.textContent?.trim() || '';

export default function createDownloadButtonHTML(
  downloadLinkCell,
  downloadTextCell,
  downloadTitleCell,
  doc,
) {
  const authoredLink = downloadLinkCell?.querySelector('a');
  const href = authoredLink?.getAttribute('href') || authoredLink?.href || '';
  const text = authoredLink?.textContent?.trim() || '';

  if (!href || !text) return null;

  const anchor = doc.createElement('a');
  anchor.href = href;
  anchor.className = 'download-files icon-download';
  anchor.textContent = text;
  anchor.title = getCellText(downloadTitleCell) || text;

  if (href && href.startsWith('/-/media')) {
    anchor.setAttribute('href', `https://www.bangkokbank.com${href}`);
  }

  const wrapper = doc.createElement('div');
  wrapper.className = 'download-button-wrapper';
  wrapper.appendChild(anchor);
  return wrapper;
}
