import { moveInstrumentation } from '../../scripts/scripts.js';
import {
  readBoolean,
  readDotsAlignment,
  readPosition,
  detectVariantHint,
} from '../../scripts/helper-files/carousel-helpers.js';
import { decorateButtonsV1 } from '../../scripts/bbl-decorators.js';

/**
 * Build a prop-name → cell map from a slide element's fields.
 *
 * In Universal Editor, AEM annotates each slide field with data-aue-prop.
 * These may be DIRECT children of the slide element OR nested inside a
 * wrapper div (depending on AEM version / rendering pipeline).
 * We use querySelectorAll so we find them at any depth.
 *
 * Falls back to positional array (cells = direct children) for
 * document-authored pages where no data-aue-prop attributes exist.
 */
function buildSlideCellMap(row) {
  const directChildren = [...row.children];

  // Try: find all data-aue-prop descendants (works for any nesting depth)
  const propEls = row.querySelectorAll('[data-aue-prop]');
  const cellMap = new Map();
  propEls.forEach((el) => {
    const prop = el.dataset.aueProp || el.getAttribute('data-aue-prop');
    if (prop && !cellMap.has(prop)) cellMap.set(prop, el); // first occurrence wins
  });

  const isUE = cellMap.size > 0;
  return { cellMap, isUE, cells: directChildren };
}

/**
 * Get a slide cell either by prop name (UE) or positional index (doc-authored).
 */
function getSlideCell(cellMap, isUE, cells, propName, fallbackIndex) {
  return isUE ? (cellMap.get(propName) ?? null) : cells[fallbackIndex];
}

/**
 * Read a boolean value from a slide field element.
 *
 * In document-authored pages the element's textContent is "true" or "false".
 * In AEM Universal Editor boolean fields (data-aue-type="boolean") may render
 * without text content — the value is stored in data-aue-value / data-value
 * attributes, or displayed via a <input type="checkbox" checked>.
 */
function readBoolCell(el) {
  if (!el) return false;
  // 1. textContent (document-authored / AEM table rendering)
  const text = el.textContent?.trim().toLowerCase();
  if (text === 'true') return true;
  if (text === 'false') return false;
  // 2. AEM UE attribute variants
  const attrs = [
    el.getAttribute?.('data-aue-value'),
    el.getAttribute?.('data-value'),
    el.dataset?.aueValue,
    el.dataset?.value,
  ];

  const isTrue = attrs.some((val) => val === 'true');
  if (isTrue) return true;

  const isFalse = attrs.some((val) => val === 'false');
  if (isFalse) return false;
  // 3. Checkbox input (UE inline edit)
  const check = el.querySelector?.('input[type="checkbox"]');
  if (check) return check.checked;
  return false;
}

/**
 * Return true if a slide image/reference cell has a value — either a rendered
 * <picture> element (document-authored) or a non-empty data-aue-value path
 * attribute (AEM UE reference field rendering).
 */
function hasImageValue(el) {
  if (!el) return false;
  if (el.querySelector?.('picture')) return true;
  const ref = el.getAttribute?.('data-aue-value')
    || el.getAttribute?.('data-value')
    || el.dataset?.aueValue
    || el.dataset?.value
    || '';
  return ref.trim().length > 0;
}

/**
 * Build a slide WITH IMAGE variation
 * Fields: withImage | badgeText | image | description | link | linkText | linkTitle | linkType
 */
function buildSlideWithImage(row, index, cellMap, isUE, cells) {
  const slide = document.createElement('div');
  slide.className = 'carousel-dotted-item with-image';
  slide.dataset.index = index;
  moveInstrumentation(row, slide);

  const get = (prop, idx) => getSlideCell(cellMap, isUE, cells, prop, idx);

  // Background image (cell 2 = "image")
  const picture = get('image', 2)?.querySelector('picture');
  if (picture) {
    const media = document.createElement('div');
    media.className = 'carousel-bg';
    media.append(picture);
    slide.append(media);
  }

  const content = document.createElement('div');
  content.className = 'carousel-dotted-content';

  // Badge text (cell 1 = "badgeText")
  const badgeText = get('badgeText', 1)?.textContent.trim();
  if (badgeText) {
    const badge = document.createElement('div');
    badge.className = 'carousel-badge';
    badge.textContent = badgeText;
    content.append(badge);
  }

  // Description (cell 3 = "description")
  const descCell = get('description', 3);
  if (descCell) {
    const description = document.createElement('div');
    description.className = 'carousel-dotted-description';
    // Use innerHTML copy (not DOM mutation) so the original cell stays intact
    description.innerHTML = descCell.innerHTML;
    content.append(description);
  }

  // Link/Button (cell 4 = "link")
  const link = get('link', 4)?.querySelector('a');
  if (link) {
    content.append(link);
  }

  slide.append(content);
  return slide;
}

/**
 * Build a slide WITHOUT IMAGE variation
 * Fields: withoutImage | headerText | default-text
 * Doc-authored positional map (all 13 model fields always present):
 *   0:withImage 1:badgeText 2:image 3:description 4:link 5:withoutImage
 *   6:linkText 7:linkTitle 8:linkType 9:headerText 10:default-text
 */
function buildSlideWithoutImage(row, index, cellMap, isUE, cells) {
  const slide = document.createElement('div');
  slide.className = 'carousel-dotted-item without-image';
  slide.dataset.index = index;
  moveInstrumentation(row, slide);

  const content = document.createElement('div');
  content.className = 'carousel-dotted-content';

  const get = (prop, idx) => getSlideCell(cellMap, isUE, cells, prop, idx);

  // Header text (cell 9 = "headerText")
  const headerText = get('headerText', 9)?.textContent.trim();
  if (headerText) {
    const header = document.createElement('div');
    header.className = 'carousel-dotted-header';
    header.textContent = headerText;
    content.append(header);
  }

  // Default text (cell 10 = "default-text")
  const defaultCell = get('default-text', 10);
  if (defaultCell) {
    const defaultText = document.createElement('div');
    defaultText.className = 'carousel-default-text';
    // Use innerHTML copy (not DOM mutation) so the original cell stays intact
    defaultText.innerHTML = defaultCell.innerHTML;
    content.append(defaultText);
  }

  slide.append(content);
  return slide;
}

/**
 * Build a slide HERO BANNER IMAGE CAROUSEL or TEXT ANIMATION VARIANT
 * Doc-authored positional map:
 *   11:hero-banner-image-carousel  12:text-animation-variant
 *   13:heroImage  14:imageAlt  15:title  16:subtitle  17:heroLink
 */
function buildSlideHeroVariant(row, index, cellMap, isUE, cells, variant) {
  const slide = document.createElement('div');
  slide.className = `carousel-item ${variant}`;
  slide.dataset.index = index;

  const get = (prop, idx) => getSlideCell(cellMap, isUE, cells, prop, idx);

  const heroImageCell = get('heroImage', 13);
  const titleCell = get('title', 15);
  const subtitleCell = get('subtitle', 16);
  const linkCell = get('heroLink', 17);

  const picture = heroImageCell?.querySelector('picture');
  if (picture) {
    const media = document.createElement('div');
    media.className = 'carousel-bg';
    media.append(picture);
    slide.append(media);
  }

  const content = document.createElement('div');
  content.className = 'carousel-content content';

  if (titleCell) {
    const title = document.createElement('div');
    title.classList.add('carousel-title', 'animated-text');
    title.innerHTML = titleCell.innerHTML;
    content.append(title);
  }

  if (subtitleCell) {
    const subtitle = document.createElement('div');
    subtitle.classList.add('carousel-subtitle', 'text-animation-variant', 'animated-text');
    subtitle.innerHTML = subtitleCell.innerHTML;
    content.append(subtitle);
  }

  if (linkCell) {
    content.innerHTML += linkCell.innerHTML;
  }

  decorateButtonsV1(content);
  content.querySelector('a')?.classList.add('button-m', 'animated-text');

  slide.append(content);
  return slide;
}

/**
 * Build a slide – determines which variation to use and delegates.
 * Reads fields by data-aue-prop name in UE; falls back to positional index otherwise.
 */
function buildSlide(row, index) {
  const { cellMap, isUE, cells } = buildSlideCellMap(row);

  const get = (prop, idx) => getSlideCell(cellMap, isUE, cells, prop, idx);

  const heroBannerImageCarousel = readBoolCell(get('hero-banner-image-carousel', 11));
  const textAnimationVariant = readBoolCell(get('text-animation-variant', 12));
  const hasImageIndicator = readBoolCell(get('withImage', 0));
  const hasImageUrl = hasImageValue(get('image', 2));

  if (heroBannerImageCarousel) {
    return buildSlideHeroVariant(row, index, cellMap, isUE, cells, 'hero-banner-image-carousel');
  }
  if (textAnimationVariant) {
    return buildSlideHeroVariant(row, index, cellMap, isUE, cells, 'text-animation-variant');
  }

  const hasImage = hasImageIndicator || hasImageUrl;
  if (hasImage) {
    return buildSlideWithImage(row, index, cellMap, isUE, cells);
  }
  return buildSlideWithoutImage(row, index, cellMap, isUE, cells);
}

/**
 * Initialize drag/swipe functionality for the carousel
 * @param {HTMLElement} block - The carousel block element
 * @param {Array} slideEls - Array of slide elements
 * @param {Function} setActive - Function to set active slide
 * @param {number} dragThreshold - Minimum drag distance to trigger slide change
 * @param {boolean} enableLooping - Whether to enable infinite looping
 */

function initializeDragSwipe(
  block,
  slideEls,
  setActive,
  dragThreshold = 50,
  enableLooping = false,
) {
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let hasMoved = false;

  const handleStart = (e) => {
    if (e.target.closest('a, button')) return;
    isDragging = true;
    hasMoved = false;
    startX = e.type === 'touchstart' ? e.touches[0].pageX : (e.pageX || e.clientX);
    currentX = startX;
    block.classList.add('is-dragging');
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    currentX = e.type === 'touchmove' ? e.touches[0].pageX : (e.pageX || e.clientX);
    if (Math.abs(currentX - startX) > 5) hasMoved = true;
  };

  const handleEnd = () => {
    if (!isDragging) return;

    isDragging = false;
    block.classList.remove('is-dragging');

    const deltaX = currentX - startX;

    if (hasMoved && Math.abs(deltaX) > dragThreshold) {
      const currentIndex = slideEls.findIndex((slide) => slide.classList.contains('is-active'));

      if (deltaX < -dragThreshold) {
        let nextIndex;
        if (enableLooping) {
          nextIndex = currentIndex < slideEls.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex < slideEls.length - 1 ? currentIndex + 1 : currentIndex;
        }
        if (nextIndex !== currentIndex) setActive(nextIndex);
      } else if (deltaX > dragThreshold) {
        let prevIndex;
        if (enableLooping) {
          prevIndex = currentIndex > 0 ? currentIndex - 1 : slideEls.length - 1;
        } else {
          prevIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
        }
        if (prevIndex !== currentIndex) setActive(prevIndex);
      }
    }

    // Reset drag state
    startX = 0;
    currentX = 0;
    hasMoved = false;
  };

  const handleCancel = () => {
    if (isDragging) {
      isDragging = false;
      block.classList.remove('is-dragging');
      startX = 0;
      currentX = 0;
      hasMoved = false;
    }
  };

  // Add mouse event listeners for desktop
  block.addEventListener('mousedown', handleStart);
  block.addEventListener('mousemove', handleMove);
  block.addEventListener('mouseup', handleEnd);
  block.addEventListener('mouseleave', handleCancel);

  // Add touch event listeners for mobile/tablet
  block.addEventListener('touchstart', handleStart, { passive: true });
  block.addEventListener('touchmove', handleMove, { passive: true });
  block.addEventListener('touchend', handleEnd);
  block.addEventListener('touchcancel', handleCancel);
}

/**
 * Initialize auto-scroll functionality for the carousel
 * @param {HTMLElement} block - The carousel block element
 * @param {Array} slideEls - Array of slide elements
 * @param {Function} setActive - Function to set active slide
 * @param {HTMLElement} prevArrow - Previous arrow button
 * @param {HTMLElement} nextArrow - Next arrow button
 * @param {Array} dotButtons - Array of dot button objects
 * @param {number} delay - Scroll delay in milliseconds
 * @param {number} itemsPerScroll - Number of items to scroll at once
 */
function initializeAutoScroll(
  block,
  slideEls,
  setActive,
  prevArrow,
  nextArrow,
  dotButtons,
  delay,
  itemsPerScroll,
) {
  let autoScrollInterval;

  const startAutoScroll = () => {
    if (autoScrollInterval) return;
    autoScrollInterval = setInterval(() => {
      const currentIndex = slideEls.findIndex((slide) => slide.classList.contains('is-active'));
      let nextIdx = currentIndex + itemsPerScroll;
      if (nextIdx >= slideEls.length) nextIdx = 0;
      setActive(nextIdx);
    }, delay);
  };

  const stopAutoScroll = () => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  };

  // Start auto-scroll immediately
  startAutoScroll();

  // Pause auto-scroll on hover
  block.addEventListener('mouseenter', stopAutoScroll);
  block.addEventListener('mouseleave', startAutoScroll);

  // Pause auto-scroll when user interacts with navigation
  const pauseAutoScrollOnInteraction = () => {
    stopAutoScroll();
    // Resume after a delay (2x the scroll delay)
    setTimeout(startAutoScroll, delay * 2);
  };

  prevArrow.addEventListener('click', pauseAutoScrollOnInteraction);
  nextArrow.addEventListener('click', pauseAutoScrollOnInteraction);
  dotButtons.forEach(({ button }) => {
    button.addEventListener('click', pauseAutoScrollOnInteraction);
  });

  // Clean up interval when block is removed from DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === block || node.contains(block)) {
          stopAutoScroll();
          observer.disconnect();
        }
      });
    });
  });

  if (block.parentNode) {
    observer.observe(block.parentNode, { childList: true });
  }
}

export default function decorate(block) {
  const rows = [...block.children];

  /**
   * Known config field names defined in the model (carousel-dotted).
   * Universal Editor stores each field as a row with data-aue-prop="<name>".
   * Conditional fields (e.g. link, linkText) are only stored when their
   * condition is true — so the number of config rows is variable.
   * We look up each field by prop name first, then fall back to a fixed
   * positional index for document-authored pages (no data-aue-prop attrs).
   */
  const CONFIG_PROPS = new Set([
    'filter',
    'dotsAlignment',
    'dotsPosition',
    'showLinks',
    'link',
    'linkText',
    'linkTitle',
    'linkType',
    'autoScroll',
    'scrollTimeDelay',
  ]);

  // ---------------------------------------------------------------------------
  // Detect Universal Editor context.
  //
  // AEM renders UE instrumentation attributes server-side, so they are present
  // even on the INITIAL page load (before client-side UE JS runs):
  //   • Config field rows  → data-aue-prop="<fieldName>"
  //   • Child item rows    → data-aue-resource="urn:..."  (their OWN resource URI)
  //
  // isUE is true when ANY child row carries at least one UE attribute.
  // This is more reliable than propMap.size > 0 because slide items have
  // data-aue-resource but NOT data-aue-prop, so propMap can be empty even
  // on a page that IS being served by Universal Editor.
  // ---------------------------------------------------------------------------
  const isUE = rows.some((row) => (
    row?.hasAttribute?.('data-aue-resource')
    || row?.hasAttribute?.('data-aue-prop')
    || row?.hasAttribute?.('data-aue-type')
  ));

  // Build a map: prop name → row element (for config field reads in UE)
  const propMap = new Map();
  if (isUE) {
    rows.forEach((row) => {
      const prop = row?.dataset?.aueProp || row?.getAttribute?.('data-aue-prop');
      if (prop && CONFIG_PROPS.has(prop)) propMap.set(prop, row);
    });
  }

  /**
   * Read a config row either by prop name (UE) or by positional index (doc-authored).
   */
  function getRow(propName, fallbackIndex) {
    return isUE ? (propMap.get(propName) ?? null) : rows[fallbackIndex];
  }

  // ---------------------------------------------------------------------------
  // Read configuration values
  // ---------------------------------------------------------------------------
  // Resolve the carousel variant. Priority order:
  //  1. data-aue-filter / data-filter / data-variant on the block element (UE)
  //  2. block className hints
  //  3. "filter" row content (doc-authored fallback via detectVariantHint rows scan)
  const carouselVariant = detectVariantHint(block, rows);
  const showDots = carouselVariant === 'showDots';
  const showArrowsDots = carouselVariant === 'showArrowsDots';

  const dotsAlignment = readDotsAlignment(getRow('dotsAlignment', 1));
  const dotsPosition = readPosition(getRow('dotsPosition', 2));
  const showLinks = readBoolean(getRow('showLinks', 3));

  let seeMoreLink = null;
  if (showLinks) {
    const linkRow = getRow('link', 4);
    const linkEl = linkRow?.querySelector('a');
    const linkUrl = linkEl ? linkEl.href : linkRow?.textContent.trim();
    const linkText = getRow('linkText', 5)?.textContent.trim();
    const linkTitle = getRow('linkTitle', 6)?.textContent.trim();
    const linkType = getRow('linkType', 7)?.textContent.trim().toLowerCase() || 'primary';

    if (linkUrl && linkText) {
      seeMoreLink = document.createElement('a');
      seeMoreLink.href = linkUrl;
      seeMoreLink.textContent = linkText;
      if (linkTitle) seeMoreLink.setAttribute('title', linkTitle);

      const btnClass = linkType.includes('button') ? linkType : `button-${linkType}`;
      seeMoreLink.className = `button ${btnClass}`;

      if (linkEl && linkEl.target) {
        seeMoreLink.target = linkEl.target;
      }
    }
  }

  const autoScroll = readBoolean(getRow('autoScroll', 8));
  const scrollTimeDelay = getRow('scrollTimeDelay', 9)?.textContent.trim() || '';

  // ---------------------------------------------------------------------------
  // Separate slides from config rows
  //
  // In AEM Universal Editor the correct discriminator for child component items
  // (slides) is data-aue-type="component". Only actual child items get this
  // type — config field rows use types like "select", "boolean", "text", etc.
  //
  // Config field rows may also carry data-aue-resource (pointing to the block's
  // own JCR node), so filtering on data-aue-resource alone incorrectly includes
  // them as slides, causing all slides to show the first slide's values.
  //
  // Fallback chain:
  //   1. UE with data-aue-type="component"  → most reliable
  //   2. UE with data-aue-resource (no component type found) → older UE versions
  //   3. Doc-authored (no UE attributes)    → positional slice
  // ---------------------------------------------------------------------------
  let slides;
  if (!isUE) {
    slides = rows.slice(10);
  } else {
    const componentRows = rows.filter((row) => {
      const type = row?.dataset?.aueType || row?.getAttribute?.('data-aue-type');
      return type === 'component';
    });
    // If data-aue-type="component" found, use those; otherwise fall back to
    // data-aue-resource presence (handles older AEM UE rendering)
    slides = componentRows.length > 0
      ? componentRows
      : rows.filter((row) => row?.hasAttribute?.('data-aue-resource'));
  }
  block.className = 'carousel-dotted';

  if (showDots) {
    block.classList.add(`dots-${dotsAlignment}-${dotsPosition}`);
  } else {
    block.classList.add('no-dots');
  }

  if (showArrowsDots) {
    block.classList.add('show-arrows-dots');
  }

  if (autoScroll) {
    block.classList.add('auto-scroll');
    if (scrollTimeDelay) block.dataset.scrollDelay = scrollTimeDelay;
  }

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');

  const slideEls = slides.map((row, index) => buildSlide(row, index));

  const slidesWithImage = slideEls.filter((s) => s.classList.contains('with-image')).length;
  const slidesWithoutImage = slideEls.filter((s) => s.classList.contains('without-image')).length;
  const slidesHeroBanner = slideEls.filter((s) => s.classList.contains('hero-banner-image-carousel')).length;
  const slidesTextAnimation = slideEls.filter((s) => s.classList.contains('text-animation-variant')).length;

  if (
    slidesWithImage > 0
    && slidesWithoutImage === 0
    && slidesHeroBanner === 0
    && slidesTextAnimation === 0
  ) {
    block.classList.add('all-with-image');
  } else if (
    slidesWithoutImage > 0
    && slidesWithImage === 0
    && slidesHeroBanner === 0
    && slidesTextAnimation === 0
  ) {
    block.classList.add('all-without-image');
  } else if (
    slidesHeroBanner > 0
    && slidesWithImage === 0
    && slidesWithoutImage === 0
    && slidesTextAnimation === 0
  ) {
    block.classList.add('all-hero-banner-image-carousel');
  } else if (
    slidesTextAnimation > 0
    && slidesWithImage === 0
    && slidesWithoutImage === 0
    && slidesHeroBanner === 0
  ) {
    block.classList.add('all-text-animation-variant');
  } else {
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

  const zoomTimers = new Map();

  function triggerBgZoom(slideEl) {
    const bg = slideEl.querySelector('.carousel-bg');
    if (!bg) return;

    if (zoomTimers.has(slideEl)) {
      clearTimeout(zoomTimers.get(slideEl));
    }

    bg.classList.remove('bg-zoom-enter');
    // eslint-disable-next-line no-unused-expressions
    bg.offsetWidth;
    bg.classList.add('bg-zoom-enter');

    const timer = setTimeout(() => {
      bg.classList.remove('bg-zoom-enter');
      zoomTimers.delete(slideEl);
    }, 800);
    zoomTimers.set(slideEl, timer);
  }

  let isFirstLoad = true;

  function setActive(index) {
    const prevIndex = slideEls.findIndex((slide) => slide.classList.contains('is-active'));

    const isHeroVariant = block.classList.contains('all-hero-banner-image-carousel')
      || block.classList.contains('all-text-animation-variant');

    const allHeroBanner = (slidesHeroBanner > 0 || slidesTextAnimation > 0)
      && slidesWithImage === 0
      && slidesWithoutImage === 0;

    const allWithoutImageTrack = slidesWithoutImage > 0
      && slidesWithImage === 0
      && slidesHeroBanner === 0
      && slidesTextAnimation === 0;

    const isLoopingForward = index === 0 && prevIndex === slideEls.length - 1;

    slideEls.forEach((slide, i) => {
      const active = i === index;
      const wasActive = slide.classList.contains('is-active');
      if (isHeroVariant && !wasActive && active && !isFirstLoad) {
        if (!isLoopingForward) {
          triggerBgZoom(slide);
          slide.classList.add('is-entering');
          setTimeout(() => slide.classList.remove('is-entering'), 600);
        }
      }

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

    prevArrow.disabled = index === 0;
    nextArrow.disabled = index === slideEls.length - 1;

    if (allHeroBanner || allWithoutImageTrack) {
      const trackWrapper = block.querySelector('.carousel-track-wrapper');
      if (trackWrapper) {
        const slideWidth = block.offsetWidth;

        if (isLoopingForward) {
          if (isHeroVariant && !isFirstLoad) {
            const cloneSlide = trackWrapper.lastElementChild;
            triggerBgZoom(cloneSlide);
            cloneSlide.classList.add('is-entering');
            setTimeout(() => cloneSlide.classList.remove('is-entering'), 600);
          }

          trackWrapper.style.transform = `translate3d(${-slideEls.length * slideWidth}px, 0px, 0px)`;
          setTimeout(() => {
            trackWrapper.style.transition = 'none';
            trackWrapper.style.transform = 'translate3d(0px, 0px, 0px)';
            trackWrapper.getBoundingClientRect();
            trackWrapper.style.transition = '';
          }, 700);
        } else {
          trackWrapper.style.transform = `translate3d(${-index * slideWidth}px, 0px, 0px)`;
        }
      }
    }
  }

  prevArrow.addEventListener('click', () => {
    const currentIndex = slideEls.findIndex((slide) => slide.classList.contains('is-active'));
    if (currentIndex > 0) setActive(currentIndex - 1);
  });

  nextArrow.addEventListener('click', () => {
    const currentIndex = slideEls.findIndex((slide) => slide.classList.contains('is-active'));
    if (currentIndex < slideEls.length - 1) setActive(currentIndex + 1);
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

  const allWithoutImage = slidesWithoutImage > 0
    && slidesWithImage === 0
    && slidesHeroBanner === 0
    && slidesTextAnimation === 0;

  const allHeroBanner = (slidesHeroBanner > 0 || slidesTextAnimation > 0)
    && slidesWithImage === 0
    && slidesWithoutImage === 0;

  if (allHeroBanner || allWithoutImage) {
    const trackWrapper = document.createElement('div');
    trackWrapper.className = 'carousel-track-wrapper';
    const cloneFirst = slideEls[0].cloneNode(true);
    cloneFirst.setAttribute('aria-hidden', 'true');
    trackWrapper.replaceChildren(...slideEls, cloneFirst);
    block.replaceChildren(trackWrapper);
  } else {
    block.replaceChildren(...slideEls);
  }

  if (showDots) {
    block.append(dots);
  } else if (showArrowsDots) {
    block.append(prevArrow, nextArrow);
  }

  if (seeMoreLink) {
    const moreWrap = document.createElement('div');
    moreWrap.className = 'carousel-dotted-more';
    seeMoreLink.classList.add('icon-arrow-left');
    moreWrap.append(seeMoreLink);
    block.append(moreWrap);
  }

  if (slideEls.length) {
    setActive(0);
  }

  requestAnimationFrame(() => {
    isFirstLoad = false;
  });

  if (autoScroll && scrollTimeDelay) {
    const delay = parseInt(scrollTimeDelay, 10);
    initializeAutoScroll(block, slideEls, setActive, prevArrow, nextArrow, dotButtons, delay, 1);
  }

  // Initialize drag/swipe functionality
  // Enable looping only if slides have images (like Grow Club section)
  // Disable looping for text-only slides (like News and Activities section)
  const enableLooping = slidesWithImage > 0 || slidesHeroBanner > 0 || slidesTextAnimation > 0;
  initializeDragSwipe(block, slideEls, setActive, 50, enableLooping);
}
