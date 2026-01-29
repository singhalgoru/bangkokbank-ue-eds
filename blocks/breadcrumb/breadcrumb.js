import { getMetadata } from '../../scripts/aem.js';

/**
 * Builds breadcrumb navigation from the current URL path
 * @param {Element} block The breadcrumb block element
 */
export default async function decorate(block) {
  const shortTitle = getMetadata('short-title');
  const pageTitle = document.title;

  const ol = document.createElement('ol');
  block.appendChild(ol);

  const pathSegments = window.location.pathname
    .split('/')
    .filter(Boolean);

  const langPattern = /^([a-z]{2}(-[A-Z]{2})?)$/;
  const startIndex = pathSegments.length && langPattern.test(pathSegments[0]) ? 1 : 0;

  // Homepage only
  if (pathSegments.length === startIndex) {
    block.classList.add('is-homepage');

    const li = document.createElement('li');
    li.textContent = 'Homepage - Bangkok Bank';
    li.setAttribute('aria-current', 'page');
    ol.appendChild(li);

    return;
  }

  let currentPath = '';

  for (let i = startIndex; i < pathSegments.length; i += 1) {
    const segment = pathSegments[i];
    currentPath += `/${segment}`;

    const li = document.createElement('li');

    const isLast = i === pathSegments.length - 1;

    if (isLast) {
      // Use shortTitle if available, then document.title, otherwise use pageTitle
      li.textContent = shortTitle || pageTitle;
      li.setAttribute('aria-current', 'page');
    } else {
      const label = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
      const link = document.createElement('a');
      link.href = currentPath;
      link.textContent = label;
      li.appendChild(link);
    }

    ol.appendChild(li);
  }

  // Find and move existing social-icons block below breadcrumb
  const socialIconsBlock = document.querySelector('.social-icons.block');
  if (socialIconsBlock) {
    // Get the wrapper and section of the social-icons block
    const socialWrapper = socialIconsBlock.parentElement;
    const socialSection = socialWrapper?.parentElement;

    // Move social-icons block below breadcrumb wrapper
    const breadcrumbWrapper = block.closest('.breadcrumb-wrapper');
    if (breadcrumbWrapper) {
      breadcrumbWrapper.parentNode.insertBefore(socialWrapper, breadcrumbWrapper.nextSibling);

      // Clean up empty section if it exists
      if (socialSection && socialSection.children.length === 0) {
        socialSection.remove();
      }
    }
  }
}
