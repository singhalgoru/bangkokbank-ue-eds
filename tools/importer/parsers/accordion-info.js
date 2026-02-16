/**
 * Parser for accordion-info block variant
 * Extracts collapsible/expandable content sections
 */
export function parse(element) {
  const cells = [];

  // Block name row
  cells.push(['Accordion-Info']);

  // Find all accordion items
  const items = element.querySelectorAll('.collapse-item');

  items.forEach(item => {
    const row = [];

    // Title column
    const titleCol = document.createElement('div');
    const header = item.querySelector('.collapse-header');
    if (header) {
      titleCol.textContent = header.textContent.trim();
    }
    row.push(titleCol);

    // Content column
    const contentCol = document.createElement('div');
    const inner = item.querySelector('.collapse-inner');
    if (inner) {
      const links = inner.querySelectorAll('a');
      links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.textContent.trim();
        contentCol.appendChild(a);
        contentCol.appendChild(document.createElement('br'));
      });
    }
    row.push(contentCol);

    cells.push(row);
  });

  return cells;
}
