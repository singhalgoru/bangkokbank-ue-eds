function decorateButtonsV1(element) {
  element.querySelectorAll('a').forEach((a) => {
    a.title = a.title || a.textContent;
    if (a.href !== a.textContent) {
      const up = a.parentElement;
      const twoup = a.parentElement.parentElement;
      if (!a.querySelector('img')) {
        if (
          up.childNodes.length === 1
          && up.tagName === 'STRONG'
          && twoup.childNodes.length === 1
          && twoup.tagName === 'P'
        ) {
          a.className = 'button primary';
          twoup.classList.add('button-container');
        }
        if (
          up.childNodes.length === 1
          && up.tagName === 'EM'
          && twoup.childNodes.length === 1
          && twoup.tagName === 'P'
        ) {
          a.className = 'button secondary';
          twoup.classList.add('button-container');
        }
        if (up.childNodes.length === 1 && (up.tagName === 'P' || up.tagName === 'DIV')) {
          a.className = 'button-tertiary';
          up.classList.add('button-container');
        }
      }

      // Check for target link setting in adjacent element
      const hasTargetTrue = (linkParent) => {
        const nextSibling = linkParent?.nextElementSibling;
        if (nextSibling && nextSibling.tagName === 'DIV') {
          const text = nextSibling.textContent.trim().toLowerCase();
          if (text === 'true') {
            nextSibling.remove();
            return true;
          }
          // Check for nested div with "true"
          const childDiv = nextSibling.querySelector(':scope > div');
          if (childDiv && childDiv.textContent.trim().toLowerCase() === 'true') {
            nextSibling.remove();
            return true;
          }
        }
        return false;
      };

      if (a.classList.contains('button')) {
        if (hasTargetTrue(twoup) || hasTargetTrue(up) || a.target === '_blank') {
          a.target = '_blank';
        } else {
          a.target = '_self';
        }
      }
    }
  });
}

function decorateTerritoryButtons(main) {
  // Find anchors that are "button" only (no variants like primary/secondary)
  // and convert them to "button territory".
  main.querySelectorAll('a.button:not([class*=" "])').forEach((a) => {
    a.className = 'button-tertiary';
  });
}

/**
 * Decorates SVG icons with alt text separated by '-alt_-' in the icon name
 * @param {Element} element container element
 */
function decorateSvgWithAltText(element) {
  element.querySelectorAll('span.icon img[src$=".svg"]').forEach((img) => {
    const { iconName } = img.dataset;
    if (iconName && iconName.includes('-alt_-')) {
      const [srcPart, altPart] = iconName.split('-alt_-');

      // Update the src to use only the first part
      const currentSrc = img.getAttribute('src');
      const basePath = currentSrc.substring(0, currentSrc.lastIndexOf('/') + 1);
      img.setAttribute('src', `${basePath}${srcPart}.svg`);

      // Update the alt text with the second part (replace underscores and hyphens with spaces)
      const altText = altPart.replace(/[_-]/g, ' ').trim();
      img.setAttribute('alt', altText);
    }
  });
}

/**
 * Decorates title elements with style classes based on their data attributes
 * @param {Element} element container element
 */
function decorateTitles(element) {
  // Find all heading elements (h1-h6) and apply style classes
  element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    // Check for style data attribute (can be comma-separated values from multiselect)
    const style = heading.getAttribute('data-style')
      || heading.getAttribute('data-aue-prop-style')
      || heading.dataset.style;

    if (style) {
      // Split by comma in case multiple styles are selected
      const styles = style.split(',').map((s) => s.trim()).filter((s) => s);

      styles.forEach((styleValue) => {
        if (styleValue === 'underline') {
          heading.classList.add('title-underline');
        }
        // Add other style mappings here in the future
      });
    }

    // Also check if styles are already applied as classes
    if (heading.classList.contains('underline')) {
      heading.classList.add('title-underline');
      heading.classList.remove('underline');
    }
  });
}

export {
  decorateTerritoryButtons,
  decorateButtonsV1,
  decorateSvgWithAltText,
  decorateTitles,
};
