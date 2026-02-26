export default function decorateDownloadLinks(container) {
  container.querySelectorAll('a').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (!href?.includes('/-/media')) return;

    anchor.classList.add('download-file');
    if (href.startsWith('/-/media')) {
      anchor.setAttribute('href', `${window.location.origin}${href}`);
    }
    if (!anchor.querySelector('.icon-download')) {
      anchor.insertAdjacentHTML('beforeend', '<span class="icon-download"></span>');
    }
  });
}
