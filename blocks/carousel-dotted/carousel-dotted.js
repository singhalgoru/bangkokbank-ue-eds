import { moveInstrumentation } from '../../scripts/scripts.js';
import {
  readBoolean,
  readDotsAlignment,
  readPosition,
  readArrowsAlignment,
  readAnimation,
} from '../../scripts/helper-files/carousel-helpers.js';

/**
 * Build a slide WITH IMAGE variation
 * Structure: Badge Text | Image | Description | Link
 */
function buildSlideWithImage(row, index, cells) {
  const slide = document.createElement('div');
  slide.className = 'carousel-item with-image';
  slide.dataset.index = index;
  moveInstrumentation(row, slide);

  // Create and append background image if it exists
  const picture = cells[2]?.querySelector('picture');
  if (picture) {
    const media = document.createElement('div');
    media.className = 'carousel-bg';
    media.append(picture);
    slide.append(media);
  }

  // Create content container
  const content = document.createElement('div');
  content.className = 'carousel-content';

  // Badge text (cell 1)
  const badgeText = cells[1]?.textContent.trim();
  if (badgeText) {
    const badge = document.createElement('div');
    badge.className = 'carousel-badge';
    badge.textContent = badgeText;
    content.append(badge);
  }

  // Description (cell 3)
  if (cells[3]) {
    const description = document.createElement('div');
    description.className = 'carousel-description';
    while (cells[3].firstChild) description.append(cells[3].firstChild);
    content.append(description);
  }

  // Link/Button (cell 4)
  const link = cells[4]?.querySelector('a');
  if (link) {
    content.append(link);
  }

  slide.append(content);
  return slide;
}

/**
 * Build a slide WITHOUT IMAGE variation
 * Structure: Header Text | Default Text
 */
function buildSlideWithoutImage(row, index, cells) {
  const slide = document.createElement('div');
  slide.className = 'carousel-item without-image';
  slide.dataset.index = index;
  moveInstrumentation(row, slide);

  // Create content container
  const content = document.createElement('div');
  content.className = 'carousel-content';

  // Header text (cell 1)
  const headerText = cells[6]?.textContent.trim();
  if (headerText) {
    const header = document.createElement('div');
    header.className = 'carousel-header';
    header.textContent = headerText;
    content.append(header);
  }

  // Default text (cell 2)
  if (cells[7]) {
    const defaultText = document.createElement('div');
    defaultText.className = 'carousel-default-text';
    while (cells[7].firstChild) defaultText.append(cells[7].firstChild);
    content.append(defaultText);
  }

  slide.append(content);
  return slide;
}

/**
 * Build a slide - determines which variation to use and delegates
 */
function buildSlide(row, index) {
  const cells = [...row.children];

  // Check if this is a "with image" or "without image" slide
  // Check both cell 0 for boolean indicator and cell 2 for picture
  const withImageIndicator = cells[0]?.textContent.trim().toLowerCase();
  const picture = cells[2]?.querySelector('picture');

  // Determine if this is a with-image slide:
  // Either has "true" in cell 0 OR has a picture in cell 2
  const hasImage = (withImageIndicator === 'true' || !!picture);

  if (hasImage) {
    return buildSlideWithImage(row, index, cells);
  }
  return buildSlideWithoutImage(row, index, cells);
}

export default function decorate(block) {
  const rows = [...block.children];

  // Read configuration values from block rows
  const showDots = readBoolean(rows[0]);
  const dotsAlignment = readDotsAlignment(rows[1]);
  const dotsPosition = readPosition(rows[2]);
  const showArrows = readBoolean(rows[3]);
  const arrowsAlignment = readArrowsAlignment(rows[4]);
  const animationType = readAnimation(rows[5]);
  const autoScroll = readBoolean(rows[6]);
  const scrollTimeDelay = rows[7]?.textContent.trim() || '';
  const itemsToScroll = rows[8]?.textContent.trim() || '';
  let nextIndex = 9;
  let seeMoreLink = null;

  const seeMoreLinkRow = rows[nextIndex];
  if (seeMoreLinkRow) {
    const link = seeMoreLinkRow.querySelector('a');
    if (link) {
      seeMoreLink = link;
      nextIndex += 1;
    }
  }

  const slides = rows.slice(nextIndex);
  // Use the block element itself as the container
  block.className = 'carousel-dotted-container';

  // Add dots-related classes
  if (showDots) {
    block.classList.add(`dots-${dotsAlignment}-${dotsPosition}`);
  } else {
    block.classList.add('no-dots');
  }

  // Add arrows-related classes
  if (showArrows) {
    block.classList.add('show-arrows');
    block.classList.add(`arrows-${arrowsAlignment}`);
  }

  block.classList.add(`animation-${animationType}`);
  if (autoScroll) {
    block.classList.add('auto-scroll');
    if (scrollTimeDelay) block.dataset.scrollDelay = scrollTimeDelay;
  }
  if (itemsToScroll) block.dataset.itemsToScroll = itemsToScroll;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  const slideEls = slides.map((row, index) => {
    const slide = buildSlide(row, index);
    return slide;
  });

  // Determine if all slides have images, none have images, or it's mixed
  const slidesWithImage = slideEls.filter((slide) => slide.classList.contains('with-image')).length;
  const slidesWithoutImage = slideEls.filter((slide) => slide.classList.contains('without-image')).length;
  if (slidesWithImage > 0 && slidesWithoutImage === 0) {
    block.classList.add('all-with-image');
  } else if (slidesWithoutImage > 0 && slidesWithImage === 0) {
    block.classList.add('all-without-image');
  } else if (slidesWithImage > 0 && slidesWithoutImage > 0) {
    block.classList.add('mixed-image-slides');
  }
  const dots = document.createElement('ul');
  dots.className = 'slick-dots';
  dots.setAttribute('role', 'tablist');

  // Create arrows
  const prevArrow = document.createElement('button');
  prevArrow.className = 'carousel-arrow carousel-arrow-prev';
  prevArrow.setAttribute('aria-label', 'Previous slide');
  prevArrow.type = 'button';

  const nextArrow = document.createElement('button');
  nextArrow.className = 'carousel-arrow carousel-arrow-next';
  nextArrow.setAttribute('aria-label', 'Next slide');
  nextArrow.type = 'button';

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

    // Update arrow states
    prevArrow.disabled = index === 0;
    nextArrow.disabled = index === slideEls.length - 1;
  }

  // Arrow click handlers
  prevArrow.addEventListener('click', () => {
    const currentIndex = slideEls.findIndex((slide) => slide.classList.contains('is-active'));
    if (currentIndex > 0) {
      setActive(currentIndex - 1);
    }
  });

  nextArrow.addEventListener('click', () => {
    const currentIndex = slideEls.findIndex((slide) => slide.classList.contains('is-active'));
    if (currentIndex < slideEls.length - 1) {
      setActive(currentIndex + 1);
    }
  });
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
  } else if (showArrows) {
    // Only append arrows if dots are not shown
    block.append(prevArrow, nextArrow);
  }

  if (seeMoreLink) {
    const moreWrap = document.createElement('div');
    moreWrap.className = 'carousel-dotted-more';
    seeMoreLink.classList.add('button-tertiary');
    moreWrap.append(seeMoreLink);
    block.append(moreWrap);
  }

  if (slideEls.length) {
    setActive(0);
  }
}
