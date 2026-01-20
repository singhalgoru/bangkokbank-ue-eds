export default function decorate(block) {
  const items = document.createElement('div');
  items.className = 'hero-items';

  [...block.children].forEach((row) => {
    const [imageCell, altCell, textCell] = [...row.children];
    const item = document.createElement('div');
    item.className = 'hero-item';

    const picture = imageCell?.querySelector('picture');
    const img = picture?.querySelector('img');
    const alt = altCell?.textContent?.trim();
    if (img && alt) img.alt = alt;

    if (picture) item.append(picture);

    const content = document.createElement('div');
    content.className = 'hero-item-content';
    if (textCell) content.append(...textCell.childNodes);
    item.append(content);

    items.append(item);
  });

  block.replaceChildren(items);
}

