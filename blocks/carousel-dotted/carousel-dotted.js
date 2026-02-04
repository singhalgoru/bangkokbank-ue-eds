import { moveInstrumentation } from '../../scripts/scripts.js';

function readBoolean(cell, fallback = true) {
  console.warn('[carousel-dotted] readBoolean: Reading boolean value from cell', { cell, fallback });
  if (!cell) return fallback;
  const value = cell.textContent.trim().toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

function readAlignment(cell, fallback = 'center') {
  console.warn('[carousel-dotted] readAlignment: Reading alignment value from cell', { cell, fallback });
  if (!cell) return fallback;
  const value = cell.textContent.trim().toLowerCase();
  if (['left', 'center', 'right'].includes(value)) return value;
  return fallback;
}

function buildSlide(row, index) {
  console.warn(`[carousel-dotted] buildSlide: Building slide ${index}`, { row });
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
    console.warn(`[carousel-dotted] buildSlide: Adding badge to slide ${index}`, { badgeText });
    const badge = document.createElement('div');
    badge.className = 'carousel-badge';
    badge.textContent = badgeText;
    content.append(badge);
  }

  if (cells[2]) {
    console.warn(`[carousel-dotted] buildSlide: Adding title to slide ${index}`);
    const title = document.createElement('div');
    title.className = 'carousel-title';
    while (cells[2].firstChild) title.append(cells[2].firstChild);
    content.append(title);
  }

  const link = cells[3]?.querySelector('a');
  if (link) {
    console.warn(`[carousel-dotted] buildSlide: Adding CTA link to slide ${index}`, { linkHref: link.href });
    link.classList.add('carousel-cta');
    content.append(link);
  }

  slide.append(media, content);
  return slide;
}

export default function decorate(block) {
  console.warn('[carousel-dotted] decorate: Starting carousel decoration', { block });
  const rows = [...block.children];
  const showDots = readBoolean(rows[0]);
  const dotsAlignment = readAlignment(rows[1]);
  console.warn('[carousel-dotted] decorate: Configuration loaded', { showDots, dotsAlignment });
  let nextIndex = 2;
  let seeMoreLink = null;
  let seeMoreText = '';
  let seeMoreTitle = '';

  const seeMoreLinkRow = rows[nextIndex];
  console.warn('[carousel-dotted] decorate: Checking for "See More" link at index', nextIndex);
  if (seeMoreLinkRow && !seeMoreLinkRow.querySelector('picture')) {
    const link = seeMoreLinkRow.querySelector('a');
    if (link && seeMoreLinkRow.children.length === 1) {
      console.warn('[carousel-dotted] decorate: Found "See More" link', { link: link.href });
      seeMoreLink = link;
      nextIndex += 1;
      const textRow = rows[nextIndex];
      if (textRow && !textRow.querySelector('picture') && !textRow.querySelector('a')) {
        seeMoreText = textRow.textContent.trim();
        console.warn('[carousel-dotted] decorate: Found "See More" text', { seeMoreText });
        nextIndex += 1;
      }
      const titleRow = rows[nextIndex];
      if (titleRow && !titleRow.querySelector('picture') && !titleRow.querySelector('a')) {
        seeMoreTitle = titleRow.textContent.trim();
        console.warn('[carousel-dotted] decorate: Found "See More" title', { seeMoreTitle });
        nextIndex += 1;
      }
    }
  }

  const slides = rows.slice(nextIndex);
  console.warn('[carousel-dotted] decorate: Processing slides', { slideCount: slides.length, startIndex: nextIndex });

  block.classList.add(`carousel-dotted--dots-${dotsAlignment}`);
  if (!showDots) block.classList.add('carousel-dotted--no-dots');
  console.warn('[carousel-dotted] decorate: Applied carousel classes', { dotsAlignment, showDots });

  console.warn('[carousel-dotted] decorate: Creating carousel DOM structure');
  const container = document.createElement('div');
  container.className = 'carousel-container';

  const carousel = document.createElement('div');
  carousel.className = 'carousel';
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-roledescription', 'carousel');

  const list = document.createElement('div');
  list.className = 'slick-list';

  const track = document.createElement('div');
  track.className = 'slick-track';
  list.append(track);
  carousel.append(list);
  container.append(carousel);

  console.warn('[carousel-dotted] decorate: Building all slides');
  const slideEls = slides.map((row, index) => {
    const slide = buildSlide(row, index);
    track.append(slide);
    return slide;
  });
  console.warn('[carousel-dotted] decorate: All slides built and appended', { totalSlides: slideEls.length });

  console.warn('[carousel-dotted] decorate: Creating dots navigation');
  const dots = document.createElement('ul');
  dots.className = 'slick-dots';
  dots.setAttribute('role', 'tablist');

  let dotButtons;

  function setActive(index) {
    console.warn(`[carousel-dotted] setActive: Activating slide ${index}`);
    slideEls.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle('is-active', active);
      slide.classList.toggle('slick-current', active);
      slide.classList.toggle('slick-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    dotButtons.forEach(({ li, button }, i) => {
      const active = i === index;
      li.classList.toggle('slick-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.tabIndex = active ? 0 : -1;
    });
  }

  console.warn('[carousel-dotted] decorate: Creating dot buttons for navigation');
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
  console.warn('[carousel-dotted] decorate: Dot buttons created', { buttonCount: dotButtons.length });

  if (showDots) {
    console.warn('[carousel-dotted] decorate: Appending dots to container');
    container.append(dots);
  }

  if (seeMoreLink) {
    console.warn('[carousel-dotted] decorate: Adding "See More" link to carousel', { seeMoreText, seeMoreTitle });
    const moreWrap = document.createElement('div');
    moreWrap.className = 'carousel-dotted-more';
    seeMoreLink.classList.add('button-tertiary');
    if (seeMoreText) seeMoreLink.textContent = seeMoreText;
    if (seeMoreTitle) seeMoreLink.title = seeMoreTitle;
    moreWrap.append(seeMoreLink);
    container.append(moreWrap);
  }

  if (slideEls.length) {
    console.warn('[carousel-dotted] decorate: Setting first slide as active');
    setActive(0);
  }

  console.warn('[carousel-dotted] decorate: Carousel decoration complete, replacing block content');
  block.replaceChildren(container);
}
