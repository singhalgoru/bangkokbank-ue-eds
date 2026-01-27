import { createOptimizedPicture } from '../../scripts/aem.js';
import {
  moveInstrumentation,
} from '../../scripts/scripts.js';

function buildCardButton({
  linkCell,
  textCell,
  titleCell,
  typeCell,
}) {
  const linkAnchor = linkCell?.querySelector('a');
  const href = linkAnchor?.href || linkCell?.textContent?.trim();
  if (!href) return null;

  const label = textCell?.textContent?.trim() || linkAnchor?.textContent?.trim();
  if (!label) return null;

  const title = titleCell?.textContent?.trim() || label;
  const type = typeCell?.textContent?.trim();

  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  a.title = title;
  a.className = ['button', type].filter(Boolean).join(' ');

  const p = document.createElement('p');
  p.className = 'button-container';
  p.append(a);
  return p;
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const cols = [...row.children];
    const [imageCell, textCell, linkCell, linkTextCell, linkTitleCell, linkTypeCell] = cols;

    // image
    const imageWrap = document.createElement('div');
    imageWrap.className = 'cards-card-image';
    const picture = imageCell?.querySelector('picture');
    if (picture) imageWrap.append(picture);
    li.append(imageWrap);

    // body
    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'cards-card-body';
    if (textCell) bodyWrap.append(...textCell.childNodes);

    // optional button (injected from button model)
    const button = buildCardButton({
      linkCell,
      textCell: linkTextCell,
      titleCell: linkTitleCell,
      typeCell: linkTypeCell,
    });
    if (button) bodyWrap.append(button);

    li.append(bodyWrap);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.replaceChildren(ul);
}
