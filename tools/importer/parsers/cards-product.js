/**
 * Parser for cards-product block variant
 * Extracts fund type cards from Bangkok Bank product grids
 */
export function parse(element) {
  const cells = [];

  // Block name row
  cells.push(['Cards-Product']);

  // Find all card items
  const cards = element.querySelectorAll('.thumb-default.full, .col-md-4 .thumb-default');

  cards.forEach(card => {
    const row = [];

    // Image column
    const imgCol = document.createElement('div');
    const img = card.querySelector('.thumb img:not(.img-print)');
    if (img) {
      imgCol.appendChild(img.cloneNode(true));
    }
    row.push(imgCol);

    // Content column
    const contentCol = document.createElement('div');

    const title = card.querySelector('h3.title-3, .caption h3');
    if (title) {
      const strong = document.createElement('strong');
      strong.textContent = title.textContent.trim();
      contentCol.appendChild(strong);
    }

    const desc = card.querySelector('.desc, .caption .desc');
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      contentCol.appendChild(p);
    }

    const link = card.querySelector('.button-group .btn-primary, a.btn-primary');
    if (link) {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent.trim();
      contentCol.appendChild(a);
    }

    row.push(contentCol);
    cells.push(row);
  });

  return cells;
}
