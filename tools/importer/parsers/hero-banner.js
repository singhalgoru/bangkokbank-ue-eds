/**
 * Parser for hero-banner block variant
 * Extracts hero content from Bangkok Bank banner sections
 */
export function parse(element) {
  const cells = [];

  // Block name row
  cells.push(['Hero-Banner']);

  // Image row
  const img = element.querySelector('.thumb img:not(.img-print)');
  if (img) {
    cells.push([img.cloneNode(true)]);
  }

  // Content row
  const contentCell = document.createElement('div');

  const heading = element.querySelector('h3.title-1, h3.mobile-title-1');
  if (heading) {
    const h1 = document.createElement('h1');
    h1.textContent = heading.textContent.trim();
    contentCell.appendChild(h1);
  }

  const description = element.querySelector('.caption p, .desktop-banner p');
  if (description) {
    const p = document.createElement('p');
    // Get text content without the button
    const textContent = description.childNodes[0]?.textContent?.trim();
    if (textContent) {
      p.textContent = textContent;
      contentCell.appendChild(p);
    }
  }

  const cta = element.querySelector('.btn-primary');
  if (cta) {
    const link = document.createElement('a');
    link.href = cta.href;
    link.textContent = cta.textContent.trim();
    contentCell.appendChild(link);
  }

  if (contentCell.children.length > 0) {
    cells.push([contentCell]);
  }

  return cells;
}
