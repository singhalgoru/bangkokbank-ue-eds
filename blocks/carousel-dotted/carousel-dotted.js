import { moveInstrumentation } from '../../scripts/scripts.js';
import { readBoolean, readDotsAlignment } from '../../scripts/helper-files/carousel-helpers.js';

function buildSlide(row, index) {
  const cells = [...row.children];
  const slide = document.createElement('div');
  slide.className = 'carousel-item';
  slide.dataset.index = index;
  moveInstrumentation(row, slide);

  const media = document.createElement('div');
  media.className = 'carousel-bg';
  const picture = cells[1]?.querySelector('picture');
  if (picture) {
    media.append(picture);
  }

  const content = document.createElement('div');
  content.className = 'carousel-content';

  const badgeText = cells[0]?.textContent.trim();
  if (badgeText) {
    const badge = document.createElement('div');
    badge.className = 'carousel-badge';
    badge.textContent = badgeText;
    content.append(badge);
  }

  if (cells[2]) {
    const title = document.createElement('div');
    title.className = 'carousel-title';
    while (cells[2].firstChild) title.append(cells[2].firstChild);
    content.append(title);
  }

  const link = cells[3]?.querySelector('a');
  if (link) {
    content.append(link);
  }

  slide.append(media, content);
  return slide;
}

export default function decorate(block) {
  const rows = [...block.children];
  const showDots = readBoolean(rows[0]);
  const dotsAlignment = readDotsAlignment(rows[1]);
  let nextIndex = 2;
  let seeMoreLink = null;
  let seeMoreText = '';
  let seeMoreTitle = '';

  const seeMoreLinkRow = rows[nextIndex];
  if (seeMoreLinkRow && !seeMoreLinkRow.querySelector('picture')) {
    const link = seeMoreLinkRow.querySelector('a');
    if (link && seeMoreLinkRow.children.length === 1) {
      seeMoreLink = link;
      nextIndex += 1;
      const textRow = rows[nextIndex];
      if (textRow && !textRow.querySelector('picture') && !textRow.querySelector('a')) {
        seeMoreText = textRow.textContent.trim();
        nextIndex += 1;
      }
      const titleRow = rows[nextIndex];
      if (titleRow && !titleRow.querySelector('picture') && !titleRow.querySelector('a')) {
        seeMoreTitle = titleRow.textContent.trim();
        nextIndex += 1;
      }
    }
  }

  const slides = rows.slice(nextIndex);
  // Use the block element itself as the container
  block.className = 'carousel-dotted-container';
  block.classList.add(`dots-${dotsAlignment}`);
  if (!showDots) block.classList.add('no-dots');
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  const slideEls = slides.map((row, index) => {
    const slide = buildSlide(row, index);
    return slide;
  });
  const dots = document.createElement('ul');
  dots.className = 'slick-dots';
  dots.setAttribute('role', 'tablist');

  let dotButtons;

  function setActive(index) {
    slideEls.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle('is-active', active);
      slide.classList.toggle('is-current', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    dotButtons.forEach(({ li, button }, i) => {
      const active = i === index;
      li.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.tabIndex = active ? 0 : -1;
    });
  }
  dotButtons = slideEls.map((slide, index) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'presentation');
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-label', `Slide ${index + 1}`);
    button.addEventListener('click', () => setActive(index));
    li.append(button);
    dots.append(li);
    return { li, button };
  });
  // Clear block and append slides directly
  block.replaceChildren(...slideEls);

  if (showDots) {
    block.append(dots);
  }

  if (seeMoreLink) {
    const moreWrap = document.createElement('div');
    moreWrap.className = 'carousel-dotted-more';
    seeMoreLink.classList.add('button-tertiary');
    if (seeMoreText) seeMoreLink.textContent = seeMoreText;
    if (seeMoreTitle) seeMoreLink.title = seeMoreTitle;
    moreWrap.append(seeMoreLink);
    block.append(moreWrap);
  }

  if (slideEls.length) {
    setActive(0);
  }
}
