export default function createDownloadLink(anchor, doc = document) {
  if (!anchor) return null;

  const anchorEl = anchor.tagName === 'A' ? anchor : anchor.querySelector('a');
  if (!anchorEl) return null;

  const wrapper = doc.createElement('div');
  wrapper.className = 'download-button-wrapper';

  const link = anchorEl.cloneNode(true);
  link.classList.remove('button-tertiary');
  link.classList.add('download-files', 'icon-download');

  const href = link.getAttribute('href');
  if (href && href.startsWith('/-/media')) {
    link.href = `https://www.bangkokbank.com${href}`;
  }

  wrapper.appendChild(link);
  return wrapper;
}
