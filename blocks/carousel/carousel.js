import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Create HTML element from template string
 * @param {string} html - HTML template string
 * @param {Document} doc - Document reference
 * @returns {Element} The created element
 */
function createElementFromHTML(html, doc) {
  const template = doc.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

/**
 * Create the carousel header section
 * @param {string} title - The carousel title
 * @param {Element} linkElement - The link element with href, text, and title
 * @param {Document} doc - Document reference
 * @returns {Element} The header section element
 */
function createCarouselHeader(title, linkElement, doc) {
  const headerHTML = `
    <div class="carousel-header">
      ${title ? `<h2>${title}</h2>` : ''}
      ${linkElement ? `<a href="${linkElement.href}" class="link-primary"${linkElement.title ? ` title="${linkElement.title}"` : ''}>${linkElement.textContent}</a>` : ''}
    </div>
  `;
  return createElementFromHTML(headerHTML, doc);
}

/**
 * Create a carousel card element
 * @param {Element} cardElement - The raw card element from the block
 * @param {Document} doc - Document reference
 * @returns {Element} The formatted carousel card
 */
function createCarouselCard(cardElement, doc) {
  const card = createElementFromHTML('<div class="carousel-item"></div>', doc);

  const children = [...cardElement.children];

  // Extract carousel card fields based on the model structure
  const [
    nonActiveImageDiv,
    activeImageDiv,
    eyebrowDiv,
    cardTitleDiv,
    cardDescriptionDiv,
    buttonContainerDiv,
  ] = children;

  // Create image container with active and inactive states
  const imageContainer = createElementFromHTML('<div class="carousel-image-container"></div>', doc);

  // Process non-active image
  if (nonActiveImageDiv?.querySelector('picture')) {
    const inactiveWrapper = createElementFromHTML('<div class="carousel-image-inactive"></div>', doc);
    const nonActiveImg = nonActiveImageDiv.querySelector('img');
    if (nonActiveImg) {
      const optimizedPic = createOptimizedPicture(
        nonActiveImg.src,
        nonActiveImg.alt,
        false,
      );
      moveInstrumentation(nonActiveImg, optimizedPic.querySelector('img'));
      inactiveWrapper.appendChild(optimizedPic);
    }
    imageContainer.appendChild(inactiveWrapper);
  }

  // Process active image
  if (activeImageDiv?.querySelector('picture')) {
    const activeWrapper = createElementFromHTML('<div class="carousel-image-active"></div>', doc);
    const activeImg = activeImageDiv.querySelector('img');
    if (activeImg) {
      const optimizedPic = createOptimizedPicture(
        activeImg.src,
        activeImg.alt,
        false,
      );
      moveInstrumentation(activeImg, optimizedPic.querySelector('img'));
      activeWrapper.appendChild(optimizedPic);
    }
    imageContainer.appendChild(activeWrapper);
  }

  card.appendChild(imageContainer);

  // Create content section
  const eyebrowText = eyebrowDiv?.textContent.trim();
  const titleText = cardTitleDiv?.textContent.trim();
  const descriptionHTML = cardDescriptionDiv?.innerHTML || '';
  const buttonLink = buttonContainerDiv?.querySelector('a');

  const contentHTML = `
    <div class="carousel-content">
      ${eyebrowText ? `<div class="carousel-eyebrow">${eyebrowText}</div>` : ''}
      ${titleText ? `<h3 class="carousel-title">${titleText}</h3>` : ''}
      ${descriptionHTML ? `<p class="carousel-description">${descriptionHTML}</p>` : ''}
      ${buttonLink ? `<a href="${buttonLink.href}" class="${buttonLink.className} carousel-cta"${buttonLink.title ? ` title="${buttonLink.title}"` : ''}>${buttonLink.textContent}</a>` : ''}
    </div>
  `;

  const contentWrapper = createElementFromHTML(contentHTML, doc);
  card.appendChild(contentWrapper);

  return card;
}

/**
 * Initialize carousel slider functionality
 * @param {Element} track - The carousel track element
 */
function initCarousel(track) {
  const items = track.querySelectorAll('.carousel-item');
  if (items.length === 0) return;

  let currentIndex = 0;
  const totalItems = items.length;

  // Touch/drag variables
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  // Create navigation buttons
  const prevButton = createElementFromHTML(`
    <button class="carousel-nav carousel-prev" aria-label="Previous">
      <span class="icon icon-chevron-left"></span>
    </button>
  `, track.ownerDocument);

  const nextButton = createElementFromHTML(`
    <button class="carousel-nav carousel-next" aria-label="Next">
      <span class="icon icon-chevron-right"></span>
    </button>
  `, track.ownerDocument);

  // Decorate the icons
  decorateIcons(prevButton);
  decorateIcons(nextButton);

  track.parentElement.appendChild(prevButton);
  track.parentElement.appendChild(nextButton);

  // Get item dimensions
  function getItemDimensions() {
    const itemWidth = items[0].offsetWidth;
    const gap = window.innerWidth >= 1025 ? 24 : 16;
    return { itemWidth, gap };
  }

  // Update carousel position and active states
  function updateCarousel(animate = true) {
    const { itemWidth, gap } = getItemDimensions();
    const offset = -(currentIndex * (itemWidth + gap));

    if (animate) {
      track.style.transition = 'transform 0.4s ease-in-out';
    } else {
      track.style.transition = 'none';
    }

    track.style.transform = `translateX(${offset}px)`;
    currentTranslate = offset;
    prevTranslate = offset;

    // Update button states
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex >= totalItems - 1;

    // Update active states - only the center/current card is active on desktop
    items.forEach((item, index) => {
      if (window.innerWidth >= 1025) {
        // Desktop: Only the current slide is active
        if (index === currentIndex) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      } else {
        // Mobile: Always show as active (images always visible)
        item.classList.add('active');
      }
    });
  }

  // Check if device is mobile/tablet (disable drag on desktop)
  function isMobileOrTablet() {
    return window.innerWidth < 1025;
  }

  // Animation loop for smooth dragging
  function animation() {
    track.style.transform = `translateX(${currentTranslate}px)`;
    if (isDragging) {
      requestAnimationFrame(animation);
    }
  }

  // Touch start handler
  function touchStart(event) {
    // Only allow dragging on mobile/tablet
    if (!isMobileOrTablet()) return;

    isDragging = true;
    startPos = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    animationID = requestAnimationFrame(animation);
    track.style.cursor = 'grabbing';
  }

  // Touch move handler
  function touchMove(event) {
    if (isDragging) {
      const currentPosition = event.type.includes('mouse')
        ? event.pageX
        : event.touches[0].clientX;
      currentTranslate = prevTranslate + currentPosition - startPos;
    }
  }

  // Touch end handler
  function touchEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);
    track.style.cursor = 'grab';

    const movedBy = currentTranslate - prevTranslate;
    const { itemWidth, gap } = getItemDimensions();
    const threshold = (itemWidth + gap) * 0.2; // 20% threshold

    // Determine if we should move to next/prev slide
    if (movedBy < -threshold && currentIndex < totalItems - 1) {
      currentIndex += 1;
    } else if (movedBy > threshold && currentIndex > 0) {
      currentIndex -= 1;
    }

    updateCarousel(true);
  }

  // Add touch/drag event listeners
  track.addEventListener('touchstart', touchStart);
  track.addEventListener('touchmove', touchMove);
  track.addEventListener('touchend', touchEnd);
  track.addEventListener('mousedown', touchStart);
  track.addEventListener('mousemove', touchMove);
  track.addEventListener('mouseup', touchEnd);
  track.addEventListener('mouseleave', () => {
    if (isDragging) {
      touchEnd();
    }
  });

  // Prevent context menu on long press
  track.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  });

  // Prevent drag on images
  items.forEach((item) => {
    item.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });
  });

  // Navigation handlers - move one card at a time
  prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      updateCarousel();
    }
  });

  nextButton.addEventListener('click', () => {
    if (currentIndex < totalItems - 1) {
      currentIndex += 1;
      updateCarousel();
    }
  });

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Reset to first slide on resize to avoid positioning issues
      currentIndex = 0;
      updateCarousel(false);
    }, 250);
  });

  // Initial setup
  track.style.cursor = 'grab';
  updateCarousel(false);
}

/**
 * Decorate the carousel block
 * @param {Element} block - The carousel block element
 */
export default function decorate(block) {
  const doc = block.ownerDocument;
  const children = [...block.children];

  // Extract carousel header information (first 2 rows)
  const titleElement = children[0]?.querySelector('p');
  const linkElement = children[1]?.querySelector('a');

  const title = titleElement?.textContent.trim() || '';

  // Create carousel wrapper
  const carouselWrapper = createElementFromHTML('<div class="carousel-wrapper"></div>', doc);

  // Add header
  if (title) {
    const header = createCarouselHeader(title, linkElement, doc);
    carouselWrapper.appendChild(header);
  }

  // Create carousel track
  const carouselTrack = createElementFromHTML('<div class="carousel-track"></div>', doc);

  // Process carousel cards (remaining rows after the first 2)
  const carouselCards = children.slice(2);
  carouselCards.forEach((cardElement) => {
    const card = createCarouselCard(cardElement, doc);
    moveInstrumentation(cardElement, card);
    carouselTrack.appendChild(card);
  });

  carouselWrapper.appendChild(carouselTrack);

  // Replace block content
  block.textContent = '';
  block.appendChild(carouselWrapper);

  // Initialize carousel functionality
  if (carouselCards.length > 0) {
    initCarousel(carouselTrack);
  }
}
