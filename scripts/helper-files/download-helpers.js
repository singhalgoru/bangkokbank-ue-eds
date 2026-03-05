export default function createDownloadLink(anchor, doc = document) {
  if (!anchor) return null;

  const wrapper = doc.createElement('div');
  wrapper.className = 'download-button-wrapper';

  const link = anchor.cloneNode(true);
  link.classList.add('download-files', 'icon-download');

  const href = link.getAttribute('href');
  if (href && href.startsWith('/-/media')) {
    link.href = `https://www.bangkokbank.com${href}`;
  }

  wrapper.appendChild(link);
  return wrapper;
}
