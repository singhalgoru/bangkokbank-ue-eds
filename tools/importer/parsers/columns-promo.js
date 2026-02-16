/**
 * Parser for columns-promo block variant
 * Extracts promotional banner sections with image and text
 */
export function parse(element) {
  const cells = [];

  // Block name row
  cells.push(['Columns-Promo']);

  const row = [];

  // Determine layout order (image first or text first)
  const outer = element.querySelector('.outer');
  const thumb = element.querySelector('.thumb');

  // Check if image comes before text in DOM
  const imageFirst = thumb && outer &&
    thumb.compareDocumentPosition(outer) & Node.DOCUMENT_POSITION_FOLLOWING;

  // Image column
  const imgCol = document.createElement('div');
  const img = element.querySelector('.thumb img:not(.img-print)');
  if (img) {
    imgCol.appendChild(img.cloneNode(true));
  }

  // Content column
  const contentCol = document.createElement('div');

  const heading = element.querySelector('.content h2.title-1, .inner h2');
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    contentCol.appendChild(h2);
  }

  const desc = element.querySelector('.editor.text-default, .content .editor');
  if (desc) {
    const p = document.createElement('p');
    p.textContent = desc.textContent.trim();
    contentCol.appendChild(p);
  }

  const cta = element.querySelector('.button-group .btn-primary, .button-group a');
  if (cta) {
    const a = document.createElement('a');
    a.href = cta.href;
    a.textContent = cta.textContent.trim();
    contentCol.appendChild(a);
  }

  // Add columns in correct order
  if (imageFirst) {
    row.push(imgCol, contentCol);
  } else {
    row.push(contentCol, imgCol);
  }

  cells.push(row);

  return cells;
}
