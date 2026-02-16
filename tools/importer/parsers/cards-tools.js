/**
 * Parser for cards-tools block variant
 * Extracts tool/assistance icon links
 */
export function parse(element) {
  const cells = [];

  // Block name row
  cells.push(['Cards-Tools']);

  // Find all tool items
  const items = element.querySelectorAll('.thumb-square, li');

  items.forEach(item => {
    const link = item.querySelector('a');
    if (!link) return;

    const row = [];

    // Icon column
    const iconCol = document.createElement('div');
    const icon = item.querySelector('.visual-img img, img');
    if (icon) {
      iconCol.appendChild(icon.cloneNode(true));
    }
    row.push(iconCol);

    // Link column
    const linkCol = document.createElement('div');
    const a = document.createElement('a');
    a.href = link.href;
    const label = item.querySelector('.sub-title-small, span:not(.visual-img)');
    a.textContent = label ? label.textContent.trim() : link.textContent.trim();
    linkCol.appendChild(a);
    row.push(linkCol);

    cells.push(row);
  });

  return cells;
}
