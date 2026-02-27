export default function decorateDownloadLinks(block) {
  [...block.children].forEach((row) => {
    const [linkCell] = row.children;
    const anchor = linkCell?.querySelector('a');

    if (anchor) {
      anchor.classList.add('download-file');
      const href = anchor.getAttribute('href');
      if (href.startsWith('/-/media')) {
        anchor.setAttribute('href', `https://www.bangkokbank.com${href}`);
      }
      anchor.insertAdjacentHTML('beforeend', '<span class="icon-download"></span>');
    }

    linkCell.classList.add('download-item');
    row.replaceWith(linkCell);
  });
}
